import { DEMO_MODE } from "@/config/env";

export type CalendarEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
};

type StoredCalendarEvent = Omit<CalendarEvent, "start" | "end"> & {
  start: string;
  end: string;
};

const STORAGE_KEY = "educonnect:calendar-events:v1";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function newId() {
  const randomUUID = globalThis.crypto?.randomUUID;
  if (typeof randomUUID === "function") {
    return randomUUID.call(globalThis.crypto);
  }
  return `evt_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function serialize(eventItem: CalendarEvent): StoredCalendarEvent {
  return {
    ...eventItem,
    start: eventItem.start.toISOString(),
    end: eventItem.end.toISOString(),
  };
}

function revive(eventItem: StoredCalendarEvent): CalendarEvent {
  return {
    ...eventItem,
    start: new Date(eventItem.start),
    end: new Date(eventItem.end),
  };
}

function seedEvents(now = new Date()): CalendarEvent[] {
  const year = now.getFullYear();
  const month = now.getMonth();
  const at = (day: number, hour: number, minute = 0) => new Date(year, month, day, hour, minute);
  const baseDay = Math.max(1, now.getDate());

  return [
    {
      id: newId(),
      title: "Reuniao de Coordenacao",
      start: at(baseDay, 10, 0),
      end: at(baseDay, 11, 0),
    },
    {
      id: newId(),
      title: "Prazo de Validacao de Documentos",
      start: at(baseDay + 1, 14, 0),
      end: at(baseDay + 1, 15, 0),
    },
    {
      id: newId(),
      title: "Aprovacao de Grade de Horarios",
      start: at(baseDay + 3, 9, 0),
      end: at(baseDay + 3, 10, 0),
    },
    {
      id: newId(),
      title: "Reuniao com Corpo Docente",
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
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.map(serialize)));
}

export const calendarService = {
  list(): CalendarEvent[] {
    return readAll().sort((a, b) => a.start.getTime() - b.start.getTime());
  },

  create(input: Omit<CalendarEvent, "id">): CalendarEvent {
    const events = readAll();
    const created: CalendarEvent = { ...input, id: newId() };
    writeAll([...events, created]);
    return created;
  },

  update(id: string, patch: Partial<Omit<CalendarEvent, "id">>): CalendarEvent | null {
    const events = readAll();
    const idx = events.findIndex((item) => item.id === id);
    if (idx < 0) return null;

    const updated: CalendarEvent = { ...events[idx], ...patch, id };
    const next = events.slice();
    next[idx] = updated;
    writeAll(next);
    return updated;
  },

  remove(id: string) {
    const events = readAll();
    writeAll(events.filter((item) => item.id !== id));
  },

  resetToMock() {
    if (!canUseStorage()) return;
    window.localStorage.removeItem(STORAGE_KEY);
  },

  upcoming(limit = 5, from = new Date()): CalendarEvent[] {
    return this.list()
      .filter((item) => item.end.getTime() >= from.getTime())
      .slice(0, limit);
  },
};
