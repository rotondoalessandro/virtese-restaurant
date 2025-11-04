import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subHours } from "date-fns";
import { sendReminderEmail } from "@/lib/reminders";

export const runtime = "nodejs";

export async function GET() {
  // finestra: inviare reminder per prenotazioni tra 23.5h e 24.5h da ora
  const now = new Date();
  const from = subHours(now, -23.5); // = now + 23.5h
  const to   = subHours(now, -24.5); // = now + 24.5h (invertito perché subHours)

  const upcoming = await prisma.booking.findMany({
    where: {
      status: "CONFIRMED",
      dateTime: { gte: from, lte: to },
      reminderSentAt: null,
      customer: { email: { not: null } },
    },
    include: { customer: true },
    take: 200,
  });

  let sent = 0;
  for (const b of upcoming) {
    try {
      await sendReminderEmail(b);
      await prisma.booking.update({
        where: { id: b.id },
        data: { reminderSentAt: new Date() },
      });
      sent++;
    } catch (e) {
      console.error("reminder failed", b.id, e);
    }
  }

  return NextResponse.json({ ok: true, sent, checked: upcoming.length });
}