import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function sudahLogin() {
  const session = await getServerSession(authOptions);
  return !!session;
}

const tolak = () => NextResponse.json({ error: "Belum login" }, { status: 401 });

function rapikan(b: Record<string, unknown>) {
  return {
    kode: String(b.kode ?? "").trim(),
    nama: String(b.nama ?? "").trim(),
    barcode: b.barcode ? String(b.barcode).trim() : null,
    kategori: String(b.kategori ?? "").trim() || "Umum",
    satuan: String(b.satuan ?? "").trim() || "Pcs",
    harga_beli: Number(b.harga_beli) || 0,
    harga_jual: Number(b.harga_jual) || 0,
    stok_minimum: Math.round(Number(b.stok_minimum) || 0),
  };
}

export async function GET() {
  if (!(await sudahLogin())) return tolak();
  const products = await prisma.product.findMany({ orderBy: { kode: "asc" } });
  return NextResponse.json(products);
}

export async function POST(req: Request) {
  if (!(await sudahLogin())) return tolak();
  const data = rapikan(await req.json());
  if (!data.kode || !data.nama) {
    return NextResponse.json({ error: "Kode dan nama wajib diisi" }, { status: 400 });
  }
  try {
    const product = await prisma.product.create({ data });
    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Kode produk sudah dipakai" }, { status: 409 });
  }
}

export async function PUT(req: Request) {
  if (!(await sudahLogin())) return tolak();
  const body = await req.json();
  const data = rapikan(body);
  if (!body.id || !data.kode || !data.nama) {
    return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
  }
  try {
    const product = await prisma.product.update({ where: { id: body.id }, data });
    return NextResponse.json(product);
  } catch {
    return NextResponse.json({ error: "Gagal mengubah (kode mungkin sudah dipakai)" }, { status: 409 });
  }
}

export async function DELETE(req: Request) {
  if (!(await sudahLogin())) return tolak();
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID kosong" }, { status: 400 });
  await prisma.$transaction([
    prisma.stockCard.deleteMany({ where: { productId: id } }),
    prisma.stock.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);
  return NextResponse.json({ ok: true });
}