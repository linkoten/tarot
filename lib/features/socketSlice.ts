import { SocketState } from "@/app/types/type";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const initialState: SocketState = {
  connected: false,
  transport: "N/A",
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: (create) => ({
    setConnectionStatus: create.reducer(
      (state, action: PayloadAction<boolean>) => {
        state.connected = action.payload;
      }
    ),
    setTransport: create.reducer((state, action: PayloadAction<string>) => {
      state.transport = action.payload;
    }),
  }),
  selectors: {
    ConnectSocket: (socket) => socket.connected,
    selectTransport: (socket) => socket.transport,
  },
});

export const { ConnectSocket, selectTransport } = socketSlice.selectors;

export const { setConnectionStatus, setTransport } = socketSlice.actions;
export default socketSlice.reducer;
