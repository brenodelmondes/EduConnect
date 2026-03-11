import { DEMO_MODE } from "@/config/env";
import { api } from "@/services/api";
import type { ActivityRow, MaterialRow, SubmissionRow } from "@/types/academic";
import type { UserRole } from "@/utils/storage";

type WorkspaceCourse = {
  id: string;
  title: string;
  track: "ADS" | "SI" | "CCO" | "ENG";
  semesterLabel: string;
  teacherName: string;
};

type WorkspaceSnapshot = {
  courses: WorkspaceCourse[];
  materials: MaterialRow[];
  activities: ActivityRow[];
  submissions: SubmissionRow[];
};

type CreateActivityPayload = {
  courseId: string;
  title: string;
  description: string;
  dueAt: string;
  attachmentName?: string;
  attachmentFileId?: string;
  attachmentUrl?: string;
};

type SubmitPayload = {
  fileName: string;
  submissionFileId?: string;
  submissionUrl?: string;
};

const LEGACY_KEY = "educonnect:activities:v1";
const STORAGE_PREFIX = "educonnect:activities:v2";

function canUseStorage() {
  return typeof window !== "undefined" && !!window.localStorage;
}

function storageKey(role: UserRole, userId?: number | null) {
  const normalizedUser = typeof userId === "number" && Number.isFinite(userId) ? userId : 0;
  return `${STORAGE_PREFIX}:${role}:${normalizedUser}`;
}

function newId(prefix: string) {
  const uuid = globalThis.crypto?.randomUUID;
  if (typeof uuid === "function") return `${prefix}_${uuid.call(globalThis.crypto)}`;
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function daysFromNow(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(23, 59, 0, 0);
  return date.toISOString();
}

function defaultCourses(): WorkspaceCourse[] {
  return [
    {
      id: "C-ADS-ALG",
      title: "Algoritmos e Programação",
      track: "ADS",
      semesterLabel: "2026.1",
      teacherName: "Profa. Camila",
    },
    {
      id: "C-ADS-BD",
      title: "Banco de Dados",
      track: "ADS",
      semesterLabel: "2026.1",
      teacherName: "Prof. Renato",
    },
    {
      id: "C-ENG-ES",
      title: "Engenharia de Software",
      track: "ENG",
      semesterLabel: "2026.1",
      teacherName: "Profa. Luana",
    },
    {
      id: "C-SI-NUV",
      title: "Arquitetura em Nuvem",
      track: "SI",
      semesterLabel: "2026.1",
      teacherName: "Prof. Diego",
    },
  ];
}

function defaultSnapshot(): WorkspaceSnapshot {
  const nowIso = new Date().toISOString();
  const courses = defaultCourses();

  const materials: MaterialRow[] = [
    {
      id: "MAT-1",
      courseId: courses[0].id,
      title: "Aula 1 - Introdução",
      fileName: "aula-01-introducao.pdf",
      fileId: "file_mat_1",
      createdAt: nowIso,
    },
    {
      id: "MAT-2",
      courseId: courses[1].id,
      title: "Modelo relacional",
      fileName: "modelo-relacional.pdf",
      fileId: "file_mat_2",
      createdAt: nowIso,
    },
  ];

  const activities: ActivityRow[] = [
    {
      id: "ATV-1",
      courseId: courses[0].id,
      title: "OpenLab - Semana 3",
      description: "Resolva os exercícios práticos e envie um PDF com as respostas.",
      dueAt: daysFromNow(3),
      createdAt: nowIso,
      createdByRole: "PROFESSOR",
      attachmentName: "roteiro-openlab.pdf",
      attachmentFileId: "file_atv_1",
    },
    {
      id: "ATV-2",
      courseId: courses[2].id,
      title: "Checkpoint de Arquitetura",
      description: "Desenhe a arquitetura proposta e publique em PDF.",
      dueAt: daysFromNow(6),
      createdAt: nowIso,
      createdByRole: "PROFESSOR",
      attachmentName: "enunciado-checkpoint.pdf",
      attachmentFileId: "file_atv_2",
    },
  ];

  return {
    courses,
    materials,
    activities,
    submissions: [],
  };
}

function normalizeSnapshot(snapshot: WorkspaceSnapshot): WorkspaceSnapshot {
  return {
    courses: snapshot.courses ?? [],
    materials: snapshot.materials ?? [],
    activities: snapshot.activities ?? [],
    submissions: snapshot.submissions ?? [],
  };
}

function migrateLegacyIfNeeded(key: string) {
  if (!canUseStorage()) return;
  const existing = window.localStorage.getItem(key);
  if (existing) return;

  const legacy = window.localStorage.getItem(LEGACY_KEY);
  if (!legacy) return;

  window.localStorage.setItem(key, legacy);
}

function readSnapshot(role: UserRole, userId?: number | null): WorkspaceSnapshot {
  if (!canUseStorage()) return defaultSnapshot();

  const key = storageKey(role, userId);
  migrateLegacyIfNeeded(key);

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    const seeded = defaultSnapshot();
    window.localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw) as WorkspaceSnapshot;
    if (!parsed?.courses || !Array.isArray(parsed.courses)) {
      const seeded = defaultSnapshot();
      window.localStorage.setItem(key, JSON.stringify(seeded));
      return seeded;
    }
    return normalizeSnapshot(parsed);
  } catch {
    const seeded = defaultSnapshot();
    window.localStorage.setItem(key, JSON.stringify(seeded));
    return seeded;
  }
}

function writeSnapshot(role: UserRole, userId: number | null | undefined, snapshot: WorkspaceSnapshot) {
  if (!canUseStorage()) return;
  const key = storageKey(role, userId);
  window.localStorage.setItem(key, JSON.stringify(normalizeSnapshot(snapshot)));
}

function inferSubmissionStatus(dueAt: string, submittedAt: string): SubmissionRow["status"] {
  return new Date(submittedAt).getTime() <= new Date(dueAt).getTime() ? "ENTREGUE" : "ATRASADO";
}

async function tryApiCoursesFallback() {
  if (DEMO_MODE) return null;

  try {
    const response = await api.get<Array<{ id?: number | string; nome?: string; Nome?: string }>>("/Cursos");
    const rows = Array.isArray(response.data) ? response.data : [];
    if (rows.length === 0) return null;

    return rows.slice(0, 6).map((item, index) => ({
      id: String(item.id ?? `API-${index + 1}`),
      title: String(item.nome ?? item.Nome ?? `Curso ${index + 1}`),
      track: (["ADS", "SI", "CCO", "ENG"] as const)[index % 4],
      semesterLabel: "2026.1",
      teacherName: `Docente ${index + 1}`,
    }));
  } catch {
    return null;
  }
}

export const activitiesRepository = {
  async listByRole(role: UserRole, userId?: number | null) {
    const snapshot = readSnapshot(role, userId);
    const apiCourses = await tryApiCoursesFallback();
    const courses = apiCourses && apiCourses.length > 0 ? apiCourses : snapshot.courses;

    const submissionsByActivity = new Map<string, SubmissionRow[]>();
    for (const submission of snapshot.submissions) {
      const list = submissionsByActivity.get(submission.activityId) ?? [];
      list.push(submission);
      submissionsByActivity.set(submission.activityId, list);
    }

    const normalizedSubmissions =
      role === "ALUNO" && typeof userId === "number"
        ? snapshot.submissions.filter((item) => item.studentUserId === userId)
        : snapshot.submissions;

    return {
      courses,
      materials: snapshot.materials,
      activities: snapshot.activities,
      submissions: normalizedSubmissions,
      submissionsByActivity,
    };
  },

  async createByProfessor(payload: CreateActivityPayload, userId?: number | null) {
    const snapshot = readSnapshot("PROFESSOR", userId);

    const next: ActivityRow = {
      id: newId("ATV"),
      courseId: payload.courseId,
      title: payload.title,
      description: payload.description,
      dueAt: payload.dueAt,
      createdAt: new Date().toISOString(),
      createdByRole: "PROFESSOR",
      attachmentName: payload.attachmentName,
      attachmentFileId: payload.attachmentFileId,
      attachmentUrl: payload.attachmentUrl,
    };

    snapshot.activities = [next, ...snapshot.activities];
    writeSnapshot("PROFESSOR", userId, snapshot);
    return next;
  },

  async submitByStudent(activityId: string, fileMeta: SubmitPayload, studentUserId?: number | null) {
    const snapshot = readSnapshot("ALUNO", studentUserId);
    const activity = snapshot.activities.find((item) => item.id === activityId);

    if (!activity) {
      throw new Error("Atividade não encontrada.");
    }

    const currentUser = typeof studentUserId === "number" ? studentUserId : 0;

    const nowIso = new Date().toISOString();
    const nextSubmission: SubmissionRow = {
      id: newId("SUB"),
      activityId,
      studentUserId: currentUser,
      fileName: fileMeta.fileName,
      submissionFileId: fileMeta.submissionFileId,
      submissionUrl: fileMeta.submissionUrl,
      submittedAt: nowIso,
      status: inferSubmissionStatus(activity.dueAt, nowIso),
    };

    snapshot.submissions = [
      nextSubmission,
      ...snapshot.submissions.filter(
        (item) => !(item.activityId === activityId && item.studentUserId === currentUser)
      ),
    ];

    writeSnapshot("ALUNO", currentUser, snapshot);
    return nextSubmission;
  },
};
