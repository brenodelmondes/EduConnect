import { Outlet, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  CalendarDays,
} from "lucide-react";
import { ThemeToggle as ModeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";

const navItemClass =
  "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        {/* SIDEBAR */}
        <aside className="hidden w-64 border-r bg-background/60 backdrop-blur md:sticky md:top-0 md:flex md:h-screen md:flex-col md:shrink-0">
          <div className="flex h-14 items-center px-4 border-b">
            <span className="font-semibold">EduConnect</span>
          </div>

          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive
                  ? `${navItemClass} bg-accent text-foreground`
                  : navItemClass
              }
            >
              <LayoutDashboard size={18} /> Dashboard
            </NavLink>

            <NavLink
              to="/admin/alunos"
              className={({ isActive }) =>
                isActive
                  ? `${navItemClass} bg-accent text-foreground`
                  : navItemClass
              }
            >
              <Users size={18} /> Alunos
            </NavLink>

            <NavLink
              to="/admin/professores"
              className={({ isActive }) =>
                isActive
                  ? `${navItemClass} bg-accent text-foreground`
                  : navItemClass
              }
            >
              <GraduationCap size={18} /> Professores
            </NavLink>

            <NavLink
              to="/admin/calendario"
              className={({ isActive }) =>
                isActive
                  ? `${navItemClass} bg-accent text-foreground`
                  : navItemClass
              }
            >
              <CalendarDays size={18} /> Calendário
            </NavLink>
          </nav>

          <div className="p-3 mt-auto">
            <LogoutButton />
          </div>
        </aside>

        {/* CONTEÚDO */}
        <div className="flex-1">
          {/* TOPBAR */}
          <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
            <div className="flex h-14 items-center justify-between px-4">
              <div className="text-sm text-muted-foreground">
                Área Administrativa
              </div>

              <div className="flex items-center gap-2">
                <ModeToggle />
                <span className="text-sm text-muted-foreground">
                  Olá, Admin
                </span>
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6 bg-muted/30">
            <div className="rounded-xl bg-background p-4 md:p-6 shadow-sm">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
