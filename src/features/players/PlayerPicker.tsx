"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { selectTeamByPlayerId } from "@/features/teams/teamsSlice";
import { useAppSelector } from "@/lib/hooks";
import { useDebouncedValue } from "@/lib/useDebouncedValue";
import { describeError, useGetPlayersInfiniteQuery } from "./playersApi";
import type { Player } from "./types";

interface PlayerPickerProps {
  selected: Player[];
  onChange: (players: Player[]) => void;
  capacity: number;
  teamId?: string;
  error?: string;
}

const fullName = (player: Player) => `${player.firstName} ${player.lastName}`;

// Lets a team form pick its roster from the same player cache the Players page
// uses; players on other teams and seats beyond the capacity are disabled.
export function PlayerPicker({ selected, onChange, capacity, teamId, error }: PlayerPickerProps) {
  const [search, setSearch] = useState("");
  const query = useDebouncedValue(search.trim());
  const {
    data,
    error: queryError,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetPlayersInfiniteQuery(query);
  const teamByPlayerId = useAppSelector(selectTeamByPlayerId);

  const players = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const selectedIds = useMemo(() => new Set(selected.map((player) => player.id)), [selected]);
  const full = selected.length >= capacity;

  const toggle = (player: Player) =>
    onChange(
      selectedIds.has(player.id)
        ? selected.filter((p) => p.id !== player.id)
        : [...selected, player],
    );

  return (
    <fieldset aria-describedby={error ? "team-players-error" : undefined}>
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

      <SearchInput
        aria-label="Search players"
        placeholder="Search players by name…"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="mb-2"
      />

      <div
        className={`max-h-52 overflow-y-auto rounded-md border ${error ? "border-red-500" : "border-gray-300"}`}
      >
        {isLoading ? (
          <p role="status" className="p-3 text-sm text-gray-500">
            Loading players…
          </p>
        ) : isError && players.length === 0 ? (
          <p role="alert" className="p-3 text-sm text-red-700">
            {describeError(queryError)}
          </p>
        ) : players.length === 0 ? (
          <p className="p-3 text-sm text-gray-500">
            {query ? `No players match “${query}”.` : "No players found."}
          </p>
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
            {describeError(queryError)}
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
      {error && (
        <p id="team-players-error" role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </fieldset>
  );
}
