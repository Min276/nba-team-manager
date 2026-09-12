import { describe, expect, it } from "vitest";
import type { Team } from "./teamsSlice";
import { PLAYER_COUNT_MAX, validateTeamForm, type TeamFormValues } from "./validation";

const valid: TeamFormValues = {
  name: "Dragons",
  playerCount: "5",
  region: "Asia",
  country: "Myanmar",
};

const existing: Team = {
  id: "t1",
  name: "Dragons",
  playerCount: 5,
  region: "Asia",
  country: "Myanmar",
  players: [],
  createdAt: 0,
};

describe("validateTeamForm", () => {
  it("accepts a valid form", () => {
    expect(validateTeamForm(valid, [])).toEqual({});
  });

  it("requires every field", () => {
    const errors = validateTeamForm({ name: " ", playerCount: "", region: "", country: " " }, []);
    expect(Object.keys(errors).sort()).toEqual(["country", "name", "playerCount", "region"]);
  });

  it("rejects names already taken, ignoring case and surrounding whitespace", () => {
    expect(validateTeamForm({ ...valid, name: "  dRAGONS " }, [existing]).name).toMatch(
      /already exists/,
    );
  });

  it("lets a team keep its own name while editing", () => {
    expect(validateTeamForm({ ...valid, name: "dragons" }, [existing], existing)).toEqual({});
  });

  it("bounds the player count to whole numbers within range", () => {
    expect(validateTeamForm({ ...valid, playerCount: "2.5" }, []).playerCount).toBeDefined();
    expect(validateTeamForm({ ...valid, playerCount: "0" }, []).playerCount).toBeDefined();
    expect(
      validateTeamForm({ ...valid, playerCount: String(PLAYER_COUNT_MAX + 1) }, []).playerCount,
    ).toBeDefined();
    expect(validateTeamForm({ ...valid, playerCount: String(PLAYER_COUNT_MAX) }, [])).toEqual({});
  });

  it("does not allow shrinking a team below its current roster", () => {
    const roster = [1, 2, 3].map((id) => ({
      id,
      firstName: "P",
      lastName: "T",
      position: "G",
      nbaTeam: "",
    }));
    const team = { ...existing, players: roster };
    expect(validateTeamForm({ ...valid, playerCount: "2" }, [team], team).playerCount).toMatch(
      /already has 3/,
    );
    expect(validateTeamForm({ ...valid, playerCount: "3" }, [team], team)).toEqual({});
  });

  it("rejects unknown regions", () => {
    expect(validateTeamForm({ ...valid, region: "Mars" }, []).region).toBeDefined();
  });
});
