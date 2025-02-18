"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { fetchPartieData, selectPartie } from "@/lib/features/partieSlice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MancheResult } from "./MancheResult";
import { PartieResult } from "./PartieResult";
import { calculatePoints } from "@/lib/actions/calculatePoints";
import { createNewManche } from "@/lib/actions/newManche";
import { motion } from "framer-motion";

import socket from "../socket";
import { ShimmerButton } from "@/components/magicui/shimmer-button";
import { BorderBeam } from "@/components/ui/border-beam";

interface EndMancheProps {
  partieId: number;
  currentUserId: string;
}

export default function EndManche({ partieId, currentUserId }: EndMancheProps) {
  const [activeTab, setActiveTab] = useState("manche");
  const [isCalculating, setIsCalculating] = useState(true);
  const currentPartie = useAppSelector(selectPartie);
  const dispatch = useAppDispatch();

  if (!currentPartie) return;

  const derniereManche =
    currentPartie.manches[currentPartie.manches.length - 1];

  useEffect(() => {
    if (partieId && isCalculating) {
      dispatch(fetchPartieData(partieId))
        .then(() =>
          calculatePoints(derniereManche.id, currentPartie.nombreJoueurs)
        )
        .then(() => {
          setIsCalculating(false);
          dispatch(fetchPartieData(partieId)); // Fetch updated data after calculation
        });
    }
  }, [partieId, isCalculating, dispatch]);

  useEffect(() => {
    function onNewManche(data: { partieId: number }) {
      console.log(
        "on reçoit les infos de la nouvelle manche de la part du serveur",
        data.partieId
      );

      try {
        dispatch(fetchPartieData(data.partieId));
        console.log("fetchPartieData appelé avec succès !");
      } catch (error) {
        console.error("Erreur lors de fetchPartieData :", error);
      }
    }

    socket.on("newMancheAdded", onNewManche);

    socket.connect();

    // Nettoyage lors du démontage
    return () => {
      socket.off("newMancheAdded", onNewManche);
    };
  }, [dispatch]);

  const handleNextManche = async () => {
    if (currentPartie.mancheActuelle < 10) {
      await createNewManche(partieId);
      socket.emit("nextManche", currentPartie.id);
      await dispatch(fetchPartieData(currentPartie.id));

      // Optional: refresh or redirect
    }
  };

  if (!currentPartie || isCalculating) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-64 text-white"
      >
        Calcul des résultats en cours...
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full p-2 bg-gradient-to-b from-zinc-800 to-zinc-900 rounded-lg shadow-xl"
    >
      <h2 className="text-xl font-bold text-white mb-4 text-center">
        Résultats de la partie
      </h2>
      <Card className="w-full bg-transparent border-none">
        <BorderBeam />

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 bg-zinc-700 mb-2">
              <TabsTrigger
                value="manche"
                className="data-[state=active]:bg-zinc-600 w-full"
              >
                Résultat de la Manche
              </TabsTrigger>
              <TabsTrigger
                value="partie"
                className="data-[state=active]:bg-zinc-600 w-full"
              >
                Score Total de la Partie
              </TabsTrigger>
            </TabsList>
            <TabsContent value="manche" className="mt-0">
              <MancheResult />
            </TabsContent>
            <TabsContent value="partie" className="mt-0">
              <PartieResult partie={currentPartie} />
            </TabsContent>
          </Tabs>
          <ShimmerButton
            onClick={handleNextManche}
            className="w-full mt-4 py-2 text-sm font-medium"
          >
            {currentPartie.mancheActuelle >= 10
              ? "Terminer la partie"
              : "Passer à la manche suivante"}
          </ShimmerButton>
        </CardContent>
      </Card>
    </motion.div>
  );
}
