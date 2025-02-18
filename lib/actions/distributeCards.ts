"use server";

import { prisma } from "@/lib/db";
import { Carte, Joueur } from "@prisma/client";

export async function distributeCards(partieId: number) {
  try {
    const partie = await prisma.partie.findUnique({
      where: { id: partieId },
      include: {
        joueurs: true,
        manches: {
          orderBy: { numero: "desc" },
          take: 1,
        },
      },
    });

    if (!partie) throw new Error("Partie not found");

    if (partie.joueurs.length !== 3) {
      throw new Error(
        "Invalid number of players. This game requires 3 players."
      );
    }

    const isFirstManche =
      partie.manches.length === 0 || partie.manches[0].numero === 1;

    if (isFirstManche) {
      // Créer une nouvelle manche
      const manche = await prisma.manche.create({
        data: {
          partie: { connect: { id: partieId } },
          numero: 1,
          points: 0,
          scorePreneur: 0,
          scoreDefenseurs: 0,
          contrat: null,
          preneurId: undefined,
          resultat: null,
          chien: undefined,
          pliDefenseur: undefined,
          pliPreneur: undefined,
          currentPli: undefined,
        },
        include: {
          chien: {
            include: {
              cartes: true,
            },
          },
          currentPli: {
            include: {
              cartes: true,
            },
          },
          pliDefenseur: {
            include: {
              cartes: true,
            },
          },
          pliPreneur: {
            include: {
              cartes: true,
            },
          },
        },
      });

      // Récupérer et mélanger toutes les cartes
      const allCards = await prisma.carte.findMany();
      const shuffledCards = allCards.sort(() => Math.random() - 0.5);

      // Distribuer les cartes entre les joueurs et le chien
      const cardsPerPlayer = 24;
      const chienCards = shuffledCards.slice(72);
      const updatedJoueurs: (Joueur & { cartes: Carte[] })[] = [];

      console.log("Total cards:", shuffledCards.length); // Doit être 78
      console.log("Players:", partie.joueurs.length); // Doit correspondre au nombre de joueurs dans la partie

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

      // Créer le chien avec les cartes restantes
      const chien = await prisma.chien.create({
        data: {
          manche: { connect: { id: manche.id } },
          cartes: {
            connect: chienCards.map((card) => ({ id: card.id })),
          },
          nombreCartes: 6,
          pointsChien: chienCards.reduce((sum, card) => sum + card.points, 0),
        },
        include: { cartes: true },
      });

      console.log(
        "Total distributed to players:",
        updatedJoueurs.reduce((sum, j) => sum + j.cartes.length, 0)
      );
      console.log("Chien cards:", chienCards.length); // Doit être 6

      // Mettre à jour le statut de la partie
      await prisma.partie.update({
        where: { id: partieId },
        data: {
          status: "EN_COURS",
          mancheActuelle: 1,
        },
      });

      return {
        success: true,
        message: "Cards distributed successfully",
        cards: shuffledCards,
        joueurs: updatedJoueurs,
        manche,
        chien,
      };
    } else {
      const nextMancheNumero = partie.manches[0].numero + 1;

      // Créer une nouvelle manche
      const newManche = await prisma.manche.create({
        data: {
          partie: { connect: { id: partieId } },
          numero: nextMancheNumero,
          points: 0,
          scorePreneur: 0,
          scoreDefenseurs: 0,
          contrat: null,
          preneurId: undefined,
          resultat: null,
          chien: undefined,
          pliDefenseur: undefined,
          pliPreneur: undefined,
          currentPli: undefined,
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
    }
  } catch (error) {
    console.error("Error distributing cards:", error);
    return { success: false, error: "Failed to distribute cards" };
  }
}
