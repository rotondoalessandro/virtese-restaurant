import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@prisma/client";

const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function saveHourAction(weekday: number, formData: FormData) {
  "use server";
  const openTime = String(formData.get("openTime") || "12:00");
  const closeTime = String(formData.get("closeTime") || "23:00");
  await prisma.openingHour.upsert({
    where: { weekday },
    update: { openTime, closeTime },
    create: { weekday, openTime, closeTime },
  });
  revalidatePath("/admin/settings/hours");
}

export default async function HoursPage() {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const hours = await prisma.openingHour.findMany();
  const byDay = new Map(hours.map((h) => [h.weekday, h]));

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <header>
        <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Opening Hours
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Opening Hours
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Adjust the restaurant’s operating hours for each day of the week.
        </p>
      </header>

      {/* Forms */}
      <section className="grid gap-5">
        {labels.map((lbl, i) => {
          const h = byDay.get(i);
          return (
            <form
              key={i}
              action={saveHourAction.bind(null, i)}
              className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:border-amber-400/40"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                {/* Day Label */}
                <div>
                  <h3 className="text-base font-semibold text-zinc-100">
                    {lbl}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-500">
                    Define open and close times for {lbl}.
                  </p>
                </div>

                {/* Inputs */}
                <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
                  <label className="flex flex-col gap-1 text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
                    Open
                    <input
                      name="openTime"
                      type="time"
                      defaultValue={h?.openTime ?? "12:00"}
                      className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                    />
                  </label>

                  <label className="flex flex-col gap-1 text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
                    Close
                    <input
                      name="closeTime"
                      type="time"
                      defaultValue={h?.closeTime ?? "23:00"}
                      className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                    />
                  </label>

                  <div className="pt-1">
                    <button
                      type="submit"
                      className="inline-flex h-9 items-center justify-center rounded-full bg-amber-500 px-5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </form>
          );
        })}
      </section>
    </div>
  );
}
