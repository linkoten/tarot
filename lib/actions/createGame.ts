"use server";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { findUserByClerkId } from "@/lib/partie/partie";

export async function createGame() {
  try {
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return { success: false, error: "User not authenticated" };
    }

    const prismaUser = await findUserByClerkId(clerkUserId);

    if (!prismaUser) {
      return { success: false, error: "User not found in database" };
    }

    const newPartie = await prisma.partie.create({
      data: {
        status: "EN_ATTENTE",
        nombreJoueurs: 3,
        donneur: 0,
        tourActuel: 0,
        joueurs: {
          create: {
            userId: prismaUser.id,
            seatIndex: 0,
          },
        },
      },
    });

    return { success: true, partieId: newPartie.id };
  } catch (error) {
    console.error("Error creating game:", error);
    return { success: false, error: "Failed to create game" };
  }
}
