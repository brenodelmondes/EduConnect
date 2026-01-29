import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminMetrics } from "@/mocks/metrics";
import { StudentsDistributionChart } from "@/components/charts/StudentsDistribution";

function Kpi({
  title,
  value,
  hint,
}: {
  title: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="border bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const m = getAdminMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral do semestre e pendências administrativas.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi
          title="Total de Alunos"
          value={String(m.studentsTotal)}
          hint="Ativos no sistema"
        />
        <Kpi
          title="Total de Professores"
          value={String(m.teachersTotal)}
          hint="Cadastrados"
        />
        <Kpi
          title="Turmas Ativas"
          value={String(m.activeClasses)}
          hint="Em andamento"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Kpi
          title="Novas Matrículas (Semestre)"
          value={String(m.newEnrollmentsSemester)}
          hint="Entradas recentes"
        />
        <Kpi
          title="Taxa de Evasão (Semestre)"
          value={`${(m.dropoutRateSemester * 100).toFixed(1)}%`}
          hint="Base por turma"
        />
        <Kpi
          title="Taxa de Inadimplência"
          value={`${(m.delinquencyRate * 100).toFixed(1)}%`}
          hint="Estimativa"
        />
      </div>

      {/* Pendências + gráfico placeholder */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Pendências</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Matrículas pendentes</span>
              <span className="font-semibold">{m.pendingEnrollments}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Documentos a validar</span>
              <span className="font-semibold">{m.docsToValidate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Turmas sem professor</span>
              <span className="font-semibold">{m.classesWithoutTeacher}</span>
            </div>

            <p className="pt-2 text-xs text-muted-foreground">
              Dados simulados (modo demonstração). Integração com API na próxima etapa.
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição de Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            <StudentsDistributionChart data={m.distribution} />
            <p className="mt-2 text-xs text-muted-foreground">
              Dados simulados (modo demonstração). Integração com API na próxima etapa.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
