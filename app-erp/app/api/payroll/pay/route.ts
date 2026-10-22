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
  return tx.cOA.upsert({ where: { kode }, update: {}, create: { kode, nama, tipe } });
}

export async function GET() {
  if (!(await getServerSession(authOptions))) return tolak();
  const [employees, payrolls] = await Promise.all([
    prisma.employee.findMany({ orderBy: { nama: "asc" } }),
    prisma.payroll.findMany({
      orderBy: { tanggal: "desc" },
      take: 200,
      include: { employee: true },
    }),
  ]);
  return NextResponse.json({ employees, payrolls });
}

// Ubah gaji pokok karyawan
export async function PUT(req: Request) {
  if (!(await getServerSession(authOptions))) return tolak();
  const body = await req.json();
  const id = String(body.id ?? "");
  const gaji = Number(body.gaji);
  if (!id || !Number.isFinite(gaji) || gaji < 0) {
    return NextResponse.json({ error: "Data tidak valid" }, { status: 400 });
  }
  const e = await prisma.employee.update({ where: { id }, data: { gaji } });
  return NextResponse.json(e);
}

// Bayar gaji
export async function POST(req: Request) {
  if (!(await getServerSession(authOptions))) return tolak();

  const body = await req.json();
  const periode = String(body.periode ?? "");
  const ids: string[] = Array.isArray(body.employeeIds) ? body.employeeIds.map(String) : [];

  if (!/^\d{4}-\d{2}$/.test(periode))
    return NextResponse.json({ error: "Periode tidak valid" }, { status: 400 });
  if (ids.length === 0)
    return NextResponse.json({ error: "Pilih minimal satu karyawan" }, { status: 400 });

  try {
    const hasil = await prisma.$transaction(async (tx) => {
      const employees = await tx.employee.findMany({ where: { id: { in: ids } } });
      const sudah = await tx.payroll.findMany({
        where: { periode, employeeId: { in: ids } },
        select: { employeeId: true },
      });
      const sudahSet = new Set(sudah.map((p) => p.employeeId));

      const bayar = employees.filter((e) => !sudahSet.has(e.id) && e.gaji > 0);
      if (bayar.length === 0) {
        throw new Error("Tidak ada yang bisa dibayar (sudah dibayar di periode ini atau gaji masih 0)");
      }

      let total = 0;
      for (const e of bayar) {
        await tx.payroll.create({
          data: { employeeId: e.id, periode, jumlah: e.gaji },
        });
        total += e.gaji;
      }

      const beban = await pastikanAkun(tx, "6101", "Beban Gaji", "BEBAN");
      const kas = await pastikanAkun(tx, "1001", "Kas", "ASET");

      await tx.journal.create({
        data: {
          keterangan: `Pembayaran gaji periode ${periode} (${bayar.length} karyawan)`,
          ref: `GAJI-${periode}`,
          details: {
            create: [
              { coaId: beban.id, debit: total, kredit: 0 },
              { coaId: kas.id, debit: 0, kredit: total },
            ],
          },
        },
      });

      return { jumlah: bayar.length, total, dilewati: employees.length - bayar.length };
    });

    return NextResponse.json(hasil, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Gagal memproses gaji";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}