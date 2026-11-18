"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, errorMessage, type Query } from "@/lib/api";

/** Loads GET data. Pass `null` as the path to skip loading. */
export function useFetch<T>(path: string | null, query?: Query) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(path !== null);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);
  const queryKey = JSON.stringify(query ?? {});

  const load = useCallback(
    async (silent = false) => {
      if (path === null) {
        setLoading(false);
        return;
      }
      const id = ++seq.current;
      if (!silent) setLoading(true);
      try {
        const res = await api.get<T>(path, query);
        if (id === seq.current) {
          setData(res);
          setError(null);
        }
      } catch (e) {
        if (id === seq.current) setError(errorMessage(e));
      } finally {
        if (id === seq.current) setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [path, queryKey],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: () => load(true), setData };
}
