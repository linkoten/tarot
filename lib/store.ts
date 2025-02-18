import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";
import partieReducer from "./features/partieSlice";
import mancheReducer from "./features/mancheSlice";
import cardsReducer from "./features/cardsSlice";
import inviteReducer from "./features/inviteSlice";
import chienReducer from "./features/chienSlice";
import joueurReducer from "./features/joueurSlice";
import socketReducer from "./features/socketSlice";
import actionJoueursReducer from "./features/actionJoueursSlice"; // Importez votre slice
import userReducer from "./features/userSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      partie: partieReducer,
      manche: mancheReducer,
      cards: cardsReducer,
      invite: inviteReducer,
      chien: chienReducer,
      joueur: joueurReducer,
      socket: socketReducer,
      actionJoueurs: actionJoueursReducer,
      user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }).concat(),
  });
};

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
