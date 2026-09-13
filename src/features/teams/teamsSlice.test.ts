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

const dragons: TeamInput = { name: "Dragons", playerCount: 3, region: "Asia", country: "Myanmar" };
const tigers: TeamInput = { name: "Tigers", playerCount: 5, region: "Europe", country: "Spain" };

const player = (id: number): Player => ({
  id,
  firstName: `Player${id}`,
  lastName: "Test",
  position: "G",
  nbaTeam: "Los Angeles Lakers",
});

const ids = (players: Player[]) => players.map((p) => p.id);

// Dragons start with player 101, Tigers with player 102.
function setup() {
  const store = makeStore();
  store.dispatch(teamAdded(dragons, [player(101)]));
  store.dispatch(teamAdded(tigers, [player(102)]));
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
    expect(selectAllTeams(store.getState())[0]).toMatchObject({ name: "Dragons FC" });
    expect(ids(selectAllTeams(store.getState())[0].players)).toEqual([101]);

    store.dispatch(teamRemoved(dragonsTeam.id));
    expect(selectAllTeams(store.getState()).map((team) => team.name)).toEqual(["Tigers"]);
  });

  it("refuses to create a team without a player", () => {
    const store = makeStore();
    store.dispatch(teamAdded(dragons));
    store.dispatch(teamAdded(dragons, []));
    expect(selectAllTeams(store.getState())).toEqual([]);
  });

  it("keeps a player in at most one team", () => {
    const { store, dragonsTeam, tigersTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));
    store.dispatch(playerAdded({ teamId: tigersTeam.id, player: player(1) }));

    const [d, t] = selectAllTeams(store.getState());
    expect(ids(d.players)).toEqual([101, 1]);
    expect(ids(t.players)).toEqual([102]);
    expect(selectTeamByPlayerId(store.getState()).get(1)?.id).toBe(dragonsTeam.id);
  });

  it("never exceeds the team's player count", () => {
    const { store, dragonsTeam } = setup();
    for (const id of [1, 2, 3])
      store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(id) }));
    expect(ids(selectAllTeams(store.getState())[0].players)).toEqual([101, 1, 2]);
  });

  it("removes a player but always keeps the last one", () => {
    const { store, dragonsTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));
    store.dispatch(playerRemoved({ teamId: dragonsTeam.id, playerId: 101 }));
    expect(ids(selectAllTeams(store.getState())[0].players)).toEqual([1]);
    expect(selectTeamByPlayerId(store.getState()).has(101)).toBe(false);

    store.dispatch(playerRemoved({ teamId: dragonsTeam.id, playerId: 1 }));
    expect(ids(selectAllTeams(store.getState())[0].players)).toEqual([1]);
  });

  it("releases players when their team is deleted", () => {
    const { store, dragonsTeam, tigersTeam } = setup();
    store.dispatch(teamRemoved(dragonsTeam.id));
    expect(selectTeamByPlayerId(store.getState()).has(101)).toBe(false);

    store.dispatch(playerAdded({ teamId: tigersTeam.id, player: player(101) }));
    expect(selectTeamByPlayerId(store.getState()).get(101)?.id).toBe(tigersTeam.id);
  });

  it("rejects a player count below the current roster size", () => {
    const { store, dragonsTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));
    store.dispatch(teamUpdated({ id: dragonsTeam.id, changes: { ...dragons, playerCount: 1 } }));
    expect(selectAllTeams(store.getState())[0].playerCount).toBe(3);
  });

  it("creates a team with a roster, skipping players on other teams and capping at the count", () => {
    const { store, tigersTeam } = setup();
    store.dispatch(
      teamAdded({ ...dragons, name: "Lions", playerCount: 2 }, [
        player(102),
        player(2),
        player(2),
        player(3),
        player(4),
      ]),
    );
    const lions = selectAllTeams(store.getState()).find((team) => team.name === "Lions");
    expect(ids(lions?.players ?? [])).toEqual([2, 3]);
    expect(selectTeamByPlayerId(store.getState()).get(102)?.id).toBe(tigersTeam.id);
  });

  it("replaces the roster on update under the same rules", () => {
    const { store, dragonsTeam } = setup();
    store.dispatch(
      teamUpdated({
        id: dragonsTeam.id,
        changes: { ...dragons, playerCount: 3 },
        players: [player(102), player(5), player(101), player(6), player(7)],
      }),
    );
    expect(ids(selectAllTeams(store.getState())[0].players)).toEqual([5, 101, 6]);

    store.dispatch(teamUpdated({ id: dragonsTeam.id, changes: dragons, players: [player(102)] }));
    expect(ids(selectAllTeams(store.getState())[0].players)).toEqual([5, 101, 6]);
  });

  it("restores persisted teams on hydrate", () => {
    const { store, dragonsTeam } = setup();
    store.dispatch(playerAdded({ teamId: dragonsTeam.id, player: player(1) }));

    const fresh = makeStore();
    fresh.dispatch(hydrate({ teams: store.getState().teams }));
    expect(selectAllTeams(fresh.getState())).toEqual(selectAllTeams(store.getState()));
  });
});
