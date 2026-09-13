"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { selectTeamByPlayerId } from "@/features/teams/teamsSlice";
import { useAppSelector } from "@/lib/hooks";
import { describeError, useGetPlayersInfiniteQuery } from "./playersApi";
import type { Player } from "./types";

interface PlayerPickerProps {
  selected: Player[];
  onChange: (players: Player[]) => void;
  capacity: number;
  teamId?: string;
}

const fullName = (player: Player) => `${player.firstName} ${player.lastName}`;

// Lets a team form pick its roster from the same player cache the Players page
// uses; players on other teams and seats beyond the capacity are disabled.
export function PlayerPicker({ selected, onChange, capacity, teamId }: PlayerPickerProps) {
  const { data, error, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetPlayersInfiniteQuery();
  const teamByPlayerId = useAppSelector(selectTeamByPlayerId);
  const [filter, setFilter] = useState("");

  const players = useMemo(() => {
    const all = data?.pages.flatMap((page) => page.data) ?? [];
    const query = filter.trim().toLowerCase();
    return query ? all.filter((player) => fullName(player).toLowerCase().includes(query)) : all;
  }, [data, filter]);
  const selectedIds = useMemo(() => new Set(selected.map((player) => player.id)), [selected]);
  const full = selected.length >= capacity;

  const toggle = (player: Player) =>
    onChange(
      selectedIds.has(player.id)
        ? selected.filter((p) => p.id !== player.id)
        : [...selected, player],
    );

  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium text-gray-700">
        Players{" "}
        <span className="font-normal text-gray-500">
          ({selected.length} / {Number.isFinite(capacity) ? capacity : "–"} selected)
        </span>
      </legend>

      {selected.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-1.5">
          {selected.map((player) => (
            <li key={player.id}>
              <button
                type="button"
                aria-label={`Deselect ${fullName(player)}`}
                onClick={() => toggle(player)}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                {fullName(player)}
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <input
        type="search"
        aria-label="Filter loaded players"
        placeholder="Filter loaded players…"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
        className="mb-2 block w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      />

      <div className="max-h-52 overflow-y-auto rounded-md border border-gray-300">
        {isLoading ? (
          <p role="status" className="p-3 text-sm text-gray-500">
            Loading players…
          </p>
        ) : isError && players.length === 0 ? (
          <p role="alert" className="p-3 text-sm text-red-700">
            {describeError(error)}
          </p>
        ) : players.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">No players match.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {players.map((player) => {
              const owner = teamByPlayerId.get(player.id);
              const onOtherTeam = owner !== undefined && owner.id !== teamId;
              const checked = selectedIds.has(player.id);
              const disabled = onOtherTeam || (full && !checked);
              return (
                <li key={player.id}>
                  <label
                    className={`flex items-center gap-3 px-3 py-2 text-sm ${
                      disabled ? "opacity-50" : "cursor-pointer hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={disabled}
                      onChange={() => toggle(player)}
                      className="size-4 accent-indigo-600"
                    />
                    <span className="min-w-0 flex-1 truncate">
                      <span className="font-medium text-gray-900">{fullName(player)}</span>
                      <span className="text-gray-500">
                        {" "}
                        · {player.position || "N/A"} · {player.nbaTeam}
                      </span>
                    </span>
                    {onOtherTeam && (
                      <span className="shrink-0 text-xs text-gray-500">In {owner.name}</span>
                    )}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
        {isError && players.length > 0 && (
          <p role="alert" className="border-t border-gray-100 p-2 text-center text-xs text-red-700">
            {describeError(error)}
          </p>
        )}
        {hasNextPage && (
          <div className="border-t border-gray-100 p-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              disabled={isFetchingNextPage}
              onClick={() => fetchNextPage()}
            >
              {isFetchingNextPage ? "Loading…" : isError ? "Retry" : "Load more players"}
            </Button>
          </div>
        )}
      </div>
    </fieldset>
  );
}
