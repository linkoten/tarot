import { prisma } from "../db";

async function updateScoresAfterManche(mancheId: number) {
  const manche = await prisma.manche.findUnique({
    where: { id: mancheId },
    include: { preneur: true, joueurs: true },
  });

  if (!manche) throw new Error("Manche not found");

  // Mise à jour du score du preneur
  await prisma.joueur.update({
    where: { id: manche.preneur.id },
    data: { score: { increment: manche.scorePreneur } },
  });

  // Mise à jour du score des défenseurs
  const defenseurs = manche.joueurs.filter((j) => j.id !== manche.preneur.id);
  for (const defenseur of defenseurs) {
    await prisma.joueur.update({
      where: { id: defenseur.id },
      data: {
        score: { increment: manche.scoreDefenseurs / defenseurs.length },
      },
    });
  }
}
