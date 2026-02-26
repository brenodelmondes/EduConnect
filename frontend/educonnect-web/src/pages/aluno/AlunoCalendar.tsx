import { AcademicCalendar } from "@/components/calendar/AcademicCalendar";
import { DemoNotice } from "@/components/ui/demo-notice";

export function AlunoCalendar() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Calendário acadêmico</h1>
        <p className="text-sm text-muted-foreground">
          Visualização de eventos institucionais e docentes publicados para seu período.
        </p>
      </div>
      <DemoNotice />
      <AcademicCalendar role="ALUNO" mode="aluno" />
    </div>
  );
}
