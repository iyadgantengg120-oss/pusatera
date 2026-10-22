import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  if (!(await getServerSession(authOptions)))
    return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const sp = new URL(req.url).searchParams;
  const dari = new Date((sp.get("from") || "2026-01-01") + "T00:00:00");
  const sampai = new Date((sp.get("to") || "2026-12-31") + "T23:59:59.999");

  const details = await prisma.journalDetail.findMany({
    where: { journal: { tanggal: { gte: dari, lte: sampai } } },
    include: { coa: true, journal: true },
  });

  // Klasifikasi berdasarkan kode akun: 4xxx pendapatan, 5xxx HPP, 6xxx beban
  type Akun = { kode: string; nama: string; jumlah: number };
  const pendapatan = new Map<string, Akun>();
  const hpp = new Map<string, Akun>();
  const beban = new Map<string, Akun>();
  const bulanan = new Map<string, { pendapatan: number; pengeluaran: number }>();

  const tambah = (m: Map<string, Akun>, kode: string, nama: string, v: number) => {
    const a = m.get(kode) ?? { kode, nama, jumlah: 0 };
    a.jumlah += v;
    m.set(kode, a);
  };

  for (const d of details) {
    const g = d.coa.kode.charAt(0);
    const t = new Date(d.journal.tanggal);
    const key = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`;
    const b = bulanan.get(key) ?? { pendapatan: 0, pengeluaran: 0 };

    if (g === "4") {
      const v = d.kredit - d.debit;
      tambah(pendapatan, d.coa.kode, d.coa.nama, v);
      b.pendapatan += v;
    } else if (g === "5") {
      const v = d.debit - d.kredit;
      tambah(hpp, d.coa.kode, d.coa.nama, v);
      b.pengeluaran += v;
    } else if (g === "6") {
      const v = d.debit - d.kredit;
      tambah(beban, d.coa.kode, d.coa.nama, v);
      b.pengeluaran += v;
    } else {
      continue;
    }
    bulanan.set(key, b);
  }

  const jumlah = (m: Map<string, Akun>) => [...m.values()].reduce((a, x) => a + x.jumlah, 0);
  const urut = (m: Map<string, Akun>) => [...m.values()].sort((a, b) => a.kode.localeCompare(b.kode));

  const totalPendapatan = jumlah(pendapatan);
  const totalHpp = jumlah(hpp);
  const totalBeban = jumlah(beban);

  return NextResponse.json({
    pendapatan: urut(pendapatan),
    hpp: urut(hpp),
    beban: urut(beban),
    totalPendapatan,
    totalHpp,
    totalBeban,
    labaKotor: totalPendapatan - totalHpp,
    laba: totalPendapatan - totalHpp - totalBeban,
    bulanan: [...bulanan.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([bulan, v]) => ({ bulan, ...v })),
  });
}