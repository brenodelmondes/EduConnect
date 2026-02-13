import { DEMO_MODE } from "@/config/env";
import { classes, teachers } from "@/mocks/db";
import { api } from "@/services/api";

export type TurmaStatus = "ATIVA" | "SEM_DOCENTE" | "ENCERRADA";

export type TurmaRow = {
  id: string;
  codigo: string;
  curso: string;
  professor: string;
  modalidade: "Presencial" | "EAD" | "Hibrido";
  periodo: string;
  vagas: number;
  matriculados: number;
  status: TurmaStatus;
};

type ApiTurma = {
  id?: number | string;
  codigo?: string;
  nome?: string;
  cursoNome?: string;
  professorNome?: string;
  modalidade?: string;
  periodo?: string;
  vagas?: number;
  matriculados?: number;
  ativo?: boolean;
  teacherId?: number | null;
  course?: string;

  Id?: number | string;
  Codigo?: string;
  Nome?: string;
  CursoNome?: string;
  ProfessorNome?: string;
  Modalidade?: string;
  Periodo?: string;
  Vagas?: number;
  Matriculados?: number;
  Ativo?: boolean;
  TeacherId?: number | null;
  Course?: string;
};

function asModalidade(raw: unknown): TurmaRow["modalidade"] {
  const value = String(raw ?? "").toLowerCase();
  if (value.includes("ead")) return "EAD";
  if (value.includes("hibr")) return "Hibrido";
  return "Presencial";
}

function normalizeStatus(input: { ativo?: boolean; professor?: string }) {
  if (input.ativo === false) return "ENCERRADA" as const;
  if (!input.professor || input.professor === "A definir") return "SEM_DOCENTE" as const;
  return "ATIVA" as const;
}

function demoTurmas(): TurmaRow[] {
  return classes.map((turma, idx) => {
    const teacher = teachers.find((item) => item.id === turma.teacherId);
    const professor = teacher?.name ?? "A definir";
    const status = normalizeStatus({ ativo: turma.active, professor });
    const matriculados = 18 + ((idx * 7) % 24);
    return {
      id: String(turma.id),
      codigo: `T-${String(turma.id).padStart(3, "0")}`,
      curso: turma.course,
      professor,
      modalidade: idx % 4 === 0 ? "EAD" : idx % 5 === 0 ? "Hibrido" : "Presencial",
      periodo: idx % 2 === 0 ? "Noturno" : "Vespertino",
      vagas: 45,
      matriculados,
      status,
    };
  });
}

function mapApiTurma(row: ApiTurma, index: number): TurmaRow {
  const id = row.id ?? row.Id ?? `api_turma_${index + 1}`;
  const curso = row.cursoNome ?? row.CursoNome ?? row.course ?? row.Course ?? "Curso";
  const professor = row.professorNome ?? row.ProfessorNome ?? "A definir";
  const codigo =
    row.codigo ??
    row.Codigo ??
    row.nome ??
    row.Nome ??
    `T-${String(index + 1).padStart(3, "0")}`;
  const vagas = row.vagas ?? row.Vagas ?? 45;
  const matriculados = row.matriculados ?? row.Matriculados ?? Math.max(10, (index * 9) % 40);
  const ativo = row.ativo ?? row.Ativo ?? true;

  return {
    id: String(id),
    codigo: String(codigo),
    curso: String(curso),
    professor: String(professor),
    modalidade: asModalidade(row.modalidade ?? row.Modalidade),
    periodo: String(row.periodo ?? row.Periodo ?? "Noturno"),
    vagas,
    matriculados,
    status: normalizeStatus({ ativo, professor: String(professor) }),
  };
}

export const turmasRepository = {
  async list(): Promise<TurmaRow[]> {
    const fallback = demoTurmas();
    if (DEMO_MODE) return fallback;

    try {
      const res = await api.get<ApiTurma[]>("/Turmas");
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length === 0) return fallback;
      return data.map(mapApiTurma);
    } catch {
      return fallback;
    }
  },
};
