import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const [products, warehouses, stocks] = await Promise.all([
    prisma.product.findMany({ orderBy: { kode: "asc" } }),
    prisma.warehouse.findMany(),
    prisma.stock.findMany(),
  ]);

  const gudang = new Map(warehouses.map((w) => [w.id, w]));

  // total qty per produk (untuk menentukan status stok)
  const total = new Map<string, number>();
  for (const s of stocks) {
    total.set(s.productId, (total.get(s.productId) ?? 0) + s.qty);
  }

  const status = (productId: string, min: number) => {
    const t = total.get(productId) ?? 0;
    if (t <= 0) return "HABIS";
    if (t < min) return "MINIMUM";
    return "NORMAL";
  };

  const rows = products.flatMap((p) => {
    const milik = stocks.filter((s) => s.productId === p.id);
    if (milik.length === 0) {
      return [
        {
          key: p.id,
          kode: p.kode,
          nama: p.nama,
          barcode: p.barcode,
          kategori: p.kategori,
          satuan: p.satuan,
          gudang: "-",
          lokasi: "-",
          qty: 0,
          harga_unit: p.harga_beli,
          nilai: 0,
          status: status(p.id, p.stok_minimum),
        },
      ];
    }
    return milik.map((s) => {
      const g = gudang.get(s.warehouseId);
      return {
        key: s.id,
        kode: p.kode,
        nama: p.nama,
        barcode: p.barcode,
        kategori: p.kategori,
        satuan: p.satuan,
        gudang: g?.nama ?? "-",
        lokasi: g?.alamat ?? "-",
        qty: s.qty,
        harga_unit: p.harga_beli,
        nilai: s.nilai > 0 ? s.nilai : s.qty * p.harga_beli,
        status: status(p.id, p.stok_minimum),
      };
    });
  });

  const ringkasan = {
    totalProduk: products.length,
    totalGudang: warehouses.length,
    normal: products.filter((p) => status(p.id, p.stok_minimum) === "NORMAL").length,
    minimum: products.filter((p) => status(p.id, p.stok_minimum) === "MINIMUM").length,
    habis: products.filter((p) => status(p.id, p.stok_minimum) === "HABIS").length,
    nilai: rows.reduce((a, r) => a + r.nilai, 0),
  };

  return NextResponse.json({ ringkasan, rows });
}