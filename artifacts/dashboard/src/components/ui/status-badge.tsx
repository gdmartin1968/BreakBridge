import { RatioStatus } from "@/types/schema";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: RatioStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
        {
          "status-green": status === "GREEN" || status === "COMPLETED",
          "status-fragile": status === "FRAGILE" || status === "IN_PROGRESS" || status === "PENDING",
          "status-maxed": status === "MAXED" || status === "SKIPPED",
          "bg-muted text-muted-foreground border border-border": status === "DRAFT" || status === "ABSENT",
        },
        className
      )}
    >
      {status}
    </span>
  );
}
