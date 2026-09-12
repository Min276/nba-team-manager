import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth/authSlice";
import { playersApi } from "@/features/players/playersApi";
import { hydratedReducer } from "./persistence";

const rootReducer = combineReducers({
  hydrated: hydratedReducer,
  auth: authReducer,
  [playersApi.reducerPath]: playersApi.reducer,
});

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(playersApi.middleware),
  });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
