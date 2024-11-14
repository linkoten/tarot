/*
  Warnings:

  - You are about to drop the column `type` on the `Carte` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Couleur" ADD VALUE 'ATOUT';
ALTER TYPE "Couleur" ADD VALUE 'EXCUSE';

-- AlterTable
ALTER TABLE "Carte" DROP COLUMN "type";

-- DropEnum
DROP TYPE "TypeCarte";
