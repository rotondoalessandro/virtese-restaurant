export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSlots } from "@/lib/availability";

export async function GET() {
  try {
    const now = new Date();
    const twoWeeks = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    const openEntries = await prisma.waitlistEntry.findMany({
      where: {
        status: "OPEN",
        dateISO: {
          gte: now.toISOString().slice(0, 10),
          lte: twoWeeks.toISOString().slice(0, 10),
        },
      },
      take: 200,
    });

    let notified = 0;

    for (const w of openEntries) {
      const slots = await getSlots({
        dateISO: w.dateISO,
        party: w.partySize,
        area: w.area ?? undefined,
      });
      const available = slots.filter((s) => s.available === 1);

      if (available.length) {
        const suggestions = available
          .slice(0, 3)
          .map((s) => ({ time: s.time, area: s.suggestedArea }));

        await import("@/lib/email").then((m) =>
          m.sendWaitlistNotification(w.email, {
            name: w.name,
            dateISO: w.dateISO,
            partySize: w.partySize,
            area: w.area,
            suggestions,
          })
        );

        await prisma.waitlistEntry.update({
          where: { id: w.id },
          data: { status: "NOTIFIED", notifiedAt: new Date() },
        });
        notified++;
      }
    }

    return NextResponse.json({ ok: true, checked: openEntries.length, notified });
  } catch (e: unknown) {
    console.error("waitlist cron", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
