import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const tolak = () => NextResponse.json({ error: "Belum login" }, { status: 401 });

class StokKurang extends Error {}

async function pastikanAkun(
  tx: Prisma.TransactionClient,
  kode: string,
  nama: string,
  tipe: string
) {
  return tx.cOA.upsert({ where: { kode }, update: {}, create: { kode, nama, tipe } });
}

export async function GET() {
  if (!(await getServerSession(authOptions))) return tolak();
  const [products, warehouses, stocks, orders] = await Promise.all([
    prisma.product.findMany({ orderBy: { kode: "asc" } }),
    prisma.warehouse.findMany(),
    prisma.stock.findMany(),
    prisma.salesOrder.findMany({ orderBy: { tanggal: "desc" }, take: 20 }),
  ]);
  const qty: Record<string, number> = {};
  for (const s of stocks) qty[s.productId] = (qty[s.productId] ?? 0) + s.qty;
  return NextResponse.json({
    products: products.map((p) => ({ ...p, stok: qty[p.id] ?? 0 })),
    warehouses,
    orders,
  });
}

export async function POST(req: Request) {
  if (!(await getServerSession(authOptions))) return tolak();

  const body = await req.json();
  const customer = String(body.customer ?? "").trim() || null;
  const metode = String(body.metode ?? "TUNAI").toUpperCase();
  const warehouseId = String(body.warehouseId ?? "");
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((i: any) => ({
      productId: String(i.productId ?? ""),
      qty: Number(i.qty) || 0,
      harga: Number(i.harga) || 0,
    }))
    .filter((i: any) => i.productId && i.qty > 0);

  if (!warehouseId) return NextResponse.json({ error: "Pilih gudang" }, { status: 400 });
  if (items.length === 0)
    return NextResponse.json({ error: "Minimal satu barang" }, { status: 400 });

  const total = items.reduce((a: number, i: any) => a + i.qty * i.harga, 0);
  const nomor = `SO-${Date.now()}`;
  // Tunai/Transfer/QRIS masuk Kas (1001). Kredit masuk Piutang (1102).
  const kredit = metode === "KREDIT";

  try {
    const order = await prisma.$transaction(async (tx) => {
      let hpp = 0;

      for (const i of items) {
        const stok = await tx.stock.findUnique({
          where: { productId_warehouseId: { productId: i.productId, warehouseId } },
        });
        const produk = await tx.product.findUnique({ where: { id: i.productId } });
        if (!stok || !produk || stok.qty < i.qty) {
          throw new StokKurang(
            `Stok ${produk?.nama ?? "produk"} tidak cukup (tersedia ${stok?.qty ?? 0})`
          );
        }
        const rata = stok.qty > 0 && stok.nilai > 0 ? stok.nilai / stok.qty : produk.harga_beli;
        const biaya = rata * i.qty;
        hpp += biaya;

        await tx.stock.update({
          where: { id: stok.id },
          data: { qty: { decrement: i.qty }, nilai: { decrement: Math.min(biaya, stok.nilai) } },
        });
        await tx.stockCard.create({
          data: {
            productId: i.productId,
            warehouseId,
            tipe: "KELUAR",
            qty: i.qty,
            keterangan: `Penjualan ${nomor}${customer ? " ke " + customer : ""}`,
          },
        });
      }

      const so = await tx.salesOrder.create({
        data: { nomor, customer, total, metode },
      });

      const akunHpp = await pastikanAkun(tx, "5101", "Harga Pokok Penjualan", "BEBAN_POKOK");
      const persediaan = await pastikanAkun(tx, "1101", "Persediaan Barang", "ASET");
      const akunBayar = kredit
        ? await pastikanAkun(tx, "1102", "Piutang Usaha", "ASET")
        : await pastikanAkun(tx, "1001", "Kas", "ASET");
      const penjualan = await pastikanAkun(tx, "4101", "Penjualan", "PENDAPATAN");

      await tx.journal.create({
        data: {
          keterangan: `HPP ${nomor}`,
          ref: nomor,
          details: {
            create: [
              { coaId: akunHpp.id, debit: hpp, kredit: 0 },
              { coaId: persediaan.id, debit: 0, kredit: hpp },
            ],
          },
        },
      });
      await tx.journal.create({
        data: {
          keterangan: `Penjualan ${nomor} (${metode})`,
          ref: nomor,
          details: {
            create: [
              { coaId: akunBayar.id, debit: total, kredit: 0 },
              { coaId: penjualan.id, debit: 0, kredit: total },
            ],
          },
        },
      });

      return so;
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    if (e instanceof StokKurang) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error(e);
    return NextResponse.json({ error: "Gagal memproses penjualan" }, { status: 500 });
  }
}