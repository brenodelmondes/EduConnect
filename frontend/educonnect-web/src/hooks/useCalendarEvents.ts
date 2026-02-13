import { useCallback, useEffect, useRef, useState } from "react";

import { type CalendarEvent, calendarService } from "@/services/calendar";
import { eventsRepository } from "@/services/events.repository";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function useCalendarEvents() {
  const mounted = useRef(true);

  const [data, setData] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await delay(350);
      const list = await eventsRepository.list();
      if (mounted.current) {
        setData(list);
      }
    } catch {
      if (mounted.current) {
        setError("Nao foi possivel carregar eventos.");
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

  const create = useCallback((input: Omit<CalendarEvent, "id">): CalendarEvent => {
    const created = calendarService.create(input);
    setData((prev) => [...prev, created].sort((a, b) => a.start.getTime() - b.start.getTime()));
    return created;
  }, []);

  const update = useCallback((id: string, patch: Partial<Omit<CalendarEvent, "id">>) => {
    const updated = calendarService.update(id, patch);
    if (!updated) return null;
    setData((prev) => {
      const next = prev.slice();
      const idx = next.findIndex((eventItem) => eventItem.id === id);
      if (idx >= 0) next[idx] = updated;
      return next.sort((a, b) => a.start.getTime() - b.start.getTime());
    });
    return updated;
  }, []);

  const remove = useCallback((id: string) => {
    calendarService.remove(id);
    setData((prev) => prev.filter((eventItem) => eventItem.id !== id));
  }, []);

  const reset = useCallback(async () => {
    calendarService.resetToMock();
    await load();
  }, [load]);

  return {
    data,
    setData,
    loading,
    error,
    load,
    create,
    update,
    remove,
    reset,
  };
}
