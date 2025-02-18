import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Partie, Joueur, Manche } from "@prisma/client";

interface PartieResultProps {
  partie: Partie & {
    joueurs: Joueur[];
    manches: Manche[];
  };
}

export function PartieResult({ partie }: PartieResultProps) {
  const calculateTotalScore = (joueur: Joueur, mancheIndex: number) => {
    return partie.manches.slice(0, mancheIndex + 1).reduce((total, manche) => {
      if (manche.preneurId === joueur.id) {
        return total + manche.scorePreneur;
      } else {
        return total + manche.scoreDefenseurs;
      }
    }, 0);
  };

  return (
    <Table className="text-white">
      <TableHeader>
        <TableRow>
          <TableHead>Joueur</TableHead>
          {partie.manches.map((manche, index) => (
            <TableHead key={index}>Manche {manche.numero}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {partie.joueurs.map((joueur) => (
          <TableRow key={joueur.id}>
            <TableCell>{joueur.pseudo}</TableCell>
            {partie.manches.map((manche, index) => (
              <TableCell key={index}>
                {manche.preneurId === joueur.id
                  ? manche.scorePreneur
                  : manche.scoreDefenseurs}
                <br />
                Total: {calculateTotalScore(joueur, index)}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
