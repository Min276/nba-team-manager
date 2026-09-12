import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { authReducer } from "@/features/auth/authSlice";
import { hydratedReducer } from "./persistence";

const rootReducer = combineReducers({
  hydrated: hydratedReducer,
  auth: authReducer,
});

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer: rootReducer, preloadedState });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
