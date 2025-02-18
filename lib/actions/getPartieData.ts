"use server";
import { PartieWithRelations } from "@/app/types/type";
import { prisma } from "../db";

export async function getPartieData(
  partieId: number
): Promise<PartieWithRelations | null> {
  try {
    const partie = await prisma.partie.findUnique({
      where: { id: partieId },
      include: {
        joueurs: {
          include: {
            cartes: true,
            plisDefenseursGagnes: true,
            plisPreneurGagnes: true,
          },
        },
        manches: {
          include: {
            chien: {
              include: {
                cartes: true,
              },
            },
            currentPli: {
              include: {
                cartes: {
                  orderBy: { ordre: "asc" }, // ✅ Toujours trier les cartes dans l'ordre de jeu
                },
              },
            },
            pliPreneur: {
              include: {
                cartes: true,
              },
            },
            pliDefenseur: {
              include: {
                cartes: true,
              },
            },
          },
        },
        invitations: true,
        actionsJoueurs: true,
      },
    });
    return partie;
  } catch (error) {
    console.error("Error updated Partie:", error);
    return null;
  }
}
