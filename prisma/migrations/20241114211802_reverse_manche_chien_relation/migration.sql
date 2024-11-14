/*
  Warnings:

  - You are about to drop the column `chienId` on the `Manche` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mancheId]` on the table `Chien` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `mancheId` to the `Chien` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombreCartes` to the `Chien` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoreChien` to the `Chien` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scoreDefenseurs` to the `Manche` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scorePreneur` to the `Manche` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Manche" DROP CONSTRAINT "Manche_chienId_fkey";

-- DropIndex
DROP INDEX "Manche_chienId_key";

-- AlterTable
ALTER TABLE "Chien" ADD COLUMN     "mancheId" INTEGER NOT NULL,
ADD COLUMN     "nombreCartes" INTEGER NOT NULL,
ADD COLUMN     "scoreChien" DECIMAL(4,1) NOT NULL;

-- AlterTable
ALTER TABLE "Manche" DROP COLUMN "chienId",
ADD COLUMN     "scoreDefenseurs" INTEGER NOT NULL,
ADD COLUMN     "scorePreneur" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chien_mancheId_key" ON "Chien"("mancheId");

-- AddForeignKey
ALTER TABLE "Chien" ADD CONSTRAINT "Chien_mancheId_fkey" FOREIGN KEY ("mancheId") REFERENCES "Manche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
