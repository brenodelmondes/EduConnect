import { useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { useTurmas } from "@/hooks/useTurmas";
import type { TurmaStatus } from "@/services/turmas.repository";

type StatusFilter = "TODAS" | TurmaStatus;

const PAGE_SIZE = 20;

function statusLabel(status: TurmaStatus) {
  if (status === "ATIVA") return "Ativa";
  if (status === "SEM_DOCENTE") return "Sem docente";
  return "Encerrada";
}

function statusTone(status: TurmaStatus) {
  if (status === "ATIVA") return "success" as const;
  if (status === "SEM_DOCENTE") return "warning" as const;
  return "neutral" as const;
}

export function AdminTurmas() {
  const { data, loading, error } = useTurmas();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("TODAS");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((row) => {
      const matchesQuery =
        !q ||
        row.codigo.toLowerCase().includes(q) ||
        row.curso.toLowerCase().includes(q) ||
        row.professor.toLowerCase().includes(q);
      const matchesStatus = status === "TODAS" || row.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [data, query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Turmas</h1>
        <p className="text-sm text-muted-foreground">
          Operação acadêmica com foco em ocupação, docente responsável e status das ofertas.
        </p>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Buscar</label>
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Código da turma, curso ou professor"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Status</label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as StatusFilter);
                setPage(1);
              }}
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            >
              <option value="TODAS">Todas</option>
              <option value="ATIVA">Ativas</option>
              <option value="SEM_DOCENTE">Sem docente</option>
              <option value="ENCERRADA">Encerradas</option>
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
          <CardTitle>Lista de turmas</CardTitle>
          <p className="text-sm text-muted-foreground">Total filtrado: {filtered.length}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Código</th>
                  <th className="px-3 py-2 text-left font-medium">Curso</th>
                  <th className="px-3 py-2 text-left font-medium">Professor</th>
                  <th className="px-3 py-2 text-left font-medium">Turno</th>
                  <th className="px-3 py-2 text-left font-medium">Modalidade</th>
                  <th className="px-3 py-2 text-right font-medium">Ocupação</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                      Carregando turmas...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                      Nenhuma turma encontrada para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => (
                    <tr key={row.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{row.codigo}</td>
                      <td className="px-3 py-2">{row.curso}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.professor}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.periodo}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.modalidade}</td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-medium">
                          {row.matriculados}/{row.vagas}
                        </span>
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

          <div className="flex items-center justify-between text-sm">
            <p className="text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                disabled={currentPage <= 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              >
                Anterior
              </button>
              <button
                type="button"
                className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                Próxima
              </button>
            </div>
          </div>

          <DemoNotice />
        </CardContent>
      </Card>
    </div>
  );
}
