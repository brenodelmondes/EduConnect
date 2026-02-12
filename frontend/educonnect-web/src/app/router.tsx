import { ProtectedRoute } from "@/app/protected-route";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProfessorLayout } from "@/layouts/ProfessorLayout";
import { AlunoLayout } from "@/layouts/AlunoLayout";

import { LoginPage } from "@/pages/public/LoginPage";
import { InscricaoPage } from "@/pages/public/InscricaoPage";

const AdminDashboard = lazy(() =>
  import("@/pages/admin/AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);
const AdminStudents = lazy(() =>
  import("@/pages/admin/AdminStudents").then((m) => ({ default: m.AdminStudents }))
);
const AdminTeachers = lazy(() =>
  import("@/pages/admin/AdminTeachers").then((m) => ({ default: m.AdminTeachers }))
);
const AdminCalendar = lazy(() =>
  import("@/pages/admin/AdminCalendar").then((m) => ({ default: m.AdminCalendar }))
);
const ProfessorDashboard = lazy(() =>
  import("@/pages/professor/ProfessorDashboard").then((m) => ({ default: m.ProfessorDashboard }))
);
const AlunoDashboard = lazy(() =>
  import("@/pages/aluno/AlunoDashboard").then((m) => ({ default: m.AlunoDashboard }))
);

function RouteLoader() {
  return (
    <div className="p-6 text-sm text-muted-foreground">Carregando…</div>
  );
}

function withSuspense(element: React.ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/login" replace /> },

  {
    element: <PublicLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/inscricao", element: <InscricaoPage /> },
    ],
  },

  {
    element: <ProtectedRoute allowed={["ADMIN"]} />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: withSuspense(<AdminDashboard />) },
          { path: "alunos", element: withSuspense(<AdminStudents />) },
          { path: "professores", element: withSuspense(<AdminTeachers />) },
          { path: "calendario", element: withSuspense(<AdminCalendar />) },
        ],
      },
    ],
  },

  {
    element: <ProtectedRoute allowed={["PROFESSOR"]} />,
    children: [
      {
        path: "/professor",
        element: <ProfessorLayout />,
        children: [{ path: "dashboard", element: withSuspense(<ProfessorDashboard />) }],
      },
    ],
  },

  {
    element: <ProtectedRoute allowed={["ALUNO"]} />,
    children: [
      {
        path: "/aluno",
        element: <AlunoLayout />,
        children: [{ path: "dashboard", element: withSuspense(<AlunoDashboard />) }],
      },
    ],
  },
]);
