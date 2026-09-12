import { memo } from "react";
import { Button } from "@/components/ui/Button";
import { playerRemoved, type Team } from "@/features/teams/teamsSlice";
import { useAppDispatch } from "@/lib/hooks";
import type { Player } from "./types";

interface PlayerRowProps {
  player: Player;
  team?: Team;
  onAssign: (player: Player) => void;
}

// ponytail: content-visibility lets the browser skip laying out off-screen rows,
// which keeps scrolling smooth into the hundreds of rows without a
// virtualisation library. Beyond a few thousand rows, switch to windowing.
const rowClass =
  "flex items-center gap-4 px-4 py-3 [content-visibility:auto] [contain-intrinsic-size:auto_64px]";

export const PlayerRow = memo(function PlayerRow({ player, team, onAssign }: PlayerRowProps) {
  const dispatch = useAppDispatch();

  return (
    <li className={rowClass}>
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700"
      >
        {player.firstName[0]}
        {player.lastName[0]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">
          {player.firstName} {player.lastName}
        </p>
        <p className="truncate text-sm text-gray-500">
          {player.position || "N/A"} · {player.nbaTeam}
        </p>
      </div>
      {team ? (
        <>
          <span className="max-w-24 truncate rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 sm:max-w-40">
            {team.name}
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Remove ${player.firstName} ${player.lastName} from ${team.name}`}
            onClick={() => dispatch(playerRemoved({ teamId: team.id, playerId: player.id }))}
          >
            Remove
          </Button>
        </>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => onAssign(player)}>
          Add to team
        </Button>
      )}
    </li>
  );
});
