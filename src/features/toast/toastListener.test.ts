import { describe, expect, it } from "vitest";
import {
  playerAdded,
  playerRemoved,
  selectAllTeams,
  teamAdded,
  teamRemoved,
} from "@/features/teams/teamsSlice";
import { makeStore } from "@/lib/store";
import { selectToast } from "./toastSlice";

const dragons = { name: "Dragons", playerCount: 2, region: "Asia", country: "Myanmar" } as const;

const player = (id: number) => ({
  id,
  firstName: `P${id}`,
  lastName: "Test",
  position: "G",
  nbaTeam: "",
});

describe("toast listener", () => {
  it("announces applied team and roster actions", () => {
    const store = makeStore();
    store.dispatch(teamAdded(dragons, [player(9)]));
    expect(selectToast(store.getState())?.message).toBe("Team “Dragons” created.");

    const team = selectAllTeams(store.getState())[0];
    store.dispatch(playerAdded({ teamId: team.id, player: player(1) }));
    expect(selectToast(store.getState())?.message).toBe("P1 Test added to Dragons.");

    store.dispatch(playerRemoved({ teamId: team.id, playerId: 1 }));
    expect(selectToast(store.getState())?.message).toBe("P1 Test removed from Dragons.");

    store.dispatch(teamRemoved(team.id));
    expect(selectToast(store.getState())?.message).toBe(
      "Team “Dragons” deleted, 1 player released.",
    );
  });

  it("stays quiet when a guard rejects the action", () => {
    const store = makeStore();
    store.dispatch(teamAdded(dragons));
    expect(selectToast(store.getState())).toBeNull();

    store.dispatch(teamAdded({ ...dragons, playerCount: 1 }, [player(1)]));
    const team = selectAllTeams(store.getState())[0];
    const lastToast = selectToast(store.getState());

    store.dispatch(playerAdded({ teamId: team.id, player: player(2) }));
    store.dispatch(playerRemoved({ teamId: team.id, playerId: 1 }));
    expect(selectToast(store.getState())).toBe(lastToast);
  });
});
