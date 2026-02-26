import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type CalendarContext, type CalendarEvent, calendarService } from "@/services/calendar";
import { eventsRepository } from "@/services/events.repository";
import type { UserRole } from "@/utils/storage";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

function canMutateRole(role: UserRole) {
  return role === "ADMIN" || role === "PROFESSOR" || role === "ALUNO";
}

function canEditEvent(role: UserRole, eventItem: CalendarEvent) {
  if (role === "ADMIN") {
    return eventItem.scope === "INSTITUCIONAL" || eventItem.createdByRole === "API";
  }

  if (role === "PROFESSOR") {
    return eventItem.scope === "DOCENTE" && eventItem.createdByRole === "PROFESSOR";
  }

  return eventItem.scope === "PESSOAL" && eventItem.createdByRole === "ALUNO";
}

export function useCalendarEvents(role: UserRole, userId?: number | null) {
  const mounted = useRef(true);

  const [data, setData] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const context = useMemo<CalendarContext>(() => ({ role, userId }), [role, userId]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await delay(200);
      const list = await eventsRepository.list(context);
      if (mounted.current) {
        setData(list);
      }
    } catch {
      if (mounted.current) {
        setError("Não foi possível carregar eventos.");
        setData([]);
      }
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [context]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const create = useCallback(
    (input: Omit<CalendarEvent, "id">): CalendarEvent | null => {
      if (!canMutateRole(role)) return null;

      const created = calendarService.create(input, context);
      setData((prev) => [...prev, created].sort((a, b) => a.start.getTime() - b.start.getTime()));
      return created;
    },
    [context, role]
  );

  const update = useCallback(
    (id: string, patch: Partial<Omit<CalendarEvent, "id">>) => {
      const target = data.find((item) => item.id === id);
      if (!target || !canEditEvent(role, target)) return null;

      const updated = calendarService.update(id, patch, context);
      if (!updated) return null;

      setData((prev) => {
        const next = prev.slice();
        const idx = next.findIndex((eventItem) => eventItem.id === id);
        if (idx >= 0) next[idx] = updated;
        return next.sort((a, b) => a.start.getTime() - b.start.getTime());
      });
      return updated;
    },
    [context, data, role]
  );

  const remove = useCallback(
    (id: string) => {
      const target = data.find((item) => item.id === id);
      if (!target || !canEditEvent(role, target)) return false;

      calendarService.remove(id, context);
      setData((prev) => prev.filter((eventItem) => eventItem.id !== id));
      return true;
    },
    [context, data, role]
  );

  const reset = useCallback(async () => {
    calendarService.resetToMock(context);
    await load();
  }, [context, load]);

  return {
    data,
    loading,
    error,
    load,
    create,
    update,
    remove,
    reset,
    canMutate: canMutateRole(role),
    canEditEvent: (eventItem: CalendarEvent) => canEditEvent(role, eventItem),
  };
}
