import { Outlet } from "react-router-dom";

import { StudentPortalProvider } from "@/app/student-portal";
import { PortalTopbar } from "@/components/portal-topbar";

export function AlunoLayout() {
  return (
    <StudentPortalProvider>
      <div className="min-h-screen bg-background">
        <PortalTopbar
          homeTo="/aluno/inicio"
          preferencesTo="/aluno/preferencias"
          links={[
            { label: "Início", to: "/aluno/inicio" },
            { label: "Painel", to: "/aluno/painel" },
            { label: "Meus cursos", to: "/aluno/meus-cursos" },
            { label: "Calendário", to: "/aluno/calendario" },
            { label: "Serviços digitais", to: "/aluno/servicos-digitais" },
            { label: "Notas", to: "/aluno/notas" },
          ]}
        />

        <main>
          <Outlet />
        </main>
      </div>
    </StudentPortalProvider>
  );
}

