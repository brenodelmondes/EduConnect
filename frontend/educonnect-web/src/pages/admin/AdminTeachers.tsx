import { useMemo, useState } from "react";

import { STRICT_API } from "@/config/env";
import { useTeachers } from "@/hooks/useTeachers";
import { teachersService, type TeacherRecord } from "@/services/teachers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusPill } from "@/components/ui/status-pill";

type StatusFilter = "TODOS" | "ATIVOS" | "INATIVOS";

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
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

export function AdminTeachers() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("TODOS");
  const [department, setDepartment] = useState<string>("TODOS");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const { data: rows, loading, add, reset } = useTeachers();

  const [draft, setDraft] = useState<{
    name: string;
    email: string;
    department: string;
    active: boolean;
  }>({ name: "", email: "", department: "Computacao", active: true });

  const departments = useMemo(() => {
    const values = new Set(rows.map((item) => item.department));
    return Array.from(values).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((item) => {
        if (status === "ATIVOS" && !item.active) return false;
        if (status === "INATIVOS" && item.active) return false;
        if (department !== "TODOS" && item.department !== department) return false;
        if (!q) return true;
        return item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
      })
      .sort((a, b) => a.id - b.id);
  }, [rows, query, status, department]);

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

  function onChangeQuery(value: string) {
    setQuery(value);
    resetPagination();
  }

  function onChangeStatus(value: StatusFilter) {
    setStatus(value);
    resetPagination();
  }

  function onChangeDepartment(value: string) {
    setDepartment(value);
    resetPagination();
  }

  function handleCreate() {
    const name = draft.name.trim();
    const email = draft.email.trim();
    const dep = draft.department.trim();
    if (!name || !dep) return;

    add({
      name,
      email: email || `prof.${Date.now()}@educonnect.local`,
      department: dep,
      active: draft.active,
    } satisfies Omit<TeacherRecord, "id">);

    setOpen(false);
    setDraft({ name: "", email: "", department: dep, active: true });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Professores</h1>
          <p className="text-sm text-muted-foreground">
            Gestao de docentes por departamento e status de atividade.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!STRICT_API ? (
            <Button variant="outline" onClick={() => setOpen(true)}>
              Adicionar
            </Button>
          ) : null}
          <Button
            variant="secondary"
            onClick={() =>
              downloadJson("educonnect-professores.json", teachersService.exportJson(filtered))
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
              <CardTitle>Lista de professores</CardTitle>
              <div className="text-xs text-muted-foreground">
                Total: <span className="font-medium text-foreground">{filtered.length}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground md:ml-auto">
              {loading ? "Carregando..." : ""}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-72">
                <Label htmlFor="teacher-q" className="sr-only">
                  Buscar
                </Label>
                <Input
                  id="teacher-q"
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
                  <DropdownMenuItem onClick={() => onChangeStatus("TODOS")}>Todos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeStatus("ATIVOS")}>Ativos</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onChangeStatus("INATIVOS")}>Inativos</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Departamento: {department === "TODOS" ? "Todos" : department}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-72 overflow-auto">
                  <DropdownMenuItem onClick={() => onChangeDepartment("TODOS")}>
                    Todos
                  </DropdownMenuItem>
                  {departments.map((item) => (
                    <DropdownMenuItem key={item} onClick={() => onChangeDepartment(item)}>
                      {item}
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
                  <th className="px-3 py-2 text-left font-medium">Nome</th>
                  <th className="px-3 py-2 text-left font-medium">Email</th>
                  <th className="px-3 py-2 text-left font-medium">Departamento</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-3 py-10 text-center text-muted-foreground" colSpan={5}>
                      Carregando professores...
                    </td>
                  </tr>
                ) : pageItems.length === 0 ? (
                  <tr>
                    <td className="px-3 py-10 text-center text-muted-foreground" colSpan={5}>
                      Nenhum resultado para os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  pageItems.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-3 py-2 text-muted-foreground">{item.id}</td>
                      <td className="px-3 py-2 font-medium">{item.name}</td>
                      <td className="px-3 py-2 text-muted-foreground">{item.email}</td>
                      <td className="px-3 py-2">{item.department}</td>
                      <td className="px-3 py-2">
                        <StatusPill
                          label={item.active ? "Ativo" : "Inativo"}
                          tone={item.active ? "success" : "neutral"}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-3">
            {!STRICT_API ? <DemoNotice className="flex-1" /> : <div className="flex-1" />}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={safePage <= 1}
              >
                Anterior
              </Button>
              <div className="text-xs text-muted-foreground">
                Pagina <span className="font-medium text-foreground">{safePage}</span> de {pageCount}
              </div>
              <Button
                variant="outline"
                onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                disabled={safePage >= pageCount}
              >
                Proxima
              </Button>
            </div>
          </div>

          {!STRICT_API ? (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                className="text-muted-foreground"
                onClick={async () => {
                  setQuery("");
                  setStatus("TODOS");
                  setDepartment("TODOS");
                  setPage(1);
                  await delay(200);
                  await reset();
                }}
              >
                Resetar dados locais
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog open={open && !STRICT_API} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar professor</DialogTitle>
            <DialogDescription>
              Cadastro simplificado. Os dados ficam salvos neste navegador.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={draft.name}
                onChange={(e) => setDraft((state) => ({ ...state, name: e.target.value }))}
                placeholder="Ex.: Prof. Joao Pereira"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email (opcional)</Label>
              <Input
                id="email"
                value={draft.email}
                onChange={(e) => setDraft((state) => ({ ...state, email: e.target.value }))}
                placeholder="Ex.: joao.pereira@educonnect.local"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={draft.department}
                onChange={(e) => setDraft((state) => ({ ...state, department: e.target.value }))}
                placeholder="Ex.: Computacao"
              />
            </div>

            <div className="flex items-center gap-2 text-sm">
              <input
                id="active"
                type="checkbox"
                className="h-4 w-4 accent-primary"
                checked={draft.active}
                onChange={(e) => setDraft((state) => ({ ...state, active: e.target.checked }))}
              />
              <Label htmlFor="active">Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!draft.name.trim() || !draft.department.trim()}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
