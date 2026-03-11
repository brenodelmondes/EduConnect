import { GraduationCap } from "lucide-react";

import { branding } from "@/config/branding";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  variant?: "full" | "compact";
  className?: string;
};

export function BrandMark({ variant = "full", className }: BrandMarkProps) {
  const compact = variant === "compact";

  return (
    <div className={cn("inline-flex items-center gap-2", className)} aria-label={branding.appName}>
      {branding.logoSrc ? (
        <img src={branding.logoSrc} alt={branding.appName} className={cn("h-7 w-auto", compact && "h-6")} />
      ) : (
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md border bg-primary/10 text-primary">
          <GraduationCap className="h-4 w-4" />
        </span>
      )}

      {!compact ? (
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-tight">{branding.appName}</span>
          <span className="block text-[11px] text-muted-foreground">Portal acadêmico</span>
        </span>
      ) : null}
    </div>
  );
}
