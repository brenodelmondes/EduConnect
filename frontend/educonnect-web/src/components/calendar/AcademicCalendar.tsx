import "react-big-calendar/lib/css/react-big-calendar.css";

import { useMemo, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer, type SlotInfo, type View } from "react-big-calendar";
import { format as dateFnsFormat, getDay, parse as dateFnsParse, startOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale/pt-BR";

import { useAuth } from "@/app/auth";
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { type CalendarEvent } from "@/services/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { CalendarScope } from "@/types/academic";
import type { UserRole } from "@/utils/storage";

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
  scope: CalendarScope;
};

type AcademicCalendarProps = {
  role: UserRole;
  mode: "admin" | "professor" | "aluno";
  compact?: boolean;
};

const messages = {
  today: "Hoje",
  previous: "Voltar",
  next: "Avançar",
  month: "Mês",
  week: "Semana",
  day: "Dia",
  agenda: "Agenda",
  date: "Data",
  time: "Hora",
  event: "Evento",
  noEventsInRange: "Sem eventos no período.",
  showMore: (count: number) => `+${count} mais`,
};

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(value);
}

function toInputDateTimeLocal(value: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
}

function fromInputDateTimeLocal(value: string) {
  return new Date(value);
}

function sourceLabel(eventItem: CalendarEvent) {
  if (eventItem.createdByRole === "API") return "API";
  if (eventItem.createdByRole === "ADMIN") return "Admin";
  if (eventItem.createdByRole === "ALUNO") return "Pessoal";
  return "Professor";
}

function sourceTone(eventItem: CalendarEvent) {
  if (eventItem.createdByRole === "API") return "info" as const;
  if (eventItem.createdByRole === "ADMIN") return "neutral" as const;
  if (eventItem.createdByRole === "ALUNO") return "warning" as const;
  return "success" as const;
}

function defaultScope(role: UserRole): CalendarScope {
  if (role === "PROFESSOR") return "DOCENTE";
  if (role === "ALUNO") return "PESSOAL";
  return "INSTITUCIONAL";
}

function mapCreatorByRole(role: UserRole): CalendarEvent["createdByRole"] {
  if (role === "ALUNO") return "ALUNO";
  if (role === "PROFESSOR") return "PROFESSOR";
  return "ADMIN";
}

export function AcademicCalendar({ role, mode, compact = false }: AcademicCalendarProps) {
  const { userId } = useAuth();
  const { data: events, loading, create, update, remove, canMutate, canEditEvent } = useCalendarEvents(
    role,
    userId
  );
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [view, setView] = useState<View>("month");

  const upcoming = useMemo(() => {
    const from = new Date();
    return events
      .slice()
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .filter((item) => item.end.getTime() >= from.getTime())
      .slice(0, 8);
  }, [events]);

  function openCreateFromSlot(slot: SlotInfo) {
    if (!canMutate) return;

    const slotStart = slot.start as Date;
    const slotEnd = slot.end as Date;

    const start = new Date(slotStart);
    const end = new Date(slotEnd);
    if (slot.action === "click") {
      start.setHours(10, 0, 0, 0);
      end.setTime(start.getTime() + 60 * 60 * 1000);
    }

    setDraft({
      mode: "create",
      title: "",
      start,
      end,
      allDay: false,
      scope: defaultScope(role),
    });
    setOpen(true);
  }

  function openEdit(eventItem: CalendarEvent) {
    if (!canEditEvent(eventItem)) return;

    setDraft({
      mode: "edit",
      id: eventItem.id,
      title: eventItem.title,
      start: eventItem.start,
      end: eventItem.end,
      allDay: !!eventItem.allDay,
      scope: eventItem.scope,
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
        createdByRole: mapCreatorByRole(role),
        scope: draft.scope,
      });
    } else if (draft.id) {
      update(draft.id, {
        title,
        start: draft.start,
        end: draft.end,
      });
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

  const roleLabel =
    mode === "admin" ? "Agenda administrativa" : mode === "professor" ? "Agenda docente" : "Agenda acadêmica";
  const calendarHeightClass = compact ? "h-[440px] md:h-[500px]" : "h-[560px]";

  return (
    <div className={compact ? "space-y-4" : "grid gap-4 lg:grid-cols-[1fr_300px]"}>
      <Card className="border bg-card/80 backdrop-blur">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">{roleLabel}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg border bg-background p-2">
            <div className={calendarHeightClass}>
              <BigCalendar
                localizer={localizer}
                culture="pt-BR"
                events={events}
                startAccessor="start"
                endAccessor="end"
                views={["month", "week", "day", "agenda"]}
                view={view}
                onView={setView}
                selectable={canMutate}
                onSelectSlot={openCreateFromSlot}
                onSelectEvent={(eventItem) => openEdit(eventItem as CalendarEvent)}
                popup
                messages={messages}
              />
            </div>
          </div>

          {loading ? <p className="text-xs text-muted-foreground">Carregando eventos...</p> : null}
          {!canMutate ? (
            <p className="text-xs text-muted-foreground">Visualização somente leitura para este perfil.</p>
          ) : null}
        </CardContent>
      </Card>

      {!compact ? (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Legenda operacional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Origem institucional</span>
              <StatusPill label="Admin/API" tone="info" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Origem docente</span>
              <StatusPill label="Professor" tone="success" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Origem pessoal</span>
              <StatusPill label="Aluno" tone="warning" />
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Edição disponível</span>
              <StatusPill label={canMutate ? "Sim" : "Leitura"} tone={canMutate ? "neutral" : "warning"} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {upcoming.length === 0 ? (
              <p className="text-muted-foreground">Nenhum evento agendado.</p>
            ) : (
              upcoming.map((item) => (
                <div key={item.id} className="rounded-md border bg-background px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{item.title}</p>
                    <StatusPill label={sourceLabel(item)} tone={sourceTone(item)} />
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDateTime(item.start)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      ) : (
      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground">Nenhum evento agendado.</p>
          ) : (
            upcoming.slice(0, 5).map((item) => (
              <div key={item.id} className="rounded-md border bg-background px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{item.title}</p>
                  <StatusPill label={sourceLabel(item)} tone={sourceTone(item)} />
                </div>
                <p className="text-xs text-muted-foreground">{formatDateTime(item.start)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft?.mode === "edit" ? "Editar evento" : "Novo evento"}</DialogTitle>
            <DialogDescription>
              {draft?.mode === "edit"
                ? "Atualize título e período do evento selecionado."
                : "Defina os dados do novo evento."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Ex.: Reunião de alinhamento"
                value={draft?.title ?? ""}
                onChange={(e) => setDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start">Início</Label>
                <Input
                  id="start"
                  type="datetime-local"
                  value={draft ? toInputDateTimeLocal(draft.start) : ""}
                  onChange={(e) =>
                    setDraft((prev) => (prev ? { ...prev, start: fromInputDateTimeLocal(e.target.value) } : prev))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">Fim</Label>
                <Input
                  id="end"
                  type="datetime-local"
                  value={draft ? toInputDateTimeLocal(draft.end) : ""}
                  onChange={(e) =>
                    setDraft((prev) => (prev ? { ...prev, end: fromInputDateTimeLocal(e.target.value) } : prev))
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex w-full items-center justify-between">
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
