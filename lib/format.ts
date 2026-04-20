import type { TaskStatus, TimelineEventKind } from "@/types";

export function formatDuration(durationMs: number) {
  const seconds = durationMs / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  }

  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}

export function formatStartedAt(startedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(startedAt));
}

export function formatStatusLabel(status: TaskStatus) {
  return status.replace("_", " ");
}

export function formatEventKindLabel(kind: TimelineEventKind) {
  if (kind === "reason") {
    return "reasoning";
  }

  return kind;
}
