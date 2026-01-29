import { NavLink } from "react-router-dom";
import type { ReactNode } from "react";

export function SidebarNavItem({
  to,
  icon,
  children,
}: {
  to: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const base =
    "flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground";

  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        isActive ? `${base} bg-accent text-foreground` : base
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}
