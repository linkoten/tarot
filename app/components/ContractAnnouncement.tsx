"use client";

import { useState, useEffect } from "react";
import PlayerCards from "./PlayerCards";
import type { CONTRAT, Joueur } from "@prisma/client";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchPartieData,
  selectLastContract,
  selectPartie,
} from "@/lib/features/partieSlice";
import socket from "../socket";
import { announceContract } from "@/lib/actions/announceContract";
import { motion } from "framer-motion";
import { ShimmerButton } from "@/components/magicui/shimmer-button";

interface ContractAnnouncementProps {
  currentUserId: string;
}

const contractOrder: CONTRAT[] = [
  "PASSE",
  "PRISE",
  "GARDE",
  "GARDESANS",
  "GARDECONTRE",
];

export default function ContractAnnouncement({
  currentUserId,
}: ContractAnnouncementProps) {
  const dispatch = useAppDispatch();
  const currentPartie = useAppSelector(selectPartie);
  const lastContract = useAppSelector(selectLastContract);
  const [availableContracts, setAvailableContracts] =
    useState<CONTRAT[]>(contractOrder);

  const actionsJoueursLinkToManche =
    currentPartie?.actionsJoueurs?.[currentPartie.actionsJoueurs.length - 1];
  const mancheId = currentPartie?.manches[currentPartie.manches.length - 1].id;

  useEffect(() => {
    if (
      lastContract &&
      actionsJoueursLinkToManche?.mancheId === mancheId &&
      actionsJoueursLinkToManche?.action !== "PASSE" // 🔥 Éviter la passe qui bloque
    ) {
      const lastContractIndex = contractOrder.indexOf(lastContract);
      setAvailableContracts([
        "PASSE",
        ...contractOrder.slice(lastContractIndex + 1),
      ]);
    } else {
      // 🟢 Si c'est une nouvelle manche ou tout le monde a passé → Réinitialiser
      setAvailableContracts(contractOrder);
    }
  }, [lastContract, actionsJoueursLinkToManche, mancheId]);

  useEffect(() => {
    function onNewContractAdded(data: {
      partieId: number;
      userId: string;
      userName: string;
      contract: CONTRAT;
    }) {
      console.log("Contract info received from server", data);
      try {
        dispatch(fetchPartieData(data.partieId));
      } catch (error) {
        console.error("Error in fetchPartieData:", error);
      }
    }

    socket.on("newContractAdded", onNewContractAdded);

    return () => {
      socket.off("newContractAdded", onNewContractAdded);
    };
  }, [dispatch]);

  if (!currentPartie) {
    console.error("No selected game.");
    return null;
  }

  const handleAnnounceContract = async (contract: CONTRAT) => {
    if (currentPartie.id) {
      await announceContract(currentPartie.id, currentUserId, contract);
      // Ajout des informations du joueur
      const currentPlayer = currentPartie.joueurs.find(
        (j: Joueur) => j.userId === currentUserId
      );
      socket.emit("newContract", {
        roomId: currentPartie.id,
        userId: currentUserId,
        userName: currentPlayer?.pseudo,
        contract: contract,
      });
      await dispatch(fetchPartieData(currentPartie.id)).unwrap();
    }
  };

  const isCurrentPlayerTurn =
    currentPartie?.tourActuel ===
    currentPartie?.joueurs.findIndex((j: Joueur) => j.userId === currentUserId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center space-y-6 p-6 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg shadow-xl"
    >
      <h2 className="text-2xl font-bold text-white mb-4">Announce Contract</h2>
      <div className="grid grid-cols-3 gap-4 w-full max-w-md">
        {availableContracts.map((contract) => (
          <ShimmerButton
            key={contract}
            onClick={() => handleAnnounceContract(contract)}
            disabled={!isCurrentPlayerTurn}
            className={`w-full py-2 text-sm font-medium ${
              isCurrentPlayerTurn
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-50"
            }`}
          >
            {contract}
          </ShimmerButton>
        ))}
      </div>
      <PlayerCards currentUserId={currentUserId} className=" rounded-lg p-4" />
    </motion.div>
  );
}
