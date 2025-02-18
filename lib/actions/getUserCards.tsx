"use server";

import { prisma } from "@/lib/db";
import { Carte } from "@prisma/client";

export async function getUserCards(
  partieId: number,
  userId: string
): Promise<Carte[]> {
  try {
    const cards = await prisma.carte.findMany({
      where: {
        joueur: {
          partieId: partieId,
          userId: userId,
        },
      },
    });
    return cards;
  } catch (error) {
    console.error("Failed to fetch user cards:", error);
    throw new Error("Failed to fetch user cards");
  }
}
