import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { hydrate } from "@/lib/persistence";

export interface User {
  name: string;
}

export interface AuthState {
  user: User | null;
}

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loggedIn(state, { payload }: PayloadAction<string>) {
      state.user = { name: payload };
    },
    loggedOut(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state, { payload }) => payload.auth ?? state);
  },
  selectors: {
    selectUser: (state) => state.user,
  },
});

export const { loggedIn, loggedOut } = authSlice.actions;
export const { selectUser } = authSlice.selectors;
export const authReducer = authSlice.reducer;
