"use server";

import { prisma } from "../db";
import { Carte } from "@prisma/client";

export async function createPreneurPli(
  mancheId: number,
  preneurId: string,
  newCartes: Carte[]
) {
  try {
    const existingPli = await prisma.pliPreneur.findUnique({
      where: { mancheId },
      include: { cartes: true },
    });

    if (existingPli) {
      const newPoints = newCartes.reduce(
        (sum: number, carte: Carte) => sum + carte.points,
        0
      );
      const totalPoints = existingPli.points + newPoints;

      const updatedPli = await prisma.pliPreneur.update({
        where: { id: existingPli.id },
        data: {
          gagnant: { connect: { id: preneurId } },
          status: "PRENEUR",
          cartes: {
            connect: newCartes.map((carte: Carte) => ({ id: carte.id })),
          },
          points: totalPoints,
        },
        include: { cartes: true },
      });
      return updatedPli;
    } else {
      const newPli = await prisma.pliPreneur.create({
        data: {
          gagnant: { connect: { id: preneurId } },
          manche: { connect: { id: mancheId } },
          cartes: {
            connect: newCartes.map((carte: Carte) => ({ id: carte.id })),
          },
          points: newCartes.reduce(
            (sum: number, carte: Carte) => sum + carte.points,
            0
          ),
          status: "PRENEUR",
        },
        include: { cartes: true },
      });
      return newPli;
    }
  } catch (error) {
    console.error("Error creating preneur pli:", error);
    throw new Error("Failed to create preneur pli");
  }
}

export async function createDefenseurPli(mancheId: number, newCartes: Carte[]) {
  try {
    const existingPli = await prisma.pliDefenseur.findUnique({
      where: { mancheId },
      include: { cartes: true },
    });
    if (existingPli) {
      // Calculer les nouveaux points
      const newPoints = newCartes.reduce(
        (sum: number, carte: Carte) => sum + carte.points,
        0
      );
      const totalPoints = existingPli.points + newPoints;

      const updatedPli = await prisma.pliDefenseur.update({
        where: { id: existingPli.id },
        data: {
          status: "DEFENSEURS",
          cartes: {
            connect: newCartes.map((carte: Carte) => ({ id: carte.id })),
          },
          points: totalPoints,
        },
        include: { cartes: true },
      });
      return updatedPli;
    } else {
      const newPli = await prisma.pliDefenseur.create({
        data: {
          manche: { connect: { id: mancheId } },
          cartes: {
            connect: newCartes.map((carte: Carte) => ({ id: carte.id })),
          },
          points: newCartes.reduce(
            (sum: number, carte: Carte) => sum + carte.points,
            0
          ),
          status: "DEFENSEURS",
        },
        include: { cartes: true },
      });
      return newPli;
    }
  } catch (error) {
    console.error("Error creating defenseur pli:", error);
    throw new Error("Failed to create defenseur pli");
  }
}

export async function currentPli(mancheId: number, cartes: Carte[]) {
  try {
    const updatedManche = await prisma.manche.update({
      where: { id: mancheId },
      data: {
        currentPli: {
          upsert: {
            create: {
              cartes: {
                connect: cartes.map((carte) => ({ id: carte.id })),
              },
            },
            update: {
              cartes: {
                set: cartes.map((carte) => ({ id: carte.id })),
              },
            },
          },
        },
      },
      include: {
        currentPli: true,
      },
    });
    return updatedManche.currentPli;
  } catch (error) {
    console.error("Error updating current pli:", error);
    throw new Error("Failed to update current pli");
  }
}

/*export async function updatePliPointsServerAction(
  pliId: number,
  points: string,
  isPliPreneur: boolean
): Promise<PliWithCartes | null> {
  try {
    if (isPliPreneur) {
      const updatedPli = await prisma.pliPreneur.update({
        where: { id: pliId },
        data: { points },
        include: { cartes: true },
      });
      return updatedPli;
    } else {
      const updatedPli = await prisma.pliDefenseur.update({
        where: { id: pliId },
        data: { points },
        include: { cartes: true },
      });
      return updatedPli;
    }
  } catch (error) {
    console.error("Error updating pli points:", error);
    throw new Error("Failed to update pli points");
  }
}
*/
