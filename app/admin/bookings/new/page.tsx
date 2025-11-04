import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addMinutes } from "date-fns";
import { pickTables } from "@/lib/tablePicker";
import { requireRole } from "@/lib/authz";
import { Prisma, Role } from "@prisma/client"; // 👈 Prisma added here

const FormSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
  party: z.coerce.number().min(1),
  area: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

async function createBookingAction(formData: FormData) {
  "use server";

  const raw = Object.fromEntries(formData.entries());
  const parsed = FormSchema.safeParse(raw);
  if (!parsed.success) throw new Error("Invalid form");

  const { date, time, party, area, name, email, phone, notes } = parsed.data;
  const dt = new Date(`${date}T${time}:00`);

  const rule = await prisma.reservationRule.findFirst();
  const seatDuration = rule?.seatDuration ?? 90;
  const bufferBefore = rule?.bufferBefore ?? 0;
  const bufferAfter = rule?.bufferAfter ?? 0;
  const start = addMinutes(dt, -bufferBefore);
  const end = addMinutes(dt, seatDuration + bufferAfter);

  // 👇 Build a typed where object instead of using `as any`
  const tableWhere: Prisma.TableWhereInput = {
    active: true,
  };
  if (area) {
    tableWhere.area = area as Prisma.TableWhereInput["area"];
  }

  const candidates = await prisma.table.findMany({
    where: tableWhere,
    select: { id: true, capacity: true, mergeGroup: true },
    orderBy: { capacity: "asc" },
  });

  const overlapping = await prisma.booking.findMany({
    where: {
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
  const picked = pickTables(free, party);
  if (!picked) throw new Error("No availability for selected time");

  const customer = email || phone
    ? await prisma.customer.upsert({
        where: { email: email || `anon-${Date.now()}@example.local` },
        update: { name, phone: phone || undefined },
        create: { name, email: email || null, phone: phone || null },
      })
    : null;

  const booking = await prisma.booking.create({
    data: {
      dateTime: dt,
      partySize: party,
      // 👇 Narrow `area` to the correct Prisma type instead of `as any`
      area: (area || null) as Prisma.BookingCreateInput["area"],
      status: "CONFIRMED",
      notes: notes || null,
      customerId: customer?.id,
      tables: { create: picked.map((id) => ({ tableId: id })) },
    },
  });

  revalidatePath("/admin/bookings");
  redirect(`/admin/bookings/${booking.id}/edit`);
}

export default async function NewBookingPage() {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const tables = await prisma.table.findMany({
    where: { active: true },
    orderBy: [{ area: "asc" }, { capacity: "asc" }],
  });

  const areas = Array.from(new Set(tables.map((t) => t.area)));

  const today = new Date();
  const defaultDate = today.toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <header>
        <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · New booking
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          New booking
        </h1>
        <p className="mt-2 max-w-xl text-sm text-zinc-400">
          Create a reservation manually, let the system pick tables, and jump
          straight into the booking details.
        </p>
      </header>

      {/* Form card */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 text-sm text-zinc-200">
        <form action={createBookingAction} className="grid gap-5 md:grid-cols-2">
          {/* Service details */}
          <div className="space-y-3">
            <p className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
              Service
            </p>

            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                  Date
                </span>
                <input
                  name="date"
                  type="date"
                  defaultValue={defaultDate}
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
                  defaultValue="19:30"
                  className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                  Party size
                </span>
                <input
                  name="party"
                  type="number"
                  min={1}
                  defaultValue={2}
                  className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                  Area
                </span>
                <select
                  name="area"
                  className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                >
                  <option value="">Any</option>
                  {areas.map((a) => (
                    <option key={a ?? "unknown"} value={a ?? ""}>
                      {a ?? "Unknown"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {/* Customer details */}
          <div className="space-y-3">
            <p className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
              Guest
            </p>

            <div className="space-y-3">
              <label className="flex flex-col gap-1">
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                  Name
                </span>
                <input
                  name="name"
                  className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                  placeholder="Customer name"
                  required
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                  placeholder="(optional)"
                />
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                  Phone
                </span>
                <input
                  name="phone"
                  className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                  placeholder="(optional)"
                />
              </label>
            </div>
          </div>

          {/* Notes full width */}
          <div className="md:col-span-2 space-y-2 pt-2">
            <label className="flex flex-col gap-1">
              <span className="text-[0.7rem] uppercase tracking-[0.2em] text-zinc-500">
                Notes
              </span>
              <textarea
                name="notes"
                rows={3}
                className="rounded-xl border border-zinc-700 bg-black/40 px-3 py-2 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                placeholder="Allergies, occasion..."
              />
            </label>
          </div>

          {/* Submit */}
          <div className="md:col-span-2 pt-2">
            <button className="inline-flex items-center rounded-full bg-amber-500 px-6 py-2.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400">
              Create booking
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
