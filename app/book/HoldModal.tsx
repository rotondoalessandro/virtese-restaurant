"use client";

import { useEffect } from "react";

export default function HoldModal({
  open,
  onClose,         // chiude + rilascia hold (lo fai nel parent)
  onConfirm,       // chiama POST /api/book (lo fai nel parent)
  mm,
  ss,
  date,
  time,
  party,
  areaLabel,
  isConfirming,
  notes,
  setNotes,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  mm: string;
  ss: string;
  date: string;
  time: string;
  party: number;
  areaLabel?: string | null;
  isConfirming?: boolean;
  notes: string;
  setNotes: (v: string) => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      {/* Click fuori per chiudere */}
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-zinc-800 bg-black/90 px-5 py-6 text-zinc-50 shadow-2xl sm:px-6 sm:py-7">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold">
            Confirm your booking
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
              Hold time
            </span>
            <div className="flex items-center gap-1 rounded-full border border-amber-400/60 bg-amber-500/10 px-3 py-1 font-mono text-xs text-amber-200">
              ⏳
              <span>
                {mm}:{ss}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-200">
          <b>{date}</b> at <b>{time}</b> • {party} guests{" "}
          {areaLabel ? (
            <>
              • <b>{areaLabel}</b>
            </>
          ) : null}
        </p>
        <p className="mt-1 text-xs text-zinc-400">
          We’re holding this table briefly while you confirm your reservation or add
          any notes.
        </p>

        <form
          className="mt-5 grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault();
            await onConfirm();
          }}
        >
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
              Notes (optional)
            </span>
            <textarea
              rows={3}
              className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergie, preferenze di tavolo, occasioni speciali..."
            />
          </label>

          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="submit"
              className="rounded-full bg-amber-500 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!!isConfirming}
            >
              {isConfirming ? "Confirming…" : "Confirm reservation"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-zinc-700 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
            >
              Cancel
            </button>
          </div>

          <p className="mt-3 text-[0.7rem] text-zinc-500">
            If you close this window or the timer runs out, your hold will be released
            and the table may be given to someone else.
          </p>
        </form>
      </div>
    </div>
  );
}
