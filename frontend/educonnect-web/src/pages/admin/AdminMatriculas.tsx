import { useMemo, useState } from "react";

import { DemoNotice } from "@/components/ui/demo-notice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { useMatriculas } from "@/hooks/useMatriculas";
import type { MatriculaStatus } from "@/services/matriculas.repository";

type StatusFilter = "TODAS" | MatriculaStatus;

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(isoDate));
}

function statusLabel(status: MatriculaStatus) {
  if (status === "PENDENTE") return "Pendente";
  if (status === "CANCELADA") return "Cancelada";
  return "Ativa";
}

function statusTone(status: MatriculaStatus) {
  if (status === "PENDENTE") return "warning" as const;
  if (status === "CANCELADA") return "danger" as const;
  return "success" as const;
}

export function AdminMatriculas() {
  const { data, loading, error } = useMatriculas();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("TODAS");

  const summary = useMemo(() => {
    const total = data.length;
    const pendentes = data.filter((row) => row.status === "PENDENTE").length;
    const ativas = data.filter((row) => row.status === "ATIVA").length;
    const canceladas = data.filter((row) => row.status === "CANCELADA").length;
    return { total, pendentes, ativas, canceladas };
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((row) => {
      const matchesQuery =
        !q ||
        row.aluno.toLowerCase().includes(q) ||
        row.curso.toLowerCase().includes(q) ||
        row.turma.toLowerCase().includes(q);
      const matchesStatus = status === "TODAS" || row.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [data, query, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Matriculas</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhamento do fluxo de solicitacao, validacao e efetivacao.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-semibold">{summary.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-semibold">{summary.pendentes}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Ativas</p>
            <p className="text-2xl font-semibold">{summary.ativas}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground">Canceladas</p>
            <p className="text-2xl font-semibold">{summary.canceladas}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Buscar</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Aluno, curso ou turma"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusFilter)}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="TODAS">Todas</option>
              <option value="PENDENTE">Pendentes</option>
              <option value="ATIVA">Ativas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Solicitacoes de matricula</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">Aluno</th>
                  <th className="px-3 py-2 text-left font-medium">Curso</th>
                  <th className="px-3 py-2 text-left font-medium">Turma</th>
                  <th className="px-3 py-2 text-left font-medium">Solicitacao</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                      Carregando matriculas...
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-muted-foreground">
                      Nenhuma matricula encontrada para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground">{row.id}</td>
                      <td className="px-3 py-2 font-medium">{row.aluno}</td>
                      <td className="px-3 py-2">{row.curso}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.turma}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {formatDate(row.dataSolicitacao)}
                      </td>
                      <td className="px-3 py-2">
                        <StatusPill label={statusLabel(row.status)} tone={statusTone(row.status)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <DemoNotice />
        </CardContent>
      </Card>
    </div>
  );
}
