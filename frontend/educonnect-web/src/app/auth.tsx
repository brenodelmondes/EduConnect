import React, { createContext, useContext, useMemo, useState } from "react";
import { storage } from "@/utils/storage";
import type { UserRole } from "@/utils/storage";

type AuthState = {
  token: string | null;
  role: UserRole | null;
  userId: number | null;
  profileName: string | null;
};

type AuthContextType = AuthState & {
  isAuthenticated: boolean;
  login: (token: string, role: UserRole, userId?: number | null, profileName?: string | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => storage.getToken());
  const [role, setRole] = useState<UserRole | null>(() => storage.getRole());
  const [userId, setUserId] = useState<number | null>(() => storage.getUserId());
  const [profileName, setProfileName] = useState<string | null>(() => storage.getProfileName());

  const login = (
    newToken: string,
    newRole: UserRole,
    newUserId?: number | null,
    newProfileName?: string | null
  ) => {
    storage.setToken(newToken);
    storage.setRole(newRole);
    setToken(newToken);
    setRole(newRole);

    if (typeof newUserId === "number" && Number.isFinite(newUserId)) {
      storage.setUserId(newUserId);
      setUserId(newUserId);
    } else {
      storage.clearUserId();
      setUserId(null);
    }

    if (typeof newProfileName === "string" && newProfileName.trim()) {
      storage.setProfileName(newProfileName);
      setProfileName(newProfileName);
    } else {
      storage.clearProfileName();
      setProfileName(null);
    }
  };

  const logout = () => {
    storage.clearAuth();
    setToken(null);
    setRole(null);
    setUserId(null);
    setProfileName(null);
  };

  const value = useMemo(
    () => ({ token, role, userId, profileName, isAuthenticated: !!token, login, logout }),
    [token, role, userId, profileName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
