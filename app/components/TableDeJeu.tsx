"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  fetchPartieData,
  selectPartie,
  setPartie,
} from "@/lib/features/partieSlice";
import type { TableDeJeuProps } from "../types/type";
import GameSeats from "./GameSeats";
import SocketTest from "./SocketTest";

export default function TableDeJeu({
  partie,
  currentUserId,
  onlineUsers,
}: TableDeJeuProps) {
  const dispatch = useAppDispatch();
  const currentPartie = useAppSelector(selectPartie);

  useEffect(() => {
    if (!currentPartie || currentPartie.id !== partie.id) {
      dispatch(setPartie(partie));
    }
  }, [currentPartie, partie, dispatch]);

  useEffect(() => {
    dispatch(fetchPartieData(partie.id));
  }, [dispatch, partie.id]);

  if (!currentPartie) return null;

  return (
    <>
      <GameSeats currentUserId={currentUserId} onlineUsers={onlineUsers} />
      <SocketTest roomId={partie.id} />
    </>
  );
}
//
