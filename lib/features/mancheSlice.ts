import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CONTRAT, RESULTAT, POIGNEE, Couleur } from "@prisma/client";
import { MancheState, MancheWithRelations } from "@/app/types/type";

const initialState: MancheState = {
  currentManche: {
    id: 1, // ID fictif
    partieId: 1, // Référence à la partie
    preneurId: null, // À définir après les annonces
    points: 0, // Pas encore de points
    scorePreneur: 0,
    scoreDefenseurs: 0,
    contrat: null, // À définir après les annonces
    chien: null, // Le chien sera rempli après la distribution
    createdAt: new Date(),
    updatedAt: new Date(),
    resultat: null, // Défini à la fin de la manche
    roiAppele: null,
    poigneeAnnoncee: null,
    chelemAnnonce: false,
    chelemRealise: false,
    petitAuBout: false,
    numero: 1, // Première manche
    joueurs: [],
    status: "CONTRACT",
    actionJoueurs: [],
  },
  status: "idle",
};

export const mancheSlice = createSlice({
  name: "manche",
  initialState,
  reducers: (create) => ({
    setManche: create.reducer(
      (state, action: PayloadAction<MancheWithRelations>) => {
        state.currentManche = action.payload;
      }
    ),
    updateContrat: create.reducer((state, action: PayloadAction<CONTRAT>) => {
      if (state.currentManche) {
        state.currentManche.contrat = action.payload;
      }
    }),
    updatePreneur: create.reducer((state, action: PayloadAction<string>) => {
      if (state.currentManche) {
        state.currentManche.preneurId = action.payload;
      }
    }),
    updateScores: create.reducer(
      (
        state,
        action: PayloadAction<{ preneur: number; defenseurs: number }>
      ) => {
        if (state.currentManche) {
          state.currentManche.scorePreneur = action.payload.preneur;
          state.currentManche.scoreDefenseurs = action.payload.defenseurs;
        }
      }
    ),
    updateResultat: create.reducer((state, action: PayloadAction<RESULTAT>) => {
      if (state.currentManche) {
        state.currentManche.resultat = action.payload;
      }
    }),
    updatePoignee: create.reducer((state, action: PayloadAction<POIGNEE>) => {
      if (state.currentManche) {
        state.currentManche.poigneeAnnoncee = action.payload;
      }
    }),
    updateRoiAppele: create.reducer((state, action: PayloadAction<Couleur>) => {
      if (state.currentManche) {
        state.currentManche.roiAppele = action.payload;
      }
    }),
  }),
  selectors: {
    selectId: (manche) => manche?.currentManche?.id,
    selectPartieId: (manche) => manche?.currentManche?.partieId,
    selectPreneurId: (manche) => manche?.currentManche?.preneurId,
    selectPoints: (manche) => manche?.currentManche?.points,
    selectScorePreneur: (manche) => manche?.currentManche?.scorePreneur,
    selectScoreDefenseurs: (manche) => manche?.currentManche?.scoreDefenseurs,
    selectContrat: (manche) => manche?.currentManche?.contrat,
    selectChien: (manche) => manche?.currentManche?.chien,
    selectResultat: (manche) => manche?.currentManche?.resultat,
    selectRoiAppele: (manche) => manche?.currentManche?.roiAppele,
    selectPoigneeAnnoncee: (manche) => manche?.currentManche?.poigneeAnnoncee,
    selectChelemAnnonce: (manche) => manche?.currentManche?.chelemAnnonce,
    selectPetitAuBout: (manche) => manche?.currentManche?.petitAuBout,
    selectNumero: (manche) => manche?.currentManche?.numero,
    selectJoueurs: (manche) => manche?.currentManche?.joueurs,
    selectStatus: (manche) => manche?.currentManche?.status,
    selectCurrentManche: (manche) => manche?.currentManche,
  },
});

export const {
  setManche,
  updateContrat,
  updatePreneur,
  updateScores,
  updateResultat,
  updatePoignee,
  updateRoiAppele,
} = mancheSlice.actions;

export const {
  selectId,
  selectPartieId,
  selectPreneurId,
  selectPoints,
  selectScorePreneur,
  selectScoreDefenseurs,
  selectContrat,
  selectChien,
  selectResultat,
  selectRoiAppele,
  selectPoigneeAnnoncee,
  selectChelemAnnonce,
  selectPetitAuBout,
  selectNumero,
  selectJoueurs,
  selectStatus,
  selectCurrentManche,
} = mancheSlice.selectors;

export default mancheSlice.reducer;
