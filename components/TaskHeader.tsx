import { formatDuration, formatStartedAt } from "@/lib/format";
import type { AgentTask } from "@/types";

import { StatusBadge } from "@/components/StatusBadge";

interface TaskHeaderProps {
  task: AgentTask;
}

export function TaskHeader({ task }: TaskHeaderProps) {
  const statusMessage =
    task.status === "needs_review"
      ? "The run reached a review checkpoint and is waiting for a human decision."
      : task.status === "running"
        ? "The run is still active, but the current checkpoint already exposes enough signal for review."
        : task.status === "approved"
          ? "The current run summary has already been approved, but the evidence remains visible."
          : "The run was redirected with a narrower instruction to tighten scope before the next pass.";

  return (
    <section className="rounded-[34px] border border-[var(--border)] bg-[var(--card)] p-7 shadow-[0_24px_80px_rgba(19,32,42,0.09)] backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-slate-500">
            Run-Level Review
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 md:text-[2.2rem]">
            {task.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-[15px]">
            Inspect the execution path, the touched surface area, and the steer
            a human reviewer should provide next. This view is about the run as
            a whole, not a single response or diff.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-700">
            {statusMessage}
          </p>
        </div>

        <StatusBadge status={task.status} />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Workspace
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {task.workspaceName}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Model
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {task.modelName}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Started
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {formatStartedAt(task.startedAt)}
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-white/70 p-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-slate-500">
            Duration
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-900">
            {formatDuration(task.durationMs)}
          </p>
        </div>
      </div>

      {task.redirectInstruction ? (
        <div className="mt-6 rounded-2xl border border-[var(--danger)]/16 bg-[var(--danger-soft)] px-4 py-4">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-[var(--danger)]">
            Redirect Instruction
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {task.redirectInstruction}
          </p>
        </div>
      ) : null}
    </section>
  );
}
