import { useCallback, useEffect, useRef, useState } from "react";

import { studentsRepository } from "@/services/students.repository";
import { studentsService, type StudentRecord } from "@/services/students";

export type StudentRow = StudentRecord & { ra?: string };

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function raFromId(id: number) {
  return `RA-${String(id).padStart(6, "0")}`;
}

function normalizeRows(rows: StudentRecord[]): StudentRow[] {
  return rows.map((item) => ({ ...item, ra: raFromId(item.id) }));
}

export function useStudents() {
  const mounted = useRef(true);

  const [data, setData] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await delay(300);
      const list = await studentsRepository.list();
      if (mounted.current) {
        setData(normalizeRows(list));
      }
    } catch {
      if (mounted.current) {
        setError("Nao foi possivel carregar alunos.");
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

  const add = useCallback((input: Omit<StudentRecord, "id">): StudentRow => {
    const created = studentsService.create(input);
    const row: StudentRow = { ...created, ra: raFromId(created.id) };
    setData((prev) => [...prev, row].sort((a, b) => a.id - b.id));
    return row;
  }, []);

  const reset = useCallback(async () => {
    studentsService.resetToMock();
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
