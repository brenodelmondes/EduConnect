import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STRICT_API } from "@/config/env";
import { inscricaoService } from "@/services/inscricao";

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  course: "ADS" | "SI" | "CCO" | "ENG";
};

type EnrollmentStage = "FORM" | "PAYMENT" | "DONE";

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

export function InscricaoPage() {
  const [stage, setStage] = useState<EnrollmentStage>("FORM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ status: string; correlationId: string } | null>(null);
  const [emailResendMessage, setEmailResendMessage] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(initialState);

  const canSubmit =
    form.fullName.trim().length >= 5 && form.email.includes("@") && form.phone.trim().length >= 10;

  function resetForm() {
    setForm(initialState);
    setStage("FORM");
    setResult(null);
    setError(null);
    setEmailResendMessage(null);
  }

  async function onSubmit() {
    setSubmitting(true);
    setError(null);
    setEmailResendMessage(null);

    try {
      const response = await inscricaoService.submit({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        course: form.course,
      });
      setResult(response);
      setStage("PAYMENT");
    } catch {
      setError(
        STRICT_API
          ? "Não foi possível concluir a inscrição via API em modo estrito. Verifique o endpoint /inscricoes."
          : "Não foi possível concluir a inscrição agora. Tente novamente em instantes."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function confirmPayment() {
    if (!result) return;

    setSubmitting(true);
    setError(null);

    try {
      const status = await inscricaoService.getStatus(result.correlationId);
      setResult(status);
      setStage("DONE");
    } catch {
      setError("Não foi possível confirmar o status da inscrição agora.");
    } finally {
      setSubmitting(false);
    }
  }

  async function resendEmail() {
    if (!result) return;

    setSubmitting(true);
    setError(null);
    setEmailResendMessage(null);

    try {
      const response = await inscricaoService.resendEmail(result.correlationId);
      setResult(response);
      setEmailResendMessage("E-mail de confirmação reenviado com sucesso.");
    } catch {
      setError("Não foi possível reenviar o e-mail agora.");
    } finally {
      setSubmitting(false);
    }
  }

  const qrPayload = result
    ? JSON.stringify({
        tipo: "INSCRICAO_EDUCONNECT",
        protocolo: result.correlationId,
        nome: form.fullName.trim(),
        curso: form.course,
      })
    : "";

  const courseName = courseLabel(form.course);

  const stepBadgeClass = "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold";

  const stepNumberClass = (value: EnrollmentStage) =>
    value === stage || (value === "FORM" && (stage === "PAYMENT" || stage === "DONE")) || (value === "PAYMENT" && stage === "DONE")
      ? `${stepBadgeClass} bg-primary text-primary-foreground border-primary`
      : `${stepBadgeClass} bg-muted text-muted-foreground`;

  if (stage === "DONE" && result) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <BrandMark />
          <div>
            <CardTitle>Inscrição concluída</CardTitle>
            <CardDescription>Cadastro finalizado com sucesso. Guarde o protocolo para acompanhamento.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/20 p-4 text-sm">
            <p className="font-medium">Protocolo da inscrição</p>
            <p className="mt-1 text-muted-foreground">Nome: {form.fullName}</p>
            <p className="text-muted-foreground">E-mail: {form.email}</p>
            <p className="text-muted-foreground">Curso: {courseName}</p>
            <p className="text-muted-foreground">Status: {result.status}</p>
            <p className="text-muted-foreground">Correlation ID: {result.correlationId}</p>
          </div>

          {emailResendMessage ? <p className="text-sm text-muted-foreground">{emailResendMessage}</p> : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => void resendEmail()} disabled={submitting}>
              {submitting ? "Processando..." : "Reenviar e-mail"}
            </Button>
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
          <CardDescription>Fluxo em 3 etapas: dados, pagamento via QR Code e conclusão.</CardDescription>
        </div>

        <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className={stepNumberClass("FORM")}>1</span>
          <span>Dados</span>
          <span>•</span>
          <span className={stepNumberClass("PAYMENT")}>2</span>
          <span>Pagamento</span>
          <span>•</span>
          <span className={stepNumberClass("DONE")}>3</span>
          <span>Conclusão</span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {stage === "FORM" ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Nome completo</Label>
                <Input
                  placeholder="Seu nome"
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                />
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

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex items-center justify-end">
              <Button type="button" onClick={() => void onSubmit()} disabled={!canSubmit || submitting}>
                {submitting ? "Enviando..." : "Continuar para pagamento"}
              </Button>
            </div>
          </>
        ) : null}

        {stage === "PAYMENT" && result ? (
          <>
            <div className="rounded-md border bg-muted/10 p-4">
              <p className="text-sm font-medium">Pagamento da inscrição</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Escaneie o QR Code abaixo no app do seu banco e depois confirme o pagamento.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-[240px_1fr] md:items-start">
              <div className="flex justify-center rounded-md border bg-background p-4">
                <QRCodeSVG value={qrPayload} size={200} level="M" />
              </div>

              <div className="space-y-3">
                <div className="rounded-md border bg-muted/20 p-3 text-sm">
                  <p className="font-medium">Resumo da inscrição</p>
                  <p className="mt-1 text-muted-foreground">Nome: {form.fullName}</p>
                  <p className="text-muted-foreground">Curso: {courseName}</p>
                  <p className="text-muted-foreground">Protocolo: {result.correlationId}</p>
                </div>

                <div className="space-y-2">
                  <Label>Código para copiar</Label>
                  <Input value={qrPayload} readOnly />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(qrPayload);
                      } catch {
                        setError("Não foi possível copiar o código automaticamente.");
                      }
                    }}
                  >
                    Copiar código
                  </Button>
                </div>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setStage("FORM")} disabled={submitting}>
                Voltar
              </Button>
              <Button type="button" onClick={() => void confirmPayment()} disabled={submitting}>
                {submitting ? "Confirmando..." : "Já realizei o pagamento"}
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}
