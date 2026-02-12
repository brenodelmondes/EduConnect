import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth";
import { API_URL } from "@/config/env";
import { authService } from "@/services/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(3),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [canUseDemoFallback, setCanUseDemoFallback] = useState(false);

  const preferApi = useMemo(() => authService.isApiConfigured(), []);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "" },
  });

  const goToHomeByRole = (role: "ADMIN" | "PROFESSOR" | "ALUNO") => {
    if (role === "ADMIN") nav("/admin/dashboard");
    if (role === "PROFESSOR") nav("/professor/dashboard");
    if (role === "ALUNO") nav("/aluno/dashboard");
  };

  const demoLogin = (email: string) => {
    const e = email.toLowerCase();
    const role = e.includes("admin") ? "ADMIN" : e.includes("prof") ? "PROFESSOR" : "ALUNO";
    login("mock-token", role);
    goToHomeByRole(role);
  };

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    setSubmitError(null);
    setCanUseDemoFallback(false);

    try {
      if (!preferApi) {
        demoLogin(data.email);
        return;
      }

      const res = await authService.login(data.email, data.senha);
      login(res.token, res.role);
      goToHomeByRole(res.role);
    } catch {
      // Se a API estiver configurada, falha deve ser explícita.
      // Ainda assim, mantém a opção de fallback demo para não travar a apresentação.
      setSubmitError(
        API_URL
          ? "Não foi possível autenticar na API. Verifique o backend e tente novamente."
          : "Modo demonstração indisponível."
      );
      setCanUseDemoFallback(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Entre para acessar sua área.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="seu@email.com" {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" placeholder="••••••••" {...form.register("senha")} />
            {form.formState.errors.senha && (
              <p className="text-sm text-destructive">{form.formState.errors.senha.message}</p>
            )}
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Entrando…" : "Entrar"}
          </Button>

          {submitError ? (
            <div className="grid gap-2">
              <p className="text-sm text-destructive">{submitError}</p>
              {canUseDemoFallback ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => demoLogin(form.getValues("email"))}
                >
                  Entrar em modo demonstração
                </Button>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {preferApi ? (
              <>Conectado à API: <b>{API_URL}</b></>
            ) : (
              <>Dica (MVP): email contendo <b>admin</b> ou <b>prof</b> muda o perfil.</>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
