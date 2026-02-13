import { useMemo, useState } from "react";

import { useAuth } from "@/app/auth";
import { useStudentPortal } from "@/app/student-portal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { portalService } from "@/services/portal";

function statusStyle(status: string) {
  if (status === "Aprovado") return "bg-muted/40";
  if (status === "Em recuperacao") return "bg-muted/40";
  return "bg-muted/20";
}

function downloadJson(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function AlunoGrades() {
  const { grades, loading, error } = useStudentPortal();
  const { userId } = useAuth();

  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const CURRENT_SEMESTER = "2026.1";

  const summary = useMemo(() => {
    const released = grades.filter((row) => row.grade != null);
    const avg = released.length
      ? released.reduce((acc, row) => acc + (row.grade ?? 0), 0) / released.length
      : null;
    return {
      released: released.length,
      total: grades.length,
      avg: avg == null ? null : Math.round(avg * 10) / 10,
    };
  }, [grades]);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notas</h1>
          <p className="text-sm text-muted-foreground">
            Boletim por disciplina, com status e consolidado do periodo.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={async () => {
              setPdfError(null);

              if (!portalService.isApiConfigured()) {
                setPdfError("API nao configurada para download do PDF.");
                return;
              }
              if (!userId) {
                setPdfError("Usuario sem identificacao (faca login via API).");
                return;
              }

              setDownloadingPdf(true);
              try {
                const { bytes, filename } = await portalService.downloadBoletimPdf({
                  userId,
                  semester: CURRENT_SEMESTER,
                });

                const blob = new Blob([bytes], { type: "application/pdf" });
                const url = URL.createObjectURL(blob);
                const anchor = document.createElement("a");
                anchor.href = url;
                anchor.download = filename;
                anchor.click();
                URL.revokeObjectURL(url);
              } catch {
                setPdfError("Nao foi possivel baixar o boletim em PDF.");
              } finally {
                setDownloadingPdf(false);
              }
            }}
            disabled={downloadingPdf}
          >
            {downloadingPdf ? "Baixando..." : `Baixar boletim (PDF ${CURRENT_SEMESTER})`}
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadJson("boletim.json", JSON.stringify(grades, null, 2))}
            disabled={loading || grades.length === 0}
          >
            Baixar boletim (JSON)
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      {pdfError ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{pdfError}</CardContent>
        </Card>
      ) : null}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Disciplinas</span>
              <span className="font-medium">{summary.total}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Notas publicadas</span>
              <span className="font-medium">{summary.released}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-2">
              <span>Media parcial</span>
              <span className="font-medium">{summary.avg == null ? "-" : summary.avg}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Boletim</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : grades.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma disciplina encontrada.</p>
            ) : (
              <div className="overflow-auto rounded-md border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/40 text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Disciplina</th>
                      <th className="px-3 py-2 text-left font-medium">Trilha</th>
                      <th className="px-3 py-2 text-right font-medium">Nota</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map((row) => (
                      <tr key={row.id} className="border-t">
                        <td className="px-3 py-2">
                          <span className="font-medium">{row.courseTitle}</span>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">{row.track}</td>
                        <td className="px-3 py-2 text-right font-medium">
                          {row.grade == null ? "-" : row.grade.toFixed(1)}
                        </td>
                        <td className="px-3 py-2">
                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-xs ${statusStyle(row.status)}`}
                          >
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
