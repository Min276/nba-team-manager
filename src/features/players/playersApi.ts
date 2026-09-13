import { createApi, fetchBaseQuery, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type { SerializedError } from "@reduxjs/toolkit";
import type { PlayersPage } from "./types";

export const playersApi = createApi({
  reducerPath: "playersApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/api" }),
  endpoints: (build) => ({
    getPlayers: build.infiniteQuery<PlayersPage, string, number | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
      query: ({ queryArg: search, pageParam }) => ({
        url: "players",
        params: { search: search || undefined, cursor: pageParam ?? undefined },
      }),
    }),
  }),
});

export const { useGetPlayersInfiniteQuery } = playersApi;

export function describeError(error: FetchBaseQueryError | SerializedError | undefined) {
  if (error && "status" in error) {
    if (error.status === "FETCH_ERROR")
      return "Network error — check your connection and try again.";
    const message = (error.data as { message?: unknown } | undefined)?.message;
    if (typeof message === "string") return message;
    return `Request failed (${error.status}).`;
  }
  return error?.message ?? "Something went wrong while loading players.";
}
