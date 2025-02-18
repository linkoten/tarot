import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Invitation } from "@prisma/client";

interface InviteState {
  invitations: Invitation[];
  status: "idle" | "loading" | "failed";
}

const initialState: InviteState = {
  invitations: [],
  status: "idle",
};

export const inviteSlice = createSlice({
  name: "invite",
  initialState,
  reducers: (create) => ({
    setInvitations: create.reducer(
      (state, action: PayloadAction<Invitation[]>) => {
        state.invitations = action.payload;
      }
    ),
    addInvitation: create.reducer(
      (state, action: PayloadAction<Invitation>) => {
        state.invitations.push(action.payload);
      }
    ),
    updateInvitationStatus: create.reducer(
      (state, action: PayloadAction<{ id: string; status: string }>) => {
        const invitation = state.invitations.find(
          (inv) => inv.id === action.payload.id
        );
        if (invitation) {
          invitation.status = action.payload.status;
        }
      }
    ),
    removeInvitation: create.reducer((state, action: PayloadAction<string>) => {
      state.invitations = state.invitations.filter(
        (inv) => inv.id !== action.payload
      );
    }),
  }),
  selectors: {
    selectinvitations: (invite) => invite.invitations,
    selectStatus: (invite) => invite.status,
  },
});

export const {
  setInvitations,
  addInvitation,
  updateInvitationStatus,
  removeInvitation,
} = inviteSlice.actions;

export const { selectinvitations, selectStatus } = inviteSlice.selectors;

export default inviteSlice.reducer;
