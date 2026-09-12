import { memo } from "react";
import { Button } from "@/components/ui/Button";
import type { Team } from "./teamsSlice";

interface TeamCardProps {
  team: Team;
  onEdit: (team: Team) => void;
  onDelete: (team: Team) => void;
}

export const TeamCard = memo(function TeamCard({ team, onEdit, onDelete }: TeamCardProps) {
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
    </li>
  );
});
