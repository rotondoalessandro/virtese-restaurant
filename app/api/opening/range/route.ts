// app/api/opening/range/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function hmToMinutes(hm: string) {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
}

function ymdLocal(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (!from || !to) {
    return NextResponse.json({ error: "Missing from/to" }, { status: 400 });
  }

  const fromDate = new Date(`${from}T00:00:00`);
  const toDate = new Date(`${to}T00:00:00`);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return NextResponse.json({ error: "Invalid dates" }, { status: 400 });
  }

  const days: string[] = [];
  for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
    days.push(ymdLocal(d));
  }

  // Preload opening hours (weekdays) and specials for range
  const [allHours, specials] = await Promise.all([
    prisma.openingHour.findMany(),
    prisma.specialHour.findMany({
      where: {
        date: { gte: fromDate, lte: new Date(toDate.getTime() + 24 * 60 * 60 * 1000) },
      },
    }),
  ]);
  const byWeekday = new Map(allHours.map((h) => [h.weekday, h]));
  const byDate = new Map(specials.map((s) => [ymdLocal(s.date), s]));

  const result: Record<string, { closed: boolean; openTime?: string; closeTime?: string }> = {};

  for (const ds of days) {
    const d = new Date(`${ds}T00:00:00`);
    const special = byDate.get(ds);
    const hours = byWeekday.get(d.getDay());

    if (!hours && !special) {
      result[ds] = { closed: true };
      continue;
    }

    if (special?.closed) {
      result[ds] = { closed: true };
      continue;
    }

    const open = special?.openTime ?? hours?.openTime ?? "12:00";
    const close = special?.closeTime ?? hours?.closeTime ?? "23:00";
    const openM = hmToMinutes(open);
    const closeM = hmToMinutes(close);
    const closed = openM >= closeM;
    result[ds] = { closed, openTime: open, closeTime: close };
  }

  return NextResponse.json({ days: result });
}
