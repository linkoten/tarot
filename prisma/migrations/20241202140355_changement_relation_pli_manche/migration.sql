/*
  Warnings:

  - You are about to drop the column `pliDefenseursId` on the `Manche` table. All the data in the column will be lost.
  - You are about to drop the column `pliPreneurId` on the `Manche` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Manche" DROP CONSTRAINT "Manche_pliDefenseursId_fkey";

-- DropForeignKey
ALTER TABLE "Manche" DROP CONSTRAINT "Manche_pliPreneurId_fkey";

-- DropIndex
DROP INDEX "Manche_pliDefenseursId_key";

-- DropIndex
DROP INDEX "Manche_pliPreneurId_key";

-- AlterTable
ALTER TABLE "Manche" DROP COLUMN "pliDefenseursId",
DROP COLUMN "pliPreneurId";

-- AddForeignKey
ALTER TABLE "Pli" ADD CONSTRAINT "Pli_manchePreneurId_fkey" FOREIGN KEY ("manchePreneurId") REFERENCES "Manche"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pli" ADD CONSTRAINT "Pli_mancheDefenseursId_fkey" FOREIGN KEY ("mancheDefenseursId") REFERENCES "Manche"("id") ON DELETE SET NULL ON UPDATE CASCADE;
