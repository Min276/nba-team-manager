"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { PlayerPicker } from "@/features/players/PlayerPicker";
import type { Player } from "@/features/players/types";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { REGIONS, selectAllTeams, teamAdded, teamUpdated, type Team } from "./teamsSlice";
import {
  COUNTRY_MAX,
  NAME_MAX,
  PLAYER_COUNT_MAX,
  emptyTeamForm,
  toFormValues,
  toTeamInput,
  validateTeamForm,
  type TeamFormErrors,
  type TeamFormValues,
} from "./validation";

interface TeamFormModalProps {
  team?: Team;
  onClose: () => void;
}

export function TeamFormModal({ team, onClose }: TeamFormModalProps) {
  const teams = useAppSelector(selectAllTeams);
  const dispatch = useAppDispatch();
  const [values, setValues] = useState<TeamFormValues>(() =>
    team ? toFormValues(team) : emptyTeamForm,
  );
  const [errors, setErrors] = useState<TeamFormErrors>({});
  const [selected, setSelected] = useState<Player[]>(() => team?.players ?? []);
  const capacity = Number(values.playerCount);

  const update =
    (field: keyof TeamFormValues) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setValues((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const nextErrors = validateTeamForm(values, teams, team, selected.length);
    if (Object.values(nextErrors).some(Boolean)) return setErrors(nextErrors);

    const input = toTeamInput(values);
    dispatch(
      team
        ? teamUpdated({ id: team.id, changes: input, players: selected })
        : teamAdded(input, selected),
    );
    onClose();
  };

  return (
    <Modal title={team ? "Edit team" : "Create team"} onClose={onClose}>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <Input
          id="team-name"
          label="Team name"
          maxLength={NAME_MAX}
          value={values.name}
          error={errors.name}
          onChange={update("name")}
        />
        <Input
          id="team-player-count"
          label="Player count"
          type="number"
          inputMode="numeric"
          min={1}
          max={PLAYER_COUNT_MAX}
          value={values.playerCount}
          error={errors.playerCount}
          onChange={update("playerCount")}
        />
        <Select
          id="team-region"
          label="Region"
          value={values.region}
          error={errors.region}
          onChange={update("region")}
        >
          <option value="">Select a region</option>
          {REGIONS.map((region) => (
            <option key={region}>{region}</option>
          ))}
        </Select>
        <Input
          id="team-country"
          label="Country"
          maxLength={COUNTRY_MAX}
          value={values.country}
          error={errors.country}
          onChange={update("country")}
        />
        <PlayerPicker
          selected={selected}
          onChange={(players) => {
            setSelected(players);
            setErrors((prev) => ({ ...prev, players: undefined }));
          }}
          error={errors.players}
          capacity={Number.isInteger(capacity) && capacity > 0 ? capacity : Infinity}
          teamId={team?.id}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">{team ? "Save changes" : "Create team"}</Button>
        </div>
      </form>
    </Modal>
  );
}
