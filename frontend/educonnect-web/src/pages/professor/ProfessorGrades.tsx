import { useMemo } from "react";

import { useActivities } from "@/hooks/useActivities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfessorGrades() {
  const { activities, submissions } = useActivities({ role: "PROFESSOR" });

  const rows = useMemo(
    () =>
      activities.map((activity) => {
        const related = submissions.filter((item) => item.activityId === activity.id);
        return {
          id: activity.id,
          title: activity.title,
          dueAt: activity.dueAt,
          total: related.length,
          entregues: related.filter((item) => item.status === "ENTREGUE").length,
          atrasados: related.filter((item) => item.status === "ATRASADO").length,
        };
      }),
    [activities, submissions]
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Notas e entregas</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada de submissões por atividade publicada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Painel de avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Atividade</th>
                  <th className="px-3 py-2 text-left font-medium">Prazo</th>
                  <th className="px-3 py-2 text-right font-medium">Entregas</th>
                  <th className="px-3 py-2 text-right font-medium">No prazo</th>
                  <th className="px-3 py-2 text-right font-medium">Atrasadas</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{row.title}</td>
                    <td className="px-3 py-2 text-muted-foreground">{new Date(row.dueAt).toLocaleDateString("pt-BR")}</td>
                    <td className="px-3 py-2 text-right">{row.total}</td>
                    <td className="px-3 py-2 text-right">{row.entregues}</td>
                    <td className="px-3 py-2 text-right">{row.atrasados}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted-foreground">
                      Nenhuma atividade publicada até o momento.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
