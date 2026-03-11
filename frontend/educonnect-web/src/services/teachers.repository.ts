import { API_URL, STRICT_API, USE_DEMO_FALLBACK } from "@/config/env";
import { api } from "@/services/api";
import { teachersService, type TeacherRecord } from "@/services/teachers";

type ApiProfessor = {
  id?: number;
  usuarioNome?: string;
  usuarioEmail?: string;
  departamentoNome?: string;
  active?: boolean;

  Id?: number;
  UsuarioNome?: string;
  UsuarioEmail?: string;
  DepartamentoNome?: string;
  Active?: boolean;
};

function mapApiProfessor(input: ApiProfessor): TeacherRecord {
  const id = input.id ?? input.Id;
  const name = input.usuarioNome ?? input.UsuarioNome;
  const email = input.usuarioEmail ?? input.UsuarioEmail;
  const department = input.departamentoNome ?? input.DepartamentoNome;

  if (!id || !name || !email || !department) {
    throw new Error("API retornou professor em formato inesperado");
  }

  return {
    id,
    name,
    email,
    department,
    active: input.active ?? input.Active ?? true,
  };
}

export const teachersRepository = {
  async list(): Promise<TeacherRecord[]> {
    if (USE_DEMO_FALLBACK) return teachersService.list();
    if (!API_URL) {
      if (STRICT_API) {
        throw new Error("API_URL não configurada para listar professores em modo estrito");
      }
      return teachersService.list();
    }

    try {
      const response = await api.get<ApiProfessor[]>("/Professor");
      const data = Array.isArray(response.data) ? response.data : [];
      if (data.length === 0) {
        if (STRICT_API) {
          throw new Error("API retornou lista vazia de professores em modo estrito");
        }
        return teachersService.list();
      }
      return data.map(mapApiProfessor);
    } catch (error) {
      if (STRICT_API) throw error;
      return teachersService.list();
    }
  },
};
