import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ProfessorServices() {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    if (!subject.trim() || !description.trim()) return;
    setSent(true);
    setSubject("");
    setDescription("");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Serviços digitais</h1>
        <p className="text-sm text-muted-foreground">
          Central de suporte para demandas acadêmicas e operacionais do docente.
        </p>
      </div>

      {sent ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Chamado registrado com sucesso.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Abrir chamado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Assunto</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex.: Ajuste de diário de classe"
            />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <textarea
              className="min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Informe contexto, turma e impacto da solicitação."
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={submit} disabled={!subject.trim() || !description.trim()}>
              Enviar chamado
            </Button>
          </div>
          <DemoNotice />
        </CardContent>
      </Card>
    </div>
  );
}
