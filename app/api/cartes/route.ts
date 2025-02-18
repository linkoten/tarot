import { NextResponse } from "next/server";
import { serializeDecimal } from "@/lib/utils";
import { prisma } from "@/lib/db";

export async function GET() {
  const cartes = await prisma.carte.findMany();
  const serializedCartes = serializeDecimal(cartes);
  return NextResponse.json(serializedCartes);
}
