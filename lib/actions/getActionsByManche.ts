"use server";

import { prisma } from "../db";
import { ActionJoueur } from "@prisma/client";

export async function getActionsByManche(
  partieId: number
): Promise<ActionJoueur[]> {
  try {
    const actions = await prisma.actionJoueur.findMany({
      where: {
        partieId: partieId,
      },
    });
    return actions;
  } catch (error) {
    console.error("Error fetching actions by manche:", error);
    throw new Error("Failed to fetch actions by manche");
  }
}
