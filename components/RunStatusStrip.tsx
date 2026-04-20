type RunStage = "scanning" | "reasoning" | "reviewing" | "ready";

interface RunStatusStripProps {
  currentStage: RunStage;
  isRedirectedRun: boolean;
}

const stages: Array<{
  id: RunStage;
  label: string;
  detail: string;
}> = [
  {
    id: "scanning",
    label: "Scanning",
    detail: "Collecting evidence",
  },
  {
    id: "reasoning",
    label: "Reasoning",
    detail: "Narrowing the issue",
  },
  {
    id: "reviewing",
    label: "Generating review",
    detail: "Building the run summary",
  },
  {
    id: "ready",
    label: "Ready for review",
    detail: "Human decision needed",
  },
];

export function RunStatusStrip({
  currentStage,
  isRedirectedRun,
}: RunStatusStripProps) {
  const activeIndex = stages.findIndex((stage) => stage.id === currentStage);

  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-4 shadow-[0_18px_54px_rgba(19,32,42,0.06)] backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
            Run State
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Follow the run from evidence gathering through review generation.
          </p>
        </div>
        {isRedirectedRun ? (
          <span className="rounded-full border border-[var(--danger)]/16 bg-[var(--danger-soft)] px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--danger)]">
            Redirected pass
          </span>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {stages.map((stage, index) => {
          const isCompleted = index < activeIndex;
          const isCurrent = index === activeIndex;

          return (
            <div
              key={stage.id}
              className={[
                "rounded-[22px] border px-4 py-3 transition",
                isCurrent
                  ? "border-[var(--accent)]/22 bg-[var(--accent-soft)] shadow-[0_10px_24px_rgba(15,118,110,0.08)]"
                  : isCompleted
                    ? "border-slate-200 bg-white/84"
                    : "border-[var(--border)] bg-white/58",
              ].join(" ")}
            >
              <div className="flex items-center gap-2">
                <span
                  className={[
                    "h-2.5 w-2.5 rounded-full",
                    isCurrent
                      ? "bg-[var(--accent)]"
                      : isCompleted
                        ? "bg-slate-700"
                        : "bg-slate-300",
                  ].join(" ")}
                />
                <p className="text-sm font-semibold text-slate-900">{stage.label}</p>
              </div>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                {stage.detail}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
