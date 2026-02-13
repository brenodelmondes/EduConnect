import { NavLink, Outlet } from "react-router-dom";

import { cn } from "@/lib/utils";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { adminNavGroups } from "@/layouts/admin-navigation";

const navItemClass =
  "flex items-start gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground";

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30">
      <div className="flex">
        <aside className="hidden w-72 border-r bg-background/90 md:sticky md:top-0 md:flex md:h-screen md:flex-col md:shrink-0">
          <div className="border-b px-5 py-4">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">EduConnect</p>
            <p className="mt-1 text-lg font-semibold">Console Admin</p>
          </div>

          <nav className="min-h-0 flex-1 space-y-5 overflow-y-auto px-3 py-4">
            {adminNavGroups.map((group) => (
              <div key={group.label} className="space-y-1">
                <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/80">
                  {group.label}
                </p>
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        navItemClass,
                        isActive && "bg-accent text-foreground shadow-sm ring-1 ring-border"
                      )
                    }
                  >
                    <item.icon className="mt-0.5 h-4 w-4 shrink-0" />
                    <span className="grid">
                      <span className="font-medium">{item.label}</span>
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    </span>
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <AdminTopbar />
          <main className="p-4 md:p-6">
            <div className="mx-auto w-full max-w-7xl rounded-2xl border bg-card/75 p-4 shadow-sm backdrop-blur md:p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
