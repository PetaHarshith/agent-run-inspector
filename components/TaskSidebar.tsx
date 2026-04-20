import { formatDuration, formatStartedAt } from "@/lib/format";
import type { AgentTask } from "@/types";

import { StatusBadge } from "@/components/StatusBadge";

interface TaskSidebarProps {
  tasks: AgentTask[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
}

export function TaskSidebar({
  tasks,
  selectedTaskId,
  onSelectTask,
}: TaskSidebarProps) {
  return (
    <aside className="flex h-full flex-col border-r border-white/8 bg-[var(--sidebar)] px-5 py-6 text-[var(--sidebar-foreground)] lg:sticky lg:top-0 lg:h-screen">
      <div className="mb-6 rounded-[28px] border border-white/10 bg-white/7 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/52">
          Agent Run Inspector
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight">
          Review whole runs, not single replies.
        </h1>
        <p className="mt-3 text-sm leading-6 text-white/68">
          Inspect where the agent searched, what it touched, and what a human
          should approve or redirect next.
        </p>
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-white/45">
          Seeded Runs
        </p>
        <span className="rounded-full border border-white/12 px-2.5 py-1 font-mono text-[11px] text-white/60">
          {tasks.length} tasks
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto pr-1">
          {tasks.map((task) => {
          const isSelected = task.id === selectedTaskId;

          return (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              className={[
                "relative rounded-[28px] border p-4 text-left transition",
                isSelected
                  ? "border-white/28 bg-white/12 shadow-[0_22px_64px_rgba(0,0,0,0.2)]"
                  : "border-white/10 bg-white/4 hover:border-white/18 hover:bg-white/8",
              ].join(" ")}
            >
              {isSelected ? (
                <span className="absolute inset-y-4 left-0 w-1 rounded-full bg-white/85" />
              ) : null}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/42">
                    {task.workspaceName}
                  </p>
                  <p className="text-sm font-semibold leading-6 text-white">
                    {task.title}
                  </p>
                  <p className="mt-1 text-sm text-white/58">
                    Started {formatStartedAt(task.startedAt)}
                  </p>
                </div>
                <StatusBadge status={task.status} className="shrink-0" />
              </div>

              <div className="mt-4 flex flex-wrap gap-2 text-[12px] text-white/58">
                <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 font-mono text-white/64">
                  {task.modelName}
                </span>
                <span className="rounded-full border border-white/10 bg-black/10 px-2.5 py-1 font-mono text-white/64">
                  {formatDuration(task.durationMs)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
