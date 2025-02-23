"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchPartieData, selectPartie } from "@/lib/features/partieSlice";
import { playCard } from "@/lib/actions/playCard";
import socket from "../socket";
import PlayerCards from "./PlayerCards";

interface GamePlayProps {
  partieId: number;
  currentUserId: string;
}

export default function GamePlay({ partieId, currentUserId }: GamePlayProps) {
  const dispatch = useAppDispatch();
  const currentPartie = useAppSelector(selectPartie);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    function onNewCardPlayed(data: { partieId: number }) {
      try {
        dispatch(fetchPartieData(data.partieId));
      } catch (error) {
        console.error("Erreur lors de fetchPartieData :", error);
      }
    }

    socket.on("newCardPlayed", onNewCardPlayed);

    socket.connect();

    return () => {
      socket.off("newCardPlayed", onNewCardPlayed);
    };
  }, [dispatch]);

  const handlePlayCard = async (cardId: number) => {
    if (!currentPartie) {
      setMessage("No active partie");
      return;
    }

    try {
      const result = await playCard(partieId, currentUserId, cardId);
      if (result.success) {
        const playedCard = currentPartie.joueurs
          .find((j) => j.userId === currentUserId)
          ?.cartes.find((c) => c.id === cardId);

        socket.emit("cardPlayed", {
          roomId: currentPartie.id,
          playedCard,
          currentUserId,
        });

        await dispatch(fetchPartieData(currentPartie.id)).unwrap();
        setMessage("");
      } else {
        setMessage(result.error || "Failed to play card");
      }
    } catch (error) {
      console.error("Error playing card:", error);
      setMessage("An error occurred while playing the card");
    }
  };

  if (!currentPartie) {
    return <div>Loading game...</div>;
  }

  return (
    <>
      {message && <div className="mt-4 p-2 bg-gray-100 rounded">{message}</div>}
      <PlayerCards
        currentUserId={currentUserId}
        onCardSelect={(card) => handlePlayCard(card.id)}
      />
    </>
  );
}
