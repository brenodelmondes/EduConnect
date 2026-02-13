import "react-big-calendar/lib/css/react-big-calendar.css";

import { useMemo, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, type SlotInfo } from "react-big-calendar";
import { format as dateFnsFormat, getDay, parse as dateFnsParse, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { type CalendarEvent } from "@/services/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/ui/status-pill";

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

function formatDateTime(value: Date) {
  return value.toLocaleString("pt-BR", { dateStyle: "medium", timeStyle: "short" });
}

function sourceLabel(eventItem: CalendarEvent) {
  return eventItem.id.startsWith("api_") ? "API" : "Local";
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
      .filter((item) => item.end.getTime() >= from.getTime())
      .slice(0, 6);
  }, [events]);

  function openCreateFromSlot(slot: SlotInfo) {
    const slotStart = slot.start as Date;
    const slotEnd = slot.end as Date;

    const start = new Date(slotStart);
    const end = new Date(slotStart);
    if (slot.action === "click") {
      start.setHours(10, 0, 0, 0);
      end.setHours(11, 0, 0, 0);
    } else {
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

  function openEdit(eventItem: CalendarEvent) {
    setDraft({
      mode: "edit",
      id: eventItem.id,
      title: eventItem.title,
      start: eventItem.start,
      end: eventItem.end,
      allDay: !!eventItem.allDay,
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
        <h1 className="text-2xl font-semibold">Calendario</h1>
        <p className="text-sm text-muted-foreground">
          Agenda administrativa com criacao, edicao e remocao de eventos.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <Card className="border bg-card/80 backdrop-blur">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Visao mensal
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
                  onSelectEvent={(eventItem) => openEdit(eventItem as CalendarEvent)}
                  popup
                />
              </div>
            </div>

            {loading ? <p className="text-xs text-muted-foreground">Carregando eventos...</p> : null}
            <DemoNotice />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Legenda operacional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between rounded-md border p-2">
                <span>Origem API</span>
                <StatusPill label="Sincronizado" tone="info" />
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span>Origem local</span>
                <StatusPill label="Demo local" tone="neutral" />
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span>Evento hoje</span>
                <StatusPill label="Acompanhar" tone="warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Proximos eventos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {upcoming.length === 0 ? (
                <p className="text-muted-foreground">Nenhum evento agendado.</p>
              ) : (
                <div className="space-y-2">
                  {upcoming.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => openEdit(item)}
                      className="w-full rounded-md border bg-background px-3 py-2 text-left hover:bg-accent"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium">{item.title}</div>
                        <StatusPill label={sourceLabel(item)} tone={sourceLabel(item) === "API" ? "info" : "neutral"} />
                      </div>
                      <div className="text-xs text-muted-foreground">{formatDateTime(item.start)}</div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.mode === "edit" ? "Editar evento" : "Novo evento"}</DialogTitle>
            <DialogDescription>
              {draft ? `Data/hora: ${formatDateTime(draft.start)}` : "Defina um titulo para o evento."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-2">
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              placeholder="Ex.: Reuniao de coordenacao"
              value={draft?.title ?? ""}
              onChange={(e) =>
                setDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev))
              }
            />
            <p className="text-xs text-muted-foreground">
              Para o MVP, a edicao esta limitada ao titulo.
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
