/*
  Warnings:

  - You are about to drop the column `points` on the `Joueur` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Joueur" DROP COLUMN "points",
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0;
