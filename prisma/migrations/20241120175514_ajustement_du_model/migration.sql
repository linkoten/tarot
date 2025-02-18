-- CreateEnum
CREATE TYPE "POIGNEE" AS ENUM ('SIMPLE', 'DOUBLE', 'TRIPLE');

-- AlterTable
ALTER TABLE "Carte" ADD COLUMN     "joueurId" TEXT;

-- AlterTable
ALTER TABLE "Manche" ADD COLUMN     "chelemAnnonce" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "chelemRealise" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "petitAuBout" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "poigneeAnnoncee" "POIGNEE",
ADD COLUMN     "roiAppele" "Couleur";

-- AlterTable
ALTER TABLE "Partie" ADD COLUMN     "donneur" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'EN_ATTENTE',
ADD COLUMN     "tourActuel" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Carte" ADD CONSTRAINT "Carte_joueurId_fkey" FOREIGN KEY ("joueurId") REFERENCES "Joueur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
