import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { requireRole } from "@/lib/authz";
import { Role } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCustomers({
  searchParams,
}: {
  // Next 15: è una Promise
  searchParams: Promise<{ q?: string; marketing?: string }>;
}) {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const marketingOnly = sp.marketing === "1";

  const where: Prisma.CustomerWhereInput = {};

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { surname: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { phone: { contains: q, mode: "insensitive" } },
    ];
  }

  if (marketingOnly) {
    where.marketingConsent = true;
  }

  const customers = await prisma.customer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bookings: true } },
    },
    take: 500,
  });

  const totalCount = await prisma.customer.count();
  const filteredCount = customers.length;

  const filterLinkBase =
    "inline-flex items-center rounded-full border px-4 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] transition";

  const consentBadge = (label: string, active: boolean) => {
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.18em] ${
          active
            ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
            : "border-zinc-700 bg-zinc-900/70 text-zinc-400"
        }`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Customers
        </p>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
          Customers
        </h1>
        <p className="max-w-xl text-sm text-zinc-400">
          Browse your guest list, see who booked, and check marketing consents.
        </p>
      </header>

      {/* Filters / search */}
      <section className="flex flex-wrap items-center gap-3 print:hidden">
        <form
          className="flex flex-1 items-center gap-2 max-w-md"
          action="/admin/customers"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search name, email, phone..."
            className="h-9 flex-1 rounded-full border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
          />
          {/* Mantieni il filtro marketing quando fai submit della search */}
          {marketingOnly && (
            <input type="hidden" name="marketing" value="1" />
          )}
          <button
            className="h-9 rounded-full bg-amber-500 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
            type="submit"
          >
            Search
          </button>
        </form>

        <Link
          href={marketingOnly ? "/admin/customers" : "/admin/customers?marketing=1"}
          className={`${filterLinkBase} ${
            marketingOnly
              ? "border-amber-400 bg-amber-500/10 text-amber-200"
              : "border-zinc-700 bg-black/40 text-zinc-200 hover:border-amber-400 hover:text-amber-200"
          }`}
        >
          Marketing consent
        </Link>

        <span className="ml-auto text-[0.7rem] text-zinc-500">
          Showing{" "}
          <span className="font-semibold text-zinc-200">{filteredCount}</span>{" "}
          of{" "}
          <span className="font-semibold text-zinc-200">{totalCount}</span>{" "}
          customers
        </span>
      </section>

      {/* Table */}
      <section className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/40">
        <table className="w-full border-separate border-spacing-0 text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/70 text-[0.7rem] uppercase tracking-[0.18em] text-zinc-500">
              <th className="py-3 pl-4 pr-2 text-left">Name</th>
              <th className="px-2 text-left">Email</th>
              <th className="px-2 text-left">Phone</th>
              <th className="px-2 text-left">Bookings</th>
              <th className="px-2 text-left">Consents</th>
              <th className="px-2 text-left">Created</th>
              <th className="px-4 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c, idx) => {
              const fullName =
                [c.name, c.surname].filter(Boolean).join(" ") || "Guest";
              return (
                <tr
                  key={c.id}
                  className={`border-b border-zinc-900/80 ${
                    idx % 2 === 0 ? "bg-black/20" : "bg-zinc-900/20"
                  }`}
                >
                  <td className="py-2.5 pl-4 pr-2 align-top text-zinc-100">
                    {fullName}
                  </td>
                  <td className="px-2 py-2.5 align-top text-zinc-200">
                    {c.email || "—"}
                  </td>
                  <td className="px-2 py-2.5 align-top text-zinc-200">
                    {c.phone || "—"}
                  </td>
                  <td className="px-2 py-2.5 align-top text-zinc-200">
                    {c._count.bookings}
                  </td>
                  <td className="px-2 py-2.5 align-top space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {consentBadge("MKT", c.marketingConsent)}
                      {consentBadge("PROF", c.profilingConsent)}
                      {consentBadge("PRIV", c.privacyConsent)}
                    </div>
                  </td>
                  <td className="px-2 py-2.5 align-top text-zinc-400">
                    {c.createdAt.toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-2.5 align-top text-right">
                    {c.email ? (
                      <Link
                        href={`/admin/bookings?customerEmail=${encodeURIComponent(c.email)}`}
                        className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-amber-300 hover:text-amber-200"
                      >
                        View bookings
                      </Link>
                    ) : (
                      <span className="text-[0.7rem] text-zinc-600">No email</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {customers.length === 0 && (
              <tr>
                <td
                  className="py-10 text-center text-sm text-zinc-500"
                  colSpan={7}
                >
                  No customers found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
