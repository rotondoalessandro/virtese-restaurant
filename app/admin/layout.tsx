import Link from "next/link";
import type { ReactNode } from "react";

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block rounded-xl border border-[#e1d6c9] bg-white px-3 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#5b4b41] shadow-sm transition hover:-translate-y-[1px] hover:border-[#d7c4b3] hover:bg-[#f8f2ea]"
    >
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#f7f2ec] text-[#5b4b41]">
      <div className="grid min-h-[calc(100vh-4rem)] grid-cols-1 border-t border-[#e1d6c9] md:grid-cols-[260px_1fr]">
        <aside className="border-b border-[#e1d6c9] bg-white/90 backdrop-blur-sm md:border-b-0 md:border-r">
          <div className="flex items-center justify-between border-b border-[#e1d6c9] px-5 py-5">
            <div>
              <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#b19c88]">Virtese</p>
              <p className="text-sm font-semibold text-[#3f3127]">Team admin</p>
            </div>
            <Link
              href="/"
              className="rounded-full border border-[#e1d6c9] bg-[#f8f2ea] px-3 py-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:border-[#d7c4b3] hover:bg-white"
            >
              Site
            </Link>
          </div>

          <nav className="space-y-5 px-4 py-5 text-sm">

            <div className="space-y-2">
              <p className="px-2 text-[0.7rem] uppercase tracking-[0.22em] text-[#b19c88]">Settings</p>
              <NavItem href="/admin/settings/hours" label="Hours" />
            </div>

            <div className="space-y-2 border-t border-[#e1d6c9] pt-4">
              <p className="px-2 text-[0.7rem] uppercase tracking-[0.22em] text-[#b19c88]">Studio</p>
              <NavItem href="/admin/studio" label="Open Studio" />
            </div>
          </nav>
        </aside>

        <section className="bg-[#f7f2ec] px-4 py-6 md:px-10 md:py-10">
          {children}
        </section>
      </div>
    </div>
  );
}
