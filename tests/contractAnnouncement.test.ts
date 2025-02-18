import { prisma } from "../lib/db";
import { CONTRAT, Joueur, Partie, Prisma } from "@prisma/client";
import { announceContract } from "../lib/actions/announceContract";

describe("Tests des annonces de contrats", () => {
  let partie: Partie & { joueurs: Joueur[] };
  let joueur1: Joueur;
  let joueur2: Joueur;
  let joueur3: Joueur;

  beforeEach(async () => {
    // Créer une nouvelle partie avec 3 joueurs pour chaque test
    partie = await prisma.partie.create({
      data: {
        nombreJoueurs: 3,
        donneur: 0,
        tourActuel: 0,
        status: "ECHANGE",
        mancheActuelle: 0,

        joueurs: {
          create: [
            { userId: "user1", seatIndex: 0 },
            { userId: "user2", seatIndex: 1 },
            { userId: "user3", seatIndex: 2 },
          ],
        },
      },
      include: {
        joueurs: true,
      },
    });

    [joueur1, joueur2, joueur3] = partie.joueurs;
  });

  afterEach(async () => {
    // Nettoyer la base de données après chaque test
    await prisma.partie.deleteMany();
  });

  test("Tous les joueurs passent - La manche doit se réinitialiser", async () => {
    await announceContract(partie.id, joueur1.userId, "PASSE");
    await announceContract(partie.id, joueur2.userId, "PASSE");
    await announceContract(partie.id, joueur3.userId, "PASSE");

    const partieApres = await prisma.partie.findUnique({
      where: { id: partie.id },
      include: {
        manches: true,
        joueurs: true,
      },
    });

    expect(partieApres?.donneur).toBe(1); // Le donneur suivant
    expect(partieApres?.tourActuel).toBe(1); // Le tour commence au nouveau donneur
    expect(partieApres?.manches[0].numero).toBe(1); // On reste dans la même manche
    expect(partieApres?.manches[0].status).toBe("ANNONCE");
  });

  test("Un joueur fait une garde, les autres passent", async () => {
    await announceContract(partie.id, joueur1.userId, "PASSE");
    await announceContract(partie.id, joueur2.userId, "GARDE");
    await announceContract(partie.id, joueur3.userId, "PASSE");

    const manche = await prisma.manche.findFirst({
      where: { partieId: partie.id },
      orderBy: { numero: "desc" },
    });

    expect(manche?.status).toBe("ECHANGE");
    expect(manche?.preneurId).toBe(joueur2.id);
    expect(manche?.contrat).toBe("GARDE");
  });

  test("Un joueur fait une gardesans, les autres passent", async () => {
    await announceContract(partie.id, joueur1.userId, "GARDESANS");
    await announceContract(partie.id, joueur2.userId, "PASSE");
    await announceContract(partie.id, joueur3.userId, "PASSE");

    const manche = await prisma.manche.findFirst({
      where: { partieId: partie.id },
      orderBy: { numero: "desc" },
    });

    expect(manche?.status).toBe("GAMEPLAY");
    expect(manche?.preneurId).toBe(joueur1.id);
    expect(manche?.contrat).toBe("GARDESANS");
  });

  test("Un joueur fait une gardecontre - passage immédiat en GAMEPLAY", async () => {
    await announceContract(partie.id, joueur1.userId, "GARDECONTRE");

    const manche = await prisma.manche.findFirst({
      where: { partieId: partie.id },
      orderBy: { numero: "desc" },
    });

    expect(manche?.status).toBe("GAMEPLAY");
    expect(manche?.preneurId).toBe(joueur1.id);
    expect(manche?.contrat).toBe("GARDECONTRE");
  });

  test("Enchères successives - garde puis gardesans", async () => {
    await announceContract(partie.id, joueur1.userId, "GARDE");
    await announceContract(partie.id, joueur2.userId, "GARDESANS");
    await announceContract(partie.id, joueur3.userId, "PASSE");
    await announceContract(partie.id, joueur1.userId, "PASSE");

    const manche = await prisma.manche.findFirst({
      where: { partieId: partie.id },
      orderBy: { numero: "desc" },
    });

    expect(manche?.status).toBe("GAMEPLAY");
    expect(manche?.preneurId).toBe(joueur2.id);
    expect(manche?.contrat).toBe("GARDESANS");
  });
});
