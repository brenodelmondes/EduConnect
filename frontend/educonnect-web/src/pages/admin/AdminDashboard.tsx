import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

import { StudentsDistributionChart } from "@/components/charts/StudentsDistribution";
import { DemoNotice } from "@/components/ui/demo-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { adminNavItems } from "@/layouts/admin-navigation";
import { getAdminMetrics } from "@/services/admin";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

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
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const m = getAdminMetrics();
  const totalDistribuido = m.distribution.reduce((acc, item) => acc + item.value, 0);
  const cursoLider =
    m.distribution.length > 0
      ? [...m.distribution].sort((a, b) => b.value - a.value)[0]
      : null;

  const updatedAt = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date());

  const quickActions = adminNavItems.filter((item) => item.to !== "/admin/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Dashboard Administrativo</h2>
          <p className="text-sm text-muted-foreground">
            Panorama executivo da operacao academica no semestre 2026.1.
          </p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          Atualizado em {updatedAt}
        </div>
      </div>

      <DemoNotice />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Kpi title="Total de Alunos" value={String(m.studentsTotal)} hint="Base academica cadastrada" />
        <Kpi title="Total de Professores" value={String(m.teachersTotal)} hint="Docentes ativos no sistema" />
        <Kpi title="Turmas Ativas" value={String(m.activeClasses)} hint="Turmas em andamento" />
        <Kpi
          title="Novas Matriculas (Semestre)"
          value={String(m.newEnrollmentsSemester)}
          hint="Entradas no periodo atual"
        />
        <Kpi
          title="Taxa de Evasao (Semestre)"
          value={formatPercent(m.dropoutRateSemester)}
          hint="Indicador de retencao"
        />
        <Kpi
          title="Taxa de Inadimplencia"
          value={formatPercent(m.delinquencyRate)}
          hint="Estimativa financeira do periodo"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Pendencias operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Matriculas pendentes</span>
              <span className="font-semibold">{m.pendingEnrollments}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Documentos a validar</span>
              <span className="font-semibold">{m.docsToValidate}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Turmas sem professor</span>
              <span className="font-semibold">{m.classesWithoutTeacher}</span>
            </div>
            <div className="pt-1">
              <StatusPill label="Prioridade alta" tone="warning" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Distribuicao de alunos por curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StudentsDistributionChart data={m.distribution} />
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <div className="rounded-md border p-2">
                Total no grafico:{" "}
                <span className="font-medium text-foreground">{totalDistribuido}</span>
              </div>
              <div className="rounded-md border p-2">
                Curso lider:{" "}
                <span className="font-medium text-foreground">{cursoLider ? cursoLider.name : "N/A"}</span>
              </div>
              <div className="rounded-md border p-2">
                Participacao lider:{" "}
                <span className="font-medium text-foreground">
                  {cursoLider && totalDistribuido > 0
                    ? `${((cursoLider.value / totalDistribuido) * 100).toFixed(1)}%`
                    : "0%"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Acoes rapidas da operacao</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quickActions.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group rounded-lg border bg-background px-3 py-3 transition-colors hover:bg-accent"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
