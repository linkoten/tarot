"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import socket from "../socket";
import type { PartieWithRelations } from "../types/type";
import type { Carte, CONTRAT } from "@prisma/client";
import Image from "next/image";
import { TextAnimate } from "@/components/magicui/text-animate";

interface HistoryAction {
  id: string;
  type:
    | "gameStart"
    | "newContract"
    | "preneur"
    | "exchangeChien"
    | "cardPlayed"
    | "pliWon"
    | "nextManche";
  message: string;
  timestamp: number;
  image?: string;
}

interface GameHistoryProps {
  partie: PartieWithRelations;
}

const GameHistory = ({ partie }: GameHistoryProps) => {
  const [actions, setActions] = useState<HistoryAction[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  console.log(actions);

  useEffect(() => {
    function onGameStarted() {
      addAction("gameStart", "La partie a commencé !");
    }

    function onNewContractAdded(data: {
      partieId: number;
      userId: string;
      userName: string;
      contract: CONTRAT;
    }) {
      addAction("newContract", `${data.userName} a annoncé ${data.contract}`);
    }

    function onNewExchangeChien() {
      const preneur = partie.joueurs.find(
        (j) => j.id === partie.manches[partie.manches.length - 1]?.preneurId
      );
      addAction(
        "exchangeChien",
        `${preneur?.pseudo} a effectué l'échange avec le chien`
      );
    }

    function onNewCardPlayed(data: {
      partieId: number;
      playedCard: Carte;
      currentUserId: string;
    }) {
      const joueur = partie.joueurs.find(
        (j) => j.userId === data.currentUserId
      );

      console.log(data);
      addAction(
        "cardPlayed",
        `${joueur?.pseudo} a joué ${data.playedCard.nom}`,
        data.playedCard.image1!
      );
    }

    function onNewPliWon(data: { partieId: number; currentUserId: string }) {
      const joueur = partie.joueurs.find((j) => j.id === data.currentUserId);
      addAction("pliWon", `${joueur?.pseudo} remporte le pli`);
    }

    function onNewMancheAdded() {
      addAction("nextManche", "Une nouvelle manche débute");
    }

    const addAction = (
      type: HistoryAction["type"],
      message: string,
      image?: string
    ) => {
      setActions((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          type,
          message,
          timestamp: Date.now(),
          image,
        },
      ]);
    };

    socket.on("gameStarted", onGameStarted);
    socket.on("newContractAdded", onNewContractAdded);
    socket.on("newExchangeChien", onNewExchangeChien);
    socket.on("newCardPlayed", onNewCardPlayed);
    socket.on("newPliWon", onNewPliWon);
    socket.on("newMancheAdded", onNewMancheAdded);

    return () => {
      socket.off("gameStarted", onGameStarted);
      socket.off("newContractAdded", onNewContractAdded);
      socket.off("newExchangeChien", onNewExchangeChien);
      socket.off("newCardPlayed", onNewCardPlayed);
      socket.off("newPliWon", onNewPliWon);
      socket.off("newMancheAdded", onNewMancheAdded);
    };
  }, [partie]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [actions]);

  return (
    <div className="space-y-2">
      {actions.map((action, index) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-800/50 p-2 rounded-md flex items-center space-x-2"
        >
          {action.image && (
            <Image
              src={action.image || "/placeholder.svg"}
              alt="Carte jouée"
              className="w-10 h-14 rounded-md"
              height={56}
              width={40}
            />
          )}
          <div>
            {index === actions.length - 1 ? (
              <TextAnimate animation="blurInUp" by="character" once>
                {action.message}
              </TextAnimate>
            ) : (
              <span>{action.message}</span>
            )}
            <span className="text-xs text-zinc-400 block">
              {new Date(action.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default GameHistory;
