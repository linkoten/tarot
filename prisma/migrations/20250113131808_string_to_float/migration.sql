/*
  Warnings:

  - You are about to drop the column `scoreChien` on the `Chien` table. All the data in the column will be lost.
  - The `points` column on the `Manche` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `points` column on the `PliDefenseur` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `points` column on the `PliPreneur` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `points` on table `Carte` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Carte" ALTER COLUMN "points" SET NOT NULL;

-- AlterTable
ALTER TABLE "Chien" DROP COLUMN "scoreChien",
ADD COLUMN     "pointsChien" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Manche" DROP COLUMN "points",
ADD COLUMN     "points" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PliDefenseur" DROP COLUMN "points",
ADD COLUMN     "points" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PliPreneur" DROP COLUMN "points",
ADD COLUMN     "points" DOUBLE PRECISION NOT NULL DEFAULT 0;
