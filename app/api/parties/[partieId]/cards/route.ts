import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { partieId: string } }
) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const partieId = parseInt(params.partieId);
    const cards = await prisma.carte.findMany({
      where: {
        joueur: {
          partieId: partieId,
          userId: userId,
        },
      },
    });
    return NextResponse.json(cards);
  } catch (error) {
    console.error("Failed to fetch user cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch user cards" },
      { status: 500 }
    );
  }
}
