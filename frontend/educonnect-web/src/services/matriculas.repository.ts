import { API_URL, STRICT_API, USE_DEMO_FALLBACK } from "@/config/env";
import { classes, enrollments, students } from "@/mocks/db";
import { api } from "@/services/api";

export type MatriculaStatus = "PENDENTE" | "ATIVA" | "CANCELADA";

export type MatriculaRow = {
  id: string;
  aluno: string;
  curso: string;
  turma: string;
  status: MatriculaStatus;
  dataSolicitacao: string;
};

type ApiMatricula = {
  id?: number | string;
  alunoNome?: string;
  cursoNome?: string;
  turmaNome?: string;
  status?: string;
  createdAt?: string;
  dataCriacao?: string;
  alunoRa?: string;
  turmaSemestre?: string;

  Id?: number | string;
  AlunoNome?: string;
  CursoNome?: string;
  TurmaNome?: string;
  Status?: string;
  CreatedAt?: string;
  DataCriacao?: string;
  AlunoRa?: string;
  TurmaSemestre?: string;
};

function normalizeStatus(raw: unknown): MatriculaStatus {
  const value = String(raw ?? "").toLowerCase();
  if (value.includes("pend")) return "PENDENTE";
  if (value.includes("cancel")) return "CANCELADA";
  return "ATIVA";
}

function demoMatriculas(): MatriculaRow[] {
  return enrollments.map((matricula, idx) => {
    const aluno = students.find((item) => item.id === matricula.studentId);
    const turma = classes[idx % classes.length];
    return {
      id: String(matricula.id),
      aluno: aluno?.name ?? `Aluno ${matricula.studentId}`,
      curso: aluno?.course ?? turma.course,
      turma: `T-${String(turma.id).padStart(3, "0")}`,
      status: matricula.status,
      dataSolicitacao: matricula.createdAt,
    };
  });
}

function mapApiMatricula(row: ApiMatricula, index: number): MatriculaRow {
  const id = row.id ?? row.Id ?? `api_matricula_${index + 1}`;
  const createdAt =
    row.createdAt ?? row.CreatedAt ?? row.dataCriacao ?? row.DataCriacao ?? new Date().toISOString();

  return {
    id: String(id),
    aluno: String(row.alunoNome ?? row.AlunoNome ?? row.alunoRa ?? row.AlunoRa ?? `Aluno ${index + 1}`),
    curso: String(row.cursoNome ?? row.CursoNome ?? "Curso"),
    turma: String(row.turmaNome ?? row.TurmaNome ?? row.turmaSemestre ?? row.TurmaSemestre ?? `T-${String(index + 1).padStart(3, "0")}`),
    status: normalizeStatus(row.status ?? row.Status),
    dataSolicitacao: createdAt,
  };
}

export const matriculasRepository = {
  async list(): Promise<MatriculaRow[]> {
    const fallback = demoMatriculas();
    if (USE_DEMO_FALLBACK) return fallback;
    if (!API_URL) {
      if (STRICT_API) {
        throw new Error("API_URL não configurada para listar matrículas em modo estrito");
      }
      return fallback;
    }

    try {
      const res = await api.get<ApiMatricula[]>("/Matriculas");
      const data = Array.isArray(res.data) ? res.data : [];
      if (data.length === 0) {
        return [];
      }
      return data.map(mapApiMatricula);
    } catch (error) {
      if (USE_DEMO_FALLBACK) return fallback;
      throw error;
    }
  },
};
