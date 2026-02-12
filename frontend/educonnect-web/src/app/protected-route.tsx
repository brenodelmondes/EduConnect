import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/app/auth";
import type { UserRole } from "@/utils/storage";

export function ProtectedRoute({ allowed }: { allowed: UserRole[] }) {
  const { isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!role || !allowed.includes(role)) return <Navigate to="/login" replace />;

  return <Outlet />;
}
