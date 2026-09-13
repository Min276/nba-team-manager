import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { hydrate } from "@/lib/persistence";

export type TeamsView = "grid" | "list";

export interface PreferencesState {
  teamsView: TeamsView;
}

const initialState: PreferencesState = { teamsView: "grid" };

const preferencesSlice = createSlice({
  name: "preferences",
  initialState,
  reducers: {
    teamsViewChanged(state, { payload }: PayloadAction<TeamsView>) {
      state.teamsView = payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state, { payload }) => payload.preferences ?? state);
  },
  selectors: {
    selectTeamsView: (state) => state.teamsView,
  },
});

export const { teamsViewChanged } = preferencesSlice.actions;
export const { selectTeamsView } = preferencesSlice.selectors;
export const preferencesReducer = preferencesSlice.reducer;
