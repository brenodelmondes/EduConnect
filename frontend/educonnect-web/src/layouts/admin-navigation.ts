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
    label: "Visao Geral",
    items: [
      {
        label: "Dashboard",
        to: "/admin/dashboard",
        icon: LayoutDashboard,
        description: "Indicadores academicos, pendencias e performance do semestre.",
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
        description: "Base academica, status e acompanhamento de estudantes.",
      },
      {
        label: "Professores",
        to: "/admin/professores",
        icon: GraduationCap,
        description: "Gestao de docentes e distribuicao de responsabilidades.",
      },
    ],
  },
  {
    label: "Operacao",
    items: [
      {
        label: "Turmas",
        to: "/admin/turmas",
        icon: School2,
        description: "Turmas ativas, alocacao de docentes e ocupacao.",
      },
      {
        label: "Matriculas",
        to: "/admin/matriculas",
        icon: ClipboardList,
        description: "Solicitacoes, aprovacoes e status das matriculas.",
      },
      {
        label: "Calendario",
        to: "/admin/calendario",
        icon: CalendarDays,
        description: "Agenda institucional com eventos administrativos.",
      },
    ],
  },
];

export const adminNavItems: AdminNavItem[] = adminNavGroups.flatMap((group) => group.items);
