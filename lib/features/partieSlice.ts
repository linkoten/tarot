import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { distributeCards } from "@/lib/actions/distributeCards";
import { RootState } from "../store";
import {
  announceContractAction,
  fetchPartieActions,
} from "./actionJoueursSlice";
import { ActionJoueur, CONTRAT, Joueur } from "@prisma/client";
import { getPartieData } from "../actions/getPartieData";
import { PartieWithRelations, StartPartieResponse } from "@/app/types/type";

// Typage du state
interface PartieState {
  currentPartie: PartieWithRelations | null;
  status: string;
}

const initialState: PartieState = {
  currentPartie: {
    id: 1, // ID fictif, sera remplacé dynamiquement
    createdAt: new Date(),
    updatedAt: new Date(),
    nombreJoueurs: 3,
    status: "EN_ATTENTE", // Le statut passera à "EN_COURS" lors du début de la partie
    donneur: 0, // Index du donneur initial
    tourActuel: 0, // Index du joueur dont c'est le tour
    mancheActuelle: 1, // Première manche
    joueurs: [],
    manches: [], // Manches ajoutées dynamiquement
    invitations: [], // Invitations si nécessaires
    actionsJoueurs: [],
  },
  status: "idle",
};

// Action asynchrone pour distribuer les cartes
export const startPartie = createAsyncThunk(
  "partie/startPartie",
  async (partieId: number, { rejectWithValue }) => {
    try {
      const result = await distributeCards(partieId);
      if (!result.success) {
        throw new Error(result.error || "Une erreur est survenue.");
      }
      return result; // Retourne les données pour être intégrées dans le state Redux
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPartieData = createAsyncThunk(
  "partie/fetchData",
  async (partieId: number, { rejectWithValue }) => {
    try {
      const result = await getPartieData(partieId);

      return result; // Retourne les données pour être intégrées dans le state Redux
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const partieSlice = createSlice({
  name: "partie",
  initialState,
  reducers: {
    setPartie: (state, action: PayloadAction<PartieWithRelations>) => {
      state.currentPartie = action.payload;
    },

    handleGameStarted(state, action: PayloadAction<StartPartieResponse>) {
      const { joueurs, manches, chien } = action.payload;
      if (!state.currentPartie || !joueurs || !manches || !chien) return;

      state.currentPartie.joueurs = joueurs.map((joueur: any) => ({
        ...joueur,
        cartes: joueur.cartes || [],
      }));
      state.currentPartie.manches = manches;
      state.currentPartie.mancheActuelle = manches[-1].numero;
      state.currentPartie.status = "EN_COURS";
      state.status = "idle";
    },
    addActionJoueur: (state, action: PayloadAction<ActionJoueur>) => {
      if (!state.currentPartie!.actionsJoueurs) {
        state.currentPartie!.actionsJoueurs = [];
      }
      state.currentPartie!.actionsJoueurs.push(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startPartie.pending, (state) => {
        state.status = "loading";
      })
      .addCase(startPartie.fulfilled, (state, action) => {
        const { joueurs, manche, chien } = action.payload;
        if (!joueurs || !manche || !chien) return;

        // Update players with their cards
        state.currentPartie!.joueurs = joueurs.map((joueur) => ({
          ...joueur,
          cartes: joueur.cartes || [],
        }));

        state.currentPartie!.manches.push(manche);
        state.currentPartie!.mancheActuelle = manche.numero;

        // We don't need to update state.currentPartie!.cartes as it doesn't exist in our state

        state.currentPartie!.status = "EN_COURS";
        state.status = "idle";
      })
      .addCase(startPartie.rejected, (state, action) => {
        state.status = "failed";
        console.error(
          "Erreur lors du démarrage de la partie :",
          action.payload
        );
      })
      .addCase(announceContractAction.fulfilled, (state, action) => {
        state.status = "idle";
        if (action.payload) {
          if (!state.currentPartie!.actionsJoueurs) {
            state.currentPartie!.actionsJoueurs = [];
          }
          state.currentPartie!.actionsJoueurs.push(action.payload);
        }
      })
      .addCase(announceContractAction.rejected, (state, action) => {
        state.status = "failed";
        console.error("Erreur lors de l'ajout du contrat :", action.payload);
      })
      .addCase(fetchPartieActions.fulfilled, (state, action) => {
        state.currentPartie!.actionsJoueurs = action.payload;
      })
      .addCase(fetchPartieData.fulfilled, (state, action) => {
        state.currentPartie = action.payload;
      });
  },
});

export const { setPartie, handleGameStarted } = partieSlice.actions;

export const selectPartie = (state: RootState) => state.partie.currentPartie;
export const selectManche = (state: any) =>
  state.partie.currentPartie.manches[-1];
export const selectLoading = (state: any) => state.partie.status === "loading";
export const selectError = (state: any) => state.partie.status === "failed";
export const selectLastContract = (state: RootState): CONTRAT | null => {
  const actions = state.partie.currentPartie!.actionsJoueurs;
  if (!actions || actions.length === 0) return null;

  for (let i = actions.length - 1; i >= 0; i--) {
    if (actions[i].action !== "PASSE") {
      return actions[i].action as CONTRAT;
    }
  }
  return null;
};
export const selectActionJoueurs = (state: RootState) =>
  state.partie.currentPartie!.actionsJoueurs;
export default partieSlice.reducer;
