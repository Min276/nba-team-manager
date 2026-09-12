"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAppSelector } from "@/lib/hooks";
import { DeleteTeamModal } from "./DeleteTeamModal";
import { TeamCard } from "./TeamCard";
import { TeamFormModal } from "./TeamFormModal";
import { selectAllTeams, type Team } from "./teamsSlice";

type ModalState = { type: "create" } | { type: "edit" | "delete"; team: Team } | null;

export function TeamList() {
  const teams = useAppSelector(selectAllTeams);
  const [modal, setModal] = useState<ModalState>(null);

  const openEdit = useCallback((team: Team) => setModal({ type: "edit", team }), []);
  const openDelete = useCallback((team: Team) => setModal({ type: "delete", team }), []);
  const close = () => setModal(null);

  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Teams</h1>
        <Button onClick={() => setModal({ type: "create" })}>New team</Button>
      </div>

      {teams.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="font-medium text-gray-900">No teams yet</p>
          <p className="mt-1 text-sm text-gray-600">
            Create your first team, then add players to it from the Players page.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => (
            <TeamCard key={team.id} team={team} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </ul>
      )}

      {modal?.type === "create" && <TeamFormModal onClose={close} />}
      {modal?.type === "edit" && <TeamFormModal team={modal.team} onClose={close} />}
      {modal?.type === "delete" && <DeleteTeamModal team={modal.team} onClose={close} />}
    </>
  );
}
