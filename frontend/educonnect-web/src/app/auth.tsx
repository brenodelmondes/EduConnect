import React, { createContext, useContext, useMemo, useState } from "react";
import { storage } from "@/utils/storage";
import type { UserRole } from "@/utils/storage";

type AuthState = {
  token: string | null;
  role: UserRole | null;
};

type AuthContextType = AuthState & {
  isAuthenticated: boolean;
  login: (token: string, role: UserRole) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [role, setRole] = useState<UserRole | null>(() => storage.getRole());

  const login = (newToken: string, newRole: UserRole) => {
    storage.setToken(newToken);
    storage.setRole(newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    storage.clearAuth();
    setToken(null);
    setRole(null);
  };

  const value = useMemo(
    () => ({ token, role, isAuthenticated: !!token, login, logout }),
    [token, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
