import { DEMO_MODE } from "@/config/env";
import { api } from "@/services/api";
import { studentsService, type StudentRecord } from "@/services/students";

type ApiAluno = {
  id?: number;
  usuarioNome?: string;
  usuarioEmail?: string;
  ra?: string;
  cursoNome?: string;

  // fallback PascalCase
  Id?: number;
  UsuarioNome?: string;
  UsuarioEmail?: string;
  Ra?: string;
  CursoNome?: string;
};

function todayIso() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mapApiAluno(a: ApiAluno): StudentRecord & { ra?: string } {
  const id = a.id ?? a.Id;
  const name = a.usuarioNome ?? a.UsuarioNome;
  const email = a.usuarioEmail ?? a.UsuarioEmail;
  const course = a.cursoNome ?? a.CursoNome;
  const ra = a.ra ?? a.Ra;

  if (!id || !name || !email || !course) {
    throw new Error("API retornou aluno em formato inesperado");
  }

  return {
    id,
    name,
    email,
    course,
    active: true,
    enrolledAt: todayIso(),
    ra,
  };
}

export const studentsRepository = {
  async list(): Promise<Array<StudentRecord & { ra?: string }>> {
    if (DEMO_MODE) return studentsService.list();

    try {
      const res = await api.get<ApiAluno[]>("/Alunos");
      const data = Array.isArray(res.data) ? res.data : [];
      return data.map(mapApiAluno);
    } catch {
      return studentsService.list();
    }
  },
};
