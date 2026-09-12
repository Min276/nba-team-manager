import { createAction, createReducer, type Reducer } from "@reduxjs/toolkit";
import type { AppStore, RootState } from "./store";

// ponytail: bump the version when a persisted slice changes shape; old data is simply ignored.
export const STORAGE_KEY = "nba-team-manager:v1";
const PERSISTED_KEYS = ["auth", "teams"] as const satisfies readonly (keyof RootState)[];

export type PersistedState = Pick<RootState, (typeof PERSISTED_KEYS)[number]>;

export const hydrate = createAction<Partial<PersistedState>>("persistence/hydrate");

export const hydratedReducer: Reducer<boolean> = createReducer<boolean>(false, (builder) => {
  builder.addCase(hydrate, () => true);
});

export const selectHydrated = (state: RootState) => state.hydrated;

export function loadPersistedState(): Partial<PersistedState> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
    return parsed && typeof parsed === "object" ? (parsed as Partial<PersistedState>) : {};
  } catch {
    return {};
  }
}

export function persistStore(store: AppStore) {
  let prev = store.getState();
  return store.subscribe(() => {
    const next = store.getState();
    if (PERSISTED_KEYS.every((key) => next[key] === prev[key])) return;
    prev = next;
    const snapshot = Object.fromEntries(PERSISTED_KEYS.map((key) => [key, next[key]]));
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    } catch {
      // storage full or unavailable (private mode): keep the app usable, just unpersisted
    }
  });
}
