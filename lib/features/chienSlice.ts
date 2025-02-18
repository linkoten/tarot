import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Chien, Carte } from "@prisma/client";
import { ChienState } from "@/app/types/type";
import { handleChien } from "../actions/handleChien";

const initialState: ChienState = {
  currentChien: null, // Aucun chien initialement
  status: "idle",
};

export const EchangeChienAction = createAsyncThunk<
  Chien & { cartes: Carte[] }, // Type attendu en retour
  { partieId: number; preneurId: string | null; cardsToDiscard: number[] }, // Type des arguments
  { rejectValue: string } // Type de rejet
>(
  "chien/echangeChien",
  async ({ partieId, preneurId, cardsToDiscard }, { rejectWithValue }) => {
    try {
      const result = await handleChien(
        partieId,
        preneurId as string,
        cardsToDiscard
      );

      if (!result.success) {
        return rejectWithValue(result.error || "Une erreur est survenue.");
      }

      // Retourner uniquement les données nécessaires
      const updatedChien = result.updatedChien;
      if (!updatedChien) {
        throw new Error("Données du chien introuvables.");
      }

      return updatedChien; // Typé comme `Chien & { cartes: Carte[] }`
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Erreur inconnue."
      );
    }
  }
);

export const chienSlice = createSlice({
  name: "chien",
  initialState,
  reducers: (create) => ({
    setChien: create.reducer(
      (state, action: PayloadAction<Chien & { cartes: Carte[] }>) => {
        state.currentChien = action.payload;
      }
    ),
    updateChienCards: create.reducer(
      (state, action: PayloadAction<Carte[]>) => {
        if (state.currentChien) {
          state.currentChien.cartes = action.payload;
        }
      }
    ),
    updateChienScore: create.reducer((state, action: PayloadAction<number>) => {
      if (state.currentChien) {
        state.currentChien.pointsChien = action.payload;
      }
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(EchangeChienAction.pending, (state) => {
        state.status = "loading";
      })
      .addCase(EchangeChienAction.fulfilled, (state, action) => {
        state.status = "idle";
        state.currentChien = action.payload;
      })
      .addCase(EchangeChienAction.rejected, (state) => {
        state.status = "failed";
      });
  },
  selectors: {
    selectMancheId: (chien) => chien.currentChien?.mancheId,
    selectCartes: (chien) => chien.currentChien?.cartes,
    selectScoreChien: (chien) => chien.currentChien?.pointsChien,
    selectStatus: (chien) => chien.status,
  },
});

export const { setChien, updateChienCards, updateChienScore } =
  chienSlice.actions;

export const selectCurrentChien = (state: { chien: ChienState }) =>
  state.chien.currentChien;

export const selectChienCartes = (state: { chien: ChienState }) =>
  state.chien.currentChien?.cartes || [];

export const selectChienStatus = (state: { chien: ChienState }) =>
  state.chien.status;

export const { selectMancheId, selectScoreChien, selectCartes, selectStatus } =
  chienSlice.selectors;

export default chienSlice.reducer;
