import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getServerSession(authOptions)))
    return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const journals = await prisma.journal.findMany({
    orderBy: { tanggal: "desc" },
    take: 100,
    include: { details: { include: { coa: true } } },
  });
  return NextResponse.json(journals);
}