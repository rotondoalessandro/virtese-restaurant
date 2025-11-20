import { requireRole } from "@/lib/authz";
import { Role } from "@prisma/client";
import Link from "next/link";

export default async function AdminSettings() {
  await requireRole([Role.OWNER, Role.MANAGER, Role.HOST]);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header className="space-y-2">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#8a7463]">
          Virtese - Settings
        </p>
        <h1 className="font-display text-3xl leading-tight text-[#3f3127] sm:text-4xl">
          Settings now live in Sanity
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#5b4b41]">
          Booking rules and content are now managed via Sanity Studio. Use the Studio to update content, menus and hours.
        </p>
      </header>

      <section className="rounded-[1.25rem] border border-[#e1d6c9] bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-[#8a7463]">Next steps</p>
            <p className="mt-1 text-sm text-[#5b4b41]">
              Open the Studio, edit content, then publish to update the site.
            </p>
          </div>
          <Link
            href="/admin/studio"
            className="inline-flex items-center justify-center rounded-full bg-[#5b4b41] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c]"
          >
            Open Studio
          </Link>
        </div>
      </section>
    </div>
  );
}
