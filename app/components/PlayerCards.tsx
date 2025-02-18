"use client";

import { useState } from "react";
import Image from "next/image";
import { useAppSelector } from "@/lib/hooks";
import type { Carte, Joueur } from "@prisma/client";
import { selectPartie } from "@/lib/features/partieSlice";
import { motion, AnimatePresence } from "framer-motion";

interface PlayerCardsProps {
  currentUserId: string;
  onCardSelect?: (card: Carte) => void;
  selectedCard?: Carte | null;
  selectedCards?: number[];
  isExchangePhase?: boolean;
  className?: string;
}

export default function PlayerCards({
  currentUserId,
  onCardSelect,
  selectedCard,
  selectedCards = [],
  isExchangePhase = false,
  className = "",
}: PlayerCardsProps) {
  const currentPartie = useAppSelector(selectPartie);
  const [playedCard, setPlayedCard] = useState<Carte | null>(null);

  if (!currentPartie) return null;

  const currentPlayer = currentPartie.joueurs.find(
    (player: Joueur) => player.userId === currentUserId
  );

  if (!currentPlayer || currentPlayer.cartes.length === 0) {
    return <div>Joueur Actif non trouvé</div>;
  }

  const playerCards = currentPlayer.cartes;
  const currentManche = currentPartie.manches[currentPartie.manches.length - 1];
  const isPreneur = currentManche.preneurId === currentPlayer.id;

  const sortedPlayerCards = [...playerCards].sort((cardA, cardB) => {
    return cardA.id - cardB.id;
  });

  if (sortedPlayerCards.length === 0) {
    return <div>Aucune carte disponible</div>;
  }

  const isPlayerTurn = currentPartie.tourActuel === currentPlayer.seatIndex;

  const handleCardPlay = (card: Carte) => {
    if (onCardSelect) {
      if (currentManche.status === "GAMEPLAY" && isPlayerTurn) {
        setPlayedCard(card);
        setTimeout(() => {
          onCardSelect(card);
          setPlayedCard(null);
        }, 1000);
      } else if (isExchangePhase && isPreneur) {
        onCardSelect(card);
      }
    }
  };

  const renderCards = (cards: Carte[]) => {
    const rows = 3;
    const cardsPerRow = Math.ceil(cards.length / rows);

    return (
      <div className="flex flex-col">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center"
            style={{
              marginTop: rowIndex === 0 ? 0 : "-50px",
              zIndex: rowIndex + 1,
              position: "relative",
            }}
          >
            {cards
              .slice(rowIndex * cardsPerRow, (rowIndex + 1) * cardsPerRow)
              .map((card, index) => (
                <motion.div
                  key={card.id}
                  className="relative"
                  style={{
                    width: "60px",
                    height: "90px",
                    marginLeft: index === 0 ? 0 : "-30px",
                    zIndex: index,
                  }}
                  whileHover={{
                    y: -10,
                    zIndex: 50,
                    transition: { duration: 0.3 },
                  }}
                >
                  <AnimatePresence>
                    {(currentManche.status !== "GAMEPLAY" ||
                      playedCard?.id !== card.id) && (
                      <motion.div
                        id={`card-${card.id}`}
                        initial={{ opacity: 1 }}
                        exit={
                          currentManche.status === "GAMEPLAY"
                            ? {
                                opacity: 0,
                                y: -100,
                                rotate: Math.random() * 360,
                                transition: { duration: 1 },
                              }
                            : {}
                        }
                      >
                        <Image
                          src={card.image1 || "/placeholder.svg"}
                          alt={card.nom}
                          width={40}
                          height={60}
                          className={`rounded-lg ${
                            selectedCard?.id === card.id ||
                            selectedCards.includes(card.id)
                              ? "ring-2 ring-blue-500"
                              : ""
                          }`}
                        />
                        <button
                          className={`absolute inset-0 w-full h-full cursor-pointer focus:outline-none ${
                            (currentManche.status === "GAMEPLAY" &&
                              !isPlayerTurn) ||
                            (isExchangePhase && !isPreneur)
                              ? "hover:cursor-not-allowed"
                              : ""
                          }`}
                          onClick={() => handleCardPlay(card)}
                          disabled={
                            (currentManche.status === "GAMEPLAY" &&
                              !isPlayerTurn) ||
                            (isExchangePhase && !isPreneur)
                          }
                          aria-label={`${
                            isExchangePhase ? "Sélectionner" : "Jouer"
                          } ${card.nom}`}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`p-4  rounded-lg overflow-hidden w-full ${
        isExchangePhase ? "max-h-[40vh] overflow-y-auto" : "transform "
      } ${className}`}
    >
      {renderCards(sortedPlayerCards)}
    </div>
  );
}
