"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import socket from "../socket";
import type { PartieWithRelations } from "../types/type";
import type { Carte, CONTRAT } from "@prisma/client";
import Image from "next/image";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HistoryAction {
  id: string;
  type:
    | "gameStart"
    | "newContract"
    | "preneur"
    | "exchangeChien"
    | "cardPlayed"
    | "pliWon"
    | "nextManche"
    | "sendMessage";
  message: string;
  timestamp: number;
  image?: string;
  userId?: string;
}

interface GameHistoryProps {
  partie: PartieWithRelations;
  currentUserId: string;
}

const GameHistory = ({ partie, currentUserId }: GameHistoryProps) => {
  const [actions, setActions] = useState<HistoryAction[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState("");

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

    function onNewMessage(data: {
      currentUserId: string;
      partieId: number;
      message: string;
    }) {
      const joueur = partie.joueurs.find(
        (j) => j.userId === data.currentUserId
      );
      addAction("sendMessage", `${joueur?.pseudo} : ${data.message}`);
    }

    function onNewCardPlayed(data: {
      partieId: number;
      playedCard: Carte;
      currentUserId: string;
    }) {
      const joueur = partie.joueurs.find(
        (j) => j.userId === data.currentUserId
      );

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
      image?: string,
      userId?: string
    ) => {
      setActions((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substr(2, 9),
          type,
          message,
          timestamp: Date.now(),
          image,
          userId,
        },
      ]);
    };

    socket.on("gameStarted", onGameStarted);
    socket.on("newContractAdded", onNewContractAdded);
    socket.on("newExchangeChien", onNewExchangeChien);
    socket.on("newCardPlayed", onNewCardPlayed);
    socket.on("newPliWon", onNewPliWon);
    socket.on("newMancheAdded", onNewMancheAdded);
    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("gameStarted", onGameStarted);
      socket.off("newContractAdded", onNewContractAdded);
      socket.off("newExchangeChien", onNewExchangeChien);
      socket.off("newCardPlayed", onNewCardPlayed);
      socket.off("newPliWon", onNewPliWon);
      socket.off("newMancheAdded", onNewMancheAdded);
      socket.off("newMessage", onNewMessage);
    };
  }, [partie]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [actions]);

  const sendMessage = (
    currentUserId: string,
    partieId: number,
    message: string
  ) => {
    if (message.trim() === "") return;

    socket.emit("sendMessage", {
      currentUserId,
      partieId,
      message: message.trim(),
      // Remove the duplicated message property
    });

    setMessage("");
  };

  const getActionClass = (type: HistoryAction["type"]) => {
    switch (type) {
      case "sendMessage":
        return "bg-zinc-700/50";
      default:
        return "bg-zinc-800/50";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${getActionClass(
              action.type
            )} p-2 rounded-md flex items-center space-x-2`}
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
            <div className="flex-1">
              {action.type === "sendMessage" && action.userId && (
                <span className="font-bold text-zinc-300">
                  {partie.joueurs.find((j) => j.userId === action.userId)
                    ?.pseudo || "Joueur"}
                  :
                </span>
              )}{" "}
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

      <div className="mt-4 p-2 bg-zinc-900/50 rounded-md">
        <div className="flex space-x-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Écrivez un message..."
            className="flex-1"
          />
          <Button
            onClick={() => sendMessage(currentUserId, partie.id, message)}
          >
            Envoyer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameHistory;
