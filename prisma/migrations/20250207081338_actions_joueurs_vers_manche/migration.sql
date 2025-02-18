/*
  Warnings:

  - You are about to drop the column `manche` on the `ActionJoueur` table. All the data in the column will be lost.
  - Added the required column `mancheId` to the `ActionJoueur` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ActionJoueur" DROP COLUMN "manche",
ADD COLUMN     "mancheId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "ActionJoueur" ADD CONSTRAINT "ActionJoueur_mancheId_fkey" FOREIGN KEY ("mancheId") REFERENCES "Manche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
