import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { useAuth } from "@/app/auth";
import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_URL } from "@/config/env";
import { authService } from "@/services/auth";

const schema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  senha: z.string().min(3, "Informe sua senha"),
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
    if (role === "PROFESSOR") navigate("/professor/painel");
    if (role === "ALUNO") navigate("/aluno/inicio");
  };

  const demoLogin = (email: string) => {
    const value = email.toLowerCase();
    const role = value.includes("admin") ? "ADMIN" : value.includes("prof") ? "PROFESSOR" : "ALUNO";
    const userHash = Array.from(value).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const demoUserId = role === "ADMIN" ? 1 : role === "PROFESSOR" ? 200 + (userHash % 50) : 1000 + (userHash % 200);
    login("mock-token", role, demoUserId, "Modo demonstração");
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
      <CardHeader className="space-y-3">
        <BrandMark />
        <div>
          <CardTitle>Entrar no portal</CardTitle>
          <CardDescription>Acesse sua área acadêmica no EduConnect.</CardDescription>
        </div>
      </CardHeader>

      <CardContent className="grid gap-4">
        <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
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
                  Entrar em modo demonstração
                </Button>
              ) : null}
            </div>
          ) : null}

          <p className="text-xs text-muted-foreground">
            {preferApi ? (
              <>
                Conectado à API: <b>{API_URL}</b>
              </>
            ) : (
              <>
                Dica para demo: e-mail com <b>admin</b> ou <b>prof</b> altera o perfil.
              </>
            )}
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
