import { useMemo, useState } from "react";

import { useAuth } from "@/app/auth";
import { useStudentPortal } from "@/app/student-portal";
import { DemoNotice } from "@/components/ui/demo-notice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useActivities } from "@/hooks/useActivities";
import type { StudentTrack } from "@/services/portal";

type TrackFilter = "TODOS" | StudentTrack;

function trackLabel(track: StudentTrack) {
  if (track === "ADS") return "ADS";
  if (track === "SI") return "SI";
  if (track === "CCO") return "CCO";
  return "Eng. Software";
}

function formatDateShort(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(iso));
}

export function AlunoCourses() {
  const { userId } = useAuth();
  const { courses, loading, error } = useStudentPortal();
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState<TrackFilter>("TODOS");
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [fileByActivity, setFileByActivity] = useState<Record<string, File | null>>({});
  const [submittingByActivity, setSubmittingByActivity] = useState<Record<string, boolean>>({});

  const {
    materials,
    activities,
    submissionsMap,
    submitByStudent,
    loading: loadingActivities,
  } = useActivities({ role: "ALUNO", userId });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter((item) => {
      const matchesQ =
        !q || item.title.toLowerCase().includes(q) || item.teacherName.toLowerCase().includes(q);
      const matchesTrack = track === "TODOS" || item.track === track;
      return matchesQ && matchesTrack;
    });
  }, [courses, query, track]);

  const selectedCourse = useMemo(
    () => courses.find((item) => item.id === selectedCourseId) ?? null,
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

  async function handleSubmitActivity(activityId: string) {
    const file = fileByActivity[activityId] ?? null;
    if (!file || submittingByActivity[activityId]) return;

    setSubmittingByActivity((prev) => ({ ...prev, [activityId]: true }));
    try {
      await submitByStudent(activityId, file);
      setFileByActivity((prev) => ({ ...prev, [activityId]: null }));
    } finally {
      setSubmittingByActivity((prev) => ({ ...prev, [activityId]: false }));
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Meus cursos</h1>
          <p className="text-sm text-muted-foreground">
            Trilhas focadas em tecnologia (ADS, SI, CCO e Engenharia de Software).
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-3 pt-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <label className="text-xs text-muted-foreground">Buscar</label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome do curso ou docente"
            />
          </div>

          <div>
            <label className="text-xs text-muted-foreground">Trilha</label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={track}
              onChange={(e) => setTrack(e.target.value as TrackFilter)}
            >
              <option value="TODOS">Todas</option>
              <option value="ADS">ADS</option>
              <option value="SI">SI</option>
              <option value="CCO">CCO</option>
              <option value="ENG">Eng. Software</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">{error}</CardContent>
        </Card>
      ) : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">Nenhum curso encontrado.</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {trackLabel(item.track)} • {item.semesterLabel}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="text-muted-foreground">Docente: </span>
                  <span className="font-medium">{item.teacherName}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>{item.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>

                {item.nextItem ? (
                  <>
                    <Separator />
                    <div className="text-xs text-muted-foreground">
                      Próximo: <span className="text-foreground">{item.nextItem.label}</span>
                      <span className="text-muted-foreground"> • {formatDateShort(item.nextItem.dueAt)}</span>
                    </div>
                  </>
                ) : null}

                <Button variant="outline" className="w-full" onClick={() => setSelectedCourseId(item.id)}>
                  Ver materiais e atividades
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCourse ? (
        <Card>
          <CardHeader>
            <CardTitle>{selectedCourse.title} • Conteúdos da disciplina</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingActivities ? (
              <p className="text-sm text-muted-foreground">Carregando conteúdos...</p>
            ) : (
              <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Materiais PDF</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedMaterials.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem materiais para esta disciplina.</p>
                    ) : (
                      selectedMaterials.map((item) => (
                        <div key={item.id} className="rounded-md border p-3">
                          <p className="text-sm font-medium">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.fileName}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Atividades e envio</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedActivities.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sem atividades para esta disciplina.</p>
                    ) : (
                      selectedActivities.map((item) => {
                        const submission = submissionsMap.get(item.id);
                        const selectedFile = fileByActivity[item.id] ?? null;
                        const isSubmitting = !!submittingByActivity[item.id];

                        return (
                          <div key={item.id} className="space-y-2 rounded-md border p-3">
                            <p className="text-sm font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground">Prazo: {formatDateShort(item.dueAt)}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                            {item.attachmentName ? (
                              <p className="text-xs text-muted-foreground">Anexo do professor: {item.attachmentName}</p>
                            ) : null}

                            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                              <Input
                                type="file"
                                accept=".pdf,.doc,.docx,.zip,.png,.jpg,.jpeg"
                                onChange={(e) =>
                                  setFileByActivity((prev) => ({
                                    ...prev,
                                    [item.id]: e.target.files?.[0] ?? null,
                                  }))
                                }
                              />
                              <Button onClick={() => handleSubmitActivity(item.id)} disabled={!selectedFile || isSubmitting}>
                                {isSubmitting ? "Enviando..." : "Enviar arquivo"}
                              </Button>
                            </div>

                            {selectedFile ? (
                              <p className="text-xs text-muted-foreground">Arquivo selecionado: {selectedFile.name}</p>
                            ) : null}

                            {submission ? (
                              <p className="text-xs text-muted-foreground">
                                Último envio: {submission.fileName} • {formatDateShort(submission.submittedAt)} • {submission.status}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">Nenhum envio registrado.</p>
                            )}
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            <DemoNotice />
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
