const TOKEN_KEY = "educonnect:token";
const ROLE_KEY = "educonnect:role";

export type UserRole = "ADMIN" | "PROFESSOR" | "ALUNO";

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  getRole: () => localStorage.getItem(ROLE_KEY) as UserRole | null,
  setRole: (r: UserRole) => localStorage.setItem(ROLE_KEY, r),
  clearRole: () => localStorage.removeItem(ROLE_KEY),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  },
};
