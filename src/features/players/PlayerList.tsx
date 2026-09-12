"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { PlayerRow } from "./PlayerRow";
import { describeError, useGetPlayersInfiniteQuery } from "./playersApi";
import { useInfiniteScroll } from "./useInfiniteScroll";

export function PlayerList() {
  const {
    data,
    error,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    refetch,
  } = useGetPlayersInfiniteQuery();

  const players = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data]);
  const sentinelRef = useInfiniteScroll(fetchNextPage, hasNextPage && !isFetchingNextPage && !isError);

  if (isLoading) {
    return (
      <ul role="status" aria-label="Loading players" className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {Array.from({ length: 6 }, (_, i) => (
          <li key={i} className="flex animate-pulse items-center gap-4 px-4 py-3">
            <span className="size-10 rounded-full bg-gray-200" />
            <span className="h-4 w-40 rounded bg-gray-200" />
          </li>
        ))}
      </ul>
    );
  }

  if (isError && players.length === 0) {
    return (
      <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-medium text-red-800">Couldn&apos;t load players</p>
        <p className="mt-1 text-sm text-red-700">{describeError(error)}</p>
        <Button variant="secondary" className="mt-4" onClick={() => refetch()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {players.map((player) => (
          <PlayerRow key={player.id} player={player} />
        ))}
      </ul>

      <div className="flex flex-col items-center gap-2 py-6 text-sm text-gray-500">
        {isError && (
          <p role="alert" className="text-red-700">
            {describeError(error)}
          </p>
        )}
        {hasNextPage ? (
          <>
            <div ref={sentinelRef} aria-hidden className="h-px w-full" />
            <Button variant="secondary" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
              {isFetchingNextPage ? "Loading…" : isError ? "Retry" : "Load more"}
            </Button>
          </>
        ) : (
          <p>You&apos;ve reached the end of the list.</p>
        )}
      </div>
    </>
  );
}
