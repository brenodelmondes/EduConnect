import { Outlet, NavLink } from "react-router-dom";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* fundo leve */}
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(79,124,255,0.18),transparent_55%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(79,124,255,0.22),transparent_55%)]" />

      {/* header */}
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <span className="font-semibold">EduConnect</span>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <NavLink to="/login" className={({isActive}) => isActive ? "text-foreground" : ""}>Login</NavLink>
              <NavLink to="/inscricao" className={({isActive}) => isActive ? "text-foreground" : ""}>Inscrição</NavLink>
            </nav>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* centro */}
      <main className="mx-auto grid min-h-[calc(100vh-3.5rem)] max-w-6xl place-items-center px-4 py-10">
        <Outlet />
      </main>
    </div>
  );
}