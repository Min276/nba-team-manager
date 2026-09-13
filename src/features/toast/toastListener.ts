import { createListenerMiddleware } from "@reduxjs/toolkit";
import type { Player } from "@/features/players/types";
import {
  playerAdded,
  playerRemoved,
  teamAdded,
  teamRemoved,
  teamUpdated,
} from "@/features/teams/teamsSlice";
import type { AppDispatch, RootState } from "@/lib/store";
import { toastShown } from "./toastSlice";

// Turns successful team/roster actions into toast messages in one place.
// Effects run after the reducer, so comparing the original and new state
// tells us whether an action was actually applied or rejected by a guard.
export const toastListener = createListenerMiddleware();
const startListening = toastListener.startListening.withTypes<RootState, AppDispatch>();

const fullName = (player: Player) => `${player.firstName} ${player.lastName}`;

startListening({
  actionCreator: teamAdded,
  effect: ({ payload }, api) => {
    if (api.getState().teams.entities[payload.id]) {
      api.dispatch(toastShown(`Team “${payload.name}” created.`));
    }
  },
});

startListening({
  actionCreator: teamUpdated,
  effect: ({ payload }, api) => {
    const team = api.getState().teams.entities[payload.id];
    if (team && team !== api.getOriginalState().teams.entities[payload.id]) {
      api.dispatch(toastShown(`Team “${team.name}” updated.`));
    }
  },
});

startListening({
  actionCreator: teamRemoved,
  effect: ({ payload }, api) => {
    const team = api.getOriginalState().teams.entities[payload];
    if (!team) return;
    const released = team.players.length;
    api.dispatch(
      toastShown(
        `Team “${team.name}” deleted${released ? `, ${released} player${released === 1 ? "" : "s"} released` : ""}.`,
      ),
    );
  },
});

startListening({
  actionCreator: playerAdded,
  effect: ({ payload }, api) => {
    const before = api.getOriginalState().teams.entities[payload.teamId]?.players.length ?? 0;
    const team = api.getState().teams.entities[payload.teamId];
    if (team && team.players.length > before) {
      api.dispatch(toastShown(`${fullName(payload.player)} added to ${team.name}.`));
    }
  },
});

startListening({
  actionCreator: playerRemoved,
  effect: ({ payload }, api) => {
    const team = api.getOriginalState().teams.entities[payload.teamId];
    const player = team?.players.find((p) => p.id === payload.playerId);
    const applied =
      api.getState().teams.entities[payload.teamId]?.players.length !== team?.players.length;
    if (team && player && applied) {
      api.dispatch(toastShown(`${fullName(player)} removed from ${team.name}.`));
    }
  },
});
