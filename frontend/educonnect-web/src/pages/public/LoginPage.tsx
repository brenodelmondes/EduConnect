import { useNavigate } from "react-router-dom";
import { useAuth } from "@/app/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", senha: "" },
  });

  const onSubmit = (data: FormData) => {
    // MOCK: define role pelo email (só pro MVP)
    const email = data.email.toLowerCase();
    const role =
      email.includes("admin") ? "ADMIN" :
      email.includes("prof") ? "PROFESSOR" : "ALUNO";

    login("mock-token", role);

    if (role === "ADMIN") nav("/admin/dashboard");
    if (role === "PROFESSOR") nav("/professor/dashboard");
    if (role === "ALUNO") nav("/aluno/dashboard");
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

          <Button className="w-full" type="submit">
            Entrar
          </Button>

          <p className="text-xs text-muted-foreground">
            Dica (MVP): email contendo <b>admin</b> ou <b>prof</b> muda o perfil.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
