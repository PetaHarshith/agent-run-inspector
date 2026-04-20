import { StatusBadge } from "@/components/StatusBadge";
import type { AgentTask, ReviewReport } from "@/types";

interface ReviewPanelProps {
  task: AgentTask;
  review?: ReviewReport;
  isLoading: boolean;
  error?: string;
  onApprove: () => void;
  onRetry: () => void;
  onRedirect: () => void;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
      {children}
    </p>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-[28px] border border-[var(--border)] bg-white/82 p-4">
      <SectionTitle>In Progress</SectionTitle>
      <p className="mt-3 text-sm font-medium text-slate-700">
        Generating structured review...
      </p>
      <div className="mt-4 space-y-3">
        <div className="h-4 w-2/3 animate-pulse rounded-full bg-slate-200" />
        <div className="h-16 animate-pulse rounded-3xl bg-slate-100" />
        <div className="h-20 animate-pulse rounded-3xl bg-slate-100" />
        <div className="h-16 animate-pulse rounded-3xl bg-slate-100" />
      </div>
    </div>
  );
}

export function ReviewPanel({
  task,
  review,
  isLoading,
  error,
  onApprove,
  onRetry,
  onRedirect,
}: ReviewPanelProps) {
  return (
    <section className="rounded-[34px] border border-[var(--border)] bg-[var(--card-strong)] p-5 shadow-[0_28px_90px_rgba(19,32,42,0.12)] backdrop-blur md:sticky md:top-6 md:flex md:max-h-[calc(100vh-3rem)] md:flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <SectionTitle>Review Panel</SectionTitle>
          <h3 className="mt-2 text-[1.45rem] font-semibold tracking-tight text-slate-950">
            Structured run review
          </h3>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
            A compact reviewer-facing summary of the run, its risks, and the
            next steering decision.
          </p>
        </div>
        <StatusBadge status={task.status} />
      </div>

      <div className="mt-5 flex-1 space-y-4 md:min-h-0 md:overflow-y-auto md:pr-1">
        {isLoading ? <LoadingSkeleton /> : null}

        {!isLoading && error ? (
          <div className="rounded-2xl border border-[var(--danger)]/16 bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        {!isLoading && review ? (
          <>
            <div className="grid gap-4">
              <div className="rounded-[28px] border border-[var(--border)] bg-white/82 p-4">
                <SectionTitle>Summary</SectionTitle>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {review.summary}
                </p>
              </div>

              <div className="rounded-[28px] border border-[var(--border)] bg-white/82 p-4">
                <SectionTitle>Root Cause</SectionTitle>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {review.rootCause}
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[28px] border border-[var(--border)] bg-white/82 p-4">
                <SectionTitle>Assumptions</SectionTitle>
                <div className="mt-3 space-y-2">
                  {review.assumptions.map((assumption) => (
                    <p
                      key={assumption}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-700"
                    >
                      {assumption}
                    </p>
                  ))}
                </div>
              </div>

              <div className="rounded-[28px] border border-[var(--border)] bg-white/82 p-4">
                <SectionTitle>Risks</SectionTitle>
                <div className="mt-3 space-y-2">
                  {review.risks.map((risk) => (
                    <p
                      key={risk}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm leading-6 text-slate-700"
                    >
                      {risk}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[var(--accent)]/16 bg-[var(--accent-soft)] p-4">
              <SectionTitle>Recommended Next Step</SectionTitle>
              <p className="mt-2 text-sm leading-6 text-slate-700">
                {review.recommendedNextStep}
              </p>
            </div>
          </>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-[var(--border)] pt-4">
        <button
          type="button"
          onClick={onApprove}
          disabled={task.status === "approved" || isLoading}
          className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {task.status === "approved" ? "Approved" : "Approve"}
        </button>
        <button
          type="button"
          onClick={onRetry}
          disabled={isLoading}
          className="rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Running..." : "Retry"}
        </button>
        <button
          type="button"
          onClick={onRedirect}
          disabled={isLoading}
          className="rounded-full border border-transparent bg-[var(--danger)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-92"
        >
          Redirect
        </button>
      </div>
    </section>
  );
}
