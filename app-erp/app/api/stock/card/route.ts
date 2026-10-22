import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  if (!(await getServerSession(authOptions)))
    return NextResponse.json({ error: "Belum login" }, { status: 401 });

  const cards = await prisma.stockCard.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { product: true, warehouse: true },
  });
  return NextResponse.json(cards);
}