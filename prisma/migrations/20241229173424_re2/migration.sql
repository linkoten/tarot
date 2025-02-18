-- AlterTable
ALTER TABLE "Carte" ADD COLUMN     "mancheId" INTEGER;

-- AddForeignKey
ALTER TABLE "Carte" ADD CONSTRAINT "Carte_mancheId_fkey" FOREIGN KEY ("mancheId") REFERENCES "Manche"("id") ON DELETE SET NULL ON UPDATE CASCADE;
