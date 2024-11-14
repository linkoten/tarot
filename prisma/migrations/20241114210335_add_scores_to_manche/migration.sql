/*
  Warnings:

  - You are about to drop the column `mancheId` on the `Pli` table. All the data in the column will be lost.
  - You are about to alter the column `points` on the `Pli` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(4,1)`.
  - A unique constraint covering the columns `[pliPreneurId]` on the table `Manche` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[pliDefenseursId]` on the table `Manche` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chienId]` on the table `Manche` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[manchePreneurId]` on the table `Pli` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mancheDefenseursId]` on the table `Pli` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chienId` to the `Manche` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contrat` to the `Manche` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pliDefenseursId` to the `Manche` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pliPreneurId` to the `Manche` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultat` to the `Manche` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreJoueurs` to the `Partie` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CONTRAT" AS ENUM ('PRISE', 'GARDE', 'GARDESANS', 'GARDECONTRE');

-- CreateEnum
CREATE TYPE "RESULTAT" AS ENUM ('GAGNE', 'PERDU');

-- DropForeignKey
ALTER TABLE "Pli" DROP CONSTRAINT "Pli_gagnantId_fkey";

-- DropForeignKey
ALTER TABLE "Pli" DROP CONSTRAINT "Pli_mancheId_fkey";

-- AlterTable
ALTER TABLE "Carte" ADD COLUMN     "chienId" INTEGER;

-- AlterTable
ALTER TABLE "Manche" ADD COLUMN     "chienId" INTEGER NOT NULL,
ADD COLUMN     "contrat" "CONTRAT" NOT NULL,
ADD COLUMN     "pliDefenseursId" INTEGER NOT NULL,
ADD COLUMN     "pliPreneurId" INTEGER NOT NULL,
ADD COLUMN     "resultat" "RESULTAT" NOT NULL;

-- AlterTable
ALTER TABLE "Partie" ADD COLUMN     "nombreJoueurs" SMALLINT NOT NULL;

-- AlterTable
ALTER TABLE "Pli" DROP COLUMN "mancheId",
ADD COLUMN     "mancheDefenseursId" INTEGER,
ADD COLUMN     "manchePreneurId" INTEGER,
ALTER COLUMN "gagnantId" DROP NOT NULL,
ALTER COLUMN "points" SET DATA TYPE DECIMAL(4,1);

-- CreateTable
CREATE TABLE "Chien" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Chien_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manche_pliPreneurId_key" ON "Manche"("pliPreneurId");

-- CreateIndex
CREATE UNIQUE INDEX "Manche_pliDefenseursId_key" ON "Manche"("pliDefenseursId");

-- CreateIndex
CREATE UNIQUE INDEX "Manche_chienId_key" ON "Manche"("chienId");

-- CreateIndex
CREATE UNIQUE INDEX "Pli_manchePreneurId_key" ON "Pli"("manchePreneurId");

-- CreateIndex
CREATE UNIQUE INDEX "Pli_mancheDefenseursId_key" ON "Pli"("mancheDefenseursId");

-- AddForeignKey
ALTER TABLE "Carte" ADD CONSTRAINT "Carte_chienId_fkey" FOREIGN KEY ("chienId") REFERENCES "Chien"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manche" ADD CONSTRAINT "Manche_pliPreneurId_fkey" FOREIGN KEY ("pliPreneurId") REFERENCES "Pli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manche" ADD CONSTRAINT "Manche_pliDefenseursId_fkey" FOREIGN KEY ("pliDefenseursId") REFERENCES "Pli"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manche" ADD CONSTRAINT "Manche_chienId_fkey" FOREIGN KEY ("chienId") REFERENCES "Chien"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pli" ADD CONSTRAINT "Pli_gagnantId_fkey" FOREIGN KEY ("gagnantId") REFERENCES "Joueur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
