"use server";

import { prisma } from "../db";
import { CONTRAT } from "@prisma/client";

export async function handleChien(
  partieId: number,
  preneurId: string,
  cardsToDiscard: number[]
) {
  try {
    const manche = await prisma.manche.findFirst({
      where: { partieId, preneurId },
      include: { chien: { include: { cartes: true } } },
      orderBy: { numero: "desc" },
    });

    if (!manche || !manche.chien) throw new Error("Manche or chien not found");

    const preneur = await prisma.joueur.findUnique({
      where: { id: preneurId },
      include: { cartes: true },
    });

    if (!preneur) throw new Error("Preneur not found");

    if (manche.contrat === CONTRAT.PRISE || manche.contrat === CONTRAT.GARDE) {
      if (cardsToDiscard.length !== 6)
        throw new Error("Must discard exactly 6 cards");

      const allAvailableCards = [
        ...preneur.cartes.map((card) => card.id),
        ...manche.chien.cartes.map((card) => card.id),
      ];

      console.log("allAvailableCards", allAvailableCards);
      console.log("manche", manche);

      if (
        !cardsToDiscard.every((cardId) => allAvailableCards.includes(cardId))
      ) {
        throw new Error("Invalid cards selected for discard");
      }

      // Ajouter les cartes du chien au preneur
      await prisma.joueur.update({
        where: { id: preneurId },
        data: {
          cartes: {
            connect: manche.chien.cartes.map((card) => ({ id: card.id })),
          },
        },
      });

      // Retirer les cartes sélectionnées de la main du preneur et les ajouter au chien
      await prisma.chien.update({
        where: { id: manche.chien.id },
        data: {
          cartes: {
            disconnect: manche.chien.cartes.map((card) => ({ id: card.id })),
            connect: cardsToDiscard.map((cardId) => ({ id: cardId })),
          },
        },
      });

      await prisma.joueur.update({
        where: { id: preneurId },
        data: {
          cartes: {
            disconnect: cardsToDiscard.map((cardId) => ({ id: cardId })),
          },
        },
      });

      // Renvoyer les nouvelles données mises à jour
      const updatedChien = await prisma.chien.findUnique({
        where: { id: manche.chien.id },
        include: { cartes: true },
      });

      const updatedPreneur = await prisma.joueur.findUnique({
        where: { id: preneurId },
        include: { cartes: true },
      });

      const pointsChienFinal =
        updatedChien?.cartes.reduce(
          (sum, card) => sum + (card.points || 0),
          0
        ) || 0;

      await prisma.pliPreneur.create({
        data: {
          manche: { connect: { id: manche.id } },
          gagnant: { connect: { id: preneurId } },

          cartes: {
            connect: cardsToDiscard.map((cardId) => ({ id: cardId })),
          },
          points: pointsChienFinal,
        },
      });

      // Mettre à jour le statut de la manche à GAMEPLAY
      await prisma.manche.update({
        where: { id: manche.id },
        data: { status: "GAMEPLAY" },
      });

      return {
        success: true,
        message: "Chien handled successfully",
        updatedChien,
        updatedPreneur,
      };
    } else if (
      manche.contrat === CONTRAT.GARDESANS ||
      manche.contrat === CONTRAT.GARDECONTRE
    ) {
      if (manche.contrat === CONTRAT.GARDESANS) {
        const updatedChien = await prisma.chien.findUnique({
          where: { id: manche.chien.id },
          include: { cartes: true },
        });
        await prisma.pliPreneur.create({
          data: {
            manche: { connect: { id: manche.id } },
            gagnant: { connect: { id: preneurId } },

            cartes: {
              connect: cardsToDiscard.map((cardId) => ({ id: cardId })),
            },
            points: updatedChien?.pointsChien,
          },
        });
      } else if (manche.contrat === CONTRAT.GARDECONTRE) {
        const updatedChien = await prisma.chien.findUnique({
          where: { id: manche.chien.id },
          include: { cartes: true },
        });

        await prisma.pliDefenseur.create({
          data: {
            manche: { connect: { id: manche.id } },

            cartes: {
              connect: cardsToDiscard.map((cardId) => ({ id: cardId })),
            },
            points: updatedChien?.pointsChien,
          },
        });
      }

      // Mettre à jour le statut de la manche à GAMEPLAY
      await prisma.manche.update({
        where: { id: manche.id },
        data: { status: "GAMEPLAY" },
      });

      // Renvoyer les nouvelles données mises à jour
      const updatedChien = await prisma.chien.findUnique({
        where: { id: manche.chien.id },
        include: { cartes: true },
      });

      const updatedPreneur = await prisma.joueur.findUnique({
        where: { id: preneurId },
        include: { cartes: true },
      });
      // Pour Garde Sans et Garde Contre, le chien reste intact
      return {
        success: true,
        message: "Chien remains untouched for Garde Sans or Garde Contre",
        updatedChien,
        updatedPreneur,
      };
    } else {
      throw new Error("Invalid contract");
    }
  } catch (error) {
    console.error("Error handling chien:", error);
    return { success: false, error: "Failed to handle chien" };
  }
}
