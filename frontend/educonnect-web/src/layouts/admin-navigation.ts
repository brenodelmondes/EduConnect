import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  School2,
  Users,
} from "lucide-react";

export type AdminNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  description: string;
};

export type AdminNavGroup = {
  label: string;
  items: AdminNavItem[];
};

export const adminNavGroups: AdminNavGroup[] = [
  {
    label: "Visão Geral",
    items: [
      {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: LayoutDashboard,
        description: "Indicadores acadêmicos, pendências e performance do semestre.",
      },
    ],
  },
  {
    label: "Cadastros",
    items: [
      {
        label: "Alunos",
        to: "/admin/alunos",
        icon: Users,
        description: "Base acadêmica, status e acompanhamento de estudantes.",
      },
      {
        label: "Professores",
        to: "/admin/professores",
        icon: GraduationCap,
        description: "Gestão de docentes e distribuição de responsabilidades.",
      },
    ],
  },
  {
    label: "Operação",
    items: [
      {
        label: "Turmas",
        to: "/admin/turmas",
        icon: School2,
        description: "Turmas ativas, alocação de docentes e ocupação.",
      },
      {
        label: "Matrículas",
        to: "/admin/matriculas",
        icon: ClipboardList,
        description: "Solicitações, aprovações e status das matrículas.",
      },
      {
        label: "Calendário",
        to: "/admin/calendario",
        icon: CalendarDays,
        description: "Agenda institucional com eventos administrativos.",
      },
    ],
  },
];

export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((group) => group.items);
