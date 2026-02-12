import { Outlet, Link } from "react-router-dom";

export function AlunoLayout() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", minHeight: "100vh" }}>
      <aside style={{ padding: 16, borderRight: "1px solid var(--border)" }}>
        <h3 style={{ marginTop: 0 }}>Aluno</h3>
        <nav style={{ display: "grid", gap: 8 }}>
          <Link to="/aluno/dashboard">Dashboard</Link>
        </nav>
      </aside>
      <main style={{ padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
