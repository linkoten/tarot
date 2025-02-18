import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ActionJoueur, CONTRAT } from "@prisma/client";
import { ActionJoueursState } from "@/app/types/type";
import { announceContract } from "../actions/announceContract";
import { getActionsByManche } from "../actions/getActionsByManche";

const initialState: ActionJoueursState = {
  actions: [],
  status: "idle",
  error: null,
};

export const announceContractAction = createAsyncThunk<
  ActionJoueur, // Type attendu en retour
  { partieId: number; joueurId: string; action: CONTRAT }, // Type des arguments
  { rejectValue: string } // Type de rejet en cas d'erreur
>(
  "actionJoueurs/announceContract",
  async ({ partieId, joueurId, action }, { rejectWithValue }) => {
    try {
      const result = await announceContract(partieId, joueurId, action);

      if (!result.success) {
        return rejectWithValue(result.error || "An unknown error occurred");
      }
      return result.action as ActionJoueur; // Assurez-vous que `response.action` est bien typé
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

export const fetchPartieActions = createAsyncThunk<
  ActionJoueur[],
  { partieId: number },
  { rejectValue: string }
>(
  "actionJoueurs/fetchPartieActions",
  async ({ partieId }, { rejectWithValue }) => {
    try {
      const actions = await getActionsByManche(partieId);
      return actions;
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    }
  }
);

export const actionJoueursSlice = createSlice({
  name: "actionJoueurs",
  initialState,
  reducers: (create) => ({
    setActionJoueurs: create.reducer(
      (state, action: PayloadAction<ActionJoueur[]>) => {
        state.actions = action.payload;
      }
    ),
    addActionJoueur: create.reducer(
      (state, action: PayloadAction<ActionJoueur>) => {
        state.actions.push(action.payload);
      }
    ),
    clearActionJoueurs: create.reducer((state) => {
      state.actions = [];
    }),
    setStatus: create.reducer(
      (state, action: PayloadAction<"idle" | "loading" | "failed">) => {
        state.status = action.payload;
      }
    ),
    setError: create.reducer((state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }),
  }),
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartieActions.fulfilled, (state, action) => {
        state.actions = action.payload;
        state.status = "idle";
      })
      .addCase(fetchPartieActions.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchPartieActions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload || "Failed to fetch partie actions";
      });
  },
  selectors: {
    selectActions: (actionJoueurs) => actionJoueurs.actions,
    selectError: (actionJoueurs) => actionJoueurs.error,
    selectStatus: (actionJoueurs) => actionJoueurs.status,
  },
});

export const {
  setActionJoueurs,
  addActionJoueur,
  clearActionJoueurs,
  setStatus,
  setError,
} = actionJoueursSlice.actions;

export const { selectActions, selectError, selectStatus } =
  actionJoueursSlice.selectors;

export default actionJoueursSlice.reducer;
