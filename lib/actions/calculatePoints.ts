"use server";

import { CONTRAT } from "@prisma/client";
import { prisma } from "../db";

export async function calculatePoints(mancheId: number, nombreJoueurs: number) {
  const manche = await prisma.manche.findUnique({
    where: { id: mancheId },
    include: {
      pliPreneur: { include: { cartes: true } },
      pliDefenseur: { include: { cartes: true } },
      joueurs: {
        select: {
          id: true,
          partieId: true,
          userId: true,
          pseudo: true,
          score: true,
          seatIndex: true,
        },
      },
      preneur: {
        select: {
          id: true,
          partieId: true,
          userId: true,
          pseudo: true,
          score: true,
          seatIndex: true,
        },
      },
    },
  });

  console.log("Manche fetched:", manche);

  if (!manche) throw new Error("Manche not found");

  const { pliPreneur, contrat, preneur, joueurs } = manche;
  if (!pliPreneur) return;
  const nombreBouts = pliPreneur.cartes.filter((carte) => carte.bout).length;
  console.log("Nombre de bouts:", nombreBouts);

  // Compter les cartes spéciales
  const cartesPenalite = [
    ...pliPreneur.cartes.filter(
      (carte) =>
        carte.nom.toLowerCase().includes("14") ||
        carte.nom.toLowerCase().includes("13") ||
        carte.nom.toLowerCase().includes("12") ||
        carte.nom.toLowerCase().includes("11") ||
        carte.bout == true
    ),
  ];

  const pointsPreneur = pliPreneur?.points - cartesPenalite.length * 0.5;
  console.log("Points preneur:", pointsPreneur);

  const pointsRequis = {
    0: 56,
    1: 51,
    2: 41,
    3: 36,
  }[nombreBouts];
  console.log("Points requis:", pointsRequis);

  if (!pointsRequis) return;

  const difference = pointsPreneur - pointsRequis;
  console.log("Différence:", difference);

  const basePoints = 25;
  const bonusPoints = Math.abs(difference);

  const contractMultiplier = {
    [CONTRAT.PASSE]: 0,
    [CONTRAT.PRISE]: 1,
    [CONTRAT.GARDE]: 2,
    [CONTRAT.GARDESANS]: 4,
    [CONTRAT.GARDECONTRE]: 6,
  }[contrat as CONTRAT];

  const totalPoints = basePoints * contractMultiplier + bonusPoints;
  console.log("Total points:", totalPoints);

  const nombreDefenseur = nombreJoueurs - 1;

  console.log("Nombre Defenseur:", nombreDefenseur);

  const isSuccess = difference >= 0;
  const preneurScore = isSuccess
    ? totalPoints * nombreDefenseur
    : -totalPoints * nombreDefenseur;
  const defenseurScore = isSuccess ? -totalPoints : totalPoints;
  console.log("Score preneur:", preneurScore);
  console.log("Score défenseur:", defenseurScore);
  // Update manche
  await prisma.manche.update({
    where: { id: mancheId },
    data: {
      resultat: isSuccess ? "GAGNE" : "PERDU",
      scorePreneur: preneurScore,
      scoreDefenseurs: defenseurScore,
    },
  });

  // Update joueurs scores
  for (const joueur of joueurs) {
    const scoreToAdd =
      joueur.id === preneur?.id ? preneurScore : defenseurScore;
    await prisma.joueur.update({
      where: { id: joueur.id },
      data: { score: { increment: scoreToAdd } },
    });
    console.log(`Score updated for joueur ${joueur.id}`);
  }
  console.log("Final result:", { preneurScore, defenseurScore, isSuccess });
  return { preneurScore, defenseurScore, isSuccess };
}
