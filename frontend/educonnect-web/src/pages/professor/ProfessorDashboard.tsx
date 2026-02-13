import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";

export function ProfessorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Painel do professor</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhamento de turmas, atividades e publicacoes do semestre.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de entregas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between rounded-md border p-2">
            <span>Atividades para corrigir</span>
            <span className="font-semibold">14</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-2">
            <span>Aulas planejadas na semana</span>
            <span className="font-semibold">6</span>
          </div>
          <div className="flex items-center justify-between rounded-md border p-2">
            <span>Turmas sob responsabilidade</span>
            <span className="font-semibold">4</span>
          </div>
          <DemoNotice />
        </CardContent>
      </Card>
    </div>
  );
}
