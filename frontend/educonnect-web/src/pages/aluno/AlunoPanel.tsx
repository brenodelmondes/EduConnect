import { useStudentPortal } from "@/app/student-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function formatDateTime(isoOrDate: string | Date) {
  const value = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export function AlunoPanel() {
  const { upcoming, announcements, notifications, loading, error } = useStudentPortal();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel do aluno</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe avisos, prazos e proximos eventos academicos.
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
            <CardTitle>Linha do tempo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum evento agendado.</p>
            ) : (
              upcoming.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDateTime(item.start)} • {formatDateTime(item.end)}
                      </p>
                    </div>
                    <span className="rounded-full border px-2 py-1 text-xs text-muted-foreground">
                      Evento
                    </span>
                  </div>
                </div>
              ))
            )}

            <Separator />
            <p className="text-xs text-muted-foreground">
              Dica: eventos administrativos podem ser acompanhados no menu Calendario.
            </p>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avisos recentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem avisos no momento.</p>
              ) : (
                announcements.slice(0, 3).map((item) => (
                  <div key={item.id} className="space-y-1 rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-muted-foreground">{item.category}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.body}</p>
                    <p className="pt-1 text-xs text-muted-foreground">{item.author}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notificacoes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <p className="text-sm text-muted-foreground">Carregando...</p>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem notificacoes.</p>
              ) : (
                notifications.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-3 rounded-md border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
