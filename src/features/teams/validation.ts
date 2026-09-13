import { REGIONS, type Region, type Team, type TeamInput } from "./teamsSlice";

export const NAME_MAX = 40;
export const COUNTRY_MAX = 56;
export const PLAYER_COUNT_MAX = 30;

export interface TeamFormValues {
  name: string;
  playerCount: string;
  region: string;
  country: string;
}

export type TeamFormErrors = Partial<Record<keyof TeamFormValues, string>>;

export const emptyTeamForm: TeamFormValues = {
  name: "",
  playerCount: "5",
  region: "",
  country: "",
};

export const toFormValues = (team: Team): TeamFormValues => ({
  name: team.name,
  playerCount: String(team.playerCount),
  region: team.region,
  country: team.country,
});

export const toTeamInput = (values: TeamFormValues): TeamInput => ({
  name: values.name.trim(),
  playerCount: Number(values.playerCount),
  region: values.region as Region,
  country: values.country.trim(),
});

const isRegion = (value: string): value is Region => (REGIONS as readonly string[]).includes(value);

// Letters (any script) with the spaces and punctuation real country names use.
const COUNTRY_PATTERN = /^\p{L}[\p{L}\s.'’-]*$/u;

export function validateTeamForm(
  values: TeamFormValues,
  teams: Team[],
  editing?: Team,
  rosterSize = editing?.players.length ?? 0,
): TeamFormErrors {
  const errors: TeamFormErrors = {};

  const name = values.name.trim();
  const taken = teams.some(
    (team) => team.id !== editing?.id && team.name.toLowerCase() === name.toLowerCase(),
  );
  if (!name) errors.name = "Team name is required.";
  else if (name.length > NAME_MAX)
    errors.name = `Team name must be at most ${NAME_MAX} characters.`;
  else if (taken) errors.name = `A team named “${name}” already exists.`;

  const playerCount = Number(values.playerCount);
  if (values.playerCount.trim() === "" || !Number.isInteger(playerCount)) {
    errors.playerCount = "Player count must be a whole number.";
  } else if (playerCount < 1 || playerCount > PLAYER_COUNT_MAX) {
    errors.playerCount = `Player count must be between 1 and ${PLAYER_COUNT_MAX}.`;
  } else if (playerCount < rosterSize) {
    errors.playerCount = `Player count can't be less than the ${rosterSize} players selected.`;
  }

  if (!isRegion(values.region)) errors.region = "Please select a region.";

  const country = values.country.trim();
  if (!country) errors.country = "Country is required.";
  else if (country.length > COUNTRY_MAX) {
    errors.country = `Country must be at most ${COUNTRY_MAX} characters.`;
  } else if (!COUNTRY_PATTERN.test(country)) {
    errors.country = "Country must be a name, e.g. Spain or Côte d’Ivoire.";
  }

  return errors;
}
