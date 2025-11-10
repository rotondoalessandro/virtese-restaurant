import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addMinutes } from "date-fns";
import { Area, BookingStatus, Role } from "@prisma/client";
import { pickTables } from "@/lib/tablePicker";
import { randomUUID } from "crypto";
import { computeAllocationWindow } from "@/lib/reservationWindow";
import { requireRole } from "@/lib/authz";

export const dynamic = "force-dynamic";

/* ===========================
   DATA LOADER
=========================== */
async function getData(id: string) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      customer: true,
      tables: { include: { table: true } },
    },
  });
  if (!booking) return null;

  const tables = await prisma.table.findMany({
    where: { active: true },
    orderBy: [{ area: "asc" }, { code: "asc" }],
  });
  // Compute currently busy tables for this booking's time window
  const rule = await prisma.reservationRule.findFirst();
  const seatDuration = rule?.seatDuration ?? 90;
  const bufferBefore = rule?.bufferBefore ?? 0;
  const bufferAfter = rule?.bufferAfter ?? 0;
  const start = addMinutes(booking.dateTime, -bufferBefore);
  const end = addMinutes(booking.dateTime, seatDuration + bufferAfter);

  const overlapping = await prisma.booking.findMany({
    where: {
      id: { not: id },
      status: { in: ["PENDING", "CONFIRMED"] },
      dateTime: { lt: end, gt: addMinutes(start, -seatDuration) },
    },
    include: { tables: true },
  });

  const busyIds = new Set<string>();
  for (const b of overlapping) for (const t of b.tables) busyIds.add(t.tableId);

  return { booking, tables, busyIds: Array.from(busyIds) };
}

/* ===========================
   SERVER ACTIONS
=========================== */
const UpdateSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  partySize: z.coerce.number().int().min(1),
  area: z.nativeEnum(Area).nullable().optional(),
  status: z.nativeEnum(BookingStatus),
  notes: z.string().optional().nullable(),
  tableIds: z.array(z.string()).optional(), // può essere vuoto -> auto-assign
  sendEmail: z.coerce.boolean().optional().default(false),
});

async function updateBookingAction(formData: FormData) {
  "use server";

  await requireRole([Role.OWNER, Role.MANAGER]);

  const raw = {
    id: String(formData.get("id") || ""),
    date: String(formData.get("date") || ""),
    time: String(formData.get("time") || ""),
    partySize: Number(formData.get("partySize") || 1),
    // 👇 niente `any`, lasciamo string | null e ci pensa Zod
    area: String(formData.get("area") || "") || null,
    status: String(formData.get("status") || "CONFIRMED") as BookingStatus,
    notes: String(formData.get("notes") || ""),
    tableIds: (formData.getAll("tableIds") as string[]) || [],
    sendEmail: formData.get("sendEmail") === "on",
  };

  const parsed = UpdateSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error("Invalid form data");
  }

  const { id, date, time, partySize, area, status, notes, tableIds, sendEmail } =
    parsed.data;

  const dt = new Date(`${date}T${time}:00`);

  // Regole attuali
  const rule = await prisma.reservationRule.findFirst();
  const seatDuration = rule?.seatDuration ?? 90;
  const bufferBefore = rule?.bufferBefore ?? 0;
  const bufferAfter = rule?.bufferAfter ?? 0;

  // Auto-assign se nessun tavolo selezionato
  let selectedTableIds = tableIds ?? [];
  if (!selectedTableIds.length) {
    const candidates = await prisma.table.findMany({
      where: { active: true, ...(area ? { area } : {}) },
      select: { id: true, capacity: true, mergeGroup: true },
      orderBy: { capacity: "asc" },
    });

    const start = addMinutes(dt, -bufferBefore);
    const end = addMinutes(dt, seatDuration + bufferAfter);

    const overlapping = await prisma.booking.findMany({
      where: {
        id: { not: id },
        status: { in: ["PENDING", "CONFIRMED"] },
        dateTime: { lt: end, gt: addMinutes(start, -seatDuration) },
      },
      include: { tables: true },
    });

    const busy = new Set<string>();
    for (const b of overlapping) {
      for (const t of b.tables) busy.add(t.tableId);
    }

    const free = candidates.filter((t) => !busy.has(t.id));
    const picked = pickTables(free, partySize);
    if (!picked) {
      throw new Error("No availability for the chosen time/area.");
    }
    selectedTableIds = picked;
  }

  // Calcola la finestra di allocazione per le righe BookingTable
  const { start_at, end_at } = computeAllocationWindow(dt, {
    seatDuration,
    bufferBefore,
    bufferAfter,
  });

  // Transazione: reset join e aggiorna booking + ricrea join con start_at/end_at
  try {
    await prisma.$transaction(async (tx) => {
      // pulisci allocazioni precedenti
      await tx.bookingTable.deleteMany({ where: { bookingId: id } });

      // aggiorna booking
      await tx.booking.update({
        where: { id },
        data: {
          dateTime: dt,
          partySize,
          area: area ?? null,
          status,
          notes: notes || null,
          ...(status === "PENDING" || status === "CONFIRMED"
            ? {
                tables: {
                  create: selectedTableIds.map((tid) => ({
                    tableId: tid,
                    start_at,
                    end_at,
                  })),
                },
              }
            : {}),
        },
      });
    });
  } catch (err: unknown) {
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();

    if (
      msg.includes("bookingtable_no_overlap") ||
      msg.includes("nowait") ||
      msg.includes("could not obtain lock")
    ) {
      // Redirect back with a friendly error banner
      const encoded = encodeURIComponent(
        "That table is already booked at that time. Pick different tables or adjust the time."
      );
      redirect(`/admin/bookings/${id}/edit?error=${encoded}`);
    }
    throw err;
  }

  // Reinvia email (opzionale) se CONFIRMED
  if (sendEmail && status === "CONFIRMED") {
    const updated = await prisma.booking.findUnique({
      where: { id },
      include: { customer: true },
    });

    if (updated?.customer?.email) {
      let token = updated.manageToken ?? "";
      if (!token) {
        token = randomUUID();
        await prisma.booking.update({
          where: { id },
          data: { manageToken: token },
        });
      }
      const { sendBookingConfirmation } = await import("@/lib/email");
      await sendBookingConfirmation(updated.customer.email, {
        name: updated.customer.name ?? "Guest",
        dateTime: updated.dateTime,
        partySize: updated.partySize,
        area: updated.area,
        manageToken: token,
      }).catch((e) => console.error("resend email failed", e));
    }
  }

  revalidatePath("/admin/bookings");
  redirect("/admin/bookings");
}

async function cancelBookingAction(id: string) {
  "use server";
  await requireRole([Role.OWNER, Role.MANAGER]);
  await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
  revalidatePath("/admin/bookings");
  redirect("/admin/bookings");
}

/* ===========================
   PAGE
=========================== */
export default async function EditBookingPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ error?: string }>;
}) {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  // 👇 Next ora vuole che `params` sia awaited
  const { id } = await props.params;
  const sp = props.searchParams ? await props.searchParams : {};
  const friendlyError = sp?.error;

  const data = await getData(id);
  if (!data) notFound();
  const { booking, tables, busyIds } = data;

  const d = booking.dateTime;
  const date = d.toISOString().slice(0, 10);
  const time = d.toTimeString().slice(0, 5);

  const currentTableIds = new Set(booking.tables.map((bt) => bt.tableId));
  const busySet = new Set<string>(busyIds ?? []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <header>
        <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Edit booking
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Edit booking
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Adjust time, party, tables and status. Changes apply immediately to
          the floor plan.
        </p>
      </header>

      {/* Main form card */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-200">
        {friendlyError ? (
          <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {friendlyError}
          </div>
        ) : null}
        <form action={updateBookingAction} className="space-y-5">
          <input type="hidden" name="id" value={booking.id} />

          {/* Date / time */}
          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                Date
              </span>
              <input
                name="date"
                type="date"
                defaultValue={date}
                required
                className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                Time
              </span>
              <input
                name="time"
                type="time"
                defaultValue={time}
                required
                className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
              />
            </label>
          </div>

          {/* Party / Area / Status */}
          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                Party size
              </span>
              <input
                name="partySize"
                type="number"
                min={1}
                defaultValue={booking.partySize}
                required
                className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                Area
              </span>
              <select
                name="area"
                defaultValue={booking.area ?? ""}
                className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
              >
                <option value="">(no preference)</option>
                <option value="INDOOR">INDOOR</option>
                <option value="OUTDOOR">OUTDOOR</option>
                <option value="BAR">BAR</option>
                <option value="HIGHTOP">HIGHTOP</option>
                <option value="PRIVATE">PRIVATE</option>
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                Status
              </span>
              <select
                name="status"
                defaultValue={booking.status}
                className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
              >
                <option value="PENDING">PENDING</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
                <option value="NO_SHOW">NO_SHOW</option>
              </select>
            </label>
          </div>

          {/* Notes */}
          <label className="flex flex-col gap-1">
            <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
              Notes
            </span>
            <textarea
              name="notes"
              rows={3}
              defaultValue={booking.notes ?? ""}
              className="rounded-xl border border-zinc-700 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
          </label>

          {/* Tables selection */}
          <div className="rounded-2xl border border-zinc-800 bg-black/40 p-3">
            <div className="mb-2 text-sm font-medium text-zinc-100">
              Tables{" "}
              <span className="text-[0.7rem] font-normal uppercase tracking-[0.18em] text-zinc-500">
                (leave empty to auto-assign)
              </span>
            </div>
            <div className="grid max-h-64 gap-2 overflow-auto pr-2 md:grid-cols-2">
              {tables.map((t) => {
                const isAssigned = currentTableIds.has(t.id);
                const isBusy = !isAssigned && busySet.has(t.id);
                return (
                  <label
                    key={t.id}
                    className={
                      "flex items-center gap-2 text-xs " +
                      (isBusy ? "text-zinc-500 opacity-60 cursor-not-allowed" : "text-zinc-200")
                    }
                    title={isBusy ? "Unavailable at this time" : undefined}
                  >
                    <input
                      type="checkbox"
                      name="tableIds"
                      value={t.id}
                      defaultChecked={isAssigned}
                      disabled={isBusy}
                      className="h-3 w-3 accent-amber-500"
                    />
                    <span className="inline-flex flex-wrap items-center gap-1">
                      <span className="font-semibold text-zinc-50">
                        {t.code}
                      </span>
                      <span className="text-zinc-500">{t.area}</span>
                      <span className="text-zinc-500">{t.capacity} seats</span>
                      {t.mergeGroup ? (
                        <span className="text-zinc-600">[{t.mergeGroup}]</span>
                      ) : null}
                      {isBusy ? (
                        <span className="ml-1 rounded bg-red-500/15 px-2 py-[2px] text-[10px] font-medium text-red-300">
                          unavailable
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="mt-2 text-[0.7rem] text-zinc-500">
              If you don’t select any tables, the system will try to
              auto-assign suitable tables for the chosen time/area.
            </p>
          </div>

          {/* Email checkbox */}
          <label className="flex items-center gap-2 text-xs text-zinc-200">
            <input
              type="checkbox"
              name="sendEmail"
              className="h-3 w-3 accent-amber-500"
            />
            <span>Resend confirmation email if status is CONFIRMED</span>
          </label>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button className="inline-flex items-center rounded-full bg-amber-500 px-6 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400">
              Save changes
            </button>
          </div>
        </form>

        {/* Cancel form (separate, non-nested) */}
        <div className="mt-4">
          <form action={cancelBookingAction.bind(null, booking.id)}>
            <button
              className="inline-flex items-center rounded-full border border-red-500/60 px-5 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-red-300 transition hover:border-red-400 hover:text-red-200"
              type="submit"
            >
              Cancel booking
            </button>
          </form>
        </div>
      </section>

      {/* Customer info */}
      <section className="rounded-2xl border border-zinc-800 bg-black/40 p-4 text-xs text-zinc-300">
        <p className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
          Customer
        </p>
        <p className="mt-2">
          <span className="font-semibold text-zinc-50">
            {booking.customer?.name ?? "Guest"}
          </span>{" "}
          — {booking.customer?.email ?? "no email"}
        </p>
      </section>
    </div>
  );
}
