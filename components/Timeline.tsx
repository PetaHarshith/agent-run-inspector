import { formatEventKindLabel } from "@/lib/format";
import type { TimelineEvent, TimelineEventKind } from "@/types";

const kindStyles: Record<TimelineEventKind, string> = {
  scan: "border-slate-300 bg-slate-100 text-slate-700",
  read: "border-sky-200 bg-sky-100 text-sky-700",
  reason: "border-amber-200 bg-amber-100 text-amber-700",
  write: "border-emerald-200 bg-emerald-100 text-emerald-700",
  complete: "border-rose-200 bg-rose-100 text-rose-700",
};

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_18px_54px_rgba(19,32,42,0.06)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
            Timeline
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Execution trail
          </h3>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-xs text-slate-600">
          {events.length} events
        </span>
      </div>

      <div className="mt-6 space-y-3">
        {events.map((event, index) => (
          <div
            key={event.id}
            className="run-fade-in relative pl-8"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <span className="absolute left-0 top-2 h-3 w-3 rounded-full border border-white bg-slate-400 shadow-[0_0_0_4px_rgba(255,255,255,0.9)] transition-transform duration-300 ease-out" />
            {index < events.length - 1 ? (
              <span className="run-grow-line absolute left-[5px] top-5 h-[calc(100%+12px)] w-px bg-[linear-gradient(180deg,rgba(148,163,184,0.35),rgba(148,163,184,0))]" />
            ) : null}
            <div className="rounded-[22px] border border-[var(--border)] bg-white/82 p-4 shadow-[0_10px_30px_rgba(19,32,42,0.04)]">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--border)] bg-slate-50 px-2.5 py-1 font-mono text-[11px] text-slate-500">
                  {event.timestampLabel}
                </span>
                <span
                  className={[
                    "rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
                    kindStyles[event.kind],
                  ].join(" ")}
                >
                  {formatEventKindLabel(event.kind)}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-700">
                {event.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
