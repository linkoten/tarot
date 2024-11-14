/*
  Warnings:

  - Added the required column `atout` to the `Carte` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Carte_atout_key";

-- AlterTable
ALTER TABLE "Carte" DROP COLUMN "atout",
ADD COLUMN     "atout" BOOLEAN NOT NULL;
