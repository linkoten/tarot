"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "../db";
import { distributeCards } from "./distributeCards";
import { Carte, Joueur } from "@prisma/client";

export async function createNewManche(partieId: number) {
  try {
    // Find the current partie
    const partie = await prisma.partie.findUnique({
      where: { id: partieId },
      include: {
        manches: {
          orderBy: { numero: "asc" },
          take: 1,
        },
        joueurs: true,
      },
    });

    if (!partie) {
      throw new Error("Partie not found");
    }

    // Determine the next manche number
    const nextMancheNumero = (partie.manches[0]?.numero || 0) + 1;

    // Check if game has reached maximum rounds (10)
    if (nextMancheNumero > 10) {
      throw new Error("Maximum number of manches reached");
    }

    // Créer la nouvelle manche
    const newManche = await prisma.manche.create({
      data: {
        partieId: partie.id,
        numero: nextMancheNumero,
        status: "CONTRACT",
        joueurs: {
          connect: partie.joueurs.map((joueur) => ({ id: joueur.id })),
        },
        scoreDefenseurs: 0,
        scorePreneur: 0,
      },
      include: {
        chien: {
          include: { cartes: true },
        },
        pliPreneur: {
          include: { cartes: true },
        },
        pliDefenseur: {
          include: { cartes: true },
        },
        currentPli: {
          include: { cartes: true },
        },
      },
    });

    // Retrieve and shuffle all cards
    const allCards = await prisma.carte.findMany();
    const shuffledCards = allCards.sort(() => Math.random() - 0.5);

    // Distribute cards to players and chien
    const cardsPerPlayer = 24;
    const chienCards = shuffledCards.slice(72);
    const updatedJoueurs: (Joueur & { cartes: Carte[] })[] = [];

    // Clear previous cards for all players
    await Promise.all(
      partie.joueurs.map((joueur) =>
        prisma.joueur.update({
          where: { id: joueur.id },
          data: { cartes: { set: [] } },
        })
      )
    );

    for (let i = 0; i < partie.joueurs.length; i++) {
      const playerCards = shuffledCards.slice(
        i * cardsPerPlayer,
        (i + 1) * cardsPerPlayer
      );

      const updatedJoueur = await prisma.joueur.update({
        where: { id: partie.joueurs[i].id },
        data: {
          cartes: {
            connect: playerCards.map((card) => ({ id: card.id })),
          },
        },
        include: { cartes: true },
      });
      updatedJoueurs.push(updatedJoueur);
    }

    // Create chien with remaining cards
    const chien = await prisma.chien.create({
      data: {
        manche: { connect: { id: newManche.id } },
        cartes: {
          connect: chienCards.map((card) => ({ id: card.id })),
        },
        nombreCartes: 6,
        pointsChien: chienCards.reduce((sum, card) => sum + card.points, 0),
      },
      include: { cartes: true },
    });

    // Update partie status
    await prisma.partie.update({
      where: { id: partieId },
      data: {
        mancheActuelle: nextMancheNumero,
      },
    });

    return {
      success: true,
      message: "Cards distributed successfully for subsequent manche",
      manche: newManche,
      chien,
    };
  } catch (error) {
    console.error("Error creating new manche:", error);
    throw error;
  }
}
