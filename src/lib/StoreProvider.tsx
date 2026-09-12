"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { hydrate, loadPersistedState, persistStore } from "./persistence";
import { makeStore } from "./store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    store.dispatch(hydrate(loadPersistedState()));
    return persistStore(store);
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
