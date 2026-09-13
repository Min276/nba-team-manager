import { describe, expect, it } from "vitest";
import type { Player } from "@/features/players/types";
import { hydrate } from "@/lib/persistence";
import { makeStore } from "@/lib/store";
import {
  playerAdded,
  playerRemoved,
  selectAllTeams,
  selectTeamByPlayerId,
  teamAdded,
  teamRemoved,
  teamUpdated,
  type TeamInput,
} from "./teamsSlice";

const dragons: TeamInput = { name: "Dragons", playerCount: 2, region: "Asia", country: "Myanmar" };
const tigers: TeamInput = { name: "Tigers", playerCount: 5, region: "Europe", country: "Spain" };

const player = (id: number): Player => ({
  id,
  firstName: `Player${id}`,
  lastName: "Test",
  position: "G",
  nbaTeam: "Los Angeles Lakers",
});

function setup() {
  const store = makeStore();
  store.dispatch(teamAdded(dragons));
  store.dispatch(teamAdded(tigers));
  const [dragonsTeam, tigersTeam] = selectAllTeams(store.getState());
  return { store, dragonsTeam, tigersTeam };
}

describe("teams slice", () => {
  it("creates, updates and removes teams", () => {
    const { store, dragonsTeam } = setup();
    expect(selectAllTeams(store.getState()).map((team) => team.name)).toEqual([
      "Dragons",
      "Tigers",
    ]);

    store.dispatch(
      teamUpdated({ id: dragonsTeam.id, changes: { ...dragons, name: "Dragons FC" } }),
    );
    expect(selectAllTeams(store.getState())[0]).toMatchObject({ name: "Dragons FC", players: [] });

    store.dispatch(teamRemoved(dragonsTeam.id));
    expect(selectAllTeams(store.getState()).map((team) => team.name)).toEqual(["Tigers"]);
  });

  it("keeps a player in at most one team", () => {
    const { store, dragonsTeam, tigersTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));
    store.dispatch(playerAdded({ teamId: tigersTeam.id, player: player(1) }));

    const [d, t] = selectAllTeams(store.getState());
    expect(d.players.map((p) => p.id)).toEqual([1]);
    expect(t.players).toEqual([]);
    expect(selectTeamByPlayerId(store.getState()).get(1)?.id).toBe(dragonsTeam.id);
  });

  it("never exceeds the team's player count", () => {
    const { store, dragonsTeam } = setup();
    for (const id of [1, 2, 3])
      store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(id) }));
    expect(selectAllTeams(store.getState())[0].players.map((p) => p.id)).toEqual([1, 2]);
  });

  it("removes a player from a team", () => {
    const { store, dragonsTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));
    store.dispatch(playerRemoved({ teamId: dragonsTeam.id, playerId: 1 }));
    expect(selectAllTeams(store.getState())[0].players).toEqual([]);
    expect(selectTeamByPlayerId(store.getState()).has(1)).toBe(false);
  });

  it("releases players when their team is deleted", () => {
    const { store, dragonsTeam, tigersTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));
    store.dispatch(teamRemoved(dragonsTeam.id));
    expect(selectTeamByPlayerId(store.getState()).has(1)).toBe(false);

    store.dispatch(playerAdded({ teamId: tigersTeam.id, player: player(1) }));
    expect(selectTeamByPlayerId(store.getState()).get(1)?.id).toBe(tigersTeam.id);
  });

  it("rejects a player count below the current roster size", () => {
    const { store, dragonsTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(2) }));
    store.dispatch(teamUpdated({ id: dragonsTeam.id, changes: { ...dragons, playerCount: 1 } }));
    expect(selectAllTeams(store.getState())[0].playerCount).toBe(2);
  });

  it("creates a team with a roster, skipping players on other teams and capping at the count", () => {
    const { store, tigersTeam } = setup();
    store.dispatch(playerAdded({ teamId: tigersTeam.id, player: player(1) }));

    store.dispatch(
      teamAdded({ ...dragons, name: "Lions", playerCount: 2 }, [
        player(1),
        player(2),
        player(2),
        player(3),
        player(4),
      ]),
    );
    const lions = selectAllTeams(store.getState()).find((team) => team.name === "Lions");
    expect(lions?.players.map((p) => p.id)).toEqual([2, 3]);
    expect(selectTeamByPlayerId(store.getState()).get(1)?.id).toBe(tigersTeam.id);
  });

  it("replaces the roster on update under the same rules", () => {
    const { store, dragonsTeam, tigersTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));
    store.dispatch(playerAdded({ teamId: tigersTeam.id, player: player(9) }));

    store.dispatch(
      teamUpdated({
        id: dragonsTeam.id,
        changes: { ...dragons, playerCount: 3 },
        players: [player(9), player(5), player(1), player(6), player(7)],
      }),
    );
    const updated = selectAllTeams(store.getState())[0];
    expect(updated.playerCount).toBe(3);
    expect(updated.players.map((p) => p.id)).toEqual([5, 1, 6]);
  });

  it("restores persisted teams on hydrate", () => {
    const { store, dragonsTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));

    const fresh = makeStore();
    fresh.dispatch(hydrate({ teams: store.getState().teams }));
    expect(selectAllTeams(fresh.getState())).toEqual(selectAllTeams(store.getState()));
  });
});
