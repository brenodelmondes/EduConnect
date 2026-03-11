type DemoNoticeProps = {
  text?: string;
  className?: string;
};

const DEFAULT_TEXT =
  "Aviso informativo: este conteúdo pode variar conforme os dados disponíveis no ambiente.";

export function DemoNotice({ text = DEFAULT_TEXT, className = "" }: DemoNoticeProps) {
  return (
    <p
      className={`rounded-md border border-dashed bg-muted/25 px-3 py-2 text-xs text-muted-foreground ${className}`.trim()}
    >
      {text}
    </p>
  );
}
