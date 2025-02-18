"use client";
import Image from "next/image";
import type { Carte, Joueur } from "@prisma/client";

interface OpponentCardsProps {
  player: Joueur & { cartes: Carte[] };
}

export default function OpponentCards({ player }: OpponentCardsProps) {
  if (!player || player.cartes.length === 0) {
    return null;
  }

  const renderCards = (cards: Carte[]) => {
    const fanWidth = 150; // Adjust this value to change the width of the fan
    const fanHeight = 75; // Adjust this value to change the height of the fan
    const cardWidth = 30;
    const cardHeight = 45;

    return (
      <div className="relative" style={{ width: fanWidth, height: fanHeight }}>
        {cards.map((card, index) => {
          const angle = (index - (cards.length - 1) / 2) * 5; // Adjust the multiplier to change the fan spread
          const radians = (angle * Math.PI) / 180;
          const x =
            fanWidth / 2 + Math.sin(radians) * (fanWidth / 2) - cardWidth / 2;
          const y =
            fanHeight - Math.cos(radians) * (fanHeight / 2) - cardHeight;

          return (
            <div
              key={card.id}
              className="absolute"
              style={{
                transform: `rotate(${angle}deg)`,
                left: `${x}px`,
                top: `${y}px`,
              }}
            >
              <Image
                src={card.image2 || "/placeholder.svg"}
                alt="Carte face cachée"
                width={cardWidth}
                height={cardHeight}
                className="rounded-lg"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-2 rounded overflow-hidden">
      <div>{renderCards(player.cartes)}</div>
    </div>
  );
}
