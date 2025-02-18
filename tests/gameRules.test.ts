import { prisma } from "../lib/db";
import { Carte, PrismaClient } from "@prisma/client";

function canPlayCard(
  playedCard: Carte,
  leadCard: Carte,
  playerCards: Carte[]
): boolean {
  // L'excuse peut toujours être jouée
  if (playedCard.couleur === "EXCUSE") {
    return true;
  }

  // Si l'excuse est en premier, on peut jouer n'importe quoi
  if (leadCard.couleur === "EXCUSE") {
    return true;
  }

  // On vérifie uniquement par rapport à la leadCard (première carte)
  const hasLeadColor = playerCards.some((c) => c.couleur === leadCard.couleur);
  const hasAtout = playerCards.some((c) => c.couleur === "ATOUT");

  // ✅ 1️⃣ Si la leadCard N'EST PAS un atout → obligation de suivre la couleur demandée
  if (leadCard.couleur !== "ATOUT") {
    if (hasLeadColor) {
      return playedCard.couleur === leadCard.couleur; // Il doit jouer la couleur demandée
    }

    // ✅ Si le joueur n'a PAS la couleur demandée
    else if (hasAtout) {
      return playedCard.couleur === "ATOUT"; // Il doit couper s'il a de l'atout
    }

    return true; // Sinon, il peut se défausser
  }

  // Si la première carte est un atout
  if (leadCard.couleur === "ATOUT") {
    if (hasAtout) {
      // Si on a des atouts, on DOIT jouer atout
      if (playedCard.couleur !== "ATOUT") {
        return false;
      }

      // Vérifier si on doit monter
      const hasStrongerAtout = playerCards.some(
        (c) => c.couleur === "ATOUT" && c.valeur! > leadCard.valeur!
      );

      if (hasStrongerAtout) {
        return playedCard.valeur! > leadCard.valeur!;
      }

      return true; // On peut jouer n'importe quel atout si on ne peut pas monter
    }

    return true; // Si on n'a pas d'atout, on peut jouer n'importe quoi
  }

  return true; // Si on n'a ni la couleur demandée ni d'atout, on peut jouer n'importe quoi
}

function getWinningCard(cards: Carte[]): Carte {
  if (cards.length === 0) {
    throw new Error("Aucune carte jouée");
  }

  // ✅ 1️⃣ Déterminer la leadCard (première carte non-Excuse)
  // On la cherche dans l'ordre des cartes jouées
  const leadCard = cards.find((card) => card.couleur !== "EXCUSE") || cards[0];
  console.log("LeadCard correcte :", leadCard);

  let winningCard = leadCard;
  let highestAtout: Carte | null = null;

  // ✅ 2️⃣ Trouver l'atout le plus fort (si un atout a été joué)
  for (const card of cards) {
    if (card.couleur === "ATOUT" && card.valeur !== null) {
      if (!highestAtout || card.valeur > highestAtout.valeur!) {
        highestAtout = card;
      }
    }
  }

  // ✅ 3️⃣ Si un atout a été joué, c'est l'atout le plus fort qui gagne
  if (highestAtout) {
    return highestAtout;
  }

  // ✅ 4️⃣ Sinon, comparer uniquement les cartes de la couleur demandée
  for (const card of cards) {
    if (
      card.couleur === leadCard.couleur && // Uniquement les cartes de la même couleur que la leadCard
      card.couleur !== "EXCUSE" && // Ignorer l'excuse dans la comparaison
      card.valeur !== null &&
      winningCard.valeur !== null &&
      card.valeur > winningCard.valeur
    ) {
      winningCard = card;
    }
  }

  return winningCard;
}

describe("Tests avec les vraies cartes de la base de données", () => {
  let cartes: Carte[];

  beforeAll(async () => {
    cartes = await prisma.carte.findMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("getWinningCard tests", () => {
    test("Tout le monde suit la couleur, la carte la plus forte gagne", () => {
      const cards = cartes.filter((c) => c.couleur === "COEUR").slice(0, 3);
      expect(getWinningCard(cards)).toEqual(
        cards.reduce((max, card) => (card.valeur! > max.valeur! ? card : max))
      );
    });

    test("Un joueur coupe avec un atout et gagne", () => {
      const roiPique = cartes.find((c) => c.nom === "14 pique");
      const cinqAtout = cartes.find((c) => c.nom === "5 atout");
      const valetPique = cartes.find((c) => c.nom === "11 pique");
      expect(getWinningCard([roiPique!, cinqAtout!, valetPique!])).toEqual(
        cinqAtout
      );
    });

    test("Un joueur joue avec un atout, les 2 autres une couleur, l'atout gagne", () => {
      const deuxAtout = cartes.find((c) => c.nom === "2 atout");
      const cavalierCarreau = cartes.find((c) => c.nom === "12 carreau");
      const valetPique = cartes.find((c) => c.nom === "11 pique");
      expect(
        getWinningCard([deuxAtout!, cavalierCarreau!, valetPique!])
      ).toEqual(deuxAtout);
    });

    test("L'atout le plus fort gagne", () => {
      const cinqAtout = cartes.find((c) => c.nom === "5 atout");
      const dixAtout = cartes.find((c) => c.nom === "10 atout");
      const vingtEtUnAtout = cartes.find((c) => c.nom === "21 atout");
      expect(getWinningCard([cinqAtout!, dixAtout!, vingtEtUnAtout!])).toEqual(
        vingtEtUnAtout
      );
    });

    test("Le Petit (1 d'atout) ne gagne pas contre un atout plus fort", () => {
      const petitAtout = cartes.find((c) => c.nom === "1 atout");
      const dixAtout = cartes.find((c) => c.nom === "10 atout");
      expect(getWinningCard([petitAtout!, dixAtout!])).toEqual(dixAtout);
    });

    test("L'Excuse ne gagne jamais", () => {
      const excuse = cartes.find((c) => c.nom === "Excuse");
      const roiCoeur = cartes.find((c) => c.nom === "14 coeur");
      expect(getWinningCard([excuse!, roiCoeur!])).toEqual(roiCoeur);
    });
  });

  test("LeadCard doit rester la première carte jouée même si un joueur joue une autre couleur", () => {
    const valetTrefle = cartes.find((c) => c.nom === "11 trefle");
    const roiPique = cartes.find((c) => c.nom === "14 pique");
    const dameTrefle = cartes.find((c) => c.nom === "13 trefle");

    const cards = [valetTrefle!, roiPique!, dameTrefle!];

    expect(getWinningCard(cards)).toEqual(dameTrefle!); // ✅ La Dame de Trèfle doit gagner car elle suit la couleur demandée
  });

  test("Les joueurs jouent 3 couleurs différentes, la 1ere gagne", () => {
    const troisTrefle = cartes.find((c) => c.nom === "3 trefle");
    const cavalierCarreau = cartes.find((c) => c.nom === "12 carreau");
    const valetPique = cartes.find((c) => c.nom === "11 pique");
    expect(
      getWinningCard([troisTrefle!, cavalierCarreau!, valetPique!])
    ).toEqual(troisTrefle);
  });

  // Ce test est sensé fonctionner mais n'a pas fonctionner. la carte 0 du pli a peut être été changé ? C'est le 4 coeur qui a gagné.
  test("Les joueurs jouent 3 couleurs différentes, la 1ere gagne", () => {
    const cinqPique = cartes.find((c) => c.nom === "5 pique");
    const quatreCoeur = cartes.find((c) => c.nom === "4 coeur");
    const sixCarreau = cartes.find((c) => c.nom === "6 carreau");
    expect(getWinningCard([cinqPique!, quatreCoeur!, sixCarreau!])).toEqual(
      cinqPique
    );
  });

  describe("canPlayCard tests", () => {
    test("Un joueur suit correctement la couleur demandée", () => {
      const dixCarreau = cartes.find((c) => c.nom === "10 carreau");
      const cinqCarreau = cartes.find((c) => c.nom === "5 carreau");
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const playerCards = [cinqCarreau!, huitCoeur!];
      expect(canPlayCard(cinqCarreau!, dixCarreau!, playerCards)).toBe(true);
    });

    test("Un joueur ne peut pas jouer une autre couleur s'il peut suivre", () => {
      const dixCarreau = cartes.find((c) => c.nom === "10 carreau");
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const cinqCarreau = cartes.find((c) => c.nom === "5 carreau");
      const playerCards = [cinqCarreau!, huitCoeur!];
      expect(canPlayCard(huitCoeur!, dixCarreau!, playerCards)).toBe(false);
    });

    test("Un joueur peut jouer n'importe quelle carte s'il ne peut pas suivre", () => {
      const dixCarreau = cartes.find((c) => c.nom === "10 carreau");
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const cinqPique = cartes.find((c) => c.nom === "5 pique");
      const playerCards = [huitCoeur!, cinqPique!];
      expect(canPlayCard(huitCoeur!, dixCarreau!, playerCards)).toBe(true);
    });

    test("Un joueur doit couper à l'atout s'il n'a pas la couleur demandée", () => {
      const dixCarreau = cartes.find((c) => c.nom === "10 carreau");
      const cinqAtout = cartes.find((c) => c.nom === "5 atout");
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const playerCards = [cinqAtout!, huitCoeur!];
      expect(canPlayCard(cinqAtout!, dixCarreau!, playerCards)).toBe(true);
      expect(canPlayCard(huitCoeur!, dixCarreau!, playerCards)).toBe(false);
    });

    test("Un joueur peut jouer un atout plus faible s'il ne peut pas monter", () => {
      const dixAtout = cartes.find((c) => c.nom === "10 atout");
      const cinqAtout = cartes.find((c) => c.nom === "5 atout");
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const playerCards = [cinqAtout!, huitCoeur!];
      expect(canPlayCard(cinqAtout!, dixAtout!, playerCards)).toBe(true);
    });

    test("Un joueur ne peut pas pisser si il y a un atout plus fort", () => {
      const dixAtout = cartes.find((c) => c.nom === "10 atout");
      const cinqAtout = cartes.find((c) => c.nom === "5 atout");
      const douxeAtout = cartes.find((c) => c.nom === "12 atout");
      const playerCards = [cinqAtout!, douxeAtout!];
      expect(canPlayCard(cinqAtout!, dixAtout!, playerCards)).toBe(false);
    });

    test("L'Excuse peut toujours être jouée", () => {
      const dixCarreau = cartes.find((c) => c.nom === "10 carreau");
      const excuse = cartes.find((c) => c.nom === "Excuse");
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const playerCards = [excuse!, huitCoeur!];
      expect(canPlayCard(excuse!, dixCarreau!, playerCards)).toBe(true);
    });

    test("Troisième joueur ne peut pas jouer un atout inférieur", () => {
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const dameCoeur = cartes.find((c) => c.nom === "13 coeur");
      const sixAtout = cartes.find((c) => c.nom === "6 atout");
      const dixAtout = cartes.find((c) => c.nom === "10 atout");
      const unCarreau = cartes.find((c) => c.nom === "1 carreau");
      const troisCarreau = cartes.find((c) => c.nom === "3 carreau");
      const troisPique = cartes.find((c) => c.nom === "3 pique");
      const sixTrefle = cartes.find((c) => c.nom === "6 trefle");
      const septAtout = cartes.find((c) => c.nom === "7 atout");

      const playerCards = [
        unCarreau!,
        troisCarreau!,
        troisPique!,
        sixTrefle!,
        sixAtout!,
        septAtout!,
        dixAtout!,
      ];

      // Le premier joueur joue le 8 de coeur
      // Le deuxième joueur joue la Dame de coeur
      // Le troisième joueur a le choix entre plusieurs cartes, dont le 6 d'atout et le 10 d'atout

      expect(canPlayCard(sixAtout!, dameCoeur!, playerCards)).toBe(true);
    });

    test("Troisième joueur peut jouer un atout inférieur de son choix", () => {
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const sixAtout = cartes.find((c) => c.nom === "6 atout");
      const neufAtout = cartes.find((c) => c.nom === "9 atout");

      const dixAtout = cartes.find((c) => c.nom === "10 atout");

      const playerCards = [huitCoeur!, sixAtout!, neufAtout!];

      expect(canPlayCard(sixAtout!, dixAtout!, playerCards)).toBe(true);
    });

    test("Troisième joueur ne peut pas jouer autre chose qu'un atout", () => {
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const dameCoeur = cartes.find((c) => c.nom === "13 coeur");
      const sixAtout = cartes.find((c) => c.nom === "6 atout");
      const dixAtout = cartes.find((c) => c.nom === "10 atout");
      const unCarreau = cartes.find((c) => c.nom === "1 carreau");
      const troisCarreau = cartes.find((c) => c.nom === "3 carreau");
      const troisPique = cartes.find((c) => c.nom === "3 pique");
      const sixTrefle = cartes.find((c) => c.nom === "6 trefle");
      const septAtout = cartes.find((c) => c.nom === "7 atout");

      const playerCards = [
        unCarreau!,
        troisCarreau!,
        troisPique!,
        sixTrefle!,
        sixAtout!,
        septAtout!,
        dixAtout!,
      ];

      // Le premier joueur joue le 8 de coeur
      // Le deuxième joueur joue la Dame de coeur
      // Le troisième joueur a le choix entre plusieurs cartes, dont le 6 d'atout et le 10 d'atout

      expect(canPlayCard(troisCarreau!, dameCoeur!, playerCards)).toBe(false);
    });

    test("Troisième joueur doit suivre la couleur demandée même après un atout", () => {
      const troisCarreau = cartes.find((c) => c.nom === "3 carreau");
      const septAtout = cartes.find((c) => c.nom === "7 atout");
      const unCarreau = cartes.find((c) => c.nom === "1 carreau");
      const sixAtout = cartes.find((c) => c.nom === "6 atout");
      const dixAtout = cartes.find((c) => c.nom === "10 atout");

      const playerCards = [unCarreau!, sixAtout!, dixAtout!];

      // Premier joueur joue 3 Carreau (leadCard)
      // Deuxième joueur joue 7 Atout
      // Troisième joueur a encore du Carreau → il doit jouer Carreau

      expect(canPlayCard(unCarreau!, troisCarreau!, playerCards)).toBe(true); // ✅ Il peut jouer 1 Carreau
      expect(canPlayCard(sixAtout!, troisCarreau!, playerCards)).toBe(false); // ❌ Il ne peut pas jouer Atout
    });

    test("On peut jouer n'importe quelle carte si l'Excuse est jouée en premier", () => {
      const excuse = cartes.find((c) => c.nom === "Excuse");
      const roiPique = cartes.find((c) => c.nom === "14 pique");
      const huitCoeur = cartes.find((c) => c.nom === "8 coeur");
      const playerCards = [roiPique!, huitCoeur!];
      expect(canPlayCard(huitCoeur!, excuse!, playerCards)).toBe(true);
    });
  });
});
