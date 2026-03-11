import { DEMO_MODE, STRICT_API } from "@/config/env";
import type { CalendarEvent } from "@/types/academic";
import type { UserRole } from "@/utils/storage";

export type { CalendarEvent } from "@/types/academic";

type StoredCalendarEvent = Omit<CalendarEvent, "start" | "end"> & {
  start: string;
  end: string;
};

export type CalendarContext = {
  role: UserRole;
  userId?: number | null;
};

const GLOBAL_KEY = "educonnect:calendar:v3:global";

function personalKey(userId: number | null | undefined) {
  return `educonnect:calendar:v3:ALUNO:${typeof userId === "number" ? userId : 0}`;
}

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

function toCalendarDate(now: Date, daysOffset: number, hour: number) {
  const date = new Date(now);
  date.setDate(now.getDate() + daysOffset);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function seedGlobalEvents(now = new Date()): CalendarEvent[] {
  const adminStart = toCalendarDate(now, 1, 10);
  const adminEnd = toCalendarDate(now, 1, 11);

  const profStart = toCalendarDate(now, 2, 19);
  const profEnd = toCalendarDate(now, 2, 20);

  const apiStart = toCalendarDate(now, 4, 9);
  const apiEnd = toCalendarDate(now, 4, 10);

  return [
    {
      id: newId(),
      title: "Reunião de coordenação acadêmica",
      start: adminStart,
      end: adminEnd,
      createdByRole: "ADMIN",
      scope: "INSTITUCIONAL",
    },
    {
      id: newId(),
      title: "Plantão docente - Projeto Integrador",
      start: profStart,
      end: profEnd,
      createdByRole: "PROFESSOR",
      scope: "DOCENTE",
    },
    {
      id: "api_seed_1",
      title: "Janela de ajuste de matrícula",
      start: apiStart,
      end: apiEnd,
      createdByRole: "API",
      scope: "INSTITUCIONAL",
    },
  ];
}

function readFromKey(storageKey: string): CalendarEvent[] {
  if (!canUseStorage()) return [];
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as StoredCalendarEvent[];
    return Array.isArray(parsed) ? parsed.map(revive) : [];
  } catch {
    return [];
  }
}

function writeToKey(storageKey: string, events: CalendarEvent[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(storageKey, JSON.stringify(events.map(serialize)));
}

function ensureGlobalSeedIfNeeded() {
  if (!canUseStorage()) return;
  const globalRaw = window.localStorage.getItem(GLOBAL_KEY);
  if (globalRaw) return;
  if (!DEMO_MODE) return;
  writeToKey(GLOBAL_KEY, seedGlobalEvents());
}

function migrateLegacyV1IfNeeded() {
  if (!canUseStorage()) return;
  const legacyKey = "educonnect:calendar-events:v1";
  const globalRaw = window.localStorage.getItem(GLOBAL_KEY);
  if (globalRaw) return;

  const oldRaw = window.localStorage.getItem(legacyKey);
  if (!oldRaw) return;

  try {
    const parsed = JSON.parse(oldRaw) as Array<{
      id: string;
      title: string;
      start: string;
      end: string;
      allDay?: boolean;
    }>;

    const migrated: CalendarEvent[] = Array.isArray(parsed)
      ? parsed.map((item) => ({
          id: item.id,
          title: item.title,
          start: new Date(item.start),
          end: new Date(item.end),
          allDay: item.allDay,
          createdByRole: "ADMIN",
          scope: "INSTITUCIONAL",
        }))
      : [];

    writeToKey(GLOBAL_KEY, migrated);
    window.localStorage.removeItem(legacyKey);
  } catch {
    window.localStorage.removeItem(legacyKey);
  }
}

function listGlobalEvents(): CalendarEvent[] {
  migrateLegacyV1IfNeeded();
  ensureGlobalSeedIfNeeded();
  return readFromKey(GLOBAL_KEY);
}

function listPersonalEvents(userId?: number | null): CalendarEvent[] {
  return readFromKey(personalKey(userId));
}

function sortByDate(events: CalendarEvent[]) {
  return events.slice().sort((a, b) => a.start.getTime() - b.start.getTime());
}

function canAccessPersonal(context: CalendarContext) {
  return context.role === "ALUNO";
}

export const calendarService = {
  list(context: CalendarContext): CalendarEvent[] {
    if (STRICT_API) return [];
    if (!canUseStorage()) return DEMO_MODE ? seedGlobalEvents() : [];

    const globalEvents = listGlobalEvents();
    if (!canAccessPersonal(context)) {
      return sortByDate(globalEvents);
    }

    const personalEvents = listPersonalEvents(context.userId);
    return sortByDate([...globalEvents, ...personalEvents]);
  },

  create(input: Omit<CalendarEvent, "id">, context: CalendarContext): CalendarEvent {
    if (STRICT_API) {
      throw new Error("Calendário local desativado em modo API estrito");
    }

    const created: CalendarEvent = { ...input, id: newId() };

    if (!canUseStorage()) return created;

    if (input.scope === "PESSOAL" && canAccessPersonal(context)) {
      const personal = listPersonalEvents(context.userId);
      writeToKey(personalKey(context.userId), [...personal, created]);
      return created;
    }

    const globalEvents = listGlobalEvents();
    writeToKey(GLOBAL_KEY, [...globalEvents, created]);
    return created;
  },

  update(
    id: string,
    patch: Partial<Omit<CalendarEvent, "id">>,
    context: CalendarContext
  ): CalendarEvent | null {
    if (STRICT_API) {
      throw new Error("Atualização local de calendário desativada em modo API estrito");
    }

    if (!canUseStorage()) return null;

    if (canAccessPersonal(context)) {
      const key = personalKey(context.userId);
      const personal = listPersonalEvents(context.userId);
      const index = personal.findIndex((item) => item.id === id);
      if (index >= 0) {
        const updated = { ...personal[index], ...patch, id };
        const next = personal.slice();
        next[index] = updated;
        writeToKey(key, next);
        return updated;
      }
    }

    const globalEvents = listGlobalEvents();
    const index = globalEvents.findIndex((item) => item.id === id);
    if (index < 0) return null;

    const updated = { ...globalEvents[index], ...patch, id };
    const next = globalEvents.slice();
    next[index] = updated;
    writeToKey(GLOBAL_KEY, next);
    return updated;
  },

  remove(id: string, context: CalendarContext) {
    if (STRICT_API) {
      throw new Error("Remoção local de calendário desativada em modo API estrito");
    }

    if (!canUseStorage()) return;

    if (canAccessPersonal(context)) {
      const key = personalKey(context.userId);
      const personal = listPersonalEvents(context.userId);
      const next = personal.filter((item) => item.id !== id);
      if (next.length !== personal.length) {
        writeToKey(key, next);
        return;
      }
    }

    const globalEvents = listGlobalEvents();
    writeToKey(
      GLOBAL_KEY,
      globalEvents.filter((item) => item.id !== id)
    );
  },

  resetToMock(context: CalendarContext) {
    if (STRICT_API) return;
    if (!canUseStorage()) return;

    if (canAccessPersonal(context)) {
      window.localStorage.removeItem(personalKey(context.userId));
      return;
    }

    window.localStorage.removeItem(GLOBAL_KEY);
  },

  upcoming(limit = 5, from = new Date(), context: CalendarContext): CalendarEvent[] {
    return this.list(context)
      .filter((item) => item.end.getTime() >= from.getTime())
      .slice(0, limit);
  },
};
