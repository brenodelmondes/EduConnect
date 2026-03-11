import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DemoNotice } from "@/components/ui/demo-notice";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AlunoServices() {
  const [category, setCategory] = useState("Academico");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  function submit() {
    setSent(true);
    setSubject("");
    setDescription("");
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">Servicos digitais</h1>
        <p className="text-sm text-muted-foreground">
          Central de ajuda para solicitacoes academicas, financeiras e tecnicas.
        </p>
      </div>

      {sent ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-sm text-muted-foreground">
            Chamado registrado com sucesso. Voce recebera atualizacoes por e-mail.
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Suporte digital</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Categoria do chamado</Label>
            <select
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="Academico">Academico</option>
              <option value="Financeiro">Financeiro</option>
              <option value="Suporte">Suporte tecnico</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assunto</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Descreva o tema do chamado"
            />
          </div>

          <div className="space-y-2">
            <Label>Descricao</Label>
            <textarea
              className="min-h-28 w-full resize-y rounded-md border bg-background px-3 py-2 text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Inclua turma, disciplina e detalhes do que precisa."
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={submit}
              disabled={!name.trim() || !email.trim() || !subject.trim() || !description.trim()}
            >
              Enviar chamado
            </Button>
          </div>

          <DemoNotice text="Envio e acompanhamento variam conforme a disponibilidade dos serviços no ambiente." />
        </CardContent>
      </Card>
    </div>
  );
}
