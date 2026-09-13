import { describe, expect, it } from "vitest";
import { playerAdded, selectAllTeams, teamAdded, teamRemoved } from "@/features/teams/teamsSlice";
import { makeStore } from "@/lib/store";
import { selectToast } from "./toastSlice";

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
    store.dispatch(
      teamAdded({ name: "Dragons", playerCount: 1, region: "Asia", country: "Myanmar" }),
    );
    expect(selectToast(store.getState())?.message).toBe("Team “Dragons” created.");

    const team = selectAllTeams(store.getState())[0];
    store.dispatch(playerAdded({ teamId: team.id, player: player(1) }));
    expect(selectToast(store.getState())?.message).toBe("P1 Test added to Dragons.");

    store.dispatch(teamRemoved(team.id));
    expect(selectToast(store.getState())?.message).toBe(
      "Team “Dragons” deleted, 1 player released.",
    );
  });

  it("stays quiet when a guard rejects the action", () => {
    const store = makeStore();
    store.dispatch(
      teamAdded({ name: "Dragons", playerCount: 1, region: "Asia", country: "Myanmar" }),
    );
    const team = selectAllTeams(store.getState())[0];
    store.dispatch(playerAdded({ teamId: team.id, player: player(1) }));
    const lastToast = selectToast(store.getState());

    store.dispatch(playerAdded({ teamId: team.id, player: player(2) }));
    expect(selectToast(store.getState())).toBe(lastToast);
  });
});
