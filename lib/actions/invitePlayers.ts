// app/actions/invitePlayer.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";

export async function invitePlayer(
  partieId: number,
  seatIndex: number,
  invitedUserId: string,
  invitingUserId: string
) {
  try {
    const invitation = await prisma.invitation.create({
      data: {
        partieId,
        seatIndex,
        invitedUserId,
        invitingUserId,
        status: "PENDING",
      },
    });

    // Revalidation de la page si nécessaire
    revalidatePath(`/dashboard/${partieId}`);

    return { success: true, invitation };
  } catch (error) {
    console.error("Error inviting player:", error);
    return { success: false, error: "Failed to invite player" };
  }
}

export async function acceptInvitation(
  invitationId: string,
  userId: string,
  userName: string | null
) {
  try {
    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
      include: { partie: true },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.invitedUserId !== userId) {
      throw new Error("User is not the invited player");
    }

    if (invitation.status !== "PENDING") {
      throw new Error("Invitation is not pending");
    }

    // Update the invitation status
    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "ACCEPTED" },
    });

    // Add the player to the game
    await prisma.joueur.create({
      data: {
        userId: userId,
        partieId: invitation.partieId,
        seatIndex: invitation.seatIndex,
        pseudo: userName || "Joueur",
      },
    });

    revalidatePath(`/dashboard/${invitation.partieId}`);

    return { success: true, invitation: updatedInvitation };
  } catch (error) {
    console.error("Error accepting invitation:", error);
    return { success: false, error: "Failed to accept invitation" };
  }
}

export async function refuseInvitation(invitationId: string, userId: string) {
  try {
    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.invitedUserId !== userId) {
      throw new Error("User is not the invited player");
    }

    if (invitation.status !== "PENDING") {
      throw new Error("Invitation is not pending");
    }

    // Update the invitation status
    const updatedInvitation = await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "DECLINED" },
    });

    revalidatePath(`/dashboard/${invitation.partieId}`);

    return { success: true, invitation: updatedInvitation };
  } catch (error) {
    console.error("Error refusing invitation:", error);
    return { success: false, error: "Failed to refuse invitation" };
  }
}

export async function getPendingInvitations(userId: string) {
  try {
    const invitations = await prisma.invitation.findMany({
      where: {
        invitedUserId: userId,
        status: "PENDING",
      },
    });

    return { success: true, invitations };
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return {
      success: false,
      invitations: [],
      error: "Failed to fetch invitations",
    };
  }
}
