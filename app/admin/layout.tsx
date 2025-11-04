import Link from "next/link";
import type { ReactNode } from "react";

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-transparent bg-zinc-900/40 px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-zinc-300 transition hover:border-amber-400/70 hover:bg-zinc-900/80 hover:text-amber-100"
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#050505] text-zinc-50 md:grid-cols-[240px_1fr]">
      {/* SIDEBAR */}
      <aside className="border-b border-zinc-800 bg-black/70 backdrop-blur md:border-b-0 md:border-r">
        {/* Top brand */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-4">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-zinc-500">
              Virtese
            </p>
            <p className="text-sm font-semibold">Admin</p>
          </div>
          <Link
            href="/"
            className="rounded-full border border-zinc-700 px-3 py-1 text-[0.65rem] uppercase tracking-[0.24em] text-zinc-300 transition hover:border-amber-400 hover:text-amber-200"
          >
            Site
          </Link>
        </div>

        {/* Nav */}
        <nav className="space-y-6 px-3 py-5 text-sm">
          <div className="space-y-2">
            <p className="px-2 text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">
              Overview
            </p>
            <NavItem href="/admin" label="Dashboard" />
          </div>

          <div className="space-y-2">
            <p className="px-2 text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">
              Service
            </p>
            <NavItem href="/admin/calendar" label="Calendar" />
            <NavItem href="/admin/calendar/multi" label="Calendar · Multi" />
            <NavItem href="/admin/bookings" label="Bookings" />
            <NavItem href="/admin/bookings/new" label="New booking" />
            <NavItem href="/admin/tables" label="Tables" />
            <NavItem href="/admin/waitlist" label="Waitlist" />
          </div>

          <div className="space-y-2 border-t border-zinc-800 pt-4">
            <p className="px-2 text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">
              Settings
            </p>
            <NavItem href="/admin/settings/rules" label="Rules" />
            <NavItem href="/admin/settings/hours" label="Hours" />
          </div>

          <div className="space-y-2 border-t border-zinc-800 pt-4">
            <p className="px-2 text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">
              Studio
            </p>
            <NavItem href="/admin/studio" label="Open Studio" />
          </div>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="px-4 py-6 md:px-8 md:py-10">
        {children}
      </main>
    </div>
  );
}
