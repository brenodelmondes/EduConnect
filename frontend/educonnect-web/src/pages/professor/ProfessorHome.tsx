import { useMemo } from "react";

import { useStudentPortal } from "@/app/student-portal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
}

export function ProfessorHome() {
  const { announcements, notifications, loading, error } = useStudentPortal();

  const stats = useMemo(() => {
    const academic = notifications.filter((item) => item.category === "Acadêmico").length;
    const financial = notifications.filter((item) => item.category === "Financeiro").length;
    return { total: notifications.length, academic, financial };
  }, [notifications]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Início do professor</h1>
        <p className="text-sm text-muted-foreground">
          Comunicados institucionais e destaques operacionais do semestre.
        </p>
      </div>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Notificações totais</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Acadêmicas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.academic}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Financeiras</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{stats.financial}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
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
              <div key={item.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">{item.category}</span>
                  <span className="text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</span>
                </div>
                <p className="mt-1 text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.body}</p>
              </div>
            ))
          )}
          <DemoNotice />
        </CardContent>
      </Card>
    </div>
  );
}
