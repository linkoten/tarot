-- AlterTable
ALTER TABLE "Joueur" ADD COLUMN     "seatIndex" INTEGER;

-- CreateTable
CREATE TABLE "Invitation" (
    "id" SERIAL NOT NULL,
    "partieId" INTEGER NOT NULL,
    "seatIndex" INTEGER NOT NULL,
    "invitedUserId" TEXT NOT NULL,
    "invitingUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_partieId_fkey" FOREIGN KEY ("partieId") REFERENCES "Partie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
