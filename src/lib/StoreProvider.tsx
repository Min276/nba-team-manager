"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { STORAGE_KEY, hydrate, loadPersistedState, persistStore } from "./persistence";
import { makeStore } from "./store";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(makeStore);

  useEffect(() => {
    store.dispatch(hydrate(loadPersistedState()));
    const unsubscribe = persistStore(store);

    // Another tab wrote to storage: adopt its state so both tabs agree.
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) store.dispatch(hydrate(loadPersistedState()));
    };
    window.addEventListener("storage", onStorage);
    return () => {
      unsubscribe();
      window.removeEventListener("storage", onStorage);
    };
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
