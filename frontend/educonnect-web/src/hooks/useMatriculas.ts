import { useCallback, useEffect, useRef, useState } from "react";

import {
  matriculasRepository,
  type MatriculaRow,
} from "@/services/matriculas.repository";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function useMatriculas() {
  const mounted = useRef(true);
  const [data, setData] = useState<MatriculaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await delay(250);
      const rows = await matriculasRepository.list();
      if (mounted.current) {
        setData(rows);
      }
    } catch {
      if (mounted.current) {
        setError("Nao foi possivel carregar matriculas.");
        setData([]);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  return {
    data,
    loading,
    error,
    reload: load,
    setData,
  };
}
