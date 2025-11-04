import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { hmToMinutes, buildDaySlots } from "@/lib/slots";
import { requireRole } from "@/lib/authz";
import { Area, BookingStatus, Role } from "@prisma/client";

export const dynamic = "force-dynamic";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

// stesso shape dei blocchi usati nel calendar client
type Block = {
  bookingId: string;
  tableId: string;
  startISO: string;
  endISO: string;
  label: string;
  status: BookingStatus; // in pratica PENDING | CONFIRMED qui
};

type Slot = { time: string; date: string };

type DayData = {
  dayStart: Date;
  slots: Slot[];
  blocksByTable: Record<string, Block[]>;
};

export default async function CalendarMulti({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; area?: string; days?: string }>;
}) {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const sp = await searchParams;
  const base = sp.date ? new Date(`${sp.date}T00:00:00`) : new Date();
  const areaFilter: Area | undefined =
    sp.area && sp.area !== "ALL" ? (sp.area as Area) : undefined;
  const days = Math.min(Math.max(parseInt(sp.days ?? "3") || 3, 1), 7);

  const [rule] = await Promise.all([prisma.reservationRule.findFirst()]);
  const seatDuration = rule?.seatDuration ?? 90;
  const bufferBefore = rule?.bufferBefore ?? 0;
  const bufferAfter = rule?.bufferAfter ?? 0;
  const slotInterval = rule?.slotInterval ?? 15;

  const tables = await prisma.table.findMany({
    where: { active: true, ...(areaFilter ? { area: areaFilter } : {}) },
    orderBy: [{ area: "asc" }, { code: "asc" }],
  });

  const areas = Array.from(
    new Set(
      (
        await prisma.table.findMany({
          select: { area: true },
        })
      ).map((t) => t.area)
    )
  );

  const daysData: DayData[] = await Promise.all(
    Array.from({ length: days }, (_, i) => i).map(async (i) => {
      const dayStart = startOfDay(addDays(base, i));
      const dayEnd = endOfDay(addDays(base, i));
      const weekday = dayStart.getDay();

      const [special, hours] = await Promise.all([
        prisma.specialHour.findFirst({
          where: { date: { gte: dayStart, lte: dayEnd } },
        }),
        prisma.openingHour.findFirst({ where: { weekday } }),
      ]);

      const open = special?.openTime ?? hours?.openTime ?? "12:00";
      const close = special?.closeTime ?? hours?.closeTime ?? "23:00";
      const openMins = hmToMinutes(open);
      const closeMins = hmToMinutes(close);

      const slots: Slot[] = buildDaySlots(
        dayStart,
        openMins,
        closeMins,
        slotInterval
      ).map((s) => ({
        time: s.time,
        date: s.date.toISOString(),
      }));

      const bookings = await prisma.booking.findMany({
        where: {
          dateTime: { gte: dayStart, lte: dayEnd },
          status: { in: ["PENDING", "CONFIRMED"] },
          tables: { some: { tableId: { in: tables.map((t) => t.id) } } },
        },
        include: {
          customer: true,
          tables: { include: { table: true } },
        },
        orderBy: { dateTime: "asc" },
      });

      const blocksByTable: Record<string, Block[]> = {};
      for (const t of tables) blocksByTable[t.id] = [];

      for (const b of bookings) {
        const st = new Date(b.dateTime);
        const startWithBuffer = new Date(
          st.getTime() - bufferBefore * 60_000
        );
        const endWithBuffer = new Date(
          st.getTime() + (seatDuration + bufferAfter) * 60_000
        );
        const label = `${st.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })} • ${b.customer?.name ?? "Guest"} (${b.partySize})`;

        for (const tb of b.tables) {
          if (!blocksByTable[tb.tableId]) continue;
          blocksByTable[tb.tableId].push({
            bookingId: b.id,
            tableId: tb.tableId,
            startISO: startWithBuffer.toISOString(),
            endISO: endWithBuffer.toISOString(),
            label,
            status: b.status,
          });
        }
      }

      return { dayStart, slots, blocksByTable };
    })
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Calendar — Multi day
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Calendar — Multi day
        </h1>
        <p className="max-w-xl text-sm text-zinc-400">
          Compare multiple services side by side and keep track of how the week
          is filling up.
        </p>
      </header>

      {/* Filters */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
        <form
          method="GET"
          className="flex flex-wrap items-end gap-3 text-sm text-zinc-200"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="date"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Start date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              defaultValue={toISODate(startOfDay(base))}
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
              {areas.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="days"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Days
            </label>
            <input
              id="days"
              type="number"
              min={1}
              max={7}
              name="days"
              defaultValue={days}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
          </div>

          <button
            className="inline-flex h-9 items-center justify-center rounded-full bg-amber-500 px-5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
            type="submit"
          >
            Apply
          </button>
        </form>
      </section>

      {/* Days */}
      <div className="space-y-8">
        {daysData.map((d, i) => (
          <section key={i} className="space-y-3">
            <h2 className="text-lg font-semibold text-zinc-50">
              {new Date(d.dayStart).toLocaleDateString(undefined, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h2>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/40">
              <div className="min-w-[900px]">
                {/* header righe orarie */}
                <div
                  className="grid"
                  style={{
                    gridTemplateColumns: `160px repeat(${d.slots.length}, minmax(50px,1fr))`,
                  }}
                >
                  <div className="sticky left-0 z-10 border-b border-zinc-800 bg-zinc-950 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-300">
                    Table
                  </div>
                  {d.slots.map((s, j) => (
                    <div
                      key={j}
                      className="border-b border-zinc-800 bg-zinc-900/70 px-2 py-2 text-[0.7rem] text-zinc-400"
                    >
                      {s.time}
                    </div>
                  ))}
                </div>

                {/* righe tavoli */}
                {tables.map((t) => {
                  const blocks: Block[] = [...(d.blocksByTable[t.id] ?? [])].sort(
                    (a, b) =>
                      new Date(a.startISO).getTime() -
                      new Date(b.startISO).getTime()
                  );

                  return (
                    <div
                      key={t.id}
                      className="grid"
                      style={{
                        gridTemplateColumns: `160px repeat(${d.slots.length}, minmax(50px,1fr))`,
                      }}
                    >
                      <div className="sticky left-0 z-10 border-t border-zinc-800 bg-zinc-950 px-3 py-2 text-xs">
                        <div className="text-sm font-semibold text-zinc-50">
                          {t.code}
                        </div>
                        <div className="text-[0.7rem] text-zinc-500">
                          {t.area} • {t.capacity} covers
                        </div>
                      </div>

                      {d.slots.map((s, idx) => {
                        const cellMid = new Date(
                          new Date(s.date).getTime() +
                            (slotInterval / 2) * 60_000
                        );

                        const block = blocks.find(
                          (b) =>
                            new Date(b.startISO) <= cellMid &&
                            cellMid < new Date(b.endISO)
                        );

                        const color = block
                          ? block.status === "CONFIRMED"
                            ? "bg-emerald-500/20 border-emerald-400/60 text-zinc-100"
                            : "bg-amber-500/20 border-amber-400/60 text-zinc-100"
                          : "bg-zinc-950 border-zinc-900 text-zinc-300";

                        return (
                          <div
                            key={idx}
                            className={`border-t border-l px-1 py-1 text-[10px] ${color}`}
                          >
                            {block ? block.label : ""}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
