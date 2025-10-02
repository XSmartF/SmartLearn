import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

interface StatCardProps {
  icon?: ReactNode;
  label: ReactNode;
  value: ReactNode;
  helper?: ReactNode;
  className?: string;
}

export function StatCard({ icon, label, value, helper, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border/40 bg-card/60 p-5 shadow-[var(--neu-shadow-sm)] backdrop-blur-sm transition-all duration-200 hover:border-border/70 hover:shadow-[var(--neu-shadow)]",
        className
      )}
    >
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        {icon && <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-muted/60">{icon}</span>}
        <span className="font-medium text-foreground/80">{label}</span>
      </div>
      <div className="text-3xl font-semibold tracking-tight text-foreground">{value}</div>
      {helper && <div className="text-xs text-muted-foreground">{helper}</div>}
    </div>
  );
}
