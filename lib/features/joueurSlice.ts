import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Joueur, Carte, Manche } from "@prisma/client";
import { JoueurState } from "@/app/types/type";

const initialState: JoueurState = {
  joueurs: [
    {
      id: "joueur1",
      userId: "user1",
      partieId: 1,
      pseudo: "Joueur 1",
      score: 0,
      seatIndex: 0,
      cartes: [], // Cartes du joueur
      manches: [], // Manches associées au joueur
      plisGagnes: [], // Add this line
    },
    {
      id: "joueur2",
      userId: "user2",
      partieId: 1,
      pseudo: "Joueur 2",
      score: 0,
      seatIndex: 1,
      cartes: [],
      manches: [],
      plisGagnes: [], // Add this line
    },
    {
      id: "joueur3",
      userId: "user3",
      partieId: 1,
      pseudo: "Joueur 3",
      score: 0,
      seatIndex: 2,
      cartes: [],
      manches: [],
      plisGagnes: [], // Add this line
    },
  ],
  currentJoueur: null,
  status: "idle",
};

export const joueurSlice = createSlice({
  name: "joueur",
  initialState,
  reducers: (create) => ({
    setJoueurs: create.reducer(
      (
        state,
        action: PayloadAction<
          (Joueur & {
            cartes: Carte[];
            manches: Manche[];
            plisGagnes: number[];
          })[]
        >
      ) => {
        state.joueurs = action.payload;
      }
    ),
    setCurrentJoueur: create.reducer(
      (
        state,
        action: PayloadAction<
          Joueur & { cartes: Carte[]; manches: Manche[]; plisGagnes: number[] }
        >
      ) => {
        state.currentJoueur = action.payload;
      }
    ),
    updateJoueurScore: create.reducer(
      (state, action: PayloadAction<{ id: string; score: number }>) => {
        const joueur = state.joueurs.find((j) => j.id === action.payload.id);
        if (joueur) {
          joueur.score = action.payload.score;
        }
        if (
          state.currentJoueur &&
          state.currentJoueur.id === action.payload.id
        ) {
          state.currentJoueur.score = action.payload.score;
        }
      }
    ),
    updateJoueurCards: create.reducer(
      (state, action: PayloadAction<{ id: string; cartes: Carte[] }>) => {
        if (
          state.currentJoueur &&
          state.currentJoueur.id === action.payload.id
        ) {
          state.currentJoueur.cartes = action.payload.cartes;
        }
      }
    ),
    updateJoueurPlis: create.reducer(
      (state, action: PayloadAction<{ id: string; pliId: number }>) => {
        const joueur = state.joueurs.find((j) => j.id === action.payload.id);
        if (joueur) {
          // Assuming we're just keeping track of pli IDs for simplicity
          // You might want to store more information about the plis if needed
          joueur.plisGagnes = [
            ...(joueur.plisGagnes || []),
            action.payload.pliId,
          ];
        }
        if (
          state.currentJoueur &&
          state.currentJoueur.id === action.payload.id
        ) {
          state.currentJoueur.plisGagnes = [
            ...(state.currentJoueur.plisGagnes || []),
            action.payload.pliId,
          ];
        }
      }
    ),
  }),
  selectors: {
    selectJoueurByIndex: (state) => (index: number) => state.joueurs[index],

    selectJoueurPropertyByIndex:
      (state) => (index: number, property: keyof Joueur) => {
        const joueur = state.joueurs[index];
        return joueur ? joueur[property] : null;
      },

    selectCurrentJoueur: (joueur) => joueur.currentJoueur,
    selectStatus: (joueur) => joueur.status,
    selectJoueurs: (joueur) => joueur.joueurs,
  },
});

export const {
  setJoueurs,
  setCurrentJoueur,
  updateJoueurScore,
  updateJoueurCards,
  updateJoueurPlis,
} = joueurSlice.actions;

export const {
  selectJoueurByIndex,
  selectJoueurPropertyByIndex,
  selectCurrentJoueur,
  selectStatus,
  selectJoueurs,
} = joueurSlice.selectors;

export default joueurSlice.reducer;
