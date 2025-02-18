/*
  Warnings:

  - You are about to drop the `Pli` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CarteToPli` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Pli" DROP CONSTRAINT "Pli_gagnantId_fkey";

-- DropForeignKey
ALTER TABLE "Pli" DROP CONSTRAINT "Pli_mancheDefenseursId_fkey";

-- DropForeignKey
ALTER TABLE "Pli" DROP CONSTRAINT "Pli_manchePreneurId_fkey";

-- DropForeignKey
ALTER TABLE "_CarteToPli" DROP CONSTRAINT "_CarteToPli_A_fkey";

-- DropForeignKey
ALTER TABLE "_CarteToPli" DROP CONSTRAINT "_CarteToPli_B_fkey";

-- AlterTable
ALTER TABLE "Carte" ADD COLUMN     "pliDefenseurId" INTEGER,
ADD COLUMN     "pliPreneurId" INTEGER;

-- DropTable
DROP TABLE "Pli";

-- DropTable
DROP TABLE "_CarteToPli";

-- CreateTable
CREATE TABLE "PliPreneur" (
    "id" SERIAL NOT NULL,
    "mancheId" INTEGER NOT NULL,
    "points" TEXT NOT NULL,
    "gagnantId" TEXT NOT NULL,
    "status" "PLISTATUS" NOT NULL DEFAULT 'ENCOURS',

    CONSTRAINT "PliPreneur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PliDefenseur" (
    "id" SERIAL NOT NULL,
    "mancheId" INTEGER NOT NULL,
    "points" TEXT NOT NULL,
    "gagnantId" TEXT NOT NULL,
    "status" "PLISTATUS" NOT NULL DEFAULT 'ENCOURS',

    CONSTRAINT "PliDefenseur_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PliPreneur_mancheId_key" ON "PliPreneur"("mancheId");

-- CreateIndex
CREATE UNIQUE INDEX "PliDefenseur_mancheId_key" ON "PliDefenseur"("mancheId");

-- AddForeignKey
ALTER TABLE "Carte" ADD CONSTRAINT "Carte_pliPreneurId_fkey" FOREIGN KEY ("pliPreneurId") REFERENCES "PliPreneur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carte" ADD CONSTRAINT "Carte_pliDefenseurId_fkey" FOREIGN KEY ("pliDefenseurId") REFERENCES "PliDefenseur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PliPreneur" ADD CONSTRAINT "PliPreneur_mancheId_fkey" FOREIGN KEY ("mancheId") REFERENCES "Manche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PliPreneur" ADD CONSTRAINT "PliPreneur_gagnantId_fkey" FOREIGN KEY ("gagnantId") REFERENCES "Joueur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PliDefenseur" ADD CONSTRAINT "PliDefenseur_mancheId_fkey" FOREIGN KEY ("mancheId") REFERENCES "Manche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PliDefenseur" ADD CONSTRAINT "PliDefenseur_gagnantId_fkey" FOREIGN KEY ("gagnantId") REFERENCES "Joueur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
