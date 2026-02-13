import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/app/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/config/env";
import { authService } from "@/services/auth";

const schema = z.object({
  email: z.string().email(),
  senha: z.string().min(3),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
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
    if (role === "ADMIN") navigate("/admin/dashboard");
    if (role === "PROFESSOR") navigate("/professor/dashboard");
    if (role === "ALUNO") navigate("/aluno/inicio");
  };

  const demoLogin = (email: string) => {
    const value = email.toLowerCase();
    const role = value.includes("admin") ? "ADMIN" : value.includes("prof") ? "PROFESSOR" : "ALUNO";
    login("mock-token", role, null, "Modo demonstracao");
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

      const response = await authService.login(data.email, data.senha);
      login(response.token, response.role, response.userId, response.perfilNome);
      goToHomeByRole(response.role);
    } catch {
      setSubmitError(
        API_URL
          ? "Nao foi possivel autenticar na API. Verifique o backend e tente novamente."
          : "Modo demonstracao indisponivel."
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
        <CardDescription>Entre para acessar sua area no EduConnect.</CardDescription>
      </CardHeader>

      <CardContent className="grid gap-4">
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="seu@email.com" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="senha">Senha</Label>
            <Input id="senha" type="password" placeholder="********" {...form.register("senha")} />
            {form.formState.errors.senha ? (
              <p className="text-sm text-destructive">{form.formState.errors.senha.message}</p>
            ) : null}
          </div>

          <Button className="w-full" type="submit" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </Button>

          {submitError ? (
            <div className="grid gap-2">
              <p className="text-sm text-destructive">{submitError}</p>
              {canUseDemoFallback ? (
                <Button type="button" variant="outline" onClick={() => demoLogin(form.getValues("email"))}>
                  Entrar em modo demonstracao
                </Button>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {preferApi ? (
              <>
                Conectado a API: <b>{API_URL}</b>
              </>
            ) : (
              <>
                Dica para demo: email contendo <b>admin</b> ou <b>prof</b> muda o perfil.
              </>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
