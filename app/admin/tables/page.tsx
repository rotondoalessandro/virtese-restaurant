import { prisma } from "@/lib/prisma";
import {
  createTableAction,
  updateTableAction,
  toggleActiveAction,
  deleteTableAction,
} from "./actions";
import ConfirmSubmit from "./ConfirmSubmit";
import { requireRole } from "@/lib/authz";
import { Role } from "@prisma/client";

export default async function AdminTables() {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  const tables = await prisma.table.findMany({
    orderBy: [{ area: "asc" }, { code: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <header>
        <p className="mb-3 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.3em] text-zinc-500">
          <span className="h-1 w-6 bg-amber-500" />
          Virtese · Tables
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
              Tables
            </h1>
            <p className="mt-2 max-w-xl text-sm text-zinc-400">
              Manage table codes, areas and capacities so the booking engine
              reflects how the dining room really works.
            </p>
          </div>
          <div className="mt-2 text-right text-xs text-zinc-500 sm:text-[0.7rem]">
            <p className="uppercase tracking-[0.24em]">Total tables</p>
            <p className="mt-1 text-sm font-semibold text-zinc-100">
              {tables.length}
            </p>
          </div>
        </div>
      </header>

      {/* Add table */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
              Add table
            </p>
            <p className="mt-1 text-xs text-zinc-400">
              Create a new table and assign it to an area / merge group.
            </p>
          </div>
        </div>

        <form
          action={createTableAction}
          className="grid gap-3 text-sm md:grid-cols-5"
        >
          <input
            name="code"
            placeholder="Code (e.g. I1)"
            className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60 md:col-span-1"
            required
          />
          <input
            name="capacity"
            type="number"
            min={1}
            defaultValue={2}
            className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60 md:col-span-1"
          />
          <select
            name="area"
            defaultValue="INDOOR"
            className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60 md:col-span-1"
          >
            <option value="INDOOR">INDOOR</option>
            <option value="OUTDOOR">OUTDOOR</option>
            <option value="BAR">BAR</option>
            <option value="HIGHTOP">HIGHTOP</option>
            <option value="PRIVATE">PRIVATE</option>
          </select>
          <input
            name="mergeGroup"
            placeholder="Merge group (optional)"
            className="h-9 rounded-xl border border-zinc-700 bg-black/40 px-3 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60 md:col-span-1"
          />
          <button
            className="inline-flex h-9 items-center justify-center rounded-full bg-amber-500 px-4 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 md:col-span-1"
          >
            Add
          </button>
        </form>
      </section>

      {/* List */}
      <section>
        <p className="mb-3 text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
          Existing tables
        </p>
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tables.map((t) => (
            <li
              key={t.id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-black/50 p-4 text-sm text-zinc-100"
            >
              {/* Header + toggle */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold">{t.code}</span>
                    <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.22em] text-zinc-300">
                      {t.area}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-400">
                    Capacity:{" "}
                    <span className="font-medium text-zinc-100">
                      {t.capacity}
                    </span>
                    {t.mergeGroup && (
                      <>
                        {" "}
                        · Merge group:{" "}
                        <span className="font-medium text-zinc-100">
                          {t.mergeGroup}
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <form action={toggleActiveAction.bind(null, t.id, !t.active)}>
                  <button
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] transition ${
                      t.active
                        ? "border-emerald-400/60 bg-emerald-500/10 text-emerald-300 hover:border-emerald-300"
                        : "border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:border-amber-400 hover:text-amber-200"
                    }`}
                  >
                    {t.active ? "Active" : "Inactive"}
                  </button>
                </form>
              </div>

              {/* Update form */}
              <form
                action={updateTableAction.bind(null, t.id)}
                className="grid gap-2 text-xs text-zinc-200"
              >
                <label className="grid gap-1">
                  <span className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
                    Code
                  </span>
                  <input
                    name="code"
                    defaultValue={t.code}
                    className="h-8 rounded-xl border border-zinc-700 bg-black/40 px-2 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
                    Capacity
                  </span>
                  <input
                    name="capacity"
                    type="number"
                    min={1}
                    defaultValue={t.capacity}
                    className="h-8 rounded-xl border border-zinc-700 bg-black/40 px-2 text-xs text-zinc-100 outline-none ring-0 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                  />
                </label>
                <label className="grid gap-1">
                  <span className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
                    Area
                  </span>
                  <select
                    name="area"
                    defaultValue={t.area}
                    className="h-8 rounded-xl border border-zinc-700 bg-black/40 px-2 text-xs text-zinc-100 outline-none ring-0 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                  >
                    <option value="INDOOR">INDOOR</option>
                    <option value="OUTDOOR">OUTDOOR</option>
                    <option value="BAR">BAR</option>
                    <option value="HIGHTOP">HIGHTOP</option>
                    <option value="PRIVATE">PRIVATE</option>
                  </select>
                </label>
                <label className="grid gap-1">
                  <span className="text-[0.65rem] uppercase tracking-[0.22em] text-zinc-500">
                    Merge group
                  </span>
                  <input
                    name="mergeGroup"
                    defaultValue={t.mergeGroup ?? ""}
                    placeholder="e.g. G1"
                    className="h-8 rounded-xl border border-zinc-700 bg-black/40 px-2 text-xs text-zinc-100 outline-none ring-0 placeholder:text-zinc-500 focus:border-amber-400 focus:ring-1 focus:ring-amber-400/60"
                  />
                </label>

                <div className="mt-2 flex items-center gap-2">
                  <button className="inline-flex items-center rounded-full border border-zinc-600 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200">
                    Save
                  </button>
                </div>
              </form>

              {/* Delete */}
              <form action={deleteTableAction.bind(null, t.id)}>
                <ConfirmSubmit
                  message="Delete table? Allowed only if it has never been used."
                  className="mt-1 inline-flex items-center rounded-full border border-red-500/60 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-red-300 transition hover:border-red-400 hover:text-red-200"
                >
                  Delete
                </ConfirmSubmit>
              </form>

              {!t.active && (
                <p className="pt-1 text-[0.65rem] text-zinc-500">
                  This table is inactive and won’t be offered for new bookings.
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
