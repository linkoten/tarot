/*
  Warnings:

  - The `valeur` column on the `Carte` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Carte" DROP COLUMN "valeur",
ADD COLUMN     "valeur" INTEGER;
