/*
  Warnings:

  - The `action` column on the `ActionJoueur` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "ActionJoueur" DROP COLUMN "action",
ADD COLUMN     "action" "CONTRAT";
