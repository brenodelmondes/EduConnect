import { DEMO_MODE } from "@/config/env";
import { api } from "@/services/api";
import { calendarService, type CalendarEvent } from "@/services/calendar";

type ApiEvento = {
  id?: number;
  titulo?: string;
  dataEvento?: string;

  // fallback PascalCase
  Id?: number;
  Titulo?: string;
  DataEvento?: string;
};

function mapApiEvento(e: ApiEvento): CalendarEvent {
  const id = e.id ?? e.Id;
  const title = e.titulo ?? e.Titulo;
  const when = e.dataEvento ?? e.DataEvento;

  if (!id || !title || !when) {
    throw new Error("API retornou evento em formato inesperado");
  }

  const start = new Date(when);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  return {
    id: `api_${id}`,
    title,
    start,
    end,
  };
}

function mergeById(apiEvents: CalendarEvent[], localEvents: CalendarEvent[]) {
  const byId = new Map<string, CalendarEvent>();
  for (const e of apiEvents) byId.set(e.id, e);
  for (const e of localEvents) byId.set(e.id, e);
  return Array.from(byId.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const eventsRepository = {
  async list(): Promise<CalendarEvent[]> {
    const local = calendarService.list();

    if (DEMO_MODE) return local;

    try {
      const res = await api.get<ApiEvento[]>("/Eventos");
      const data = Array.isArray(res.data) ? res.data : [];
      const apiEvents = data.map(mapApiEvento);
      // Mantém eventos locais (criados na demo) visíveis na UI.
      return mergeById(apiEvents, local);
    } catch {
      return local;
    }
  },
};
