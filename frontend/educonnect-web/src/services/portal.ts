import { API_URL } from "@/config/env";
import { calendarService } from "@/services/calendar";
import { api } from "@/services/api";

export type StudentTrack = "ADS" | "SI" | "CCO" | "ENG";

export type StudentCourseCard = {
  id: string;
  title: string;
  track: StudentTrack;
  semesterLabel: string;
  teacherName: string;
  progress: number;
  nextItem?: { label: string; dueAt: string };
};

export type StudentAnnouncement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  author: string;
  category: "Acadêmico" | "Institucional" | "Financeiro";
};

export type StudentNotification = {
  id: string;
  title: string;
  createdAt: string;
  category: StudentAnnouncement["category"] | "Suporte";
  unread?: boolean;
};

export type StudentGradeRow = {
  id: string;
  courseTitle: string;
  track: StudentTrack;
  grade: number | null;
  status: "Aprovado" | "Em recuperação" | "Pendente";
};

type ApiCurso = {
  id?: number | string;
  nome?: string;
  trilha?: string;
  semestre?: string;
  professorNome?: string;

  Id?: number | string;
  Nome?: string;
  Trilha?: string;
  Semestre?: string;
  ProfessorNome?: string;
};

type ApiEvento = {
  id?: number | string;
  titulo?: string;
  dataEvento?: string;
  categoria?: string;

  Id?: number | string;
  Titulo?: string;
  DataEvento?: string;
  Categoria?: string;
};

type ApiAluno = {
  id?: number;
  usuarioId?: number;

  Id?: number;
  UsuarioId?: number;
};

function asTrack(raw: unknown): StudentTrack {
  const value = String(raw ?? "").toLowerCase();
  if (value.includes("ads")) return "ADS";
  if (value.includes("si")) return "SI";
  if (value.includes("cco") || value.includes("comput")) return "CCO";
  return "ENG";
}

function clamp01To100(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function daysFromNowIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function userOffset(userId?: number | null) {
  if (typeof userId !== "number" || !Number.isFinite(userId)) return 0;
  return Math.abs(userId) % 7;
}

function demoCourses(userId?: number | null): StudentCourseCard[] {
  const offset = userOffset(userId);
  const base: Array<Pick<StudentCourseCard, "title" | "track" | "teacherName" | "semesterLabel">> = [
    { title: "Algoritmos e Programação", track: "ADS", teacherName: "Profa. Camila", semesterLabel: "2026.1" },
    { title: "Banco de Dados", track: "ADS", teacherName: "Prof. Renato", semesterLabel: "2026.1" },
    { title: "Engenharia de Software", track: "ENG", teacherName: "Profa. Luana", semesterLabel: "2026.1" },
    { title: "Arquitetura em Nuvem", track: "SI", teacherName: "Prof. Diego", semesterLabel: "2026.1" },
    { title: "Estruturas de Dados", track: "CCO", teacherName: "Prof. André", semesterLabel: "2026.1" },
    { title: "Desenvolvimento Web", track: "ADS", teacherName: "Profa. Bruna", semesterLabel: "2026.1" },
    { title: "DevOps e Observabilidade", track: "SI", teacherName: "Prof. Marcelo", semesterLabel: "2026.1" },
    { title: "Projeto Integrador", track: "ENG", teacherName: "Profa. Fernanda", semesterLabel: "2026.1" },
  ];

  return base.slice(offset, offset + 6).concat(base.slice(0, Math.max(0, offset - 2))).slice(0, 6).map((item, index) => {
    const progress = clamp01To100(18 + ((index * 13 + offset * 9) % 70));
    const dueAt = daysFromNowIso(2 + ((index + offset) % 7));
    return {
      id: `demo_course_${offset}_${index + 1}`,
      ...item,
      progress,
      nextItem: {
        label: index % 3 === 0 ? "Entrega de atividade" : index % 3 === 1 ? "Checkpoint" : "Aula síncrona",
        dueAt,
      },
    };
  });
}

function demoAnnouncements(): StudentAnnouncement[] {
  const now = new Date();
  const create = (
    id: string,
    title: string,
    body: string,
    daysAgo: number,
    category: StudentAnnouncement["category"],
    author: string
  ) => {
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(10, 0, 0, 0);
    return { id, title, body, createdAt: date.toISOString(), category, author };
  };

  return [
    create(
      "a1",
      "Planejamento de aulas - semana 3",
      "Disponibilizamos o cronograma atualizado e materiais complementares para as disciplinas matriculadas.",
      1,
      "Acadêmico",
      "Secretaria Acadêmica"
    ),
    create(
      "a2",
      "Manutenção programada do portal",
      "O portal pode apresentar instabilidade no sábado, das 22h às 23h30, para atualização de infraestrutura.",
      3,
      "Institucional",
      "TI Acadêmico"
    ),
    create(
      "a3",
      "Boleto/recorrência - conferência cadastral",
      "Se houver divergência de dados, atualize suas informações em Preferências para evitar atrasos.",
      6,
      "Financeiro",
      "Financeiro"
    ),
  ];
}

function demoGrades(courses: StudentCourseCard[]): StudentGradeRow[] {
  return courses.slice(0, 7).map((item, index) => {
    const raw = 7.2 + ((index * 0.6) % 2.8);
    const grade = index % 4 === 3 ? null : Math.round(raw * 10) / 10;
    const status: StudentGradeRow["status"] = grade == null ? "Pendente" : grade >= 6 ? "Aprovado" : "Em recuperação";
    return {
      id: `g_${item.id}`,
      courseTitle: item.title,
      track: item.track,
      grade,
      status,
    };
  });
}

function demoNotifications(): StudentNotification[] {
  const announcements = demoAnnouncements();
  const base: StudentNotification[] = announcements.map((item) => ({
    id: `n_${item.id}`,
    title: item.title,
    createdAt: item.createdAt,
    category: item.category,
    unread: true,
  }));

  const actionItems: StudentNotification[] = [
    {
      id: "n_action_1",
      title: "Atividade cadastrada: Projeto Integrador",
      createdAt: daysFromNowIso(-1),
      category: "Acadêmico",
      unread: true,
    },
    {
      id: "n_action_2",
      title: "Nota publicada: Banco de Dados",
      createdAt: daysFromNowIso(-4),
      category: "Acadêmico",
      unread: false,
    },
    ...base,
  ];

  return actionItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function mapApiCurso(course: ApiCurso, index: number): StudentCourseCard {
  const id = course.id ?? course.Id ?? `api_course_${index}`;
  const title = course.nome ?? course.Nome ?? "Curso";
  const track = asTrack(course.trilha ?? course.Trilha);
  const semesterLabel = String(course.semestre ?? course.Semestre ?? "2026.1");
  const teacherName = String(course.professorNome ?? course.ProfessorNome ?? "Docente");
  const progress = clamp01To100(25 + ((index * 11) % 65));

  return {
    id: String(id),
    title,
    track,
    semesterLabel,
    teacherName,
    progress,
  };
}

function mapApiEventoToNotification(eventItem: ApiEvento, index: number): StudentNotification {
  const id = eventItem.id ?? eventItem.Id ?? `evt_${index}`;
  const title = eventItem.titulo ?? eventItem.Titulo ?? "Evento";
  const createdAt = eventItem.dataEvento ?? eventItem.DataEvento ?? new Date().toISOString();
  const rawCategory = String(eventItem.categoria ?? eventItem.Categoria ?? "Acadêmico").toLowerCase();
  const category: StudentNotification["category"] = rawCategory.includes("fin")
    ? "Financeiro"
    : rawCategory.includes("inst")
      ? "Institucional"
      : "Acadêmico";

  return {
    id: String(id),
    title,
    createdAt,
    category,
    unread: true,
  };
}

export const portalService = {
  isApiConfigured() {
    return !!API_URL;
  },

  async listCourses(userId?: number | null): Promise<StudentCourseCard[]> {
    const fallback = demoCourses(userId);
    if (!API_URL) return fallback;

    try {
      const response = await api.get<ApiCurso[]>("/Cursos");
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length === 0) return fallback;
      return data.map(mapApiCurso);
    } catch {
      return fallback;
    }
  },

  async listAnnouncements(): Promise<StudentAnnouncement[]> {
    return demoAnnouncements();
  },

  async listNotifications(): Promise<StudentNotification[]> {
    const fallback = demoNotifications();
    if (!API_URL) return fallback;

    try {
      const response = await api.get<ApiEvento[]>("/Eventos");
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length === 0) return fallback;
      return data
        .map(mapApiEventoToNotification)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
    } catch {
      return fallback;
    }
  },

  async listGrades(courses?: StudentCourseCard[]): Promise<StudentGradeRow[]> {
    return demoGrades(courses ?? demoCourses());
  },

  async downloadBoletimPdf(input: {
    userId: number;
    semester: string;
  }): Promise<{ bytes: ArrayBuffer; filename: string }> {
    if (!API_URL) {
      throw new Error("API_URL não configurada");
    }

    const studentsResponse = await api.get<ApiAluno[]>("/Alunos");
    const studentsData = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];

    const student = studentsData.find((item) => (item.usuarioId ?? item.UsuarioId) === input.userId);
    const alunoId = student?.id ?? student?.Id;
    if (!alunoId) {
      throw new Error("Não foi possível localizar o aluno vinculado a este usuário.");
    }

    const semester = encodeURIComponent(input.semester);
    const url = `/boletins/alunos/${alunoId}/semestres/${semester}/pdf`;
    const pdfResponse = await api.get<ArrayBuffer>(url, { responseType: "arraybuffer" });

    return {
      bytes: pdfResponse.data,
      filename: `boletim_${input.semester}.pdf`,
    };
  },

  listUpcomingFromCalendar(input: { role: "ADMIN" | "PROFESSOR" | "ALUNO"; userId?: number | null; limit?: number }) {
    const from = new Date();
    const limit = input.limit ?? 6;
    return calendarService
      .list({ role: input.role, userId: input.userId })
      .slice()
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .filter((item) => item.end.getTime() >= from.getTime())
      .slice(0, limit);
  },
};
