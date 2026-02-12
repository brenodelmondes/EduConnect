export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

import { DEMO_MODE } from "@/config/env";

type StoredCalendarEvent = Omit<CalendarEvent, "start" | "end"> & {
  start: string;
  end: string;
};

const STORAGE_KEY = "educonnect:calendar-events:v1";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function newId() {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `evt_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function serialize(e: CalendarEvent): StoredCalendarEvent {
  return {
    ...e,
    start: e.start.toISOString(),
    end: e.end.toISOString(),
  };
}

function revive(e: StoredCalendarEvent): CalendarEvent {
  return {
    ...e,
    start: new Date(e.start),
    end: new Date(e.end),
  };
}

function seedEvents(now = new Date()): CalendarEvent[] {
  const y = now.getFullYear();
  const m = now.getMonth();

  const at = (day: number, hour: number, minute = 0) => new Date(y, m, day, hour, minute);

  // eventos próximos para sempre aparecer algo na demo
  const baseDay = Math.max(1, now.getDate());

  return [
    {
      id: newId(),
      title: "Reunião de Coordenação",
      start: at(baseDay, 10, 0),
      end: at(baseDay, 11, 0),
    },
    {
      id: newId(),
      title: "Prazo de Validação de Documentos",
      start: at(baseDay + 1, 14, 0),
      end: at(baseDay + 1, 15, 0),
    },
    {
      id: newId(),
      title: "Aprovação de Grade de Horários",
      start: at(baseDay + 3, 9, 0),
      end: at(baseDay + 3, 10, 0),
    },
    {
      id: newId(),
      title: "Reunião com Corpo Docente",
      start: at(baseDay + 5, 16, 0),
      end: at(baseDay + 5, 17, 0),
    },
  ];
}

function readAll(): CalendarEvent[] {
  if (!canUseStorage()) return DEMO_MODE ? seedEvents() : [];

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    if (!DEMO_MODE) return [];

    const seeded = seedEvents();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded.map(serialize)));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as StoredCalendarEvent[];
    return Array.isArray(parsed) ? parsed.map(revive) : [];
  } catch {
    return [];
  }
}

function writeAll(events: CalendarEvent[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(events.map(serialize))
  );
}

export const calendarService = {
  list(): CalendarEvent[] {
    return readAll().sort((a, b) => a.start.getTime() - b.start.getTime());
  },

  create(input: Omit<CalendarEvent, "id">): CalendarEvent {
    const events = readAll();
    const created: CalendarEvent = { ...input, id: newId() };
    const next = [...events, created];
    writeAll(next);
    return created;
  },

  update(id: string, patch: Partial<Omit<CalendarEvent, "id">>): CalendarEvent | null {
    const events = readAll();
    const idx = events.findIndex((e) => e.id === id);
    if (idx < 0) return null;

    const updated: CalendarEvent = { ...events[idx], ...patch, id };
    const next = events.slice();
    next[idx] = updated;
    writeAll(next);
    return updated;
  },

  remove(id: string) {
    const events = readAll();
    const next = events.filter((e) => e.id !== id);
    writeAll(next);
  },

  resetToMock() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },

  upcoming(limit = 5, from = new Date()): CalendarEvent[] {
    return this.list()
      .filter((e) => e.end.getTime() >= from.getTime())
      .slice(0, limit);
  },
};
