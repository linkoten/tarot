-- AlterTable
ALTER TABLE "_CurrentPliToJoueur" ADD CONSTRAINT "_CurrentPliToJoueur_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_CurrentPliToJoueur_AB_unique";

-- AlterTable
ALTER TABLE "_JoueurToManche" ADD CONSTRAINT "_JoueurToManche_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_JoueurToManche_AB_unique";

-- AlterTable
ALTER TABLE "_JoueurToPliDefenseur" ADD CONSTRAINT "_JoueurToPliDefenseur_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_JoueurToPliDefenseur_AB_unique";
