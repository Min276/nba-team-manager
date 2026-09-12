"use client";

import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useAppDispatch } from "@/lib/hooks";
import { teamRemoved, type Team } from "./teamsSlice";

interface DeleteTeamModalProps {
  team: Team;
  onClose: () => void;
}

export function DeleteTeamModal({ team, onClose }: DeleteTeamModalProps) {
  const dispatch = useAppDispatch();
  const rosterSize = team.players.length;

  const onConfirm = () => {
    dispatch(teamRemoved(team.id));
    onClose();
  };

  return (
    <Modal title="Delete team" onClose={onClose}>
      <p className="text-sm text-gray-600">
        Delete <span className="font-medium text-gray-900">{team.name}</span>?{" "}
        {rosterSize > 0 &&
          `Its ${rosterSize} ${rosterSize === 1 ? "player" : "players"} will be released and can join other teams. `}
        This can&apos;t be undone.
      </p>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Delete team
        </Button>
      </div>
    </Modal>
  );
}
