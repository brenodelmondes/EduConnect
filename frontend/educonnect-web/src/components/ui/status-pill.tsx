import { cn } from "@/lib/utils";

type StatusTone = "success" | "warning" | "neutral" | "danger" | "info";

const toneClass: Record<StatusTone, string> = {
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  neutral: "border-border bg-muted/40 text-muted-foreground",
  danger: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300",
};

export function StatusPill({
  label,
  tone = "neutral",
  className,
}: {
  label: string;
  tone?: StatusTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
        toneClass[tone],
        className
      )}
    >
      {label}
    </span>
  );
}
