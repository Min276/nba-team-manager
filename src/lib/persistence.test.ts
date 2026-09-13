import { beforeEach, describe, expect, it } from "vitest";
import { loggedIn, selectUser } from "@/features/auth/authSlice";
import { teamAdded } from "@/features/teams/teamsSlice";
import {
  STORAGE_KEY,
  hydrate,
  loadPersistedState,
  persistStore,
  selectHydrated,
} from "./persistence";
import { makeStore } from "./store";

const storage = new Map<string, string>();

beforeEach(() => {
  storage.clear();
  globalThis.localStorage = {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
  } as Storage;
});

describe("persistence", () => {
  it("writes only the persisted slices and restores them into a fresh store", () => {
    const store = makeStore();
    persistStore(store);
    store.dispatch(loggedIn("Min"));
    store.dispatch(
      teamAdded({ name: "Dragons", playerCount: 5, region: "Asia", country: "Myanmar" }),
    );

    const written = JSON.parse(storage.get(STORAGE_KEY)!);
    expect(Object.keys(written).sort()).toEqual(["auth", "preferences", "teams"]);

    const fresh = makeStore();
    expect(selectHydrated(fresh.getState())).toBe(false);
    fresh.dispatch(hydrate(loadPersistedState()));
    expect(selectHydrated(fresh.getState())).toBe(true);
    expect(selectUser(fresh.getState())).toEqual({ name: "Min" });
    expect(fresh.getState().teams).toEqual(store.getState().teams);
  });

  it("falls back to an empty state when storage is missing or corrupt", () => {
    expect(loadPersistedState()).toEqual({});
    storage.set(STORAGE_KEY, "{not json");
    expect(loadPersistedState()).toEqual({});
    storage.set(STORAGE_KEY, "42");
    expect(loadPersistedState()).toEqual({});
  });
});
