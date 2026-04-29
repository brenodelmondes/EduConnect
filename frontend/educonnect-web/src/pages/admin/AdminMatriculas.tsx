import { useCallback, useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { Button } from "@/components/ui/button";
import { inscricaoService, type InscricaoPendente } from "@/services/inscricao";

type StatusFilter = "TODAS" | "PENDENTE" | "APROVADA" | "REPROVADA";
type ViewMode = "PENDENTES" | "PROCESSADAS";

const PAGE_SIZE = 20;

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(isoDate));
}

function statusLabel(status: string) {
  if (status === "PENDENTE") return "Pendente";
  if (status === "REPROVADA") return "Reprovada";
  return "Aprovada";
}

function statusTone(status: string) {
  if (status === "PENDENTE") return "warning" as const;
  if (status === "REPROVADA") return "danger" as const;
  return "success" as const;
}

export function AdminMatriculas() {
  const [data, setData] = useState<InscricaoPendente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<{
    correlationId?: string;
    status?: string;
    emailSent?: boolean;
    message?: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("PENDENTES");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("TODAS");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const rows = viewMode === "PENDENTES"
        ? await inscricaoService.listPendentes()
        : await inscricaoService.listProcessadas(status === "TODAS" ? undefined : status);
      setData(rows);
    } catch (err) {
      setError("Nao foi possivel carregar inscricoes pendentes.");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [status, viewMode]);

  const approve = useCallback(
    async (correlationId: string) => {
      setActionId(correlationId);
      setActionMessage(null);
      setActionResult(null);

      try {
        const result = await inscricaoService.aprovar(correlationId);
        setActionMessage(result.message ?? "Inscricao aprovada com sucesso.");
        setActionResult({
          correlationId,
          status: result.status,
          emailSent: result.emailSent,
          message: result.message,
        });
        await load();
      } catch (err) {
        const maybeResponse = err as { response?: { data?: unknown } } | null;
        const responseMessage = typeof maybeResponse?.response?.data === "string"
          ? maybeResponse?.response?.data
          : null;
        setActionMessage(responseMessage ?? "Nao foi possivel aprovar a inscricao.");
      } finally {
        setActionId(null);
      }
    },
    [load]
  );

  useEffect(() => {
    void load();
  }, [load]);

  const summary = useMemo(() => {
    const total = data.length;
    const pendentes = data.filter((row) => row.status === "PENDENTE").length;
    const aprovadas = data.filter((row) => row.status === "APROVADA").length;
    const reprovadas = data.filter((row) => row.status === "REPROVADA").length;
    return { total, pendentes, aprovadas, reprovadas };
  }, [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.filter((row) => {
      const matchesQuery =
        !q ||
        row.fullName.toLowerCase().includes(q) ||
        row.email.toLowerCase().includes(q) ||
        row.course.toLowerCase().includes(q);
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
        <h1 className="text-3xl font-semibold">Matrículas</h1>
        <p className="text-sm text-muted-foreground">
          Aprovação das inscrições pendentes para liberação do primeiro acesso.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Total</p><p className="text-2xl font-semibold">{summary.total}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Pendentes</p><p className="text-2xl font-semibold">{summary.pendentes}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Aprovadas</p><p className="text-2xl font-semibold">{summary.aprovadas}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-xs text-muted-foreground">Reprovadas</p><p className="text-2xl font-semibold">{summary.reprovadas}</p></CardContent></Card>
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
              placeholder="Aluno, curso ou turma"
            />
          </div>
          <div className="grid gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Lista</label>
              <select
                value={viewMode}
                onChange={(e) => {
                  setViewMode(e.target.value as ViewMode);
                  setPage(1);
                }}
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="PENDENTES">Pendentes</option>
                <option value="PROCESSADAS">Processadas</option>
              </select>
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
                <option value="PENDENTE">Pendentes</option>
                <option value="APROVADA">Aprovadas</option>
                <option value="REPROVADA">Reprovadas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      {actionMessage ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            {actionMessage}
          </CardContent>
        </Card>
      ) : null}

      {actionResult ? (
        <Card className="border-dashed">
          <CardContent className="space-y-2 pt-6 text-sm text-muted-foreground">
            <p>
              Protocolo: <span className="text-foreground">{actionResult.correlationId}</span>
            </p>
            <p>
              Status: <span className="text-foreground">{actionResult.status ?? "-"}</span>
            </p>
            <p>
              Email enviado: <span className="text-foreground">{actionResult.emailSent ? "Sim" : "Nao"}</span>
            </p>
            {actionResult.message ? (
              <p>
                Mensagem: <span className="text-foreground">{actionResult.message}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Solicitações de matrícula</CardTitle>
          <p className="text-sm text-muted-foreground">Total filtrado: {filtered.length}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Protocolo</th>
                  <th className="px-3 py-2 text-left font-medium">Aluno</th>
                  <th className="px-3 py-2 text-left font-medium">E-mail</th>
                  <th className="px-3 py-2 text-left font-medium">Curso</th>
                  <th className="px-3 py-2 text-left font-medium">Solicitação</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                      Carregando inscricoes...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-3 py-10 text-center text-muted-foreground">
                      Nenhuma inscricao encontrada para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => (
                    <tr key={row.correlationId} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground">{row.correlationId}</td>
                      <td className="px-3 py-2 font-medium">{row.fullName}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.email}</td>
                      <td className="px-3 py-2">{row.course}</td>
                      <td className="px-3 py-2 text-muted-foreground">{formatDate(row.createdAt)}</td>
                      <td className="px-3 py-2">
                        <StatusPill label={statusLabel(row.status)} tone={statusTone(row.status)} />
                      </td>
                      <td className="px-3 py-2">
                        <Button
                          size="sm"
                          disabled={row.status !== "PENDENTE" || actionId === row.correlationId}
                          onClick={() => approve(row.correlationId)}
                        >
                          {actionId === row.correlationId ? "Aprovando..." : "Aprovar"}
                        </Button>
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

        </CardContent>
      </Card>
    </div>
  );
}
