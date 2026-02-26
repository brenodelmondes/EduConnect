import { useMemo, useState } from "react";

import { useActivities } from "@/hooks/useActivities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";

export function ProfessorPanel() {
  const { courses, activities, submissions, loading, error } = useActivities({ role: "PROFESSOR" });
  const [referenceNow] = useState(() => Date.now());

  const metrics = useMemo(() => {
    const overdue = activities.filter((item) => new Date(item.dueAt).getTime() < referenceNow).length;
    return {
      turmas: courses.length,
      atividades: activities.length,
      envios: submissions.length,
      atrasadas: overdue,
    };
  }, [courses, activities, submissions, referenceNow]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel do professor</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhamento de turmas, atividades e entregas dos estudantes.
        </p>
      </div>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Turmas sob responsabilidade</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{metrics.turmas}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Atividades publicadas</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{metrics.atividades}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Entregas recebidas</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{metrics.envios}</p></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Atividades vencidas</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{metrics.atrasadas}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo operacional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {loading ? (
            <p className="text-muted-foreground">Carregando...</p>
          ) : (
            <>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span>Atividades para corrigir</span>
                <span className="font-semibold">{Math.max(0, metrics.envios - 1)}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span>Aulas planejadas na semana</span>
                <span className="font-semibold">{Math.max(4, metrics.turmas + 1)}</span>
              </div>
              <div className="flex items-center justify-between rounded-md border p-2">
                <span>Publicações recentes</span>
                <span className="font-semibold">{Math.min(6, metrics.atividades)}</span>
              </div>
            </>
          )}
          <DemoNotice />
        </CardContent>
      </Card>
    </div>
  );
}

