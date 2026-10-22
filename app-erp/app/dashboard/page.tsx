import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);

function sapaan(jam: number) {
  if (jam < 11) return "Selamat Pagi";
  if (jam < 15) return "Selamat Siang";
  if (jam < 18) return "Selamat Sore";
  return "Selamat Malam";
}

function Kartu({
  angka,
  label,
  warna = "#FFFFFF",
}: {
  angka: string | number;
  label: string;
  warna?: string;
}) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: "#0E2A3A", borderColor: "#1E4A5E" }}
    >
      <div className="text-3xl font-extrabold" style={{ color: warna }}>
        {angka}
      </div>
      <div
        className="mt-2 text-xs font-bold uppercase tracking-widest"
        style={{ color: "#9BB0BB" }}
      >
        {label}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const [products, totalGudang, totalKaryawan, totalUser] = await Promise.all([
    prisma.product.findMany({ include: { stocks: true } }),
    prisma.warehouse.count(),
    prisma.employee.count(),
    prisma.user.count(),
  ]);

  let normal = 0;
  let minimum = 0;
  let habis = 0;
  let nilaiStok = 0;

  for (const p of products) {
    const qty = p.stocks.reduce((s, x) => s + x.qty, 0);
    nilaiStok += p.stocks.reduce((s, x) => s + x.nilai, 0);
    if (qty <= 0) habis++;
    else if (qty < p.stok_minimum) minimum++;
    else normal++;
  }

  const sekarang = new Date();
  const tanggal = sekarang.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const aksi = [
    { label: "Tambah Produk", href: "/dashboard/products" },
    { label: "Stok On Hand", href: "/dashboard/stock" },
    { label: "Kasir POS", href: "/dashboard/pos" },
    { label: "Pembelian", href: "/dashboard/purchase" },
    { label: "Penjualan", href: "/dashboard/sales" },
    { label: "Laba Rugi", href: "/dashboard/accounting/profit-loss" },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-extrabold">
        {sapaan(sekarang.getHours())},{" "}
        <span style={{ color: "#2EC5E8" }}>{session?.user?.name}</span>
      </h1>
      <p className="mt-1" style={{ color: "#9BB0BB" }}>
        {tanggal}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kartu angka={products.length} label="Total Produk" />
        <Kartu angka={totalGudang} label="Total Gudang" />
        <Kartu angka={totalKaryawan} label="Total Karyawan" />
        <Kartu angka={totalUser} label="Total User" />
      </div>

      <h2 className="mt-10 text-lg font-bold">Kondisi Stok</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kartu angka={normal} label="Stok Normal" warna="#27C93F" />
        <Kartu angka={minimum} label="Stok Minimum" warna="#FFBD2E" />
        <Kartu angka={habis} label="Stok Habis" warna="#FF5F56" />
        <Kartu angka={rupiah(nilaiStok)} label="Nilai Stok" warna="#2EC5E8" />
      </div>

      <h2 className="mt-10 text-lg font-bold">Aksi Cepat</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {aksi.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "#2596B5" }}
          >
            {a.label}
          </Link>
        ))}
      </div>
    </div>
  );
}