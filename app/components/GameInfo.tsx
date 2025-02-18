import { BorderBeam } from "@/components/ui/border-beam";
import { PartieWithRelations } from "../types/type";

interface GameInfoProps {
  partie: PartieWithRelations;
}

export default function GameInfo({ partie }: GameInfoProps) {
  const currentManche =
    partie.manches.length > 0
      ? partie.manches[partie.manches.length - 1]
      : null;
  const preneur = partie.joueurs.find((j) => j.id === currentManche?.preneurId);
  const currentPlayer = partie.joueurs.find(
    (j) => j.seatIndex === partie.tourActuel
  );

  return (
    <div className="sticky  bg-zinc-800 bg-opacity-80 p-4 rounded-lg shadow-md hover:shadow-inner hover:shadow-green-400 hover:border-blue-500 hover:border-2">
      <BorderBeam className="rounded-sm" />

      <h2 className=" font-bold mb-2 text-xs">Informations de la partie</h2>
      <div className=" text-xs">
        <p>Numéro de partie: {partie.id}</p>
        <p>Manche en cours: {currentManche ? currentManche.numero : 0}</p>

        <p>Preneur: {preneur ? preneur.pseudo : "Non déterminé"}</p>
        <p>Contrat: {currentManche?.contrat || "Non déterminé"}</p>
      </div>
      {currentPlayer && (
        <div className="mt-4 p-2 bg-green-800/30 rounded-md">
          <p className="font-bold text-green-400 text-xs">
            C&apos;est au tour de {currentPlayer.pseudo} de jouer
          </p>
        </div>
      )}
    </div>
  );
}
