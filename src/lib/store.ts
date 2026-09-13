import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth/authSlice";
import { playersApi } from "@/features/players/playersApi";
import { preferencesReducer } from "@/features/preferences/preferencesSlice";
import { teamsReducer } from "@/features/teams/teamsSlice";
import { toastListener } from "@/features/toast/toastListener";
import { toastReducer } from "@/features/toast/toastSlice";
import { hydratedReducer } from "./persistence";

const rootReducer = combineReducers({
  hydrated: hydratedReducer,
  auth: authReducer,
  teams: teamsReducer,
  preferences: preferencesReducer,
  toast: toastReducer,
  [playersApi.reducerPath]: playersApi.reducer,
});

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(toastListener.middleware).concat(playersApi.middleware),
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
