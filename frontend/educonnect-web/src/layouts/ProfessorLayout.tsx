import { Outlet } from "react-router-dom";

import { PortalTopbar } from "@/components/portal-topbar";
import { StudentPortalProvider } from "@/app/student-portal";

export function ProfessorLayout() {
  return (
    <StudentPortalProvider>
      <div className="min-h-screen bg-background">
        <PortalTopbar
          homeTo="/professor/inicio"
          preferencesTo={null}
          links={[
            { label: "Início", to: "/professor/inicio" },
            { label: "Painel", to: "/professor/painel" },
            { label: "Meus cursos", to: "/professor/meus-cursos" },
            { label: "Calendário", to: "/professor/calendario" },
            { label: "Serviços digitais", to: "/professor/servicos-digitais" },
            { label: "Notas", to: "/professor/notas" },
          ]}
        />
        <main>
          <Outlet />
        </main>
      </div>
    </StudentPortalProvider>
  );
}
