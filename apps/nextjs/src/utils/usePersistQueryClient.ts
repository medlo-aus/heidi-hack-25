import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { useQueryClient } from "@tanstack/react-query";
import {
  persistQueryClient,
  removeOldestQuery,
  type PersistedClient,
} from "@tanstack/react-query-persist-client";
import { useEffect } from "react";
import superjson from "superjson";

const usePersistQueryClient = () => {
  const queryClient = useQueryClient();
  useEffect(() => {
    const localStoragePersister = createSyncStoragePersister({
      storage: window.localStorage,
      throttleTime: 1000,
      retry: removeOldestQuery,
      serialize: (data) => superjson.stringify(data) ?? "",
      deserialize: (data) => superjson.parse(data) ?? {},
    });

    persistQueryClient({
      queryClient,
      persister: localStoragePersister,
      maxAge: 60 * 60 * 24,
    });
  }, []);
};

export default usePersistQueryClient;
