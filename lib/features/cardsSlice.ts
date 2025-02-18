import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Carte } from "@prisma/client";
import { CardsState } from "@/app/types/type";
// import { CardsState } from "@/app/types/type";

const initialState: CardsState = {
  allCards: [],
  playerCards: [],
  status: "idle",
};

export const cardsSlice = createSlice({
  name: "cards",
  initialState,
  reducers: (create) => ({
    setAllCards: create.reducer((state, action: PayloadAction<Carte[]>) => {
      state.allCards = action.payload;
    }),
    setPlayerCards: create.reducer((state, action: PayloadAction<Carte[]>) => {
      state.playerCards = action.payload;
    }),
    addCardToPlayer: create.reducer((state, action: PayloadAction<Carte>) => {
      state.playerCards.push(action.payload);
    }),
    removeCardFromPlayer: create.reducer(
      (state, action: PayloadAction<number>) => {
        state.playerCards = state.playerCards.filter(
          (card) => card.id !== action.payload
        );
      }
    ),
    playCard: create.reducer((state, action: PayloadAction<number>) => {
      state.playerCards = state.playerCards.filter(
        (card) => card.id !== action.payload
      );
    }),
  }),
  selectors: {
    selectAllCards: (cards) => cards.allCards,
    selectPlayerCards: (cards) => cards.playerCards,
    selectStatus: (cards) => cards.status,
  },
});

export const {
  setAllCards,
  setPlayerCards,
  addCardToPlayer,
  removeCardFromPlayer,
  playCard,
} = cardsSlice.actions;

export const { selectAllCards, selectPlayerCards, selectStatus } =
  cardsSlice.selectors;

export default cardsSlice.reducer;
