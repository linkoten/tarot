"use server";

import { prisma } from "../db";
import { Carte } from "@prisma/client";
import { createDefenseurPli, createPreneurPli } from "../features/pliActions";

export async function playCard(
  partieId: number,
  joueurId: string,
  cardId: number
) {
  try {
    const partie = await prisma.partie.findUnique({
      where: { id: partieId },
      include: {
        joueurs: { include: { cartes: true } },
        manches: {
          orderBy: { numero: "desc" },
          take: 1,
          include: {
            currentPli: {
              include: {
                cartes: true,
                joueurs: true,
              },
            },
          },
        },
      },
    });

    if (!partie || partie.manches.length === 0)
      throw new Error("Partie or current manche not found");

    const currentManche = partie.manches[partie.manches.length - 1];
    const currentPlayerIndex = partie.tourActuel;
    const currentPlayer = partie.joueurs[currentPlayerIndex];

    const currentPlayerData = partie.joueurs.find(
      (joueur) => joueur.userId === joueurId
    );

    if (!currentPlayerData) {
      throw new Error(`Aucun joueur trouvé avec userId : ${joueurId}`);
    }

    console.log("Joueur courant:", {
      id: currentPlayerData.id,
      userId: currentPlayerData.userId,
    });

    const currentPlayerId = currentPlayerData.id;
    const currentPlayerUserId = currentPlayerData.userId;

    if (currentPlayerUserId !== joueurId) {
      throw new Error("Not your turn");
    }

    const playedCard = await prisma.carte.findUnique({
      where: { id: cardId },
    });

    if (!playedCard) throw new Error("Card not found");

    console.log("Carte jouée:", playedCard);

    // Vérifier si la carte peut être jouée selon les règles
    if (
      currentManche.currentPli &&
      currentManche.currentPli.cartes.length > 0
    ) {
      // Le problème est là. De temps en temps la 1ere carte est en premiere position et parfois elle est en 2eme
      const leadCard =
        currentManche.currentPli.cartes
          .sort((a, b) => a.ordre! - b.ordre!)
          .find((card) => card.couleur !== "EXCUSE") ||
        currentManche.currentPli.cartes[0];

      console.log("leadCard", leadCard);
      const playerCards = currentPlayer.cartes;

      if (!canPlayCard(playedCard, leadCard, playerCards)) {
        console.log("Cards info", playedCard, leadCard, playerCards);
        throw new Error("This card cannot be played according to the rules");
      }
    }

    console.log("test", playedCard);
    console.log("les joueurs", joueurId, currentPlayerId);

    // Ajouter la carte au pli courant

    const updatedCurrentPli = await prisma.currentPli.upsert({
      where: { mancheId: currentManche.id },
      create: {
        manche: { connect: { id: currentManche.id } },
        cartes: { connect: { id: cardId } }, // Ajoute seulement cette carte
        joueurs: { connect: { id: currentPlayer.id } },
      },
      update: {
        cartes: {
          connect: { id: cardId }, // Connecte la carte actuelle
        },
      },
      include: {
        cartes: {
          orderBy: {
            ordre: "asc", // Assurez-vous d'avoir ajouté ce champ à votre modèle Carte
          },
        },
        joueurs: { include: { cartes: true } },
      },
    });
    console.log("Pli courant mis à jour:", updatedCurrentPli);

    await prisma.$transaction(async (prisma) => {
      // Récupérer le pli courant s'il existe
      let currentPli = await prisma.currentPli.findUnique({
        where: { mancheId: currentManche.id },
        include: { cartes: true, joueurs: true },
      });

      const ordre = (currentPli?.cartes.length || 0) + 1; // ✅ Garde l'ordre d'ajout des cartes

      // Ajouter la carte au pli courant en conservant l'ordre
      await prisma.carte.update({
        where: { id: cardId },
        data: {
          ordre: ordre, // ✅ Stocke l'ordre de la carte
          currentPliId: currentPli!.id,
        },
      });

      // Retirer la carte de la main du joueur après avoir déterminé le vainqueur
      await prisma.joueur.update({
        where: { id: currentPlayerId },
        data: {
          cartes: { disconnect: { id: cardId } },
        },
      });

      if (!currentPli) {
        // Créer un nouveau pli si aucun n'existe
        currentPli = await prisma.currentPli.create({
          data: {
            manche: { connect: { id: currentManche.id } },
            cartes: { connect: { id: cardId } },
            joueurs: { connect: { id: currentPlayer.id } },
          },
          include: { cartes: true, joueurs: true },
        });
      } else {
        // Mettre à jour le pli existant
        currentPli = await prisma.currentPli.update({
          where: { id: currentPli.id },
          data: {
            cartes: { connect: { id: cardId } },
            joueurs: { connect: { id: currentPlayer.id } },
          },
          include: { cartes: true, joueurs: true },
        });
      }

      // Mettre à jour la carte pour conserver le lien avec le joueur
      await prisma.carte.update({
        where: { id: cardId },
        data: { joueurId: currentPlayer.id },
      });
    });

    // Mettre à jour le tour actuel
    const nextPlayerIndex = (currentPlayerIndex + 1) % partie.nombreJoueurs;
    await prisma.partie.update({
      where: { id: partieId },
      data: { tourActuel: nextPlayerIndex },
    });

    console.log(
      "legnth",
      updatedCurrentPli.cartes.length,
      partie.nombreJoueurs
    );

    // Vérifier si c'est la fin du pli
    if (updatedCurrentPli.cartes.length === partie.nombreJoueurs) {
      const winningCard = getWinningCard(updatedCurrentPli.cartes);

      console.log("All cards in the pli:", updatedCurrentPli.cartes);
      console.log("Winning card:", winningCard);

      const winningPlayer = partie.joueurs.find((joueur) =>
        joueur.cartes.some((carte) => carte.id === winningCard.id)
      );

      // console.log("All players:", partie.joueurs);
      console.log("Winning player:", winningPlayer);

      if (winningPlayer) {
        const excuseCard = updatedCurrentPli.cartes.find(
          (c) => c.nom === "Excuse"
        );
        const excusePlayer = excuseCard
          ? updatedCurrentPli.joueurs.find((j) => j.id === excuseCard.joueurId)
          : null;
        const isPreneur = excusePlayer
          ? excusePlayer.id === currentManche.preneurId
          : false;

        if (excuseCard) {
          // Si il y a l'excuse dans le pli
          if (isPreneur) {
            /* Si c'est le preneur qui a joué l'excuse on :
              1) Créer le pli chez les défenseurs
              2) On transfert l'excuse du pli defenseur vers le pli preneur
              3) On enlève 0.5 pts du pli preneur et on en ajoute 0.5 au pli defenseur

            */
            await createDefenseurPli(
              currentManche.id,
              updatedCurrentPli.cartes
            );
            await transferExcuseToPreneur(currentManche.id, excuseCard.id);
            await transferHalfPointCard(currentManche.id, "PreneurToDefenseur");
          }

          if (!isPreneur) {
            //Un défenseur a l"excuse
            if (winningPlayer.id !== currentManche.preneurId) {
              // les défenseurs gagnent le pli
              // pas de règles supplémentaires
              await createDefenseurPli(
                currentManche.id,
                updatedCurrentPli.cartes
              );
            } else {
              /* le preneur gagne le pli
                1) on Créé le pli chez le preneur qui a gagné
                2) On transfert l'excuse vers le pli des défenseurs
                3) On échange en contrepartie 0.5 pts entre les 2 plis.
              */
              await createPreneurPli(
                currentManche.id,
                winningPlayer.id,
                updatedCurrentPli.cartes
              );
              await transferExcuseToDefenseur(currentManche.id, excuseCard.id);
              await transferHalfPointCard(
                currentManche.id,
                "DefenseurToPreneur"
              );
            }
          }
        }

        if (!excuseCard) {
          // Les plis normaux sans l'excuse se déroulent ici.
          if (winningPlayer.id === currentManche.preneurId) {
            await createPreneurPli(
              currentManche.id,
              winningPlayer.id,
              updatedCurrentPli.cartes
            );
          } else {
            await createDefenseurPli(
              currentManche.id,
              updatedCurrentPli.cartes
            );
          }
        }

        const winningPlayerIndex = partie.joueurs.findIndex(
          (j) => j.id === winningPlayer.id
        );

        await prisma.partie.update({
          where: { id: partieId },
          data: { tourActuel: winningPlayerIndex },
        });

        await prisma.$transaction(async (tx) => {
          // Récupérer le pli courant s'il existe
          const currentPli = await tx.currentPli.findUnique({
            where: { mancheId: currentManche.id },
            include: { cartes: true }, // Inclure les cartes pour les traiter
          });

          if (!currentPli) {
            throw new Error("No current pli found.");
          }

          // Parcourir les cartes du pli et les déconnecter des mains des joueurs
          for (const carte of currentPli.cartes) {
            if (carte.joueurId) {
              await tx.joueur.update({
                where: { id: carte.joueurId },
                data: {
                  cartes: { disconnect: { id: carte.id } }, // Supprime la carte de la main du joueur
                },
              });
            }
          }
        });

        // Au lieu de supprimer le pli, déconnectez d'abord les relations
        await prisma.currentPli.update({
          where: { mancheId: currentManche.id },
          data: {
            cartes: {
              set: [], // Déconnecte toutes les cartes
            },
          },
        });
      }
    }

    // Vérifier si c'est la fin de la manche
    const remainingCards = await prisma.carte.count({
      where: { joueur: { partieId } },
    });

    if (remainingCards === 0) {
      await prisma.manche.update({
        where: { id: currentManche.id },
        data: { status: "FINISHED" },
      });
      return { success: true, message: "Card played, end of round" };
    }

    return { success: true, message: "Card played successfully" };
  } catch (error) {
    console.error("Error playing card:", error);
    return { success: false, error: "Failed to play card" };
  }
}

function canPlayCard(
  playedCard: Carte,
  leadCard: Carte,
  playerCards: Carte[]
): boolean {
  // L'excuse peut toujours être jouée
  if (playedCard.couleur === "EXCUSE") {
    return true;
  }

  // Si l'excuse est en premier, on prend la première carte non-excuse comme leadCard
  if (leadCard.couleur === "EXCUSE") {
    const actualLeadCard = playerCards.find((c) => c.couleur !== "EXCUSE");
    if (actualLeadCard) {
      leadCard = actualLeadCard;
    } else {
      return true;
    }
  }

  // On vérifie uniquement par rapport à la leadCard (première carte non-excuse)
  const hasLeadColor = playerCards.some((c) => c.couleur === leadCard.couleur);

  // Important: On doit d'abord vérifier si le joueur a la couleur demandée
  if (hasLeadColor) {
    return playedCard.couleur === leadCard.couleur;
  }

  // Si le joueur n'a pas la couleur demandée, il peut jouer n'importe quoi
  return true;
}

function getWinningCard(cards: Carte[]): Carte {
  if (cards.length === 0) {
    throw new Error("Aucune carte jouée");
  }

  // ✅ 1️⃣ Déterminer la leadCard (première carte non-Excuse)
  // On la cherche dans l'ordre des cartes jouées
  const leadCard = cards.find((card) => card.couleur !== "EXCUSE") || cards[0];
  console.log("LeadCard correcte :", leadCard);

  let winningCard = leadCard;
  let highestAtout: Carte | null = null;

  // ✅ 2️⃣ Trouver l'atout le plus fort (si un atout a été joué)
  for (const card of cards) {
    if (card.couleur === "ATOUT" && card.valeur !== null) {
      if (!highestAtout || card.valeur > highestAtout.valeur!) {
        highestAtout = card;
      }
    }
  }

  // ✅ 3️⃣ Si un atout a été joué, c'est l'atout le plus fort qui gagne
  if (highestAtout) {
    return highestAtout;
  }

  // ✅ 4️⃣ Sinon, comparer uniquement les cartes de la couleur demandée
  for (const card of cards) {
    if (
      card.couleur === leadCard.couleur && // Uniquement les cartes de la même couleur que la leadCard
      card.couleur !== "EXCUSE" && // Ignorer l'excuse dans la comparaison
      card.valeur !== null &&
      winningCard.valeur !== null &&
      card.valeur > winningCard.valeur
    ) {
      winningCard = card;
    }
  }

  return winningCard;
}

async function transferHalfPointCard(
  currentMancheId: number,
  direction: string
) {
  if (direction === "PreneurToDefenseur") {
    await prisma.pliPreneur.update({
      where: { mancheId: currentMancheId },
      data: { points: { decrement: 0.5 } },
    });
    await prisma.pliDefenseur.update({
      where: { mancheId: currentMancheId },
      data: { points: { increment: 0.5 } },
    });
  } else if (direction === "DefenseurToPreneur") {
    await prisma.pliDefenseur.update({
      where: { mancheId: currentMancheId },
      data: { points: { decrement: 0.5 } },
    });
    await prisma.pliPreneur.update({
      where: { mancheId: currentMancheId },
      data: { points: { increment: 0.5 } },
    });
  }
}

async function transferExcuseToDefenseur(
  currentMancheId: number,
  excuseCardId: number
) {
  await prisma.pliDefenseur.update({
    where: { mancheId: currentMancheId },
    data: {
      cartes: { connect: { id: excuseCardId } },
    },
  });
  await prisma.pliPreneur.update({
    where: { mancheId: currentMancheId },
    data: {
      cartes: { disconnect: { id: excuseCardId } },
    },
  });
}

async function transferExcuseToPreneur(
  currentMancheId: number,
  excuseCardId: number
) {
  await prisma.pliPreneur.update({
    where: { mancheId: currentMancheId },
    data: {
      cartes: { connect: { id: excuseCardId } },
    },
  });
  await prisma.pliDefenseur.update({
    where: { mancheId: currentMancheId },
    data: {
      cartes: { disconnect: { id: excuseCardId } },
    },
  });
}
