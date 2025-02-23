"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { JoueurWithRelations } from "../types/type";
import { useAppSelector } from "@/lib/hooks";
import { selectPartie } from "@/lib/features/partieSlice";
import type { Carte, Joueur, User } from "@prisma/client";
import { BorderBeam } from "@/components/ui/border-beam";
import { InviteModal } from "./InviteModal";
import StartGameButton from "./StartGameButton";
import ContractAnnouncement from "./ContractAnnouncement";
import EchangeChien from "./EchangeChien";
import Gameplay from "./Gameplay";
import EndManche from "./EndManche";
import OpponentCards from "./OpponentCards";
import CurrentPli from "./CurrentPli";
import GameInfo from "./GameInfo";
import socket from "../socket";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { Dock } from "@/components/magicui/dock";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";
import CardTable from "./CardTable";
import { ButtonsCard } from "@/components/ui/buttons-card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import GameHistory from "./GameHistory";

interface GameSeatsProps {
  currentUserId: string;
  onlineUsers: User[];
}

export default function GameSeats({
  currentUserId,
  onlineUsers,
}: GameSeatsProps) {
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const currentPartie = useAppSelector(selectPartie);

  if (!currentPartie) return null;

  const { joueurs, nombreJoueurs } = currentPartie;

  console.log(currentPartie);

  const playerTurn = currentPartie.tourActuel;

  const handleSeatClick = (seatIndex: number, joueur?: JoueurWithRelations) => {
    if (!joueur) {
      setSelectedSeat(seatIndex);
      setIsInviteModalOpen(true);
    } else {
      console.log(`Seat ${seatIndex} est occupé par ${joueur.pseudo}`);
    }
    const roomId = currentPartie.id;
    socket.emit("joinRoom", { roomId, userId: joueur?.id || "anonymous" });
  };

  const renderSeats = () => {
    const seats = [];
    for (let i = 0; i < nombreJoueurs; i++) {
      const joueur = joueurs?.find((j: Joueur) => j.seatIndex === i);
      const isCurrentPlayer = joueur?.userId === currentUserId;
      const isPlayerTurn = joueur?.seatIndex === playerTurn;

      seats.push(
        <div
          key={i}
          className="absolute"
          style={{
            top: `${50 - 45 * Math.cos((i * 2 * Math.PI) / nombreJoueurs)}%`,
            left: `${50 + 45 * Math.sin((i * 2 * Math.PI) / nombreJoueurs)}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            <ShimmerButton
              className={`w-14 h-14 rounded-full flex items-center justify-center text-xs${
                isPlayerTurn ? " scale-125 " : ""
              }`}
              onClick={() => handleSeatClick(i, joueur as JoueurWithRelations)}
            >
              {joueur ? joueur.pseudo : "Inviter"}
            </ShimmerButton>
          </div>
          <BorderBeam className="rounded-full" />
          {joueur && !isCurrentPlayer && (
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <OpponentCards player={joueur as Joueur & { cartes: Carte[] }} />
            </div>
          )}
        </div>
      );
    }
    return seats;
  };

  const derniereManche =
    currentPartie.manches[currentPartie.manches.length - 1];

  return (
    <div className="h-screen w-full bg-black/90 text-white p-4">
      <div className="h-full grid grid-cols-[1fr_200px] gap-4">
        {/* Main Game Area */}
        <div className="flex flex-col gap-4">
          {/* Card Table - Flex grow to take available space */}
          <div className="flex-grow relative">
            <CardTable>
              {renderSeats()}
              {/* Center of the table */}
              <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                {derniereManche?.currentPli && (
                  <CurrentPli pli={derniereManche.currentPli} />
                )}
              </div>

              {/* Bottom of the table */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                {currentPartie.status === "EN_ATTENTE" && <StartGameButton />}
                {currentPartie.status === "EN_COURS" && (
                  <>
                    {derniereManche?.status === "CONTRACT" && (
                      <ContractAnnouncement currentUserId={currentUserId} />
                    )}
                    {derniereManche?.status === "ECHANGE" && (
                      <EchangeChien
                        partieId={currentPartie.id}
                        currentUserId={currentUserId}
                      />
                    )}
                    {derniereManche?.status === "GAMEPLAY" && (
                      <Gameplay
                        currentUserId={currentUserId}
                        partieId={currentPartie.id}
                      />
                    )}
                    {derniereManche?.status === "FINISHED" && (
                      <EndManche partieId={currentPartie.id} />
                    )}
                  </>
                )}
              </div>
            </CardTable>
          </div>
          {/* Action Bar - Fixed height */}
          <div className="h-20">
            <ButtonsCard>
              <Dock>
                <Popover>
                  <PopoverTrigger asChild>
                    <ShimmerButton className="rounded-full w-fit justify-center">
                      Poignée
                    </ShimmerButton>
                  </PopoverTrigger>
                  <PopoverContent className="w-56">
                    <div className="grid gap-4">
                      <h4 className="font-medium leading-none">
                        Annoncer Poignée
                      </h4>
                      <Button onClick={() => console.log("Simple Poignée")}>
                        Simple Poignée (10 Atouts)
                      </Button>
                      <Button onClick={() => console.log("Double Poignée")}>
                        Double Poignée (13 Atouts)
                      </Button>
                      <Button onClick={() => console.log("Triple Poignée")}>
                        Triple Poignée (15 Atouts)
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
                <ShimmerButton
                  className="rounded-full w-fit justify-center"
                  onClick={() => console.log("Annoncer Chelem")}
                >
                  Chelem
                </ShimmerButton>
              </Dock>
            </ButtonsCard>
          </div>
        </div>

        {/* History Sidebar - 20% width */}
        <div className="h-full">
          <Card className="h-full bg-zinc-900/50 border-zinc-800 text-white">
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historique
              </CardTitle>
            </CardHeader>
            <Separator className="bg-zinc-800" />
            <CardContent className="p-0 flex flex-col h-[calc(100vh-8rem-65px)]">
              <div className="p-4">
                <GameInfo partie={currentPartie} />
              </div>
              <ScrollArea className="flex-grow">
                <div className="p-4">
                  <BorderBeam className="rounded-sm" />

                  <GameHistory partie={currentPartie} />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {isInviteModalOpen && selectedSeat !== null && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          partieId={currentPartie.id}
          seatIndex={selectedSeat}
          onlineUsers={onlineUsers}
          currentUserId={currentUserId}
        />
      )}
    </div>
  );
}
