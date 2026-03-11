import type { UserRole } from "@/utils/storage";

import { API_URL } from "@/config/env";
import { api } from "@/services/api";

type LoginResultDto = {
  token?: string;
  perfilNome?: string;

  // PascalCase (mais comum no backend .NET)
  Token?: string;
  PerfilNome?: string;

  // extras (não são necessários para o front agora)
  id?: number;
  nome?: string;
  email?: string;
  perfilId?: number;

  Id?: number;
  Nome?: string;
  Email?: string;
  PerfilId?: number;
};

function normalizeRole(perfilNome: string): UserRole {
  const p = perfilNome.trim().toLowerCase();
  if (p.includes("admin")) return "ADMIN";
  if (p.includes("prof")) return "PROFESSOR";
  if (p.includes("alun")) return "ALUNO";
  // fallback seguro
  return "ALUNO";
}

export const authService = {
  isApiConfigured() {
    return !!API_URL;
  },

  async login(
    email: string,
    senha: string
  ): Promise<{ token: string; role: UserRole; perfilNome: string; userId: number }> {
    if (!API_URL) {
      throw new Error("API_URL não configurada");
    }

    const res = await api.post<LoginResultDto>("/Auth/login", { email, senha });
    const token = res.data.token ?? res.data.Token;
    const perfilNome = res.data.perfilNome ?? res.data.PerfilNome;
    const userId = res.data.id ?? res.data.Id;

    if (!token || !perfilNome || typeof userId !== "number") {
      throw new Error("Resposta de login inesperada");
    }

    return {
      token,
      role: normalizeRole(perfilNome),
      perfilNome,
      userId,
    };
  },
};
