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

const playerIdsOnOtherTeams = (state: TeamsState, teamId?: string) => {
  const ids = new Set<number>();
  for (const id of state.ids) {
    if (id === teamId) continue;
    for (const player of state.entities[id].players) ids.add(player.id);
  }
  return ids;
};

// A roster may only hold players that are on no other team, at most once each,
// never more than the team's player count, and a team always keeps at least one.
const admissibleRoster = (
  state: TeamsState,
  players: Player[],
  capacity: number,
  teamId?: string,
) => {
  const taken = playerIdsOnOtherTeams(state, teamId);
  const roster: Player[] = [];
  for (const player of players) {
    if (roster.length >= capacity) break;
    if (taken.has(player.id) || roster.some((p) => p.id === player.id)) continue;
    roster.push(player);
  }
  return roster;
};

const teamsSlice = createSlice({
  name: "teams",
  initialState: teamsAdapter.getInitialState(),
  reducers: {
    teamAdded: {
      reducer(state, { payload }: PayloadAction<Team>) {
        const players = admissibleRoster(state, payload.players, payload.playerCount);
        if (players.length === 0) return;
        teamsAdapter.addOne(state, { ...payload, players });
      },
      prepare: (input: TeamInput, players: Player[] = []) => ({
        payload: { ...input, id: nanoid(), players, createdAt: Date.now() } satisfies Team,
      }),
    },
    teamUpdated(
      state,
      { payload }: PayloadAction<{ id: string; changes: TeamInput; players?: Player[] }>,
    ) {
      const team = state.entities[payload.id];
      if (!team) return;
      const players = payload.players
        ? admissibleRoster(state, payload.players, payload.changes.playerCount, team.id)
        : team.players;
      if (players.length === 0 || payload.changes.playerCount < players.length) return;
      teamsAdapter.updateOne(state, { id: payload.id, changes: { ...payload.changes, players } });
    },
    teamRemoved: teamsAdapter.removeOne,
    playerAdded(state, { payload }: PayloadAction<{ teamId: string; player: Player }>) {
      const team = state.entities[payload.teamId];
      const taken = playerIdsOnOtherTeams(state).has(payload.player.id);
      if (!team || taken || team.players.length >= team.playerCount) return;
      team.players.push(payload.player);
    },
    playerRemoved(state, { payload }: PayloadAction<{ teamId: string; playerId: number }>) {
      const team = state.entities[payload.teamId];
      if (!team || team.players.length <= 1) return;
      team.players = team.players.filter((player) => player.id !== payload.playerId);
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
