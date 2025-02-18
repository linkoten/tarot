import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { Carte } from "@prisma/client";

import { useAppSelector } from "@/lib/hooks";
import { selectPartie } from "@/lib/features/partieSlice";

export function MancheResult() {
  const currentPartie = useAppSelector(selectPartie);

  if (!currentPartie) {
    return <div>Calcul des résultats en cours...</div>;
  }

  const derniereManche =
    currentPartie.manches[currentPartie.manches.length - 1];

  const countCards = (cartes: Carte[] | undefined, type: string) => {
    if (!cartes) return 0;
    return cartes.filter((carte) => {
      if (type === "bout") return carte.bout;
      return carte.nom.toLowerCase().includes(type.toLowerCase());
    }).length;
  };

  return (
    <Card className="bg-gradient-to-b from-zinc-800 to-zinc-900 border-zinc-700 text-white">
      <CardHeader>
        <CardTitle className=" font-bold mx-auto">
          Résultat de la Manche {derniereManche.numero}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <p>ID de la partie: {derniereManche.partieId}</p>
          <p>Numéro de manche: {derniereManche.numero}</p>
          <p>Preneur: {derniereManche.preneurId}</p>
          <p>Contrat: {derniereManche.contrat}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2">
          <Card className="bg-zinc-800 border-zinc-700 text-white h-fit">
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Preneur</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-2 text-xs">
              <p>Score: {derniereManche.pliPreneur?.points}</p>
              <p>
                Bouts: {countCards(derniereManche.pliPreneur?.cartes, "bout")}
              </p>
              <p>
                Rois: {countCards(derniereManche.pliPreneur?.cartes, "roi")}
              </p>
              <p>
                Dames: {countCards(derniereManche.pliPreneur?.cartes, "dame")}
              </p>
              <p>
                Cavaliers:{" "}
                {countCards(derniereManche.pliPreneur?.cartes, "cavalier")}
              </p>
              <p>
                Valets: {countCards(derniereManche.pliPreneur?.cartes, "valet")}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700 text-white h-fit">
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Défenseurs</CardTitle>
            </CardHeader>
            <CardContent className="p-4 grid grid-cols-2 gap-2 text-xs">
              <p>Score: {derniereManche.pliDefenseur?.points}</p>
              <p>
                Bouts: {countCards(derniereManche.pliDefenseur?.cartes, "bout")}
              </p>
              <p>
                Rois: {countCards(derniereManche.pliDefenseur?.cartes, "roi")}
              </p>
              <p>
                Dames: {countCards(derniereManche.pliDefenseur?.cartes, "dame")}
              </p>
              <p>
                Cavaliers:{" "}
                {countCards(derniereManche.pliDefenseur?.cartes, "cavalier")}
              </p>
              <p>
                Valets:{" "}
                {countCards(derniereManche.pliDefenseur?.cartes, "valet")}
              </p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 text-xs">
          <p className=" font-bold">
            {derniereManche.resultat === "GAGNE" ? "Réussite" : "Chute"}
          </p>
          <div className="grid grid-cols-2">
            <p>Score du Preneur: {derniereManche.scorePreneur}</p>
            <p>Score des Défenseurs: {derniereManche.scoreDefenseurs}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
