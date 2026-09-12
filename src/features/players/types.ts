export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
  nbaTeam: string;
}

export interface PlayersPage {
  data: Player[];
  nextCursor: number | null;
}
