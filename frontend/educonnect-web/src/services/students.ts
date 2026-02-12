import { students as seedStudents, type Student as SeedStudent } from "@/mocks/db";

export type StudentRecord = SeedStudent & {
  email: string;
};

type StoredStudent = Omit<StudentRecord, never>;

const STORAGE_KEY = "educonnect:students:v1";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function seedToRecord(s: SeedStudent): StudentRecord {
  return {
    ...s,
    email: `aluno.${s.id}@educonnect.demo`,
  };
}

function readAll(): StudentRecord[] {
  const base = seedStudents.map(seedToRecord);
  if (!canUseStorage()) return base;

  const stored = safeParse<StoredStudent[]>(window.localStorage.getItem(STORAGE_KEY));
  if (!stored) return base;

  // Mescla: se existir mesmo id no storage, storage vence.
  const byId = new Map<number, StudentRecord>();
  for (const s of base) byId.set(s.id, s);
  for (const s of stored) byId.set(s.id, s);
  return Array.from(byId.values());
}

function writeAll(records: StudentRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function nextId(existing: StudentRecord[]) {
  return (existing.reduce((acc, s) => Math.max(acc, s.id), 0) || 0) + 1;
}

export const studentsService = {
  list(): StudentRecord[] {
    return readAll();
  },

  create(input: Omit<StudentRecord, "id">): StudentRecord {
    const all = readAll();
    const created: StudentRecord = { ...input, id: nextId(all) };

    // Persiste apenas o conjunto completo (MVP). Como o seed é grande, isso pode crescer.
    // Para demo, o custo é aceitável; em produção, isso viraria API.
    writeAll([...all, created]);
    return created;
  },

  exportJson(filtered?: StudentRecord[]) {
    const data = filtered ?? readAll();
    return JSON.stringify(data, null, 2);
  },

  resetToMock() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
