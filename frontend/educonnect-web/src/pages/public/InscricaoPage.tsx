import { useMemo, useState } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  course: "ADS" | "SI" | "CCO" | "ENG";
};

const DEMO_PIX_KEY = "SEU_PIX_AQUI@EMAIL.COM";
const DEMO_PIX_RECEIVER = "EduConnect Instituição";
const DEMO_AMOUNT = "89.90";

const initialState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  course: "ADS",
};

function courseLabel(course: FormState["course"]) {
  if (course === "ADS") return "Análise e Desenvolvimento de Sistemas";
  if (course === "SI") return "Sistemas de Informação";
  if (course === "CCO") return "Ciência da Computação";
  return "Engenharia de Software";
}

function buildPixPayload(form: FormState) {
  return [
    "PIX-DEMO",
    `CHAVE:${DEMO_PIX_KEY}`,
    `VALOR:${DEMO_AMOUNT}`,
    `ALUNO:${form.fullName || "NOME_NAO_INFORMADO"}`,
    `CURSO:${form.course}`,
    `REF:${Date.now()}`,
  ].join("|");
}

export function InscricaoPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState<FormState>(initialState);

  const canAdvance =
    form.fullName.trim().length >= 5 && form.email.includes("@") && form.phone.trim().length >= 10;

  const pixCode = useMemo(() => buildPixPayload(form), [form]);
  const qrUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(pixCode)}`,
    [pixCode]
  );

  async function copyPixCode() {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  function resetForm() {
    setForm(initialState);
    setStep(1);
    setDone(false);
    setCopied(false);
  }

  if (done) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <BrandMark />
          <div>
            <CardTitle>Pré-inscrição e pagamento simulados</CardTitle>
            <CardDescription>
              Fluxo concluído para demonstração executiva do EduConnect.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/20 p-4 text-sm">
            <p className="font-medium">Resumo da submissão</p>
            <p className="mt-1 text-muted-foreground">Nome: {form.fullName}</p>
            <p className="text-muted-foreground">E-mail: {form.email}</p>
            <p className="text-muted-foreground">Curso: {courseLabel(form.course)}</p>
            <p className="text-muted-foreground">Valor simulado: R$ {DEMO_AMOUNT}</p>
          </div>

          <DemoNotice />

          <div className="flex justify-end">
            <Button type="button" variant="outline" onClick={resetForm}>
              Nova inscrição
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="space-y-3">
        <BrandMark />
        <div>
          <CardTitle>Inscrição acadêmica</CardTitle>
          <CardDescription>
            Etapa {step} de 3 • Pré-cadastro institucional com confirmação e pagamento demonstrativo.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome completo</Label>
              <Input
                placeholder="Seu nome"
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Utilize o nome civil completo para validação cadastral.
              </p>
            </div>

            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input
                placeholder="seu@email.com"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                placeholder="(11) 99999-0000"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Curso de interesse</Label>
              <select
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                value={form.course}
                onChange={(e) => setForm((prev) => ({ ...prev, course: e.target.value as FormState["course"] }))}
              >
                <option value="ADS">Análise e Desenvolvimento de Sistemas</option>
                <option value="SI">Sistemas de Informação</option>
                <option value="CCO">Ciência da Computação</option>
                <option value="ENG">Engenharia de Software</option>
              </select>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3 rounded-md border p-4 text-sm">
            <p className="font-medium">Revisão dos dados</p>
            <div className="grid gap-2 md:grid-cols-2">
              <p>
                <span className="text-muted-foreground">Nome:</span> {form.fullName}
              </p>
              <p>
                <span className="text-muted-foreground">E-mail:</span> {form.email}
              </p>
              <p>
                <span className="text-muted-foreground">Telefone:</span> {form.phone}
              </p>
              <p>
                <span className="text-muted-foreground">Curso:</span> {courseLabel(form.course)}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Ao avançar, a plataforma gera o código para pagamento demonstrativo.
            </p>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
            <div className="rounded-md border bg-muted/10 p-3">
              <img src={qrUrl} alt="QR Code de pagamento" className="mx-auto h-[220px] w-[220px] rounded-md bg-white p-2" />
              <p className="mt-2 text-center text-xs text-muted-foreground">QR Code de pagamento demonstrativo</p>
            </div>

            <div className="space-y-3 rounded-md border p-4 text-sm">
              <p className="font-medium">Pagamento da pré-inscrição</p>
              <p className="text-muted-foreground">Beneficiário: {DEMO_PIX_RECEIVER}</p>
              <p className="text-muted-foreground">Chave PIX (demo): {DEMO_PIX_KEY}</p>
              <p className="text-muted-foreground">Valor de demonstração: R$ {DEMO_AMOUNT}</p>

              <div className="space-y-2">
                <Label>Código copia e cola</Label>
                <textarea
                  readOnly
                  value={pixCode}
                  className="min-h-[100px] w-full rounded-md border bg-background p-2 text-xs"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={copyPixCode}>
                  {copied ? "Código copiado" : "Copiar código"}
                </Button>
                <Button type="button" onClick={() => setDone(true)}>
                  Confirmar pagamento (demo)
                </Button>
              </div>
            </div>
          </div>
        ) : null}

        <DemoNotice text="Dados simulados (modo demonstração). Integração com API na próxima etapa." />

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3) : prev))}
            disabled={step === 1}
          >
            Voltar
          </Button>

          {step === 1 ? (
            <Button type="button" onClick={() => setStep(2)} disabled={!canAdvance}>
              Revisar dados
            </Button>
          ) : null}

          {step === 2 ? (
            <Button type="button" onClick={() => setStep(3)}>
              Ir para pagamento
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
