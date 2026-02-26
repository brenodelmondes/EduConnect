import { AcademicCalendar } from "@/components/calendar/AcademicCalendar";
import { DemoNotice } from "@/components/ui/demo-notice";

export function ProfessorCalendar() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendário docente</h1>
        <p className="text-sm text-muted-foreground">
          Planejamento de aulas, checkpoints e eventos da sua rotina acadêmica.
        </p>
      </div>
      <DemoNotice />
      <AcademicCalendar role="PROFESSOR" mode="professor" />
    </div>
  );
}
