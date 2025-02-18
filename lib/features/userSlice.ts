import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@prisma/client";

interface UserState {
  users: User[];
  currentUser: User | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
}

const initialState: UserState = {
  users: [],
  currentUser: null,
  status: "idle",
  error: null,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: (create) => ({
    setUsers: create.reducer((state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    }),
    addUser: create.reducer((state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    }),
    setCurrentUser: create.reducer(
      (state, action: PayloadAction<User | null>) => {
        state.currentUser = action.payload;
      }
    ),
    setStatus: create.reducer(
      (state, action: PayloadAction<"idle" | "loading" | "failed">) => {
        state.status = action.payload;
      }
    ),
    setError: create.reducer((state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }),
  }),
  selectors: {
    selectUsers: (user) => user.users,
    selectCurrentUser: (user) => user.currentUser,
    selectStatus: (user) => user.status,
    selectError: (user) => user.error,
  },
});

export const { setUsers, addUser, setCurrentUser, setStatus, setError } =
  userSlice.actions;

export const { selectUsers, selectCurrentUser, selectStatus, selectError } =
  userSlice.selectors;

export default userSlice.reducer;
