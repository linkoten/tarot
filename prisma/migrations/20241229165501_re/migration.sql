/*
  Warnings:

  - You are about to drop the column `gagnantId` on the `PliDefenseur` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PliDefenseur" DROP CONSTRAINT "PliDefenseur_gagnantId_fkey";

-- AlterTable
ALTER TABLE "PliDefenseur" DROP COLUMN "gagnantId";

-- CreateTable
CREATE TABLE "_JoueurToPliDefenseur" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_JoueurToPliDefenseur_AB_unique" ON "_JoueurToPliDefenseur"("A", "B");

-- CreateIndex
CREATE INDEX "_JoueurToPliDefenseur_B_index" ON "_JoueurToPliDefenseur"("B");

-- AddForeignKey
ALTER TABLE "_JoueurToPliDefenseur" ADD CONSTRAINT "_JoueurToPliDefenseur_A_fkey" FOREIGN KEY ("A") REFERENCES "Joueur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoueurToPliDefenseur" ADD CONSTRAINT "_JoueurToPliDefenseur_B_fkey" FOREIGN KEY ("B") REFERENCES "PliDefenseur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
