"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

import socket from "../socket";
import { createGame } from "@/lib/partie/partie";
import { useRouter } from "next/navigation";
import { fetchPartieData } from "@/lib/features/partieSlice";
import { useAppDispatch } from "@/lib/hooks";

export default function CreateGameButtons() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const joinRoom = (partieId: number) => {
    socket.emit("joinRoom", partieId);
    console.log("Joining room:", partieId);
  };

  useEffect(() => {
    function onUserJoined(data: { userId: string; roomId: number }) {
      console.log(`User ${data.userId} joined room ${data.roomId}`);
      dispatch(fetchPartieData(data.roomId));
    }

    socket.on("userJoined", onUserJoined);

    socket.connect();

    return () => {
      socket.off("userJoined", onUserJoined);
    };
  }, [joinRoom, dispatch]);

  const createAndJoinGame = async (nombreJoueurs: number) => {
    try {
      const partie = await createGame(nombreJoueurs);
      if (partie) {
        router.push(`/dashboard/partie/${partie.id}`);
        joinRoom(partie.id);
      } else {
        console.error("Erreur lors de la création de la partie");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la partie :", error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <form action={() => createAndJoinGame(3)}>
        <Button type="submit">Partie à 3 joueurs</Button>
      </form>
      <form action={() => createAndJoinGame(4)}>
        <Button type="submit">Partie à 4 joueurs</Button>
      </form>
      <form action={() => createAndJoinGame(5)}>
        <Button type="submit">Partie à 5 joueurs</Button>
      </form>
    </div>
  );
}
