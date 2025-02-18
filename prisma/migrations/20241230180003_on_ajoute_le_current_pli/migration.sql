/*
  Warnings:

  - The `points` column on the `Carte` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Carte" DROP CONSTRAINT "Carte_mancheId_fkey";

-- AlterTable
ALTER TABLE "Carte" ADD COLUMN     "currentPliId" INTEGER,
DROP COLUMN "points",
ADD COLUMN     "points" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CurrentPli" (
    "id" SERIAL NOT NULL,
    "mancheId" INTEGER NOT NULL,

    CONSTRAINT "CurrentPli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CurrentPliToJoueur" (
    "A" INTEGER NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CurrentPli_mancheId_key" ON "CurrentPli"("mancheId");

-- CreateIndex
CREATE UNIQUE INDEX "_CurrentPliToJoueur_AB_unique" ON "_CurrentPliToJoueur"("A", "B");

-- CreateIndex
CREATE INDEX "_CurrentPliToJoueur_B_index" ON "_CurrentPliToJoueur"("B");

-- AddForeignKey
ALTER TABLE "Carte" ADD CONSTRAINT "Carte_currentPliId_fkey" FOREIGN KEY ("currentPliId") REFERENCES "CurrentPli"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CurrentPli" ADD CONSTRAINT "CurrentPli_mancheId_fkey" FOREIGN KEY ("mancheId") REFERENCES "Manche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CurrentPliToJoueur" ADD CONSTRAINT "_CurrentPliToJoueur_A_fkey" FOREIGN KEY ("A") REFERENCES "CurrentPli"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CurrentPliToJoueur" ADD CONSTRAINT "_CurrentPliToJoueur_B_fkey" FOREIGN KEY ("B") REFERENCES "Joueur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
