import { prisma } from "../db";

export async function getCartes() {
  const cartes = await prisma.carte.findMany();
  return cartes;
}
