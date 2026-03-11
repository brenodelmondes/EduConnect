import { useCallback, useEffect, useRef, useState } from "react";

import { teachersRepository } from "@/services/teachers.repository";
import { teachersService, type TeacherRecord } from "@/services/teachers";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function useTeachers() {
  const mounted = useRef(true);

  const [data, setData] = useState<TeacherRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await delay(300);
      const list = await teachersRepository.list();
      if (mounted.current) {
        setData(list);
      }
    } catch {
      if (mounted.current) {
        setError("Nao foi possivel carregar professores.");
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

  const add = useCallback((input: Omit<TeacherRecord, "id">): TeacherRecord => {
    const created = teachersService.create(input);
    setData((prev) => [...prev, created].sort((a, b) => a.id - b.id));
    return created;
  }, []);

  const reset = useCallback(async () => {
    teachersService.resetToMock();
    await load();
  }, [load]);

  return {
    data,
    setData,
    loading,
    error,
    load,
    add,
    reset,
  };
}
