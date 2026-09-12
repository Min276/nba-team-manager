"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { playerAdded, selectAllTeams } from "@/features/teams/teamsSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import type { Player } from "./types";

interface AssignPlayerModalProps {
  player: Player;
  onClose: () => void;
}

export function AssignPlayerModal({ player, onClose }: AssignPlayerModalProps) {
  const teams = useAppSelector(selectAllTeams);
  const dispatch = useAppDispatch();

  const assign = (teamId: string) => {
    dispatch(playerAdded({ teamId, player }));
    onClose();
  };

  return (
    <Modal title={`Add ${player.firstName} ${player.lastName} to a team`} onClose={onClose}>
      {teams.length === 0 ? (
        <p className="text-sm text-gray-600">
          You don&apos;t have any teams yet.{" "}
          <Link href="/teams" className="font-medium text-indigo-600 hover:underline">
            Create one
          </Link>{" "}
          first.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200">
          {teams.map((team) => {
            const full = team.players.length >= team.playerCount;
            return (
              <li key={team.id}>
                <button
                  type="button"
                  disabled={full}
                  onClick={() => assign(team.id)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-medium text-gray-900">{team.name}</span>
                    <span className="block text-sm text-gray-500">
                      {team.region} · {team.country}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm text-gray-500">
                    {full ? "Full" : `${team.players.length} / ${team.playerCount}`}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Modal>
  );
}
