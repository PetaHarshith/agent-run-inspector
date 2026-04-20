import { useEffect, useState } from "react";

interface RedirectModalProps {
  isOpen: boolean;
  initialValue?: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

export function RedirectModal({
  isOpen,
  initialValue,
  onClose,
  onSubmit,
}: RedirectModalProps) {
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const trimmedValue = value.trim();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/28 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (!trimmedValue) {
            return;
          }

          onSubmit(trimmedValue);
        }}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-xl rounded-[32px] border border-[var(--border)] bg-[var(--card-strong)] p-6 shadow-[0_30px_100px_rgba(15,23,42,0.24)]"
      >
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-slate-500">
          Redirect Run
        </p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Narrow the next attempt
        </h3>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Provide a tighter instruction that changes the run scope without
          losing the current review context.
        </p>

        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Retry, but only touch backend auth files."
          autoFocus
          className="mt-5 min-h-36 w-full rounded-3xl border border-[var(--border)] bg-white/86 px-4 py-3 text-sm leading-6 text-slate-700 outline-none transition focus:border-slate-300 focus:ring-4 focus:ring-slate-200/70"
        />
        <p className="mt-2 text-xs text-slate-500">
          Example: Retry, but keep the run scoped to backend auth files and do
          not modify UI hooks.
        </p>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!trimmedValue}
            className="rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Save Redirect
          </button>
        </div>
      </form>
    </div>
  );
}
