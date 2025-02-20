"use server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "../db";
import { revalidatePath } from "next/cache";
import { ActionJoueur, CONTRAT, Couleur, POIGNEE } from "@prisma/client";
import { PartieWithJoueurs, PartieWithRelations } from "@/app/types/type";

export interface PartieWithRelationsAndActions extends PartieWithRelations {
  actionsJoueurs: ActionJoueur[];
}

export async function createGame(
  nombreJoueurs: number
): Promise<PartieWithJoueurs> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Vous devez être connecté pour créer une partie");
  }

  try {
    // Récupérer l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      throw new Error("Utilisateur non trouvé");
    }

    // Créer une partie avec le joueur créateur
    const partie = await prisma.partie.create({
      data: {
        nombreJoueurs,
        joueurs: {
          create: {
            user: {
              connect: {
                id: user.id,
              },
            },
            pseudo: "Créateur", // Pseudo par défaut pour le créateur
            seatIndex: 0, // Place réservée pour le créateur
          },
        },
      },
      include: {
        joueurs: {
          include: {
            cartes: true, // Inclure les cartes du joueur
            manches: true, // Inclure les manches associées au joueur
          },
        },
        manches: true, // Inclure les manches associées à la partie
        invitations: true, // Inclure les invitations associées à la partie
      },
    });

    return partie as PartieWithJoueurs; // Retourner avec le typage enrichi
  } catch (error) {
    console.error("Erreur lors de la création de la partie:", error);
    throw new Error("Impossible de créer la partie");
  }
}

export async function invitePlayer(
  partieId: number,
  seatIndex: number,
  invitedUserId: string
) {
  const { userId } = await auth();
  if (!userId)
    throw new Error("Vous devez être connecté pour inviter un joueur");

  const invitation = await prisma.invitation.create({
    data: {
      partieId,
      seatIndex,
      invitedUserId,
      invitingUserId: userId,
      status: "PENDING",
    },
  });

  revalidatePath(`/dashboard/${partieId}`);
  return invitation;
}

export async function acceptInvitation(invitationId: string) {
  const { userId } = await auth();
  if (!userId)
    throw new Error("Vous devez être connecté pour accepter une invitation");

  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) {
    throw new Error("Utilisateur non trouvé");
  }

  const invitation = await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "ACCEPTED" },
    include: { partie: true },
  });

  await prisma.joueur.create({
    data: {
      userId: user.id,
      partieId: invitation.partieId,
      seatIndex: invitation.seatIndex,
      pseudo: user.name || "Joueur", // Use the user's name as pseudo, or "Joueur" if name is null
    },
  });

  revalidatePath(`/dashboard/${invitation.partieId}`);
  return invitation.partie;
}

export async function declineInvitation(invitationId: string) {
  const invitation = await prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "DECLINED" },
  });

  revalidatePath(`/dashboard/${invitation.partieId}`);
  return invitation;
}

export async function getOnlineUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      clerkUserId: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return users;
}

export async function getPartieById(
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
            currentPli: {
              include: {
                cartes: true,
              },
            },
            actionsJoueurs: true,
          },
        },
        invitations: true,
        actionsJoueurs: true,
      },
    });

    if (!partie) {
      return null;
    }

    return partie as PartieWithRelations;
  } catch (error) {
    console.error("Erreur lors de la récupération de la partie:", error);
    throw new Error("Impossible de récupérer la partie");
  }
}

/*export async function findPartie(params: any) {
  try {
    const partie = await prisma.partie.findUnique({
      where: { id: parseInt(params.partieId) },
      include: { joueurs: true },
    });
    return partie;
  } catch (error) {
    console.error("Erreur, la partie n'existe pas:", error);
    throw error;
  }
} */

export async function addUserToPlayer(
  userId: string,
  partieId: number,
  seatIndex: number
) {
  try {
    const player = await prisma.joueur.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        partie: {
          connect: {
            id: partieId,
          },
        },
        seatIndex,
      },
    });

    return player;
  } catch (error) {
    console.error("Error creating player:", error);
    throw error;
  }
}

export async function revelerChien(mancheId: number) {
  const chien = await prisma.chien.findUnique({
    where: { mancheId },
    include: { cartes: true },
  });

  if (!chien) throw new Error("Chien non trouvé");

  // Update each carte individually
  for (const carte of chien.cartes) {
    await prisma.carte.update({
      where: { id: carte.id },
      data: { image1: carte.image2 }, // Reveal the card by setting image1 to image2
    });
  }
}

export async function annonceContrat(
  partieId: number,
  joueurId: string,
  contrat: CONTRAT
) {
  const manche = await prisma.manche.findFirst({
    where: { partieId, resultat: undefined },
    orderBy: { createdAt: "desc" },
  });

  if (!manche) throw new Error("Aucune manche en cours");

  await prisma.manche.update({
    where: { id: manche.id },
    data: {
      preneur: { connect: { id: joueurId } },
      contrat,
    },
  });

  if (contrat === "PRISE" || contrat === "GARDE") {
    await revelerChien(manche.id);
  }

  const partie = await prisma.partie.findUnique({
    where: { id: partieId },
    include: { joueurs: true },
  });

  if (!partie) throw new Error("Partie non trouvée");

  const nextPlayerIndex = (partie.tourActuel + 1) % partie.nombreJoueurs;
  await prisma.partie.update({
    where: { id: partieId },
    data: { tourActuel: nextPlayerIndex },
  });

  return manche;
}

export async function annoncePoignee(mancheId: number, poignee: POIGNEE) {
  return prisma.manche.update({
    where: { id: mancheId },
    data: { poigneeAnnoncee: poignee },
  });
}

export async function annonceChelem(mancheId: number, joueurId: string) {
  return prisma.manche.update({
    where: { id: mancheId },
    data: { chelemAnnonce: true },
  });
}

export async function annonceRoi(
  mancheId: number,
  joueurId: string,
  couleur: Couleur
) {
  return prisma.manche.update({
    where: { id: mancheId },
    data: { roiAppele: couleur },
  });
}

export async function findUserByClerkId(clerkUserId: string) {
  return await prisma.user.findUnique({
    where: { clerkUserId },
  });
}
