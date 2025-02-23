import { motion } from "framer-motion";
import Image from "next/image";
import type { Carte } from "@prisma/client";
import { useAppSelector } from "@/lib/hooks";
import { selectPartie } from "@/lib/features/partieSlice";

interface CurrentPliProps {
  pli: {
    cartes: (Carte & { joueurNom?: string })[];
  } | null;
}

export default function CurrentPli({ pli }: CurrentPliProps) {
  const currentPartie = useAppSelector(selectPartie);

  if (!pli) return null;

  if (!currentPartie) return;

  return (
    <div className="relative w-40 h-40">
      {pli.cartes.map((carte, index) => {
        const joueur = currentPartie.joueurs.find(
          (j) => j.id === carte.joueurId
        );
        const isPreneur =
          carte.joueurId ===
          currentPartie.manches[currentPartie.manches.length - 1]?.preneurId;
        const joueurPseudo = joueur ? joueur.pseudo : "Joueur inconnu";
        return (
          <motion.div
            key={carte.id}
            className="absolute"
            initial={{ opacity: 0, rotate: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            style={{
              top: `${
                50 + 20 * Math.cos((index * 2 * Math.PI) / pli.cartes.length)
              }%`,
              left: `${
                50 + 20 * Math.cos((index * 2 * Math.PI) / pli.cartes.length)
              }%`,
            }}
          >
            <div className="relative group">
              <Image
                src={carte.image1 || "/placeholder.svg"}
                alt={carte.nom}
                width={60}
                height={90}
                className="rounded-lg"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg text-xs">
                <span>{joueurPseudo}</span>
                <span>{isPreneur ? "Preneur" : "Défenseur"}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
