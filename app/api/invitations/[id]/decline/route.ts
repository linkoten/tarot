// app/api/invitations/[id]/decline/route.ts
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

  const invitation = await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "DECLINED" },
  });

  return NextResponse.json(invitation);
}
