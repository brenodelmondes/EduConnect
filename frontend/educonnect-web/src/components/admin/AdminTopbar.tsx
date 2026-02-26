import { Bell, ChevronDown, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/auth";
import { ThemeToggle } from "@/components/theme-toggle";
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
import { Input } from "@/components/ui/input";
import { adminNavItems } from "@/layouts/admin-navigation";

const adminNotifications = [
  {
    id: "admin_n1",
    title: "2 turmas sem docente responsável",
    category: "Operação",
  },
  {
    id: "admin_n2",
    title: "12 matrículas pendentes de validação",
    category: "Matrículas",
  },
  {
    id: "admin_n3",
    title: "Atualização de dados acadêmicos concluída",
    category: "Sistema",
  },
];

export function AdminTopbar() {
  const { role, profileName, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeItem =
    adminNavItems.find(
      (item) =>
        location.pathname === item.to || location.pathname.startsWith(`${item.to}/`)
    ) ?? adminNavItems[0];

  const initials = (profileName ?? role ?? "Admin")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join("")
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Área administrativa</p>
          <h1 className="truncate text-sm font-semibold md:text-base">{activeItem.label}</h1>
        </div>

        <div className="hidden flex-1 items-center justify-center px-2 lg:flex">
          <div className="relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Busca rápida"
              placeholder="Busca rápida por alunos, turmas ou matrículas"
              className="pl-9"
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Notificações">
                <span className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-1 -top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
                    {adminNotifications.length}
                  </span>
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notificações administrativas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {adminNotifications.map((item) => (
                <DropdownMenuItem key={item.id} onSelect={(e) => e.preventDefault()}>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.category}</p>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{initials || "AD"}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm md:inline">{profileName ?? "Administrador"}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate("/admin/dashboard")}>Ver dashboard</DropdownMenuItem>
              <DropdownMenuSeparator />
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
      <div className="border-t px-4 py-2 text-xs text-muted-foreground md:px-6">{activeItem.description}</div>
    </header>
  );
}
