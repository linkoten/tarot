/*
  Warnings:

  - The primary key for the `Invitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Joueur` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Joueur" DROP CONSTRAINT "Joueur_userId_fkey";

-- DropForeignKey
ALTER TABLE "Manche" DROP CONSTRAINT "Manche_preneurId_fkey";

-- DropForeignKey
ALTER TABLE "Pli" DROP CONSTRAINT "Pli_gagnantId_fkey";

-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_authorId_fkey";

-- DropForeignKey
ALTER TABLE "_JoueurToManche" DROP CONSTRAINT "_JoueurToManche_A_fkey";

-- AlterTable
ALTER TABLE "Invitation" DROP CONSTRAINT "Invitation_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Invitation_id_seq";

-- AlterTable
ALTER TABLE "Joueur" DROP CONSTRAINT "Joueur_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Joueur_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Joueur_id_seq";

-- AlterTable
ALTER TABLE "Manche" ALTER COLUMN "preneurId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Pli" ALTER COLUMN "gagnantId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "_JoueurToManche" ALTER COLUMN "A" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "Post";

-- AddForeignKey
ALTER TABLE "Joueur" ADD CONSTRAINT "Joueur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manche" ADD CONSTRAINT "Manche_preneurId_fkey" FOREIGN KEY ("preneurId") REFERENCES "Joueur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pli" ADD CONSTRAINT "Pli_gagnantId_fkey" FOREIGN KEY ("gagnantId") REFERENCES "Joueur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoueurToManche" ADD CONSTRAINT "_JoueurToManche_A_fkey" FOREIGN KEY ("A") REFERENCES "Joueur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
