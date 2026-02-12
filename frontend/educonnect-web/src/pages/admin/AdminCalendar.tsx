import "react-big-calendar/lib/css/react-big-calendar.css";

import { useMemo, useState } from "react";
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  type SlotInfo,
} from "react-big-calendar";
import {
  format as dateFnsFormat,
  parse as dateFnsParse,
  startOfWeek,
  getDay,
} from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { type CalendarEvent } from "@/services/calendar";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";

const locales = { "pt-BR": ptBR };

const localizer = dateFnsLocalizer({
  locales,
  format: (date: Date, formatStr: string, culture?: string) =>
    dateFnsFormat(date, formatStr, {
      locale: locales[(culture ?? "pt-BR") as keyof typeof locales],
    }),
  parse: (value: string, formatStr: string, culture?: string) =>
    dateFnsParse(value, formatStr, new Date(), {
      locale: locales[(culture ?? "pt-BR") as keyof typeof locales],
    }),
  startOfWeek: (culture?: string) =>
    startOfWeek(new Date(), {
      locale: locales[(culture ?? "pt-BR") as keyof typeof locales],
    }),
  getDay,
});

type Draft = {
  mode: "create" | "edit";
  id?: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
};

function formatDateTime(d: Date) {
  return d.toLocaleString("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function AdminCalendar() {
  const { data: events, loading, create, update, remove } = useCalendarEvents();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const upcoming = useMemo(() => {
    const from = new Date();
    return events
      .slice()
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .filter((e) => e.end.getTime() >= from.getTime())
      .slice(0, 6);
  }, [events]);

  function openCreateFromSlot(slot: SlotInfo) {
    const slotStart = slot.start as Date;
    const slotEnd = slot.end as Date;

    // Em month view, um clique no dia costuma ser mais apresentável com horário sugerido.
    const start = new Date(slotStart);
    const end = new Date(slotStart);
    if (slot.action === "click") {
      start.setHours(10, 0, 0, 0);
      end.setHours(11, 0, 0, 0);
    } else {
      // seleção de faixa
      end.setTime(slotEnd.getTime());
    }

    setDraft({
      mode: "create",
      title: "",
      start,
      end,
      allDay: false,
    });
    setOpen(true);
  }

  function openEdit(event: CalendarEvent) {
    setDraft({
      mode: "edit",
      id: event.id,
      title: event.title,
      start: event.start,
      end: event.end,
      allDay: !!event.allDay,
    });
    setOpen(true);
  }

  function handleSave() {
    if (!draft) return;

    const title = draft.title.trim();
    if (!title) return;

    if (draft.mode === "create") {
      create({
        title,
        start: draft.start,
        end: draft.end,
        allDay: draft.allDay,
      });
    } else if (draft.id) {
      update(draft.id, { title });
    }

    setOpen(false);
    setDraft(null);
  }

  function handleDelete() {
    if (!draft?.id) return;
    remove(draft.id);
    setOpen(false);
    setDraft(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendário</h1>
        <p className="text-sm text-muted-foreground">
          Agenda administrativa com criação e remoção de eventos.
        </p>
      </div>

      <Card className="border bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Visão mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border bg-background p-2">
            <div className="h-[620px]">
              <BigCalendar
                localizer={localizer}
                culture="pt-BR"
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={["month"]}
                defaultView="month"
                selectable
                onSelectSlot={openCreateFromSlot}
                onSelectEvent={(e) => openEdit(e as CalendarEvent)}
                popup
              />
            </div>
          </div>

          {loading ? (
            <p className="text-xs text-muted-foreground">Carregando eventos…</p>
          ) : null}

          <p className="text-xs text-muted-foreground">
            Modo demonstração — dados simulados. Integração com API na próxima etapa.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground">Nenhum evento agendado.</p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => openEdit(e)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-left hover:bg-accent"
                >
                  <div className="font-medium">{e.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(e.start)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {draft?.mode === "edit" ? "Editar evento" : "Novo evento"}
            </DialogTitle>
            <DialogDescription>
              {draft
                ? `Data/hora: ${formatDateTime(draft.start)}`
                : "Defina um título para o evento."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Ex.: Reunião de coordenação"
              value={draft?.title ?? ""}
              onChange={(e) =>
                setDraft((prev) =>
                  prev ? { ...prev, title: e.target.value } : prev
                )
              }
            />
            <p className="text-xs text-muted-foreground">
              Para o MVP, a edição é limitada ao título.
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex flex-1 items-center justify-between">
              {draft?.mode === "edit" ? (
                <Button variant="destructive" onClick={handleDelete}>
                  Excluir
                </Button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={!draft?.title.trim()}>
                  {draft?.mode === "edit" ? "Salvar" : "Criar"}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
