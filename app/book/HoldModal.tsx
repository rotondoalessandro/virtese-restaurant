"use client";

import { useEffect } from "react";

export default function HoldModal({
  open,
  onClose, // chiude + rilascia hold (lo fai nel parent)
  onConfirm, // chiama POST /api/book (lo fai nel parent)
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
    >
      {/* Click fuori per chiudere */}
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-[#e1d6c9] bg-white/98 px-6 py-7 text-[#5b4b41] shadow-2xl sm:px-8 sm:py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-display text-xl sm:text-2xl text-[#3f3127]">
            Confirm your booking
          </h2>
          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <span className="text-[0.75rem] uppercase tracking-[0.22em] text-[#8a7463]">
              Hold time
            </span>
            <div className="flex items-center gap-2 rounded-full border border-[#beafa1] bg-[#f8f2ea] px-3 py-1.5 font-mono text-xs text-[#5b4b41]">
              ⏳
              <span>
                {mm}:{ss}
              </span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm sm:text-base text-[#5b4b41]">
          <b>{date}</b> at <b>{time}</b> • {party} guests{" "}
          {areaLabel ? (
            <>
              • <b>{areaLabel}</b>
            </>
          ) : null}
        </p>
        <p className="mt-2 text-[0.85rem] text-[#8a7463]">
          Stiamo tenendo questo tavolo per te mentre confermi la prenotazione o
          aggiungi eventuali note.
        </p>

        <form
          className="mt-5 grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await onConfirm();
          }}
        >
          <label className="grid gap-1 text-sm">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
              Notes (optional)
            </span>
            <textarea
              rows={4}
              className="rounded-2xl border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergie, preferenze di tavolo, occasioni speciali..."
            />
          </label>

          <div className="mt-2 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="submit"
              className="w-full sm:w-auto rounded-full bg-[#5b4b41] px-8 py-2.75 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!!isConfirming}
            >
              {isConfirming ? "Confirming…" : "Confirm reservation"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto rounded-full border border-[#e1d6c9] px-8 py-2.75 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#5b4b41]"
            >
              Cancel
            </button>
          </div>

          <p className="mt-3 text-[0.75rem] text-[#8a7463]">
            Se chiudi questa finestra o il timer arriva a zero, il tavolo verrà
            rilasciato e potrebbe essere assegnato ad altri ospiti.
          </p>
        </form>
      </div>
    </div>
  );
}
