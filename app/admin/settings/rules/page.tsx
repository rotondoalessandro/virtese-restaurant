import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/authz";
import { Role } from "@prisma/client";

async function saveRulesAction(formData: FormData) {
  "use server";

  const seatDuration = Number(formData.get("seatDuration") || 90);
  const slotInterval = Number(formData.get("slotInterval") || 15);
  const bufferBefore = Number(formData.get("bufferBefore") || 0);
  const bufferAfter = Number(formData.get("bufferAfter") || 0);
  const depositCents = formData.get("depositCents")
    ? Number(formData.get("depositCents"))
    : null;
  const maxCoversPerSlot = formData.get("maxCoversPerSlot")
    ? Number(formData.get("maxCoversPerSlot"))
    : null;

  const existing = await prisma.reservationRule.findFirst();
  if (existing) {
    await prisma.reservationRule.update({
      where: { id: existing.id },
      data: {
        seatDuration,
        slotInterval,
        bufferBefore,
        bufferAfter,
        depositCents,
        maxCoversPerSlot,
      },
    });
  } else {
    await prisma.reservationRule.create({
      data: {
        seatDuration,
        slotInterval,
        bufferBefore,
        bufferAfter,
        depositCents,
        maxCoversPerSlot,
      },
    });
  }
  revalidatePath("/admin/settings/rules");
}

export default async function RulesPage() {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const rule = await prisma.reservationRule.findFirst();

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Header */}
      <header>
        <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Reservation Rules
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Reservation Rules
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Control how long tables are held, how often slots are offered, and how
          many covers you take per time slot.
        </p>
      </header>

      {/* Form card */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-200">
        <form
          action={saveRulesAction}
          className="grid gap-5 md:grid-cols-2 md:gap-6"
        >
          {/* Seat duration */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="seatDuration"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Seat duration (min)
            </label>
            <input
              id="seatDuration"
              name="seatDuration"
              type="number"
              min={30}
              defaultValue={rule?.seatDuration ?? 90}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
            <p className="text-[0.7rem] text-zinc-500">
              Typical seating time for a table (e.g. 90 minutes).
            </p>
          </div>

          {/* Slot interval */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="slotInterval"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Slot interval (min)
            </label>
            <input
              id="slotInterval"
              name="slotInterval"
              type="number"
              min={5}
              defaultValue={rule?.slotInterval ?? 15}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
            <p className="text-[0.7rem] text-zinc-500">
              How often a new booking slot is generated.
            </p>
          </div>

          {/* Buffer before */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="bufferBefore"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Buffer before (min)
            </label>
            <input
              id="bufferBefore"
              name="bufferBefore"
              type="number"
              min={0}
              defaultValue={rule?.bufferBefore ?? 0}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
            <p className="text-[0.7rem] text-zinc-500">
              Time between one party leaving and the next arriving.
            </p>
          </div>

          {/* Buffer after */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="bufferAfter"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Buffer after (min)
            </label>
            <input
              id="bufferAfter"
              name="bufferAfter"
              type="number"
              min={0}
              defaultValue={rule?.bufferAfter ?? 0}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
            <p className="text-[0.7rem] text-zinc-500">
              Extra time after a booking before the next slot is offered.
            </p>
          </div>

          {/* Max covers per slot */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="maxCoversPerSlot"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Max covers per slot (optional)
            </label>
            <input
              id="maxCoversPerSlot"
              name="maxCoversPerSlot"
              type="number"
              min={0}
              defaultValue={rule?.maxCoversPerSlot ?? ""}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
            <p className="text-[0.7rem] text-zinc-500">
              Optional cap on total guests per time slot across all tables.
            </p>
          </div>

          {/* Deposit */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="depositCents"
              className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500"
            >
              Deposit (cents, optional)
            </label>
            <input
              id="depositCents"
              name="depositCents"
              type="number"
              min={0}
              defaultValue={rule?.depositCents ?? ""}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
            <p className="text-[0.7rem] text-zinc-500">
              Set a per-person or per-booking deposit (in smallest currency
              unit).
            </p>
          </div>

          {/* Save button full row */}
          <div className="md:col-span-2 pt-2">
            <button
              type="submit"
              className="inline-flex items-center rounded-full bg-amber-500 px-6 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
            >
              Save rules
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
