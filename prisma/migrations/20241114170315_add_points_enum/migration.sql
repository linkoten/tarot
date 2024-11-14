/*
  Warnings:

  - You are about to alter the column `points` on the `Carte` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `Decimal(3,1)`.

*/
-- AlterTable
ALTER TABLE "Carte" ALTER COLUMN "points" SET DATA TYPE DECIMAL(3,1);
