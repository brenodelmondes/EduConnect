import { Bell, ChevronDown } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/auth";
import { useStudentPortal } from "@/app/student-portal";
import { BrandMark } from "@/components/brand/BrandMark";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type LinkItem = { label: string; to: string };

function shortRole(role: string | null) {
  if (!role) return "Conta";
  if (role === "ALUNO") return "Aluno";
  if (role === "PROFESSOR") return "Professor";
  return "Admin";
}

function isActivePath(currentPath: string, target: string) {
  if (target === "/") return currentPath === "/";
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

export function PortalTopbar({
  links,
  homeTo,
  preferencesTo,
}: {
  links: LinkItem[];
  homeTo: string;
  preferencesTo?: string | null;
}) {
  const { role, logout, profileName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { notifications } = useStudentPortal();

  const unreadCount = notifications.filter((item) => item.unread).length;
  const portalPrefix = `/${homeTo.split("/").filter(Boolean)[0] ?? "aluno"}`;
  const preferencesPath = preferencesTo ?? `${portalPrefix}/preferencias`;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
          onClick={() => navigate(homeTo)}
          aria-label="Voltar ao início"
        >
          <BrandMark variant="compact" />
        </button>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((linkItem) => {
            const active = isActivePath(location.pathname, linkItem.to);
            return (
              <NavLink
                key={linkItem.to}
                to={linkItem.to}
                className={cn(
                  "rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {linkItem.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notificações">
                <span className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  ) : null}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="px-2 py-6 text-sm text-muted-foreground">Sem notificações no momento.</div>
              ) : (
                notifications.slice(0, 8).map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    className={cn("items-start gap-2", item.unread ? "bg-muted/40" : "")}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <div className="min-w-0">
                      <span className="truncate text-sm font-medium">{item.title}</span>
                      <div className="mt-0.5 text-xs text-muted-foreground">{item.category}</div>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback>{shortRole(role).slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm md:inline">{profileName ?? shortRole(role)}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {preferencesPath ? (
                <>
                  <DropdownMenuItem onSelect={() => navigate(preferencesPath)}>Preferências</DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem
                onSelect={() => {
                  logout();
                  navigate("/login");
                }}
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-2 py-2">
          {links.map((linkItem) => {
            const active = isActivePath(location.pathname, linkItem.to);
            return (
              <NavLink
                key={linkItem.to}
                to={linkItem.to}
                className={cn(
                  "whitespace-nowrap rounded-md px-3 py-2 text-sm",
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {linkItem.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    </header>
  );
}
