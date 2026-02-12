import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useStudents } from "@/hooks/useStudents";
import { type StudentRecord } from "@/services/students";

type StatusFilter = "TODOS" | "ATIVOS" | "INATIVOS";

function downloadJson(filename: string, contents: string) {
  const blob = new Blob([contents], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}


function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function AdminStudents() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("TODOS");
  const [course, setCourse] = useState<string>("TODOS");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data: rows, loading, add, reset } = useStudents();
  const [refreshing, setRefreshing] = useState(false);

  const [draft, setDraft] = useState<{
    name: string;
    email: string;
    course: string;
    active: boolean;
  }>({ name: "", email: "", course: "ADS", active: true });

  useEffect(() => {
    if (loading) return;
    setRefreshing(true);
    const t = window.setTimeout(() => setRefreshing(false), 350);
    return () => window.clearTimeout(t);
  }, [query, status, course, page, loading]);

  const courses = useMemo(() => {
    const s = new Set(rows.map((x) => x.course));
    return Array.from(s).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((s) => {
        if (status === "ATIVOS" && !s.active) return false;
        if (status === "INATIVOS" && s.active) return false;
        if (course !== "TODOS" && s.course !== course) return false;
        if (!q) return true;
        return (
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.id - b.id);
  }, [rows, query, status, course]);

  const pageSize = 20;
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage]);

  function resetPagination() {
    setPage(1);
  }

  function onChangeQuery(v: string) {
    setQuery(v);
    resetPagination();
  }

  function onChangeStatus(v: StatusFilter) {
    setStatus(v);
    resetPagination();
  }

  function onChangeCourse(v: string) {
    setCourse(v);
    resetPagination();
  }

  function handleCreate() {
    const name = draft.name.trim();
    const email = draft.email.trim();
    const courseName = draft.course.trim();
    if (!name || !courseName) return;

    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    add({
      name,
      email: email || `aluno.${Date.now()}@educonnect.demo`,
      course: courseName,
      active: draft.active,
      enrolledAt: `${yyyy}-${mm}-${dd}`,
    } satisfies Omit<StudentRecord, "id">);

    setOpen(false);
    setDraft({ name: "", email: "", course: courseName, active: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Alunos</h1>
          <p className="text-sm text-muted-foreground">
            Gestão de alunos em modo demonstração (dados simulados).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setOpen(true)}>
            Adicionar (demo)
          </Button>
          <Button
            variant="secondary"
            onClick={() =>
              downloadJson(
                "educonnect-alunos.json",
                JSON.stringify(filtered, null, 2)
              )
            }
          >
            Exportar JSON
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-2">
              <CardTitle>Lista de alunos</CardTitle>
              <div className="text-xs text-muted-foreground">
                Total: <span className="font-medium text-foreground">{filtered.length}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground md:ml-auto">
              {loading ? "Carregando…" : refreshing ? "Atualizando…" : ""}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-72">
                <Label htmlFor="q" className="sr-only">
                  Buscar
                </Label>
                <Input
                  id="q"
                  placeholder="Buscar por nome ou email"
                  value={query}
                  onChange={(e) => onChangeQuery(e.target.value)}
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Status: {status === "TODOS" ? "Todos" : status === "ATIVOS" ? "Ativos" : "Inativos"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onChangeStatus("TODOS")}>
                    Todos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeStatus("ATIVOS")}>
                    Ativos
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeStatus("INATIVOS")}>
                    Inativos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Curso: {course === "TODOS" ? "Todos" : course}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
                  <DropdownMenuItem onClick={() => onChangeCourse("TODOS")}>
                    Todos
                  </DropdownMenuItem>
                  {courses.map((c) => (
                    <DropdownMenuItem key={c} onClick={() => onChangeCourse(c)}>
                      {c}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">ID</th>
                  <th className="px-3 py-2 text-left font-medium">RA</th>
                  <th className="px-3 py-2 text-left font-medium">Nome</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Curso</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-10 text-center text-muted-foreground" colSpan={6}>
                      Carregando alunos…
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td className="px-3 py-10 text-center text-muted-foreground" colSpan={6}>
                      Nenhum resultado para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground">{s.id}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.ra}</td>
                      <td className="px-3 py-2 font-medium">{s.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.email}</td>
                      <td className="px-3 py-2">{s.course}</td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            s.active
                              ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300"
                              : "rounded-full bg-zinc-500/10 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:text-zinc-300"
                          }
                        >
                          {s.active ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Modo demonstração — dados simulados. Integração com API na próxima etapa.
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
              >
                Anterior
              </Button>
              <div className="text-xs text-muted-foreground">
                Página <span className="font-medium text-foreground">{safePage}</span> de {pageCount}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                disabled={safePage >= pageCount}
              >
                Próxima
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              className="text-muted-foreground"
              onClick={async () => {
                setQuery("");
                setStatus("TODOS");
                setCourse("TODOS");
                setPage(1);
                await delay(200);
                await reset();
              }}
            >
              Resetar dados (demo)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar aluno (demo)</DialogTitle>
            <DialogDescription>
              Cadastro simplificado para apresentação. Os dados ficam salvos neste navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Ex.: Maria Silva"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="Ex.: maria.silva@educonnect.demo"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="course">Curso</Label>
              <Input
                id="course"
                value={draft.course}
                onChange={(e) => setDraft((d) => ({ ...d, course: e.target.value }))}
                placeholder="Ex.: ADS"
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input
                id="active"
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={draft.active}
                onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
              />
              <Label htmlFor="active">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!draft.name.trim() || !draft.course.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
