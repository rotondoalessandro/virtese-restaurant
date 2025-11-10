// lib/availability.ts
import { prisma } from "@/lib/prisma";
import { addMinutes, startOfDay, endOfDay, isWithinInterval } from "date-fns";
import { pickTables } from "@/lib/tablePicker";

type GetSlotsArgs = {
  dateISO: string; // "YYYY-MM-DD"
  party: number;   // guests
  area?: string;   // optional: "INDOOR" | "OUTDOOR" | ...
};

type SlotOut = { time: string; available: number; suggestedArea?: string };

export async function getSlots({ dateISO, party, area }: GetSlotsArgs): Promise<SlotOut[]> {
  const day = new Date(`${dateISO}T00:00:00`);
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const weekday = dayStart.getDay();

  const [rule, special, hours, blackout] = await Promise.all([
    prisma.reservationRule.findFirst(),
    prisma.specialHour.findFirst({ where: { date: { gte: dayStart, lte: dayEnd } } }),
    prisma.openingHour.findFirst({ where: { weekday } }),
    prisma.blackoutSlot.findMany({ where: { start: { lte: dayEnd }, end: { gte: dayStart } } }),
  ]);

  if (!rule) return [];
  if (!hours && !special) return [];
  if (special?.closed) return [];

  const openTime = special?.openTime ?? hours?.openTime ?? "12:00";
  const closeTime = special?.closeTime ?? hours?.closeTime ?? "23:00";

  const hmToMinutes = (hm: string) => {
    const [h, m] = hm.split(":").map(Number);
    return h * 60 + m;
  };

  const openMins = hmToMinutes(openTime);
  const closeMins = hmToMinutes(closeTime);
  if (openMins >= closeMins) return [];

  const slotInterval = rule.slotInterval ?? 15;
  const seatDuration = rule.seatDuration ?? 90;
  const bufferBefore = rule.bufferBefore ?? 0;
  const bufferAfter = rule.bufferAfter ?? 0;
  const maxCovers = rule.maxCoversPerSlot ?? null;

  // Tutti i tavoli attivi (tutte le aree; filtreremo più avanti)
  const allTables = await prisma.table.findMany({
    where: { active: true },
    select: { id: true, capacity: true, mergeGroup: true, area: true },
    orderBy: { capacity: "asc" },
  });
  if (allTables.length === 0) return [];

  // Build area list with a stable priority: prefer INDOOR by default
  const areas = Array.from(new Set(allTables.map((t) => t.area))).sort((a, b) => {
    const prio = (x: string) => (x === "INDOOR" ? 0 : 1);
    return prio(a) - prio(b);
  });

  // Prenotazioni del giorno (finestra ampia) per calcoli occupazione/coperti
  const fetchStart = addMinutes(dayStart, openMins - seatDuration - bufferBefore - 120);
  const fetchEnd = addMinutes(dayStart, closeMins + seatDuration + bufferAfter + 120);
  const bookings = await prisma.booking.findMany({
    where: {
      dateTime: { gte: fetchStart, lte: fetchEnd },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
    include: { tables: { include: { table: true } }, customer: true },
  });

  // util: coperti già venduti in una finestra (con buffer)
  function coversInWindow(windowStart: Date, windowEnd: Date) {
    let covers = 0;
    for (const b of bookings) {
      const bStart = addMinutes(b.dateTime, -bufferBefore);
      const bEnd = addMinutes(b.dateTime, seatDuration + bufferAfter);
      const overlaps = bStart < windowEnd && windowStart < bEnd;
      if (overlaps) covers += b.partySize;
    }
    return covers;
  }

  const slots: SlotOut[] = [];

  // Require the full seating to finish before close.
  for (let t = openMins; t + seatDuration <= closeMins; t += slotInterval) {
    const start = addMinutes(dayStart, t);
    const end = addMinutes(start, seatDuration);

    // blackout
    const blocked = blackout.some(
      (b) =>
        isWithinInterval(start, { start: b.start, end: b.end }) ||
        isWithinInterval(end, { start: b.start, end: b.end })
    );
    if (blocked) {
      slots.push({ time: toHHMM(start), available: 0 });
      continue;
    }

    // limite coperti per slot
    const startWithBuffer = addMinutes(start, -bufferBefore);
    const endWithBuffer = addMinutes(start, seatDuration + bufferAfter);
    if (maxCovers !== null) {
      const already = coversInWindow(startWithBuffer, endWithBuffer);
      if (already + party > maxCovers) {
        slots.push({ time: toHHMM(start), available: 0 });
        continue;
      }
    }

    // tavoli occupati in questo slot (considerando buffer)
    const busy = new Set<string>();
    for (const b of bookings) {
      const bStart = addMinutes(b.dateTime, -bufferBefore);
      const bEnd = addMinutes(b.dateTime, seatDuration + bufferAfter);
      const overlaps = bStart < endWithBuffer && startWithBuffer < bEnd;
      if (overlaps) for (const tb of b.tables) busy.add(tb.tableId);
    }

    if (area) {
      // con preferenza area: valuta solo quei tavoli
      const free = allTables.filter((tbl) => tbl.area === area && !busy.has(tbl.id));
      const picked = pickTables(free, party);
      slots.push({ time: toHHMM(start), available: picked ? 1 : 0 });
      continue;
    }

    // no preference: prova ogni area e scegli la "migliore" (spreco minore)
    let bestArea: string | undefined;
    let bestTotal = Number.POSITIVE_INFINITY;

    for (const a of areas) {
      const free = allTables.filter((tbl) => tbl.area === a && !busy.has(tbl.id));
      const picked = pickTables(free, party);
      if (picked) {
        const total = picked
          .map((id) => free.find((ft) => ft.id === id)?.capacity ?? 0)
          .reduce((acc, n) => acc + n, 0);
        // Prefer smaller total; on ties, the earlier area in `areas` wins (INDOOR first)
        if (total < bestTotal) {
          bestTotal = total;
          bestArea = a;
        }
      }
    }

    slots.push({
      time: toHHMM(start),
      available: bestArea ? 1 : 0,
      suggestedArea: bestArea,
    });
  }

  return slots;
}

function toHHMM(d: Date) {
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}
