import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { hmToMinutes, buildDaySlots } from "@/lib/slots";
import CalendarGridClient from "./CalendarGridClient";
import { requireRole } from "@/lib/authz";
import { Area, Role } from "@prisma/client";

export const dynamic = "force-dynamic";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; area?: string }>;
}) {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const sp = await searchParams;
  const base = sp.date ? new Date(`${sp.date}T00:00:00`) : new Date();

  const areaFilter: Area | undefined =
    sp.area && sp.area !== "ALL" ? (sp.area as Area) : undefined;

  const dayStart = startOfDay(base);
  const dayEnd = endOfDay(base);
  const weekday = dayStart.getDay();

  const [rule, special, hours] = await Promise.all([
    prisma.reservationRule.findFirst(),
    prisma.specialHour.findFirst({
      where: { date: { gte: dayStart, lte: dayEnd } },
    }),
    prisma.openingHour.findFirst({ where: { weekday } }),
  ]);

  const seatDuration = rule?.seatDuration ?? 90;
  const bufferBefore = rule?.bufferBefore ?? 0;
  const bufferAfter = rule?.bufferAfter ?? 0;
  const slotInterval = rule?.slotInterval ?? 15;

  const open = special?.openTime ?? hours?.openTime ?? "12:00";
  const close = special?.closeTime ?? hours?.closeTime ?? "23:00";
  const openMins = hmToMinutes(open);
  const closeMins = hmToMinutes(close);

  const slots = buildDaySlots(dayStart, openMins, closeMins, slotInterval).map(
    (s) => ({
      time: s.time,
      date: s.date.toISOString(),
    })
  );

  const tables = await prisma.table.findMany({
    where: { active: true, ...(areaFilter ? { area: areaFilter } : {}) },
    orderBy: [{ area: "asc" }, { code: "asc" }],
  });

  const bookings = await prisma.booking.findMany({
    where: {
      dateTime: { gte: dayStart, lte: dayEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
      tables: { some: { tableId: { in: tables.map((t) => t.id) } } },
    },
    include: { customer: true, tables: { include: { table: true } } },
    orderBy: { dateTime: "asc" },
  });

  const blocksByTable: Record<
    string,
    {
      bookingId: string;
      tableId: string;
      startISO: string;
      endISO: string;
      label: string;
      status: "PENDING" | "CONFIRMED";
    }[]
  > = {};

  for (const t of tables) blocksByTable[t.id] = [];

  for (const b of bookings) {
    const st = new Date(b.dateTime);
    const startWithBuffer = new Date(st.getTime() - bufferBefore * 60_000);
    const endWithBuffer = new Date(
      st.getTime() + (seatDuration + bufferAfter) * 60_000
    );
    const label = `${st.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })} • ${b.customer?.name ?? "Guest"} (${b.partySize})`;

    for (const tb of b.tables) {
      if (!blocksByTable[tb.tableId]) continue; // fuori area filter
      blocksByTable[tb.tableId].push({
        bookingId: b.id,
        tableId: tb.tableId,
        startISO: startWithBuffer.toISOString(),
        endISO: endWithBuffer.toISOString(),
        status: b.status as "PENDING" | "CONFIRMED",
        label,
      });
    }
  }

  // Area options: riuso i tavoli già caricati
  const allAreas: Area[] = Array.from(new Set(tables.map((t) => t.area)));

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Calendar
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Calendar
        </h1>
        <p className="max-w-xl text-sm text-zinc-400">
          See how the night is filling up, slot by slot and table by table.
        </p>
      </header>

      {/* Filters (GET) */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5 print:hidden">
        <form
          method="GET"
          className="flex flex-wrap items-end gap-3 text-sm text-zinc-200"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="date"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              defaultValue={toISODate(dayStart)}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="area"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Area
            </label>
            <select
              id="area"
              name="area"
              defaultValue={areaFilter ?? "ALL"}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            >
              <option value="ALL">All</option>
              {allAreas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-full bg-amber-500 px-5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
          >
            Apply
          </button>

          <a
            href="/admin/calendar"
            className="inline-flex h-9 items-center justify-center rounded-full border border-zinc-700 px-5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-zinc-200 transition hover:border-amber-400 hover:text-amber-200"
          >
            Reset
          </a>
        </form>
      </section>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-zinc-400 print:hidden">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-emerald-400/70 bg-emerald-500/30" />
          Confirmed
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border border-amber-400/70 bg-amber-500/30" />
          Pending
        </span>
      </div>

      {/* Grid (client) */}
      <CalendarGridClient
        slots={slots}
        tables={tables.map((t) => ({
          id: t.id,
          code: t.code,
          area: t.area,
          capacity: t.capacity,
        }))}
        blocksByTable={blocksByTable}
        slotInterval={slotInterval}
      />

      {/* Print CSS */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          a, button, input, select { display: none !important; }
          .min-w-[900px] { min-width: 0 !important; }
        }
      `}</style>
    </div>
  );
}
