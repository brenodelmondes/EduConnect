type DemoNoticeProps = {
  text?: string;
  className?: string;
};

const DEFAULT_TEXT =
  "Dados simulados (modo demonstracao). Integracao com API na proxima etapa.";

export function DemoNotice({ text = DEFAULT_TEXT, className = "" }: DemoNoticeProps) {
  return (
    <p
      className={`rounded-md border border-dashed bg-muted/25 px-3 py-2 text-xs text-muted-foreground ${className}`.trim()}
    >
      {text}
    </p>
  );
}
