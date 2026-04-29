import { API_URL } from "@/config/env";
import { api } from "@/services/api";
import { getAdminMetrics as getAdminMetricsMock, type AdminMetrics } from "@/mocks/metrics";

type ApiAluno = {
  id?: number;
  cursoNome?: string;
  CursoNome?: string;
};

type ApiProfessor = {
  id?: number;
};

type ApiTurma = {
  id?: number;
};

type ApiMatricula = {
  id?: number;
  status?: string;
  Status?: string;
};

type ApiInscricao = {
  status?: string;
  Status?: string;
};

export function getAdminMetrics(): AdminMetrics {
  return getAdminMetricsMock();
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  if (!API_URL) return getAdminMetricsMock();

  const [alunosRes, professoresRes, turmasRes, matriculasRes, inscricoesRes] = await Promise.all([
    api.get<ApiAluno[]>("/Alunos"),
    api.get<ApiProfessor[]>("/Professor"),
    api.get<ApiTurma[]>("/Turmas"),
    api.get<ApiMatricula[]>("/Matriculas"),
    api.get<ApiInscricao[]>("/inscricoes/pendentes"),
  ]);

  const alunos = Array.isArray(alunosRes.data) ? alunosRes.data : [];
  const professores = Array.isArray(professoresRes.data) ? professoresRes.data : [];
  const turmas = Array.isArray(turmasRes.data) ? turmasRes.data : [];
  const matriculas = Array.isArray(matriculasRes.data) ? matriculasRes.data : [];
  const inscricoes = Array.isArray(inscricoesRes.data) ? inscricoesRes.data : [];

  const distributionMap = new Map<string, number>();
  for (const aluno of alunos) {
    const curso = aluno.cursoNome ?? aluno.CursoNome ?? "Curso";
    distributionMap.set(curso, (distributionMap.get(curso) ?? 0) + 1);
  }

  const distribution = Array.from(distributionMap.entries()).map(([name, value]) => ({
    name,
    value,
  }));

  const pendingEnrollments = inscricoes.filter((i) => (i.status ?? i.Status) === "PENDENTE").length;
  const pendingMatriculas = matriculas.filter((m) => {
    const value = (m.status ?? m.Status ?? "").toString().toLowerCase();
    return value.includes("pend");
  }).length;

  return {
    studentsTotal: alunos.length,
    teachersTotal: professores.length,
    activeClasses: turmas.length,
    newEnrollmentsSemester: pendingMatriculas,
    dropoutRateSemester: 0,
    delinquencyRate: 0,
    pendingEnrollments,
    docsToValidate: 0,
    classesWithoutTeacher: 0,
    distribution,
  };
}
