// app/api/invitations/invite/route.ts
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { partieId, seatIndex, invitedUserId } = await request.json();

  const invitation = await prisma.invitation.create({
    data: {
      partieId,
      seatIndex,
      invitedUserId,
      invitingUserId: userId,
      status: "PENDING",
    },
  });

  return NextResponse.json(invitation);
}
