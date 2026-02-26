import { useStudentPortal } from "@/app/student-portal";
import { AcademicCalendar } from "@/components/calendar/AcademicCalendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";

function formatDateTime(isoOrDate: string | Date) {
  const value = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export function AlunoPanel() {
  const { announcements, loading, error, courses } = useStudentPortal();

  const nextDeliveries = courses
    .filter((item) => item.nextItem)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      courseTitle: item.title,
      label: item.nextItem?.label ?? "Atividade",
      dueAt: item.nextItem?.dueAt ?? new Date().toISOString(),
    }));

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-semibold">Painel do aluno</h1>
        <p className="text-sm text-muted-foreground">
          Visão objetiva da sua semana: próximas atividades, avisos e calendário acadêmico.
        </p>
      </div>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Atividades mais próximas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : nextDeliveries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma entrega prevista no momento.</p>
            ) : (
              nextDeliveries.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{item.courseTitle}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.label} • {formatDateTime(item.dueAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Avisos do portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem avisos no momento.</p>
            ) : (
              announcements.slice(0, 4).map((item) => (
                <div key={item.id} className="space-y-1 rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.body}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Calendário acadêmico</CardTitle>
          <p className="text-sm text-muted-foreground">
            Visualização mensal com eventos e atividades da sua rotina.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AcademicCalendar role="ALUNO" mode="aluno" compact />
          <DemoNotice />
        </CardContent>
      </Card>
    </div>
  );
}
