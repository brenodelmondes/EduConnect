const TOKEN_KEY = "educonnect:token";
const ROLE_KEY = "educonnect:role";
const USER_ID_KEY = "educonnect:userId";
const PROFILE_NAME_KEY = "educonnect:profileName";

export type UserRole = "ADMIN" | "PROFESSOR" | "ALUNO";

export const storage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  getRole: () => localStorage.getItem(ROLE_KEY) as UserRole | null,
  setRole: (r: UserRole) => localStorage.setItem(ROLE_KEY, r),
  clearRole: () => localStorage.removeItem(ROLE_KEY),

  getUserId: () => {
    const raw = localStorage.getItem(USER_ID_KEY);
    const n = raw ? Number(raw) : NaN;
    return Number.isFinite(n) ? n : null;
  },
  setUserId: (id: number) => localStorage.setItem(USER_ID_KEY, String(id)),
  clearUserId: () => localStorage.removeItem(USER_ID_KEY),

  getProfileName: () => localStorage.getItem(PROFILE_NAME_KEY),
  setProfileName: (name: string) => localStorage.setItem(PROFILE_NAME_KEY, name),
  clearProfileName: () => localStorage.removeItem(PROFILE_NAME_KEY),

  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(PROFILE_NAME_KEY);
  },
};
