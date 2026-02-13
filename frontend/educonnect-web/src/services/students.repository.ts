import { DEMO_MODE } from "@/config/env";
import { api } from "@/services/api";
import { studentsService, type StudentRecord } from "@/services/students";

type ApiAluno = {
  id?: number;
  usuarioNome?: string;
  usuarioEmail?: string;
  cursoNome?: string;

  Id?: number;
  UsuarioNome?: string;
  UsuarioEmail?: string;
  CursoNome?: string;
};

function todayIso() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function mapApiAluno(input: ApiAluno): StudentRecord {
  const id = input.id ?? input.Id;
  const name = input.usuarioNome ?? input.UsuarioNome;
  const email = input.usuarioEmail ?? input.UsuarioEmail;
  const course = input.cursoNome ?? input.CursoNome;

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
  };
}

export const studentsRepository = {
  async list(): Promise<StudentRecord[]> {
    if (DEMO_MODE) return studentsService.list();

    try {
      const response = await api.get<ApiAluno[]>("/Alunos");
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length === 0) return studentsService.list();
      return data.map(mapApiAluno);
    } catch {
      return studentsService.list();
    }
  },
};
