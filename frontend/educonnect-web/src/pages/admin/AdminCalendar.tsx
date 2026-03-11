import { AcademicCalendar } from "@/components/calendar/AcademicCalendar";
import { DemoNotice } from "@/components/ui/demo-notice";

export function AdminCalendar() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendário</h1>
        <p className="text-sm text-muted-foreground">
          Agenda institucional com criação, edição e acompanhamento de eventos.
        </p>
      </div>

      <DemoNotice />
      <AcademicCalendar role="ADMIN" mode="admin" />
    </div>
  );
}
