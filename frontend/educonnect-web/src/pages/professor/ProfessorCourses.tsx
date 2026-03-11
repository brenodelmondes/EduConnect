import { useMemo, useState } from "react";

import { useAuth } from "@/app/auth";
import { DemoNotice } from "@/components/ui/demo-notice";
import { useActivities } from "@/hooks/useActivities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(iso));
}

export function ProfessorCourses() {
  const { userId } = useAuth();
  const { courses, materials, activities, loading, error, createByProfessor } = useActivities({
    role: "PROFESSOR",
    userId,
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const selectedCourse = useMemo(
    () => courses.find((item) => item.id === selectedCourseId) ?? courses[0],
    [courses, selectedCourseId]
  );

  const selectedMaterials = useMemo(
    () => materials.filter((item) => item.courseId === selectedCourse?.id),
    [materials, selectedCourse?.id]
  );

  const selectedActivities = useMemo(
    () => activities.filter((item) => item.courseId === selectedCourse?.id),
    [activities, selectedCourse?.id]
  );

  async function publishActivity() {
    if (!selectedCourse?.id || !title.trim() || !description.trim() || !dueAt) return;
    setSaving(true);
    try {
      await createByProfessor({
        courseId: selectedCourse.id,
        title: title.trim(),
        description: description.trim(),
        dueAt: new Date(dueAt).toISOString(),
        attachmentFile,
      });
      setTitle("");
      setDescription("");
      setDueAt("");
      setAttachmentFile(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Meus cursos</h1>
        <p className="text-sm text-muted-foreground">
          Gestão de materiais e atividades publicadas para cada turma.
        </p>
      </div>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-2">
          <div>
            <Label>Turma/Disciplina</Label>
            <select
              className="mt-2 h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={selectedCourse?.id ?? ""}
              onChange={(e) => setSelectedCourseId(e.target.value)}
            >
              {courses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} • {item.semesterLabel}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-md border bg-muted/20 p-3 text-sm">
            <p className="font-medium">Docente responsável</p>
            <p className="text-muted-foreground">{selectedCourse?.teacherName ?? "-"}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Materiais da disciplina</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {loading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : selectedMaterials.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem materiais cadastrados.</p>
            ) : (
              selectedMaterials.map((item) => (
                <div key={item.id} className="rounded-md border p-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.fileName} • {formatDateShort(item.createdAt)}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Publicar atividade</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex.: OpenLab Semana 4" />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <textarea
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva instruções e critérios da atividade."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="activity-file">Anexo da atividade</Label>
                <Input
                  id="activity-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                  onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  {attachmentFile ? `Arquivo selecionado: ${attachmentFile.name}` : "Sem arquivo selecionado."}
                </p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={publishActivity}
                disabled={!selectedCourse?.id || !title.trim() || !description.trim() || !dueAt || saving}
              >
                {saving ? "Publicando..." : "Publicar atividade"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividades já publicadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {selectedActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem atividades para esta disciplina.</p>
          ) : (
            selectedActivities.map((item) => (
              <div key={item.id} className="rounded-md border p-3">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">Prazo: {formatDateShort(item.dueAt)}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                {item.attachmentName ? (
                  <p className="mt-1 text-xs text-muted-foreground">Anexo: {item.attachmentName}</p>
                ) : null}
              </div>
            ))
          )}
          <DemoNotice />
        </CardContent>
      </Card>
    </div>
  );
}
