interface FilesTouchedProps {
  files: string[];
}

export function FilesTouched({ files }: FilesTouchedProps) {
  return (
    <section className="rounded-[28px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_18px_54px_rgba(19,32,42,0.06)] backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
            Files Touched
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
            Review surface area
          </h3>
        </div>
        <span className="rounded-full border border-[var(--border)] bg-white/80 px-3 py-1 text-xs text-slate-600">
          {files.length} files
        </span>
      </div>

      <div className="mt-6 space-y-2.5">
        {files.map((file, index) => (
          <div
            key={file}
            className="run-fade-in flex items-center justify-between gap-3 rounded-[22px] border border-[var(--border)] bg-white/82 px-4 py-3 shadow-[0_10px_24px_rgba(19,32,42,0.035)]"
            style={{ animationDelay: `${index * 55}ms` }}
          >
            <div className="min-w-0">
              <p className="font-mono text-sm text-slate-800">{file}</p>
              <p className="mt-1 text-xs text-slate-500">
                Included in the run-level evidence set for human review.
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-500">
              in scope
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
