import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { Prisma, Role } from "@prisma/client";

export const dynamic = "force-dynamic";

// i valori possibili documentati nello schema
type WaitlistStatus = "OPEN" | "NOTIFIED" | "BOOKED" | "CANCELLED" | "EXPIRED";

export default async function AdminWaitlist({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; date?: string }>;
}) {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const sp = await searchParams;

  const where: Prisma.WaitlistEntryWhereInput = {};
  if (sp.status && sp.status !== "ALL") {
    where.status = sp.status as WaitlistStatus;
  }
  if (sp.date) {
    where.dateISO = sp.date;
  }

  const rows = await prisma.waitlistEntry.findMany({
    where,
    orderBy: [{ createdAt: "desc" }],
    take: 200,
  });

  const total = rows.length;

  const formatDateTime = (value: Date | null) => {
    if (!value) return "";
    return new Date(value).toLocaleString("en-GB", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const statusClass = (status: WaitlistStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
      case "NOTIFIED":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      case "BOOKED":
        return "bg-sky-500/15 text-sky-300 border-sky-500/30";
      case "CANCELLED":
        return "bg-red-500/10 text-red-300 border-red-500/30";
      case "EXPIRED":
        return "bg-zinc-700/40 text-zinc-300 border-zinc-600/70";
      default:
        return "bg-zinc-800 text-zinc-200 border-zinc-700";
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      {/* Header */}
      <header className="mb-6">
        <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Waitlist
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
              Waitlist
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              See who&apos;s waiting for a table, filter by date and status,
              and keep an eye on hot nights before they get busy.
            </p>
          </div>
          <div className="mt-2 text-right text-xs text-zinc-500 sm:text-[0.7rem]">
            <p className="uppercase tracking-[0.24em]">Entries</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">
              {total}
            </p>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
        <form
          method="GET"
          className="flex flex-wrap items-end gap-3 text-sm text-zinc-200"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="date"
              className="text-[0.7rem] uppercase tracking-[0.22em] text-zinc-500"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              name="date"
              defaultValue={sp.date}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="status"
              className="text-[0.7rem] uppercase tracking-[0.22em] text-zinc-500"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={sp.status ?? "OPEN"}
              className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
            >
              <option value="ALL">All</option>
              <option value="OPEN">OPEN</option>
              <option value="NOTIFIED">NOTIFIED</option>
              <option value="BOOKED">BOOKED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="EXPIRED">EXPIRED</option>
            </select>
          </div>

          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center rounded-full bg-amber-500 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
          >
            Apply
          </button>
        </form>
      </section>

      {/* Table */}
      <section className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/50">
        <table className="w-full border-separate border-spacing-0 text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60 text-[0.7rem] uppercase tracking-[0.18em] text-zinc-500">
              <th className="py-3 pl-4 pr-2 text-left">Created</th>
              <th className="px-2 text-left">Date</th>
              <th className="px-2 text-left">Name</th>
              <th className="px-2 text-left">Party</th>
              <th className="px-2 text-left">Area</th>
              <th className="px-2 text-left">Status</th>
              <th className="px-4 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr
                key={r.id}
                className={`border-b border-zinc-900/80 ${
                  idx % 2 === 0 ? "bg-black/20" : "bg-zinc-900/20"
                }`}
              >
                <td className="py-2.5 pl-4 pr-2 align-top text-zinc-300">
                  {formatDateTime(r.createdAt)}
                </td>
                <td className="px-2 py-2.5 align-top text-zinc-300">
                  {r.dateISO}
                </td>
                <td className="px-2 py-2.5 align-top text-zinc-100">
                  {r.name}
                </td>
                <td className="px-2 py-2.5 align-top text-zinc-200">
                  {r.partySize}
                </td>
                <td className="px-2 py-2.5 align-top text-zinc-300">
                  {r.area ?? "—"}
                </td>
                <td className="px-2 py-2.5 align-top">
                  <div className="flex flex-col gap-1">
                    <span
                      className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] ${statusClass(
                        r.status as WaitlistStatus
                      )}`}
                    >
                      {r.status}
                    </span>
                    {r.notifiedAt && (
                      <span className="text-[0.65rem] text-zinc-500">
                        Notified: {formatDateTime(r.notifiedAt)}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2.5 align-top text-zinc-300">
                  {r.email}
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-10 text-center text-sm text-zinc-500"
                >
                  No entries for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
