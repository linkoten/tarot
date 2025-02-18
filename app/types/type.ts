import {
  Carte,
  Joueur,
  Partie,
  Manche,
  Invitation,
  Chien,
  CONTRAT,
  User,
  ActionJoueur,
  PliDefenseur,
  PliPreneur,
  CurrentPli,
} from "@prisma/client";

// Typage pour enrichir Partie
export type PartieWithJoueurs = Partie & {
  joueurs: (Joueur & {
    cartes: Carte[];
    manches: Manche[];
    plisGagnes: number[];
  })[];
  cartes?: Carte[];
  manches?: (Manche & {
    chien?: (Chien & { cartes: Carte[] }) | null;
  })[];
  invitations?: Invitation[];
  actionJoueurs: { action: CONTRAT; joueurId: string }[];
  chien?: (Chien & { cartes: Carte[] }) | null;
};

export interface PartieWithRelations extends Partie {
  joueurs: (Joueur & {
    cartes: Carte[];
    pliDefenseursGagnes?: PliDefenseur[];
    pliPreneurGagnes?: PliPreneur[];
  })[];
  manches: (Manche & {
    chien:
      | (Chien & {
          cartes: Carte[];
        })
      | null;
    pliPreneur:
      | (PliPreneur & {
          cartes: Carte[];
        })
      | null;
    pliDefenseur:
      | (PliDefenseur & {
          cartes: Carte[];
        })
      | null;
    currentPli:
      | (CurrentPli & {
          cartes: Carte[];
        })
      | null;
    actionsJoueurs?: ActionJoueur[]; // Ajoute cette ligne
  })[];
  invitations?: Invitation[]; // Ajoute cette ligne
  actionsJoueurs?: ActionJoueur[]; // Ajoute cette ligne
}

export interface TableDeJeuProps {
  partie: PartieWithRelations; // Partie enrichie
  currentUserId: string;
  onlineUsers: User[]; // Correction : liste d'utilisateurs Clerk
}

// Typage pour enrichir Joueur
export type JoueurWithRelations = Joueur & {
  cartes: Carte[];
  manches: Manche[];
  plisGagnes: number[];
};

// Typage pour enrichir Manche
export type MancheWithRelations = Manche & {
  joueurs: JoueurWithRelations[];
  chien: (Chien & { cartes: Carte[] }) | null;
  actionJoueurs: ActionJoueur[];
};

export type MancheWithAllData = Manche & {
  joueurs: Joueur[];
  preneur: Joueur | null;
  pliPreneur: (PliPreneur & { cartes: Carte[] }) | null; // Ajout du | null
  pliDefenseur: (PliDefenseur & { cartes: Carte[] }) | null; // Ajout du | null
};

// Typage pour la structure globale Redux
export interface PartieState {
  currentPartie: PartieWithJoueurs | null; // Null si aucune partie en cours
  status: "idle" | "loading" | "failed";
}

export interface JoueurState {
  joueurs: JoueurWithRelations[]; // Liste des joueurs et leurs cartes
  currentJoueur: JoueurWithRelations | null; // Joueur actuel, s'il est défini
  status: "idle" | "loading" | "failed";
}

export interface MancheState {
  currentManche: MancheWithRelations | null;
  status: "idle" | "loading" | "failed";
}

export interface ChienState {
  currentChien: (Chien & { cartes: Carte[] }) | null;
  status: "idle" | "loading" | "failed";
}

export interface CardsState {
  allCards: Carte[];
  playerCards: Carte[];
  status: "idle" | "loading" | "failed";
}

export interface InviteState {
  invitations: Invitation[];
  status: "idle" | "loading" | "failed";
}

export interface PlayerCardsProps {
  cards: Carte[]; // Liste des cartes à afficher
}

export interface StartGameButtonProps {
  partieId: number; // ID de la partie
}

export interface DistributeCardsResult {
  success: boolean;
  message?: string;
  error?: string;
  cards?: Carte[];
  joueurs?: JoueurWithRelations[];
  manche?: MancheWithRelations;
  chien?: Chien & { cartes: Carte[] };
}

export interface ContractAnnouncementProps {
  partieId: number;
  currentUserId: string;
}

export interface GameSeatsProps {
  partie: PartieWithRelations; // Partie enrichie
  onOpenInviteModal: (seatIndex: number) => void;
}

export interface EchangeChienProps {
  partieId: number;
}

export type ActionJoueurWithRelations = ActionJoueur & {
  joueur: Joueur;
};

export interface ActionJoueursState {
  actions: ActionJoueur[];
  status: "idle" | "loading" | "failed";
  error: string | null;
}

export interface SocketState {
  connected: boolean;
  transport: string;
}

export interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export interface ClientToServerEvents {
  hello: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  name: string;
  age: number;
}

export interface FullInvitation extends Invitation {
  createdAt: Date;
  seatIndex: number;
  invitedUserId: string;
  invitingUserId: string;
}

export interface StartPartieResponse {
  joueurs: (Joueur & {
    cartes: Carte[];
    pliDefenseursGagnes?: PliDefenseur[];
    pliPreneurGagnes?: PliPreneur[];
  })[];
  manches: (Manche & {
    chien:
      | (Chien & {
          cartes: Carte[];
        })
      | null;
    pliPreneur:
      | (PliPreneur & {
          cartes: Carte[];
        })
      | null;
    pliDefenseur:
      | (PliDefenseur & {
          cartes: Carte[];
        })
      | null;
    currentPli:
      | (CurrentPli & {
          cartes: Carte[];
        })
      | null;
  })[];
  chien: Chien;
}
