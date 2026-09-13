import Link from "next/link";
import { memo } from "react";
import { Button } from "@/components/ui/Button";
import type { TeamsView } from "@/features/preferences/preferencesSlice";
import { useAppDispatch } from "@/lib/hooks";
import { playerRemoved, type Team } from "./teamsSlice";

interface TeamCardProps {
  team: Team;
  variant: TeamsView;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

function RosterFill({ team }: { team: Team }) {
  const filled = team.players.length;
  return (
    <div>
      <p className="text-sm text-gray-600">
        Roster:{" "}
        <span className="font-medium text-gray-900">
          {filled} / {team.playerCount}
        </span>
      </p>
      <div
        role="progressbar"
        aria-label="Roster fill"
        aria-valuemin={0}
        aria-valuemax={team.playerCount}
        aria-valuenow={filled}
        className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
      >
        <div
          className="h-full rounded-full bg-indigo-500 transition-[width]"
          style={{ width: `${Math.min(100, (filled / team.playerCount) * 100)}%` }}
        />
      </div>
    </div>
  );
}

function Roster({ team }: { team: Team }) {
  const dispatch = useAppDispatch();

  if (team.players.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No players yet —{" "}
        <Link href="/players" className="font-medium text-indigo-600 hover:underline">
          add some from the Players page
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-100">
      {team.players.map((player) => (
        <li key={player.id} className="flex items-center gap-3 px-3 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate">
            <span className="font-medium text-gray-900">
              {player.firstName} {player.lastName}
            </span>
            <span className="text-gray-500"> · {player.position || "N/A"}</span>
          </span>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Remove ${player.firstName} ${player.lastName} from ${team.name}`}
            onClick={() => dispatch(playerRemoved({ teamId: team.id, playerId: player.id }))}
          >
            Remove
          </Button>
        </li>
      ))}
    </ul>
  );
}

export const TeamCard = memo(function TeamCard({ team, variant, onEdit, onDelete }: TeamCardProps) {
  const actions = (
    <div className="flex shrink-0 gap-2">
      <Button
        variant="secondary"
        size="sm"
        aria-label={`Edit ${team.name}`}
        onClick={() => onEdit(team)}
      >
        Edit
      </Button>
      <Button
        variant="danger"
        size="sm"
        aria-label={`Delete ${team.name}`}
        onClick={() => onDelete(team)}
      >
        Delete
      </Button>
    </div>
  );

  const heading = (
    <div className="min-w-0 flex-1">
      <h2 className="truncate font-semibold text-gray-900">{team.name}</h2>
      <p className="truncate text-sm text-gray-500">
        {team.region} · {team.country}
      </p>
    </div>
  );

  if (variant === "list") {
    return (
      <li className="rounded-xl border border-gray-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          {heading}
          <div className="w-40 shrink-0">
            <RosterFill team={team} />
          </div>
          {actions}
        </div>
        {team.players.length > 0 ? (
          <details className="mt-3">
            <summary className="text-sm text-gray-600 hover:text-gray-900">
              Show roster ({team.players.length})
            </summary>
            <div className="mt-2">
              <Roster team={team} />
            </div>
          </details>
        ) : (
          <div className="mt-3">
            <Roster team={team} />
          </div>
        )}
      </li>
    );
  }

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        {heading}
        {actions}
      </div>
      <div className="mt-4">
        <RosterFill team={team} />
      </div>
      <div className="mt-3">
        <Roster team={team} />
      </div>
    </li>
  );
});
