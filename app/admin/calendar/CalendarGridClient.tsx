"use client";

import { useOptimistic, useTransition, useRef, useState, useEffect, type CSSProperties } from "react";
import { moveBookingAction } from "./actions";
import { useRouter } from "next/navigation";

// Tipi minimi per props
type Table = { id: string; code: string; area: string; capacity: number };
type Slot = { time: string; date: string }; // date as ISO
type Block = {
  bookingId: string;
  tableId: string;
  startISO: string;
  endISO: string;
  label: string;
  status: "PENDING" | "CONFIRMED";
  partySize: number;
};

export default function CalendarGridClient({
  slots,
  tables,
  blocksByTable,
  slotInterval,
}: {
  slots: Slot[];
  tables: Table[];
  blocksByTable: Record<string, Block[]>;
  slotInterval: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticBlocksByTable, applyOptimistic] =
    useOptimistic(blocksByTable);
  const scrollRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const capacityByTable = new Map(tables.map((t) => [t.id, t.capacity]));
  const [notice, setNotice] = useState<string | null>(null);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(t);
  }, [notice]);

  // Allow using CSS variables in inline style without any-casts
  type GridVars = CSSProperties & { [key in "--slot-count"]: string };

  function onDragStart(e: React.DragEvent<HTMLDivElement>, block: Block) {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        bookingId: block.bookingId,
        startISO: block.startISO,
        tableId: block.tableId,
      })
    );
    e.dataTransfer.effectAllowed = "move";
  }

  function onDropCell(
    e: React.DragEvent<HTMLDivElement>,
    cell: { tableId: string; slotISO: string }
  ) {
    e.preventDefault();
    const payload = e.dataTransfer.getData("text/plain");
    if (!payload) return;

    const { bookingId } = JSON.parse(payload) as {
      bookingId: string;
      startISO: string;
      tableId: string;
    };

    // Capacity guard on client: find party size of dragged booking
    let partySize: number | undefined;
    outer: for (const arr of Object.values(optimisticBlocksByTable)) {
      for (const b of arr) {
        if (b.bookingId === bookingId) {
          partySize = b.partySize;
          break outer;
        }
      }
    }
    const targetCapacity = capacityByTable.get(cell.tableId);
    if (partySize && targetCapacity && partySize > targetCapacity) {
      setNotice(
        `Too many guests for this table: seats ${targetCapacity}, party ${partySize}.`
      );
      return;
    }

    // Ottimismo UI
    applyOptimistic((prev) => {
      const next: Record<string, Block[]> = {};
      for (const [tid, arr] of Object.entries(prev)) {
        next[tid] = arr.filter((b) => b.bookingId !== bookingId);
      }
      const label = "Moving…";
      const startISO = cell.slotISO;
      const endISO = new Date(
        new Date(startISO).getTime() + slotInterval * 60000
      ).toISOString();
      const placeholder: Block = {
        bookingId,
        tableId: cell.tableId,
        startISO,
        endISO,
        label,
        status: "CONFIRMED",
        partySize: partySize ?? 1,
      };
      next[cell.tableId] = [...(next[cell.tableId] || []), placeholder];
      return next;
    });

    // Server Action + refresh
    startTransition(async () => {
      try {
        await moveBookingAction({
          bookingId,
          dateTimeISO: cell.slotISO,
          tableId: cell.tableId,
        });
        router.refresh();
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : typeof err === "string"
            ? err
            : "Move failed";
        setNotice(message);
        router.refresh(); // ripristina stato reale
      }
    });
  }

  // Auto-scroll the grid while dragging near edges
  function handleDragOverContainer(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const el = scrollRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const threshold = 60; // px from edges
    const maxSpeed = 20; // px per frame

    let dx = 0;
    let dy = 0;

    if (x < threshold) dx = -((threshold - x) / threshold) * maxSpeed;
    else if (x > rect.width - threshold)
      dx = ((x - (rect.width - threshold)) / threshold) * maxSpeed;

    if (y < threshold) dy = -((threshold - y) / threshold) * maxSpeed;
    else if (y > rect.height - threshold)
      dy = ((y - (rect.height - threshold)) / threshold) * maxSpeed;

    if (dx !== 0 || dy !== 0) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      const step = () => {
        if (dx) el.scrollLeft += dx;
        if (dy) el.scrollTop += dy;
        rafRef.current = requestAnimationFrame(step);
      };
      rafRef.current = requestAnimationFrame(step);
    } else if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  function stopAutoScroll() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  return (
    <>
      {/* Top bar */}
      <div className="mb-4 flex items-center gap-3 print:hidden">
        <button
          className="inline-flex items-center rounded-full border border-zinc-700 bg-black/60 px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
          onClick={() => window.print()}
          disabled={pending}
        >
          🖨️ Print view
        </button>
        {pending && (
          <span className="text-[0.7rem] text-zinc-400">Saving changes…</span>
        )}
      </div>

      {notice ? (
        <div className="mb-3 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200 print:hidden">
          {notice}
        </div>
      ) : null}

      {/* Grid wrapper */}
      <div
        ref={scrollRef}
        onDragOver={handleDragOverContainer}
        onDragEnd={stopAutoScroll}
        onDrop={stopAutoScroll}
        className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/40"
      >
        <div
          className="min-w-[900px] calendar-grid-root"
          style={{ "--slot-count": String(slots.length) } as GridVars}
        >
          {/* Header row */}
          <div
            className="grid calendar-grid"
            style={{
              gridTemplateColumns: `160px repeat(${slots.length}, minmax(50px,1fr))`,
            }}
          >
            <div className="sticky left-0 z-30 border-b border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
              Table
            </div>
            {slots.map((s, i) => (
              <div
                key={i}
                className="border-b border-zinc-800 bg-zinc-900/70 px-2 py-2 text-[0.7rem] text-zinc-400"
              >
                {s.time}
              </div>
            ))}
          </div>

          {/* Rows */}
          {tables.map((t) => {
            const blocks = (optimisticBlocksByTable[t.id] || []).sort(
              (a, b) =>
                new Date(a.startISO).getTime() -
                new Date(b.startISO).getTime()
            );

            return (
              <div
                key={t.id}
                className="grid calendar-grid"
                style={{
                  gridTemplateColumns: `160px repeat(${slots.length}, minmax(50px,1fr))`,
                }}
              >
                {/* Table info (sticky) */}
                <div className="sticky left-0 z-30 border-t border-zinc-800 bg-zinc-950 px-3 py-2 text-xs">
                  <div className="text-sm font-semibold text-zinc-50">
                    {t.code}
                  </div>
                  <div className="text-[0.7rem] text-zinc-500">
                    {t.area} • {t.capacity} covers
                  </div>
                </div>

                {/* Time slots */}
                {slots.map((s, idx) => {
                  const slotISO = s.date;
                  const cellMid = new Date(
                    new Date(slotISO).getTime() +
                      (slotInterval / 2) * 60_000
                  );
                  const block = blocks.find(
                    (b) =>
                      new Date(b.startISO) <= cellMid &&
                      cellMid < new Date(b.endISO)
                  );

                  const color = block
                    ? block.status === "CONFIRMED"
                      ? "bg-emerald-500/20 border-emerald-400/60"
                      : "bg-amber-500/20 border-amber-400/60"
                    : "bg-zinc-950 border-zinc-900";

                  return (
                    <div
                      key={idx}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) =>
                        onDropCell(e, { tableId: t.id, slotISO })
                      }
                      className={`border-t border-l px-1 py-1 text-[10px] text-zinc-300 ${color}`}
                    >
                      {block ? (
                        <div
                          draggable
                          onDragStart={(e) => onDragStart(e, block)}
                          className="cursor-move rounded-[6px] bg-black/40 px-1.5 py-1 text-[10px] text-zinc-100 shadow-sm ring-1 ring-black/40 hover:ring-amber-300/60"
                          title="Drag to move"
                        >
                          {block.label}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
