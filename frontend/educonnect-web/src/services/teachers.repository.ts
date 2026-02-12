import { DEMO_MODE } from "@/config/env";
import { api } from "@/services/api";
import { teachersService, type TeacherRecord } from "@/services/teachers";

type ApiProfessor = {
  id?: number;
  usuarioNome?: string;
  usuarioEmail?: string;
  departamentoNome?: string;
  active?: boolean;

  // fallback PascalCase
  Id?: number;
  UsuarioNome?: string;
  UsuarioEmail?: string;
  DepartamentoNome?: string;
  Active?: boolean;
};

function mapApiProfessor(p: ApiProfessor): TeacherRecord {
  const id = p.id ?? p.Id;
  const name = p.usuarioNome ?? p.UsuarioNome;
  const email = p.usuarioEmail ?? p.UsuarioEmail;
  const department = p.departamentoNome ?? p.DepartamentoNome;

  // Observação: o endpoint atual no backend retorna a Entity Professor,
  // que não traz nome/email/departamento por extenso. Se estiver incompleto,
  // força fallback para o demo mode.
  if (!id || !name || !email || !department) {
    throw new Error("API retornou professor em formato inesperado");
  }

  return {
    id,
    name,
    email,
    department,
    active: p.active ?? p.Active ?? true,
  };
}

export const teachersRepository = {
  async list(): Promise<TeacherRecord[]> {
    if (DEMO_MODE) return teachersService.list();

    try {
      const res = await api.get<ApiProfessor[]>("/Professor");
      const data = Array.isArray(res.data) ? res.data : [];
      return data.map(mapApiProfessor);
    } catch {
      return teachersService.list();
    }
  },
};
