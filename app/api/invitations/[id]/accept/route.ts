// app/api/invitations/[id]/accept/route.ts
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invitationId = params.id;

  try {
    // First, find the user by clerkUserId
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const invitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
      include: { partie: true },
    });

    // Create the Joueur using the user's id from our database
    await prisma.joueur.create({
      data: {
        partieId: invitation.partieId,
        userId: user.id, // Use the user's id from our database, not the clerkUserId
        seatIndex: invitation.seatIndex,
        pseudo: user.name || "Joueur", // Use the user's name as pseudo, or "Joueur" if name is null
      },
    });

    return NextResponse.json(invitation.partie);
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
