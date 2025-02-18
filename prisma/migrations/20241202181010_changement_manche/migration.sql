-- DropForeignKey
ALTER TABLE "Manche" DROP CONSTRAINT "Manche_preneurId_fkey";

-- AlterTable
ALTER TABLE "Manche" ALTER COLUMN "preneurId" DROP NOT NULL,
ALTER COLUMN "contrat" DROP NOT NULL,
ALTER COLUMN "resultat" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Manche" ADD CONSTRAINT "Manche_preneurId_fkey" FOREIGN KEY ("preneurId") REFERENCES "Joueur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
