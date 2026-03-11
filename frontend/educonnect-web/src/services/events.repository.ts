import { API_URL, STRICT_API, USE_DEMO_FALLBACK } from "@/config/env";
import { type CalendarContext, type CalendarEvent, calendarService } from "@/services/calendar";
import { api } from "@/services/api";

type ApiEvento = {
  id?: number;
  titulo?: string;
  dataEvento?: string;
  scope?: string | number;
  usuarioId?: number;
  turmaId?: number | null;

  Id?: number;
  Titulo?: string;
  DataEvento?: string;
  Scope?: string | number;
  UsuarioId?: number;
  TurmaId?: number | null;
};

type ApiEventoPayload = {
  titulo: string;
  dataEvento: string;
  tipo: string;
  usuarioId: number;
  scope: number;
  turmaId?: number;
};

function mapScope(scope: string | number | undefined): CalendarEvent["scope"] {
  if (scope === 2 || String(scope).toLowerCase().includes("turma")) return "DOCENTE";
  if (scope === 3 || String(scope).toLowerCase().includes("priv")) return "PESSOAL";
  return "INSTITUCIONAL";
}

function toApiScope(scope: CalendarEvent["scope"]) {
  if (scope === "DOCENTE") return 2;
  if (scope === "PESSOAL") return 3;
  return 1;
}

function getCreatorByContext(scope: CalendarEvent["scope"], context: CalendarContext): CalendarEvent["createdByRole"] {
  if (scope === "PESSOAL" && context.role === "ALUNO") return "ALUNO";
  if (scope === "DOCENTE" && context.role === "PROFESSOR") return "PROFESSOR";
  return "API";
}

function toPayload(input: Omit<CalendarEvent, "id">, context: CalendarContext): ApiEventoPayload {
  const userId = typeof context.userId === "number" ? context.userId : 1;

  return {
    titulo: input.title,
    dataEvento: input.start.toISOString(),
    tipo: input.scope === "INSTITUCIONAL" ? "Institucional" : input.scope === "DOCENTE" ? "Docente" : "Pessoal",
    usuarioId: userId,
    scope: toApiScope(input.scope),
  };
}

function mapApiEvento(input: ApiEvento, context: CalendarContext): CalendarEvent {
  const id = input.id ?? input.Id;
  const title = input.titulo ?? input.Titulo;
  const dateValue = input.dataEvento ?? input.DataEvento;
  const scope = mapScope(input.scope ?? input.Scope);

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
    createdByRole: getCreatorByContext(scope, context),
    scope,
  };
}

function mergeById(apiEvents: CalendarEvent[], localEvents: CalendarEvent[]) {
  const byId = new Map<string, CalendarEvent>();
  for (const item of apiEvents) byId.set(item.id, item);
  for (const item of localEvents) byId.set(item.id, item);
  return Array.from(byId.values()).sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const eventsRepository = {
  async list(context: CalendarContext): Promise<CalendarEvent[]> {
    const localEvents = calendarService.list(context);
    if (USE_DEMO_FALLBACK) return localEvents;
    if (!API_URL) {
      if (STRICT_API) {
        throw new Error("API_URL não configurada para listar eventos em modo estrito");
      }
      return localEvents;
    }

    try {
      const response = await api.get<ApiEvento[]>("/Eventos");
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length === 0) {
        if (STRICT_API) {
          throw new Error("API retornou lista vazia de eventos em modo estrito");
        }
        return localEvents;
      }
      const apiEvents = data.map((item) => mapApiEvento(item, context));
      if (STRICT_API) return apiEvents;
      return mergeById(apiEvents, localEvents);
    } catch (error) {
      if (STRICT_API) throw error;
      return localEvents;
    }
  },

  async create(input: Omit<CalendarEvent, "id">, context: CalendarContext): Promise<CalendarEvent> {
    if (USE_DEMO_FALLBACK) {
      return calendarService.create(input, context);
    }
    if (!API_URL) {
      if (STRICT_API) throw new Error("API_URL não configurada para criar evento em modo estrito");
      return calendarService.create(input, context);
    }

    try {
      const payload = toPayload(input, context);
      const response = await api.post<ApiEvento>("/Eventos", payload);
      return mapApiEvento(response.data, context);
    } catch (error) {
      if (STRICT_API) throw error;
      return calendarService.create(input, context);
    }
  },

  async update(
    id: string,
    current: CalendarEvent,
    patch: Partial<Omit<CalendarEvent, "id">>,
    context: CalendarContext
  ): Promise<CalendarEvent | null> {
    if (USE_DEMO_FALLBACK) {
      return calendarService.update(id, patch, context);
    }
    if (!API_URL) {
      if (STRICT_API) throw new Error("API_URL não configurada para atualizar evento em modo estrito");
      return calendarService.update(id, patch, context);
    }

    const apiId = id.startsWith("api_") ? id.replace("api_", "") : id;
    const merged: Omit<CalendarEvent, "id"> = { ...current, ...patch };

    try {
      const payload = toPayload(merged, context);
      const response = await api.put<ApiEvento>(`/Eventos/${apiId}`, payload);
      return mapApiEvento(response.data, context);
    } catch (error) {
      if (STRICT_API) throw error;
      return calendarService.update(id, patch, context);
    }
  },

  async remove(id: string, context: CalendarContext): Promise<boolean> {
    if (USE_DEMO_FALLBACK) {
      calendarService.remove(id, context);
      return true;
    }
    if (!API_URL) {
      if (STRICT_API) throw new Error("API_URL não configurada para excluir evento em modo estrito");
      calendarService.remove(id, context);
      return true;
    }

    const apiId = id.startsWith("api_") ? id.replace("api_", "") : id;

    try {
      await api.delete(`/Eventos/${apiId}`);
      return true;
    } catch (error) {
      if (STRICT_API) throw error;
      calendarService.remove(id, context);
      return true;
    }
  },
};
