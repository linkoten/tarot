"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import type { EchangeChienProps } from "../types/type";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import PlayerCards from "./PlayerCards";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchPartieData, selectPartie } from "@/lib/features/partieSlice";
import type { Carte, Joueur } from "@prisma/client";
import socket from "../socket";
import { handleChien } from "@/lib/actions/handleChien";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

export default function EchangeChien({
  partieId,
  currentUserId,
}: EchangeChienProps & {
  currentUserId: string;
}) {
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  const [isDialogOpen, setIsDialogOpen] = useState(true);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [showChien, setShowChien] = useState(true);

  const currentPartie = useAppSelector(selectPartie);

  if (!currentPartie) return null;

  const derniereManche =
    currentPartie.manches[currentPartie.manches.length - 1];

  const currentPlayer = currentPartie.joueurs.find(
    (player: Joueur) => player.userId === currentUserId
  );

  const chienCards = derniereManche.chien?.cartes;
  const preneurId = derniereManche.preneurId;

  const isPreneur = derniereManche.preneurId === currentPlayer?.id;

  const handleCardClick = (cardId: number) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(selectedCards.filter((id) => id !== cardId));
    } else if (selectedCards.length < 6) {
      setSelectedCards([...selectedCards, cardId]);
    }
  };

  useEffect(() => {
    function onNewExchangeChien(data: { partieId: number }) {
      console.log(
        "on reçoit les infos de l'échange des cartes du chien de la part du serveur",
        data.partieId
      );

      try {
        dispatch(fetchPartieData(data.partieId));
        console.log("fetchPartieData appelé avec succès !");
      } catch (error) {
        console.error("Erreur lors de fetchPartieData :", error);
      }
    }

    socket.on("newExchangeChien", onNewExchangeChien);

    socket.connect();

    return () => {
      socket.off("newExchangeChien", onNewExchangeChien);
    };
  }, [dispatch]);

  const handleExchange = async () => {
    if (currentPartie.id) {
      await handleChien(currentPartie.id, preneurId as string, selectedCards);
      toast({
        title: "Échange réussi",
        description: "Le chien a été échangé avec succès!",
        variant: "default",
      });
      socket.emit("exchangeChien", partieId);
      await dispatch(fetchPartieData(partieId));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-2 p-6 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg shadow-xl"
    >
      <h2 className="text-xl font-bold text-white mb-4">
        Échange avec le Chien
      </h2>
      <AnimatePresence>
        {showChien && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-4"
          >
            <h3 className="text-lg font-semibold mb-2 text-white">
              Cartes du Chien:
            </h3>
            <div className="flex space-x-2 justify-center">
              {chienCards?.map((card: Carte) => (
                <div
                  key={card.id}
                  onClick={() => isPreneur && handleCardClick(card.id)}
                  className="w-10 h-16 bg-gray-200 rounded flex items-center justify-center cursor-pointer"
                >
                  <Image
                    src={(card.image1 as string) || "/placeholder.svg"}
                    alt={card.nom}
                    width={40}
                    height={60}
                    className={`w-10 h-16 rounded ${
                      selectedCards.includes(card.id)
                        ? "ring-2 ring-blue-500"
                        : ""
                    } ${!isPreneur ? "opacity-50" : ""}`}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="w-full max-w-md">
        <h3 className="text-lg font-semibold mb-2 text-white">Vos cartes:</h3>
        <PlayerCards
          currentUserId={currentUserId}
          onCardSelect={(card) => handleCardClick(card.id)}
          selectedCards={selectedCards}
          isExchangePhase={true}
          className="rounded-lg p-4 bg-emerald-700 bg-opacity-50"
        />
      </div>
      {selectedCards.length !== 6 && (
        <p className="text-sm text-red-300 mb-2">
          Veuillez sélectionner exactement 6 cartes pour l'échange.
        </p>
      )}
      {selectedCards.length === 6 && (
        <p className="text-sm text-green-300 mb-2">
          Vous avez bien sélectionné 6 cartes !
        </p>
      )}
      <ShimmerButton
        onClick={handleExchange}
        disabled={selectedCards.length !== 6 || !isPreneur}
        className="w-full max-w-md py-2 text-sm font-medium"
      >
        Valider l'échange
      </ShimmerButton>
    </motion.div>
  );
}
