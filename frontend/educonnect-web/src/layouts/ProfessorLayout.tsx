import { Outlet } from "react-router-dom";

import { PortalTopbar } from "@/components/portal-topbar";
import { StudentPortalProvider } from "@/app/student-portal";

export function ProfessorLayout() {
  return (
    <StudentPortalProvider>
      <div className="min-h-screen bg-background">
        <PortalTopbar
          homeTo="/professor/dashboard"
          preferencesTo={null}
          links={[{ label: "Painel", to: "/professor/dashboard" }]}
        />
        <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </StudentPortalProvider>
  );
}
