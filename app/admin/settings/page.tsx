import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { Role } from "@prisma/client";

export default async function AdminSettings() {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const rule = await prisma.reservationRule.findFirst();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <header>
        <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Settings
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Settings
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Manage key configuration values for the booking engine and service
          rules.
        </p>
      </header>

      {/* Reservation Rule Card */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-200">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
              Reservation Rule
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Defines default table slot intervals, seating duration, and
              service buffer times.
            </p>
          </div>
          <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-300">
            Active
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800 bg-black/40 p-3">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
              Seat Duration
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-50">
              {rule?.seatDuration ?? 90}{" "}
              <span className="text-sm text-zinc-400">min</span>
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/40 p-3">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
              Slot Interval
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-50">
              {rule?.slotInterval ?? 15}{" "}
              <span className="text-sm text-zinc-400">min</span>
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-black/40 p-3">
            <p className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
              Buffer Before / After
            </p>
            <p className="mt-2 text-lg font-semibold text-zinc-50">
              {rule?.bufferBefore ?? 0} / {rule?.bufferAfter ?? 0}{" "}
              <span className="text-sm text-zinc-400">min</span>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
