"use client";

import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchPartieData } from "@/lib/features/partieSlice";
import {
  selectPartie,
  selectLoading,
  selectError,
} from "@/lib/features/partieSlice";
import socket from "../socket";
import { distributeCards } from "@/lib/actions/distributeCards";
import { ShinyButton } from "@/components/magicui/shiny-button";

export default function StartGameButton() {
  const dispatch = useAppDispatch();
  const currentPartie = useAppSelector(selectPartie);
  const loading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  useEffect(() => {
    function onGameStarted(data: { partieId: number }) {
      console.log("on reçoit les infos de la part du serveur", data.partieId);
      try {
        dispatch(fetchPartieData(data.partieId));
        console.log("fetchPartieData appelé avec succès !");
      } catch (error) {
        console.error("Erreur lors de fetchPartieData :", error);
      }
    }

    socket.on("gameStarted", onGameStarted);

    socket.connect();

    return () => {
      socket.off("gameStarted", onGameStarted);
    };
  }, [dispatch]);

  if (!currentPartie) {
    console.error("Aucune partie sélectionnée.");
    return;
  }

  const startGame = async () => {
    if (currentPartie.id) {
      await distributeCards(currentPartie.id);
      socket.emit("startGame", currentPartie.id);
      console.log("Game started successfully:");
      await dispatch(fetchPartieData(currentPartie.id));
    }
  };

  return (
    <div>
      <ShinyButton
        onClick={startGame}
        className={`mt-4 font-bold py-2 px-4 rounded ${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Starting Game..." : "Start Game"}
      </ShinyButton>
      {error && <p className="text-red-500 mt-2">Erreur : {error}</p>}
    </div>
  );
}
