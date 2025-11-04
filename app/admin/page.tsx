import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, addDays } from "date-fns";
import { requireRole } from "@/lib/authz";
import { Role } from "@prisma/client";

export default async function AdminHome() {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const today = new Date();
  const [todayCount, tomorrowCount] = await Promise.all([
    prisma.booking.count({
      where: {
        dateTime: { gte: startOfDay(today), lte: endOfDay(today) },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
    prisma.booking.count({
      where: {
        dateTime: {
          gte: startOfDay(addDays(today, 1)),
          lte: endOfDay(addDays(today, 1)),
        },
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    }),
  ]);

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-8">
        {/* Header */}
        <header className="mb-8">
          <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
            <span className="h-1 w-6 bg-amber-500" />
            Virtese · Admin
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
                Dashboard
              </h1>
              <p className="mt-2 max-w-xl text-sm text-zinc-400">
                Quick overview of tonight and tomorrow — keep an eye on how busy
                the restaurant is getting at a glance.
              </p>
            </div>
          </div>
        </header>

        {/* Stats row */}
        <section className="grid gap-5 sm:grid-cols-2">
          {/* Today card */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,158,11,0.12),_transparent_60%)]" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">
                    Bookings today
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    Pending + confirmed reservations for today&apos;s service.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-emerald-300">
                  Live
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tabular-nums">
                  {todayCount}
                </span>
                <span className="text-xs text-zinc-400">
                  {todayCount === 1 ? "booking" : "bookings"}
                </span>
              </div>
            </div>
          </div>

          {/* Tomorrow card */}
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.14),_transparent_65%)]" />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">
                    Bookings tomorrow
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    How busy the next service is looking so far.
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-zinc-800 px-3 py-1 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-zinc-300">
                  Forecast
                </span>
              </div>

              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tabular-nums">
                  {tomorrowCount}
                </span>
                <span className="text-xs text-zinc-400">
                  {tomorrowCount === 1 ? "booking" : "bookings"}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
