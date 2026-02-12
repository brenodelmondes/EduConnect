import { teachers as seedTeachers, type Teacher as SeedTeacher } from "@/mocks/db";

export type TeacherRecord = SeedTeacher & {
  email: string;
};

type StoredTeacher = Omit<TeacherRecord, never>;

const STORAGE_KEY = "educonnect:teachers:v1";

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

function seedToRecord(t: SeedTeacher): TeacherRecord {
  return {
    ...t,
    email: `prof.${t.id}@educonnect.demo`,
  };
}

function readAll(): TeacherRecord[] {
  const base = seedTeachers.map(seedToRecord);
  if (!canUseStorage()) return base;

  const stored = safeParse<StoredTeacher[]>(window.localStorage.getItem(STORAGE_KEY));
  if (!stored) return base;

  const byId = new Map<number, TeacherRecord>();
  for (const t of base) byId.set(t.id, t);
  for (const t of stored) byId.set(t.id, t);
  return Array.from(byId.values());
}

function writeAll(records: TeacherRecord[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

function nextId(existing: TeacherRecord[]) {
  return (existing.reduce((acc, t) => Math.max(acc, t.id), 0) || 0) + 1;
}

export const teachersService = {
  list(): TeacherRecord[] {
    return readAll();
  },

  create(input: Omit<TeacherRecord, "id">): TeacherRecord {
    const all = readAll();
    const created: TeacherRecord = { ...input, id: nextId(all) };
    writeAll([...all, created]);
    return created;
  },

  exportJson(filtered?: TeacherRecord[]) {
    const data = filtered ?? readAll();
    return JSON.stringify(data, null, 2);
  },

  resetToMock() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },
};
