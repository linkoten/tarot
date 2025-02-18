import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Partie, Joueur, Carte, CONTRAT, Manche, Chien } from "@prisma/client";

type JoueurWithCartes = Joueur & { cartes: Carte[] };
type MancheWithChien = Manche & { chien: (Chien & { cartes: Carte[] }) | null };
type PartieWithJoueurs = Partie & {
  joueurs: JoueurWithCartes[];
  manches: MancheWithChien[];
};

interface ActionJoueur {
  joueurId: string;
  action: CONTRAT | "PASSE";
}

interface GameState {
  partie: PartieWithJoueurs | null;
  currentPlayer: JoueurWithCartes | null;
  selectedCard: Carte | null;
  pliEnCours: Carte[];
  mancheActuelle: number;
  actionsJoueurs: ActionJoueur[];
  contratActuel: CONTRAT | null;
}

const initialState: GameState = {
  partie: null,
  currentPlayer: null,
  selectedCard: null,
  pliEnCours: [],
  mancheActuelle: 1,
  actionsJoueurs: [],
  contratActuel: null,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    setPartie: (state, action: PayloadAction<PartieWithJoueurs>) => {
      state.partie = action.payload;
    },
    setCurrentPlayer: (state, action: PayloadAction<JoueurWithCartes>) => {
      state.currentPlayer = action.payload;
    },
    setSelectedCard: (state, action: PayloadAction<Carte | null>) => {
      state.selectedCard = action.payload;
    },
    addCardToPli: (state, action: PayloadAction<Carte>) => {
      state.pliEnCours.push(action.payload);
    },
    clearPli: (state) => {
      state.pliEnCours = [];
    },
    setMancheActuelle: (state, action: PayloadAction<number>) => {
      state.mancheActuelle = action.payload;
    },
    addActionJoueur: (state, action: PayloadAction<ActionJoueur>) => {
      state.actionsJoueurs.push(action.payload);
    },
    clearActionsJoueurs: (state) => {
      state.actionsJoueurs = [];
    },
    setContratActuel: (state, action: PayloadAction<CONTRAT | null>) => {
      state.contratActuel = action.payload;
    },
    updateManche: (state, action: PayloadAction<MancheWithChien>) => {
      if (state.partie) {
        const mancheIndex = state.partie.manches.findIndex(
          (m) => m.id === action.payload.id
        );
        if (mancheIndex !== -1) {
          state.partie.manches[mancheIndex] = action.payload;
        } else {
          state.partie.manches.push(action.payload);
        }
      }
    },
    updateChien: (
      state,
      action: PayloadAction<{
        mancheId: number;
        chien: Chien & { cartes: Carte[] };
      }>
    ) => {
      if (state.partie) {
        const manche = state.partie.manches.find(
          (m) => m.id === action.payload.mancheId
        );
        if (manche) {
          manche.chien = action.payload.chien;
        }
      }
    },
  },
});

export const {
  setPartie,
  setCurrentPlayer,
  setSelectedCard,
  addCardToPli,
  clearPli,
  setMancheActuelle,
  addActionJoueur,
  setContratActuel,
  updateManche,
  updateChien,
} = gameSlice.actions;

export default gameSlice.reducer;
