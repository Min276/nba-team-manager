import { memo } from "react";
import { Button } from "@/components/ui/Button";
import { useAppDispatch } from "@/lib/hooks";
import { playerRemoved, type Team } from "./teamsSlice";

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

export const TeamCard = memo(function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
  const dispatch = useAppDispatch();

  return (
    <li className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-gray-900">{team.name}</h2>
          <p className="text-sm text-gray-500">
            {team.region} · {team.country}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="secondary" size="sm" onClick={() => onEdit(team)}>
            Edit
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(team)}>
            Delete
          </Button>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Roster:{" "}
        <span className="font-medium text-gray-900">
          {team.players.length} / {team.playerCount}
        </span>
      </p>
      {team.players.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-100 rounded-lg border border-gray-100">
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
      )}
    </li>
  );
});
