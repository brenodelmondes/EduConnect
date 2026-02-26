import { useStudentPortal } from "@/app/student-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";
import { Separator } from "@/components/ui/separator";

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
    new Date(iso)
  );
}

export function AlunoHome() {
  const { announcements, courses, upcoming, loading, error } = useStudentPortal();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-semibold">Página inicial</h1>
        <p className="text-sm text-muted-foreground">
          Comunicados e destaques da sua jornada acadêmica.
        </p>
      </div>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Avisos do portal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : announcements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem avisos no momento.</p>
            ) : (
              announcements.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">{item.category}</span>
                    <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.body}</p>
                  <Separator className="my-2" />
                  <p className="text-xs text-muted-foreground">{item.author}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meus cursos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : courses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma matrícula encontrada.</p>
            ) : (
              courses.slice(0, 6).map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.track} • {item.semesterLabel}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">{item.progress}%</span>
                </div>
              ))
            )}

            <DemoNotice className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {upcoming.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum evento agendado.</p>
          ) : (
            upcoming.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(item.start.toISOString())}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
