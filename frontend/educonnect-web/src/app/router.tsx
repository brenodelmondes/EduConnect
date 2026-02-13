import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { ProtectedRoute } from "@/app/protected-route";
import { AdminLayout } from "@/layouts/AdminLayout";
import { AlunoLayout } from "@/layouts/AlunoLayout";
import { ProfessorLayout } from "@/layouts/ProfessorLayout";
import { PublicLayout } from "@/layouts/PublicLayout";
import { InscricaoPage } from "@/pages/public/InscricaoPage";
import { LoginPage } from "@/pages/public/LoginPage";

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
const AdminTurmas = lazy(() =>
  import("@/pages/admin/AdminTurmas").then((m) => ({ default: m.AdminTurmas }))
);
const AdminMatriculas = lazy(() =>
  import("@/pages/admin/AdminMatriculas").then((m) => ({ default: m.AdminMatriculas }))
);

const ProfessorDashboard = lazy(() =>
  import("@/pages/professor/ProfessorDashboard").then((m) => ({ default: m.ProfessorDashboard }))
);

const AlunoDashboard = lazy(() =>
  import("@/pages/aluno/AlunoDashboard").then((m) => ({ default: m.AlunoDashboard }))
);
const AlunoHome = lazy(() =>
  import("@/pages/aluno/AlunoHome").then((m) => ({ default: m.AlunoHome }))
);
const AlunoPanel = lazy(() =>
  import("@/pages/aluno/AlunoPanel").then((m) => ({ default: m.AlunoPanel }))
);
const AlunoCourses = lazy(() =>
  import("@/pages/aluno/AlunoCourses").then((m) => ({ default: m.AlunoCourses }))
);
const AlunoGrades = lazy(() =>
  import("@/pages/aluno/AlunoGrades").then((m) => ({ default: m.AlunoGrades }))
);
const AlunoServices = lazy(() =>
  import("@/pages/aluno/AlunoServices").then((m) => ({ default: m.AlunoServices }))
);
const AlunoPreferences = lazy(() =>
  import("@/pages/aluno/AlunoPreferences").then((m) => ({ default: m.AlunoPreferences }))
);

function RouteLoader() {
  return <div className="p-6 text-sm text-muted-foreground">Carregando...</div>;
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
          { path: "turmas", element: withSuspense(<AdminTurmas />) },
          { path: "matriculas", element: withSuspense(<AdminMatriculas />) },
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
        children: [
          { index: true, element: <Navigate to="inicio" replace /> },
          { path: "inicio", element: withSuspense(<AlunoHome />) },
          { path: "painel", element: withSuspense(<AlunoPanel />) },
          { path: "meus-cursos", element: withSuspense(<AlunoCourses />) },
          { path: "servicos-digitais", element: withSuspense(<AlunoServices />) },
          { path: "notas", element: withSuspense(<AlunoGrades />) },
          { path: "preferencias", element: withSuspense(<AlunoPreferences />) },
          { path: "dashboard", element: withSuspense(<AlunoDashboard />) },
        ],
      },
    ],
  },
]);
