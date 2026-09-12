import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { hydratedReducer } from "./persistence";

const rootReducer = combineReducers({
  hydrated: hydratedReducer,
});

export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({ reducer: rootReducer, preloadedState });

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];
