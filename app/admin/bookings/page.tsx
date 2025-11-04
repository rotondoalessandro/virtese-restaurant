import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, addDays, parseISO } from "date-fns";
import Link from "next/link";
import { requireRole } from "@/lib/authz";
import { Role, BookingStatus } from "@prisma/client";

function rangeFromPreset(preset?: string) {
  const now = new Date();
  switch (preset) {
    case "today":
      return [startOfDay(now), endOfDay(now)] as const;
    case "tomorrow": {
      const d = addDays(now, 1);
      return [startOfDay(d), endOfDay(d)] as const;
    }
    default:
      return [addDays(now, -7), addDays(now, 7)] as const;
  }
}

export const dynamic = "force-dynamic";

export default async function AdminBookings({
  searchParams,
}: {
  // 👇 in Next 15 è una Promise
  searchParams: Promise<{ preset?: string; from?: string; to?: string }>;
}) {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);
  const sp = await searchParams; // 👈 attendi prima di leggere le props

  let from: Date, to: Date;
  if (sp.from && sp.to) {
    from = startOfDay(parseISO(sp.from));
    to = endOfDay(parseISO(sp.to));
  } else {
    [from, to] = rangeFromPreset(sp.preset);
  }

  const bookings = await prisma.booking.findMany({
    where: { dateTime: { gte: from, lte: to } },
    include: { customer: true, tables: { include: { table: true } } },
    orderBy: { dateTime: "asc" },
    take: 300,
  });

  const activePreset = sp.preset ?? "range";

  const statusClass = (status: BookingStatus) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
      case "PENDING":
        return "bg-amber-500/15 text-amber-300 border-amber-500/40";
      case "CANCELLED":
        return "bg-red-500/15 text-red-300 border-red-500/40";
      case "NO_SHOW":
        return "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/40";
      default:
        return "bg-zinc-800/80 text-zinc-200 border-zinc-700";
    }
  };

  const presetLinkBase =
    "inline-flex items-center rounded-full border px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Bookings
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Bookings
        </h1>
        <p className="max-w-xl text-sm text-zinc-400">
          See upcoming reservations, adjust details, and jump straight into
          each booking.
        </p>
      </header>

      {/* Preset filters */}
      <section className="flex flex-wrap gap-2 print:hidden">
        <Link
          className={`${presetLinkBase} ${
            activePreset === "today"
              ? "border-amber-400 bg-amber-500/10 text-amber-200"
              : "border-zinc-700 bg-black/40 text-zinc-200 hover:border-amber-400 hover:text-amber-200"
          }`}
          href="/admin/bookings?preset=today"
        >
          Today
        </Link>
        <Link
          className={`${presetLinkBase} ${
            activePreset === "tomorrow"
              ? "border-amber-400 bg-amber-500/10 text-amber-200"
              : "border-zinc-700 bg-black/40 text-zinc-200 hover:border-amber-400 hover:text-amber-200"
          }`}
          href="/admin/bookings?preset=tomorrow"
        >
          Tomorrow
        </Link>
        <Link
          className={`${presetLinkBase} ${
            activePreset === "range"
              ? "border-amber-400 bg-amber-500/10 text-amber-200"
              : "border-zinc-700 bg-black/40 text-zinc-200 hover:border-amber-400 hover:text-amber-200"
          }`}
          href="/admin/bookings"
        >
          ±7 days
        </Link>
        <span className="ml-auto text-[0.7rem] text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-zinc-200">
            {bookings.length}
          </span>{" "}
          bookings
        </span>
      </section>

      {/* Table */}
      <section className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/40">
        <table className="w-full border-separate border-spacing-0 text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/70 text-[0.7rem] uppercase tracking-[0.18em] text-zinc-500">
              <th className="py-3 pl-4 pr-2 text-left">Date</th>
              <th className="px-2 text-left">Time</th>
              <th className="px-2 text-left">Name</th>
              <th className="px-2 text-left">Party</th>
              <th className="px-2 text-left">Status</th>
              <th className="px-2 text-left">Tables</th>
              <th className="px-4 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b, idx) => (
              <tr
                key={b.id}
                className={`border-b border-zinc-900/80 ${
                  idx % 2 === 0 ? "bg-black/20" : "bg-zinc-900/20"
                }`}
              >
                <td className="py-2.5 pl-4 pr-2 align-top text-zinc-200">
                  {b.dateTime.toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-2 py-2.5 align-top text-zinc-200">
                  {b.dateTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-2 py-2.5 align-top text-zinc-100">
                  {b.customer?.name ?? "Guest"}
                </td>
                <td className="px-2 py-2.5 align-top text-zinc-200">
                  {b.partySize}
                </td>
                <td className="px-2 py-2.5 align-top">
                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${statusClass(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </td>
                <td className="px-2 py-2.5 align-top text-zinc-200">
                  {b.tables.map((t) => t.table.code).join(", ") || "—"}
                </td>
                <td className="px-4 py-2.5 align-top text-right">
                  <Link
                    className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-amber-300 hover:text-amber-200"
                    href={`/admin/bookings/${b.id}/edit`}
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}

            {bookings.length === 0 && (
              <tr>
                <td
                  className="py-10 text-center text-sm text-zinc-500"
                  colSpan={7}
                >
                  No bookings for this range.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
