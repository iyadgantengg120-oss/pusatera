import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const tolak = () => NextResponse.json({ error: "Belum login" }, { status: 401 });

async function pastikanAkun(
  tx: Prisma.TransactionClient,
  kode: string,
  nama: string,
  tipe: string
) {
  return tx.cOA.upsert({
    where: { kode },
    update: {},
    create: { kode, nama, tipe },
  });
}

export async function GET() {
  if (!(await getServerSession(authOptions))) return tolak();
  const [products, warehouses, orders] = await Promise.all([
    prisma.product.findMany({ orderBy: { kode: "asc" } }),
    prisma.warehouse.findMany(),
    prisma.purchaseOrder.findMany({ orderBy: { tanggal: "desc" }, take: 20 }),
  ]);
  return NextResponse.json({ products, warehouses, orders });
}

export async function POST(req: Request) {
  if (!(await getServerSession(authOptions))) return tolak();

  const body = await req.json();
  const supplier = String(body.supplier ?? "").trim();
  const warehouseId = String(body.warehouseId ?? "");
  const items = (Array.isArray(body.items) ? body.items : [])
    .map((i: any) => ({
      productId: String(i.productId ?? ""),
      qty: Number(i.qty) || 0,
      harga: Number(i.harga) || 0,
    }))
    .filter((i: any) => i.productId && i.qty > 0);

  if (!supplier) return NextResponse.json({ error: "Supplier wajib diisi" }, { status: 400 });
  if (!warehouseId) return NextResponse.json({ error: "Pilih gudang" }, { status: 400 });
  if (items.length === 0)
    return NextResponse.json({ error: "Minimal satu barang dengan qty lebih dari 0" }, { status: 400 });

  const total = items.reduce((a: number, i: any) => a + i.qty * i.harga, 0);
  const nomor = `PO-${Date.now()}`;

  try {
    const po = await prisma.$transaction(async (tx) => {
      const order = await tx.purchaseOrder.create({
        data: { nomor, supplier, total, status: "DITERIMA" },
      });

      for (const i of items) {
        const nilai = i.qty * i.harga;
        await tx.stock.upsert({
          where: { productId_warehouseId: { productId: i.productId, warehouseId } },
          create: { productId: i.productId, warehouseId, qty: i.qty, nilai },
          update: { qty: { increment: i.qty }, nilai: { increment: nilai } },
        });
        await tx.stockCard.create({
          data: {
            productId: i.productId,
            warehouseId,
            tipe: "MASUK",
            qty: i.qty,
            keterangan: `Pembelian ${nomor} dari ${supplier}`,
          },
        });
      }

      const persediaan = await pastikanAkun(tx, "1101", "Persediaan Barang", "ASET");
      const hutang = await pastikanAkun(tx, "2101", "Hutang Usaha", "KEWAJIBAN");

      await tx.journal.create({
        data: {
          keterangan: `Pembelian ${nomor} - ${supplier}`,
          ref: nomor,
          details: {
            create: [
              { coaId: persediaan.id, debit: total, kredit: 0 },
              { coaId: hutang.id, debit: 0, kredit: total },
            ],
          },
        },
      });

      return order;
    });

    return NextResponse.json(po, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Gagal memproses pembelian" }, { status: 500 });
  }
}