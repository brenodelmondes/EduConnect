import { useState } from "react";

import { BrandMark } from "@/components/brand/BrandMark";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { STRICT_API } from "@/config/env";
import { inscricaoService } from "@/services/inscricao";
import qrCodeImage from "@/assets/qrcodeEdu.png";

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
  const [result, setResult] = useState<{
    status: string;
    correlationId: string;
    firstAccessReleased?: boolean;
    emailSent?: boolean;
    temporaryLogin?: string;
    temporaryPassword?: string;
    message?: string;
  } | null>(null);
  const [emailResendMessage, setEmailResendMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
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
  const courseName = courseLabel(form.course);

  const stepBadgeClass = "inline-flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold";

  const stepNumberClass = (value: EnrollmentStage) =>
    value === stage || (value === "FORM" && stage !== "FORM") || (value === "PAYMENT" && stage === "DONE")
      ? `${stepBadgeClass} bg-primary text-primary-foreground border-primary`
      : `${stepBadgeClass} bg-muted text-muted-foreground`;

  function confirmPayment() {
    setStage("DONE");
  }

  function copyPixCode(code: string) {
    if (!navigator?.clipboard) return;
    void navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  if (stage === "DONE" && result) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <BrandMark />
          <div>
            <CardTitle>Pré-inscrição recebida</CardTitle>
            <CardDescription>Sua solicitação foi registrada e está pendente de análise administrativa.</CardDescription>
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
            <p className="text-muted-foreground">
              Primeiro acesso liberado: {result.firstAccessReleased ? "Sim" : "Não"}
            </p>
            {result.temporaryLogin ? (
              <p className="text-muted-foreground">Login provisório: {result.temporaryLogin}</p>
            ) : null}
            {result.temporaryPassword ? (
              <p className="text-muted-foreground">Senha provisória: {result.temporaryPassword}</p>
            ) : null}
          </div>

          {result.message ? <p className="text-sm text-muted-foreground">{result.message}</p> : null}
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

  if (stage === "PAYMENT" && result) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <BrandMark />
          <div>
            <CardTitle>Etapa de pagamento</CardTitle>
            <CardDescription>
              Confirme a etapa financeira para concluir a jornada de inscricao.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
            <span className={stepNumberClass("FORM")}>1</span>
            <span>Dados</span>
            <span>•</span>
            <span className={stepNumberClass("PAYMENT")}>2</span>
            <span>Pagamento</span>
            <span>•</span>
            <span className={stepNumberClass("DONE")}>3</span>
            <span>Conclusao</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/20 p-4 text-sm">
            <p className="font-medium">Resumo da inscricao</p>
            <p className="mt-1 text-muted-foreground">Nome: {form.fullName}</p>
            <p className="text-muted-foreground">E-mail: {form.email}</p>
            <p className="text-muted-foreground">Curso: {courseName}</p>
            <p className="text-muted-foreground">Protocolo: {result.correlationId}</p>
            <p className="text-muted-foreground">Status: {result.status}</p>
          </div>

          <div className="grid gap-4 rounded-md border p-4 text-sm md:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="font-medium">Pagamento institucional</p>
              <p className="mt-1 text-muted-foreground">
                Valor estimado: R$ 1.250,00
              </p>
              <p className="text-muted-foreground">
                Metodo: PIX (QR Code) / Cartao / Boleto
              </p>
              <p className="mt-3 text-xs text-muted-foreground">
                Use o QR Code ao lado para registrar o pagamento da inscricao.
              </p>
              <div className="mt-3 rounded-md border bg-muted/30 p-3 text-xs">
                <p className="font-medium text-foreground">Codigo PIX</p>
                <p className="mt-1 break-all text-muted-foreground">
                  00020101021226850014br.gov.bcb.pix2563educonnect.pagamento/inscricao/{result.correlationId}520400005303986540512.505802BR5920EDUCONNECT SERVICOS6009SAO PAULO62070503***6304A1B2
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() =>
                    copyPixCode(
                      `00020101021226850014br.gov.bcb.pix2563educonnect.pagamento/inscricao/${result.correlationId}520400005303986540512.505802BR5920EDUCONNECT SERVICOS6009SAO PAULO62070503***6304A1B2`
                    )
                  }
                >
                  Copiar codigo PIX
                </Button>
                {copied ? (
                  <p className="mt-2 text-xs text-foreground">Codigo copiado.</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center justify-center rounded-md border bg-muted/30 p-3">
              <img
                src={qrCodeImage}
                alt="QR Code de pagamento"
                className="h-40 w-40 rounded-md bg-white p-2"
              />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmPayment}>
              Ja realizei pagamento
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
          <CardDescription>Preencha os dados para enviar sua pré-inscrição para análise.</CardDescription>
        </div>

        <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
          <span className={stepNumberClass("FORM")}>1</span>
          <span>Dados</span>
          <span>•</span>
          <span className={stepNumberClass("PAYMENT")}>2</span>
          <span>Pagamento</span>
          <span>•</span>
          <span className={stepNumberClass("DONE")}>3</span>
          <span>Conclusao</span>
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
                {submitting ? "Enviando..." : "Enviar pré-inscrição"}
              </Button>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

