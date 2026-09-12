import {
  createEntityAdapter,
  createSelector,
  createSlice,
  nanoid,
  type PayloadAction,
} from "@reduxjs/toolkit";
import type { Player } from "@/features/players/types";
import { hydrate } from "@/lib/persistence";
import type { RootState } from "@/lib/store";

export const REGIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "Oceania",
  "South America",
] as const;

export type Region = (typeof REGIONS)[number];

export interface TeamInput {
  name: string;
  playerCount: number;
  region: Region;
  country: string;
}

export interface Team extends TeamInput {
  id: string;
  players: Player[];
  createdAt: number;
}

const teamsAdapter = createEntityAdapter<Team>({
  sortComparer: (a, b) => a.createdAt - b.createdAt,
});

export type TeamsState = ReturnType<typeof teamsAdapter.getInitialState>;

const teamsSlice = createSlice({
  name: "teams",
  initialState: teamsAdapter.getInitialState(),
  reducers: {
    teamAdded: {
      reducer: teamsAdapter.addOne,
      prepare: (input: TeamInput) => ({
        payload: { ...input, id: nanoid(), players: [], createdAt: Date.now() } satisfies Team,
      }),
    },
    teamUpdated(state, { payload }: PayloadAction<{ id: string; changes: TeamInput }>) {
      const team = state.entities[payload.id];
      if (!team || payload.changes.playerCount < team.players.length) return;
      teamsAdapter.updateOne(state, payload);
    },
    teamRemoved: teamsAdapter.removeOne,
    playerAdded(state, { payload }: PayloadAction<{ teamId: string; player: Player }>) {
      const team = state.entities[payload.teamId];
      const taken = state.ids.some((id) =>
        state.entities[id].players.some((player) => player.id === payload.player.id),
      );
      if (!team || taken || team.players.length >= team.playerCount) return;
      team.players.push(payload.player);
    },
    playerRemoved(state, { payload }: PayloadAction<{ teamId: string; playerId: number }>) {
      const team = state.entities[payload.teamId];
      if (team) team.players = team.players.filter((player) => player.id !== payload.playerId);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrate, (state, { payload }) => payload.teams ?? state);
  },
});

export const { teamAdded, teamUpdated, teamRemoved, playerAdded, playerRemoved } =
  teamsSlice.actions;
export const teamsReducer = teamsSlice.reducer;

export const { selectAll: selectAllTeams, selectById: selectTeamById } = teamsAdapter.getSelectors(
  (state: RootState) => state.teams,
);

export const selectTeamByPlayerId = createSelector([selectAllTeams], (teams) => {
  const byPlayer = new Map<number, Team>();
  for (const team of teams) for (const player of team.players) byPlayer.set(player.id, team);
  return byPlayer;
});
