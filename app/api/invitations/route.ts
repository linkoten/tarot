// app/api/invitations/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { userId } = await auth();
  const { searchParams } = new URL(request.url);
  const queryPartieId = searchParams.get("partieId");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Récupérer uniquement les invitations PENDING
  const invitations = await prisma.invitation.findMany({
    where: {
      partieId: queryPartieId ? parseInt(queryPartieId, 10) : undefined,
      status: "PENDING",
    },
  });

  return NextResponse.json(invitations);
}
