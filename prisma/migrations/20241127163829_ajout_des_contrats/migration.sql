-- AlterTable
ALTER TABLE "Manche" ADD COLUMN     "numero" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "Partie" ADD COLUMN     "mancheActuelle" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ActionJoueur" (
    "id" SERIAL NOT NULL,
    "partieId" INTEGER NOT NULL,
    "joueurId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "manche" INTEGER NOT NULL,

    CONSTRAINT "ActionJoueur_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ActionJoueur" ADD CONSTRAINT "ActionJoueur_partieId_fkey" FOREIGN KEY ("partieId") REFERENCES "Partie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActionJoueur" ADD CONSTRAINT "ActionJoueur_joueurId_fkey" FOREIGN KEY ("joueurId") REFERENCES "Joueur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
