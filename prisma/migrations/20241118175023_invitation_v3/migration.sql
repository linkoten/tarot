/*
  Warnings:

  - Made the column `seatIndex` on table `Joueur` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Joueur" ALTER COLUMN "seatIndex" SET NOT NULL;
