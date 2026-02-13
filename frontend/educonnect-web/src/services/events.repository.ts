import { DEMO_MODE } from "@/config/env";
import { type CalendarEvent, calendarService } from "@/services/calendar";
import { api } from "@/services/api";

type ApiEvento = {
  id?: number;
  titulo?: string;
  dataEvento?: string;

  Id?: number;
  Titulo?: string;
  DataEvento?: string;
};

function mapApiEvento(input: ApiEvento): CalendarEvent {
  const id = input.id ?? input.Id;
  const title = input.titulo ?? input.Titulo;
  const dateValue = input.dataEvento ?? input.DataEvento;

  if (!id || !title || !dateValue) {
    throw new Error("API retornou evento em formato inesperado");
  }

  const start = new Date(dateValue);
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
  for (const item of apiEvents) byId.set(item.id, item);
  for (const item of localEvents) byId.set(item.id, item);
  return Array.from(byId.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const eventsRepository = {
  async list(): Promise<CalendarEvent[]> {
    const localEvents = calendarService.list();
    if (DEMO_MODE) return localEvents;

    try {
      const response = await api.get<ApiEvento[]>("/Eventos");
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length === 0) return localEvents;
      const apiEvents = data.map(mapApiEvento);
      return mergeById(apiEvents, localEvents);
    } catch {
      return localEvents;
    }
  },
};
