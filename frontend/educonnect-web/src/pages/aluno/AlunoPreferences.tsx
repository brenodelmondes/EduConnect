import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AlunoPreferences() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Preferencias</h1>
        <p className="text-sm text-muted-foreground">Configuracoes pessoais do portal.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aparencia</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Tema</p>
            <p className="text-xs text-muted-foreground">Alternar entre claro e escuro.</p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Outras preferencias (dados cadastrais, notificacoes e privacidade) serao adicionadas na
          integracao com a API.
        </CardContent>
      </Card>
    </div>
  );
}
