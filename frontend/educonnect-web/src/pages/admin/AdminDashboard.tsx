import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

import { StudentsDistributionChart } from "@/components/charts/StudentsDistribution";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";
import { StatusPill } from "@/components/ui/status-pill";
import { adminNavItems } from "@/layouts/admin-navigation";
import { fetchAdminMetrics, getAdminMetrics } from "@/services/admin";

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function Kpi({ title, value, hint }: { title: string; value: string; hint?: string }) {
  return (
    <Card className="border bg-card/80 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
        {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState(getAdminMetrics());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    fetchAdminMetrics()
      .then((data) => {
        if (mounted) setMetrics(data);
      })
      .catch(() => {
        if (mounted) setMetrics(getAdminMetrics());
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const m = metrics;
  const totalDistribuido = m.distribution.reduce((acc, item) => acc + item.value, 0);
  const cursoLider =
    m.distribution.length > 0 ? [...m.distribution].sort((a, b) => b.value - a.value)[0] : null;

  const updatedAt = useMemo(() => {
    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date());
  }, [loading, m.studentsTotal, m.teachersTotal, m.activeClasses]);

  const quickActions = adminNavItems.filter((item) => item.to !== "/admin/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-semibold">Dashboard administrativo</h2>
          <p className="text-sm text-muted-foreground">
            Panorama executivo da operação acadêmica no semestre 2026.1.
          </p>
        </div>
        <div className="inline-flex w-fit items-center rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
          Atualizado em {updatedAt}
        </div>
      </div>

      {loading ? <DemoNotice /> : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Kpi title="Total de alunos" value={String(m.studentsTotal)} hint="Base acadêmica cadastrada" />
        <Kpi title="Total de professores" value={String(m.teachersTotal)} hint="Docentes ativos no sistema" />
        <Kpi title="Turmas ativas" value={String(m.activeClasses)} hint="Turmas em andamento" />
        <Kpi
          title="Novas matrículas (semestre)"
          value={String(m.newEnrollmentsSemester)}
          hint="Entradas no período atual"
        />
        <Kpi
          title="Taxa de evasão (semestre)"
          value={formatPercent(m.dropoutRateSemester)}
          hint="Indicador de retenção"
        />
        <Kpi
          title="Taxa de inadimplência"
          value={formatPercent(m.delinquencyRate)}
          hint="Estimativa financeira do período"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Pendências operacionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Matrículas pendentes</span>
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
            <StatusPill label="Prioridade alta" tone="warning" />
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Distribuição de alunos por curso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StudentsDistributionChart data={m.distribution} />
            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <div className="rounded-md border p-2">
                Total no gráfico: <span className="font-medium text-foreground">{totalDistribuido}</span>
              </div>
              <div className="rounded-md border p-2">
                Curso líder: <span className="font-medium text-foreground">{cursoLider ? cursoLider.name : "N/A"}</span>
              </div>
              <div className="rounded-md border p-2">
                Participação líder:{" "}
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
          <CardTitle>Ações rápidas da operação</CardTitle>
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
