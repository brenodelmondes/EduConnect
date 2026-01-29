import { ProtectedRoute } from "@/app/protected-route";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout } from "@/layouts/AdminLayout";
import { ProfessorLayout } from "@/layouts/ProfessorLayout";
import { AlunoLayout } from "@/layouts/AlunoLayout";

import { LoginPage } from "@/pages/public/LoginPage";
import { InscricaoPage } from "@/pages/public/InscricaoPage";

import { AdminDashboard } from "@/pages/admin/AdminDashboard";
import { ProfessorDashboard } from "@/pages/professor/ProfessorDashboard";
import { AlunoDashboard } from "@/pages/aluno/AlunoDashboard";

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
        children: [{ path: "dashboard", element: <AdminDashboard /> }],
      },
    ],
  },

  {
    element: <ProtectedRoute allowed={["PROFESSOR"]} />,
    children: [
      {
        path: "/professor",
        element: <ProfessorLayout />,
        children: [{ path: "dashboard", element: <ProfessorDashboard /> }],
      },
    ],
  },

  {
    element: <ProtectedRoute allowed={["ALUNO"]} />,
    children: [
      {
        path: "/aluno",
        element: <AlunoLayout />,
        children: [{ path: "dashboard", element: <AlunoDashboard /> }],
      },
    ],
  },
]);
