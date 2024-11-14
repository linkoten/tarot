-- CreateEnum
CREATE TYPE "Couleur" AS ENUM ('PIQUE', 'COEUR', 'TREFLE', 'CARREAU');

-- CreateEnum
CREATE TYPE "TypeCarte" AS ENUM ('ATOUT', 'EXCUSE', 'CARTE_NUMEROTEE');

-- CreateTable
CREATE TABLE "Carte" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "valeur" TEXT,
    "couleur" "Couleur",
    "bout" BOOLEAN NOT NULL,
    "type" "TypeCarte" NOT NULL,
    "atout" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "Carte_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Partie" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Joueur" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "partieId" INTEGER NOT NULL,
    "pseudo" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Joueur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manche" (
    "id" SERIAL NOT NULL,
    "partieId" INTEGER NOT NULL,
    "preneurId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manche_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pli" (
    "id" SERIAL NOT NULL,
    "mancheId" INTEGER NOT NULL,
    "gagnantId" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "Pli_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CarteToPli" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_JoueurToManche" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Carte_atout_key" ON "Carte"("atout");

-- CreateIndex
CREATE UNIQUE INDEX "_CarteToPli_AB_unique" ON "_CarteToPli"("A", "B");

-- CreateIndex
CREATE INDEX "_CarteToPli_B_index" ON "_CarteToPli"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_JoueurToManche_AB_unique" ON "_JoueurToManche"("A", "B");

-- CreateIndex
CREATE INDEX "_JoueurToManche_B_index" ON "_JoueurToManche"("B");

-- AddForeignKey
ALTER TABLE "Joueur" ADD CONSTRAINT "Joueur_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Joueur" ADD CONSTRAINT "Joueur_partieId_fkey" FOREIGN KEY ("partieId") REFERENCES "Partie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manche" ADD CONSTRAINT "Manche_partieId_fkey" FOREIGN KEY ("partieId") REFERENCES "Partie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manche" ADD CONSTRAINT "Manche_preneurId_fkey" FOREIGN KEY ("preneurId") REFERENCES "Joueur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pli" ADD CONSTRAINT "Pli_mancheId_fkey" FOREIGN KEY ("mancheId") REFERENCES "Manche"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pli" ADD CONSTRAINT "Pli_gagnantId_fkey" FOREIGN KEY ("gagnantId") REFERENCES "Joueur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarteToPli" ADD CONSTRAINT "_CarteToPli_A_fkey" FOREIGN KEY ("A") REFERENCES "Carte"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CarteToPli" ADD CONSTRAINT "_CarteToPli_B_fkey" FOREIGN KEY ("B") REFERENCES "Pli"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoueurToManche" ADD CONSTRAINT "_JoueurToManche_A_fkey" FOREIGN KEY ("A") REFERENCES "Joueur"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_JoueurToManche" ADD CONSTRAINT "_JoueurToManche_B_fkey" FOREIGN KEY ("B") REFERENCES "Manche"("id") ON DELETE CASCADE ON UPDATE CASCADE;
