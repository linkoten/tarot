"use server";

import { ActionJoueur, CONTRAT } from "@prisma/client";
import { prisma } from "../db";
import { distributeCards } from "./distributeCards";

const CONTRACT_RANKS = {
  PASSE: 0,
  PRISE: 1,
  GARDE: 2,
  GARDESANS: 3,
  GARDECONTRE: 4,
} as const;

export async function announceContract(
  partieId: number,
  joueurId: string,
  action: CONTRAT
) {
  try {
    const partie = await prisma.partie.findUnique({
      where: { id: partieId },
      include: {
        joueurs: {
          include: {
            cartes: true,
          },
        },
        manches: {
          orderBy: { numero: "asc" },
          include: {
            actionsJoueurs: {
              orderBy: { createdAt: "asc" },
            },
            chien: {
              include: {
                cartes: true,
              },
            },
          },
        },
        actionsJoueurs: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!partie) throw new Error("Partie not found");
    if (!partie.manches[0]) throw new Error("No current manche found");

    const joueur = partie.joueurs.find((j) => j.userId === joueurId);
    if (!joueur) throw new Error("Joueur not found in this partie");

    const currentPlayerIndex = partie.tourActuel;
    const currentPlayer = partie.joueurs[currentPlayerIndex];
    if (currentPlayer.userId !== joueurId) {
      throw new Error("Not your turn");
    }

    const currentManche = partie.manches[partie.manches.length - 1];

    const { nombreJoueurs } = partie;

    // Vérifier si un contrat plus élevé a déjà été annoncé
    const mancheActions = partie.actionsJoueurs.filter(
      (a) => a.mancheId === currentManche.id
    );

    const currentMancheActions = mancheActions.filter(
      (action) => action.mancheId === currentManche.id
    );

    const highestBidSoFar = currentMancheActions.reduce((highest, action) => {
      if (action.action === "PASSE") return highest;
      const currentRank =
        CONTRACT_RANKS[action.action as keyof typeof CONTRACT_RANKS];
      const highestRank = highest
        ? CONTRACT_RANKS[highest.action as keyof typeof CONTRACT_RANKS]
        : -1;
      return currentRank > highestRank ? action : highest;
    }, null as ActionJoueur | null);

    if (highestBidSoFar && action !== "PASSE") {
      const lastContractRank =
        CONTRACT_RANKS[highestBidSoFar.action as keyof typeof CONTRACT_RANKS];
      const newContractRank =
        CONTRACT_RANKS[action as keyof typeof CONTRACT_RANKS];

      if (newContractRank <= lastContractRank) {
        throw new Error("Must announce a higher contract");
      }
    }

    // Création de la nouvelle action
    const newAction = await prisma.actionJoueur.create({
      data: {
        partieId,
        joueurId: joueur.id,
        action,
        mancheId: currentManche.id,
      },
    });

    // Cas spécial : GARDECONTRE
    if (action === "GARDECONTRE") {
      await prisma.manche.update({
        where: { id: currentManche.id },
        data: {
          preneurId: joueur.id,
          contrat: action,
          status: "GAMEPLAY",
        },
      });

      await prisma.partie.update({
        where: { id: partieId },
        data: { tourActuel: partie.donneur },
      });

      return {
        success: true,
        message: "GARDECONTRE announced, starting gameplay",
      };
    }

    // Mettre à jour la liste des actions avec la nouvelle
    const allMancheActions = [...mancheActions, newAction];

    // Compter le nombre de joueurs distincts ayant fait une annonce
    const uniquePlayerIds = new Set(allMancheActions.map((a) => a.joueurId));
    const numberOfPlayersWhoDIdAContract = uniquePlayerIds.size;

    // Si tous les joueurs ont fait une annonce
    if (numberOfPlayersWhoDIdAContract === nombreJoueurs) {
      const numberOfPasses = allMancheActions.filter(
        (a) => a.action === "PASSE"
      ).length;

      // Dans le cas où tout le monde passe
      if (numberOfPasses === nombreJoueurs) {
        // Nettoyer toutes les relations de cartes
        await prisma.$transaction([
          // 1. Déconnecter les cartes du chien
          ...(partie.manches[0].chien?.cartes.map((carte) =>
            prisma.carte.update({
              where: { id: carte.id },
              data: {
                Chien: { disconnect: true },
              },
            })
          ) || []),

          // 2. Déconnecter les cartes des joueurs
          ...partie.joueurs.flatMap((joueur) =>
            joueur.cartes.map((carte) =>
              prisma.carte.update({
                where: { id: carte.id },
                data: {
                  joueur: { disconnect: true },
                },
              })
            )
          ),

          // 3. Supprimer le chien
          prisma.chien.deleteMany({
            where: { mancheId: currentManche.id },
          }),

          // 4. Supprimer les actions
          prisma.actionJoueur.deleteMany({
            where: { mancheId: currentManche.id },
          }),

          // 5. Supprimer la manche
          prisma.manche.delete({
            where: { id: currentManche.id },
          }),

          // 6. Mettre à jour le donneur et le tour
          prisma.partie.update({
            where: { id: partieId },
            data: {
              donneur: (partie.donneur + 1) % nombreJoueurs,
              tourActuel: (partie.donneur + 2) % nombreJoueurs,
            },
          }),
        ]);

        const distributionResult = await distributeCards(partieId);

        if (!distributionResult.success) {
          throw new Error("Failed to distribute cards");
        }

        return {
          success: true,
          message: "All players passed, new manche started",
          newMancheId: distributionResult.manche!.id,
        };
      }

      // Cas où il y a un preneur (tous ont passé sauf un)
      if (numberOfPasses === nombreJoueurs - 1) {
        // Trouver l'action la plus forte dans l'ordre chronologique
        const winningBid = allMancheActions
          .filter((a) => a.action !== "PASSE")
          .reduce((highest, action) => {
            const currentRank =
              CONTRACT_RANKS[action.action as keyof typeof CONTRACT_RANKS];
            const highestRank = highest
              ? CONTRACT_RANKS[highest.action as keyof typeof CONTRACT_RANKS]
              : -1;
            return currentRank > highestRank ? action : highest;
          });

        if (winningBid) {
          const newStatus =
            winningBid.action === "GARDESANS" ? "GAMEPLAY" : "ECHANGE";
          await prisma.manche.update({
            where: { id: currentManche.id },
            data: {
              preneurId: winningBid.joueurId,
              contrat: winningBid.action as CONTRAT,
              status: newStatus,
            },
          });

          await prisma.partie.update({
            where: { id: partieId },
            data: { tourActuel: partie.donneur },
          });

          return {
            success: true,
            message: `Contract ${winningBid.action} set, starting ${newStatus} phase`,
          };
        }
      }
    }

    // Passer au joueur suivant si la manche continue
    else {
      const nextPlayerIndex = (currentPlayerIndex + 1) % nombreJoueurs;
      await prisma.partie.update({
        where: { id: partieId },
        data: { tourActuel: nextPlayerIndex },
      });
    }

    return { success: true, message: "Action recorded", action: newAction };
  } catch (error) {
    console.error("Error announcing contract:", error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Failed to announce contract" };
  }
}
