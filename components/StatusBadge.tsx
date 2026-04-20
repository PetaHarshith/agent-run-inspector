import { formatStatusLabel } from "@/lib/format";
import type { TaskStatus } from "@/types";

const statusStyles: Record<TaskStatus, string> = {
  running:
    "border-[var(--accent)]/22 bg-[var(--accent-soft)] text-[var(--accent)]",
  needs_review:
    "border-[var(--warning)]/24 bg-[var(--warning-soft)] text-[var(--warning)]",
  approved:
    "border-[var(--success)]/24 bg-[var(--success-soft)] text-[var(--success)]",
  redirected:
    "border-[var(--danger)]/20 bg-[var(--danger-soft)] text-[var(--danger)]",
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em]",
        statusStyles[status],
        className ?? "",
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {formatStatusLabel(status)}
    </span>
  );
}
