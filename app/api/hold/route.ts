export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { addMinutes } from "date-fns";
import { Area, Prisma } from "@prisma/client";
import { pickTables } from "@/lib/tablePicker";
import { computeAllocationWindow } from "@/lib/reservationWindow";
import { requireSameOrigin } from "@/lib/http";

const HoldSchema = z.object({
  dateTime: z.string(), // ISO (es. 2025-10-20T19:00:00)
  partySize: z.number().min(1),
  area: z.nativeEnum(Area).optional(), // preferenza opzionale
});

export async function POST(req: NextRequest) {
  // 👇 niente any, lo castiamo a Request in modo esplicito
  const chk = requireSameOrigin(req as unknown as Request);
  if (!chk.ok) {
    return NextResponse.json({ error: chk.error }, { status: 400 });
  }

  try {
    const body = await req.json();
    const parsed = HoldSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { dateTime, partySize, area } = parsed.data;
    const dt = new Date(dateTime);

    // ---- 1) Pulizia HOLD scaduti: status->CANCELLED + drop allocazioni
    const expired = await prisma.booking.findMany({
      where: { status: "PENDING", holdExpiresAt: { lt: new Date() } },
      select: { id: true },
    });
    if (expired.length) {
      const ids = expired.map((b) => b.id);
      await prisma.$transaction([
        prisma.booking.updateMany({
          where: { id: { in: ids } },
          data: { status: "CANCELLED" },
        }),
        prisma.bookingTable.deleteMany({
          where: { bookingId: { in: ids } },
        }),
      ]);
    }

    // ---- 2) Regole e finestra
    const rule = await prisma.reservationRule.findFirst();
    const seatDuration = rule?.seatDuration ?? 90;
    const bufferBefore = rule?.bufferBefore ?? 0;
    const bufferAfter = rule?.bufferAfter ?? 0;

    const { start_at, end_at } = computeAllocationWindow(dt, {
      seatDuration,
      bufferBefore,
      bufferAfter,
    });

    // ---- 3) Candidati tavoli (per preferenza area se specificata)
    const candidates = await prisma.table.findMany({
      where: {
        active: true,
        capacity: { gte: partySize },
        ...(area ? { area } : {}),
      },
      select: { id: true, capacity: true, mergeGroup: true },
      orderBy: { capacity: "asc" },
    });
    if (!candidates.length) {
      return NextResponse.json(
        { error: "No suitable tables available" },
        { status: 404 }
      );
    }

    // ---- 4) Carica allocazioni già presenti in overlap (usa BookingTable!)
    const allocations = await prisma.bookingTable.findMany({
      where: {
        tableId: { in: candidates.map((c) => c.id) },
        booking: { status: { in: ["PENDING", "CONFIRMED"] } },
        AND: [{ start_at: { lt: end_at } }, { end_at: { gt: start_at } }],
      },
      select: { tableId: true },
    });
    const busyIds = new Set(allocations.map((a) => a.tableId));
    const free = candidates.filter((c) => !busyIds.has(c.id));

    // ---- 5) Pick tables (merge-aware) oppure prova senza preferenza area se fallisce
    let picked = pickTables(free, partySize);

    if (!picked && area) {
      const allCandidates = await prisma.table.findMany({
        where: { active: true, capacity: { gte: partySize } },
        select: { id: true, capacity: true, mergeGroup: true },
        orderBy: { capacity: "asc" },
      });

      const allAlloc = await prisma.bookingTable.findMany({
        where: {
          tableId: { in: allCandidates.map((c) => c.id) },
          booking: { status: { in: ["PENDING", "CONFIRMED"] } },
          AND: [{ start_at: { lt: end_at } }, { end_at: { gt: start_at } }],
        },
        select: { tableId: true },
      });
      const busyAll = new Set(allAlloc.map((a) => a.tableId));
      const freeAll = allCandidates.filter((c) => !busyAll.has(c.id));
      picked = pickTables(freeAll, partySize);
    }

    if (!picked) {
      return NextResponse.json(
        { error: "No availability at this time" },
        { status: 409 }
      );
    }

    // ---- 6) Crea HOLD + allocazioni (una riga per tavolo) in transazione
    const hold = await prisma.$transaction(
      async (tx) => {
        const booking = await tx.booking.create({
          data: {
            dateTime: dt,
            partySize,
            area: area ?? null,
            status: "PENDING",
            holdExpiresAt: addMinutes(new Date(), 10),
            tables: {
              create: picked!.map((tableId) => ({
                tableId,
                start_at,
                end_at,
              })),
            },
          },
          select: { id: true, holdExpiresAt: true },
        });
        return booking;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
    );

    return NextResponse.json({
      ok: true,
      bookingId: hold.id,
      expiresAt: hold.holdExpiresAt,
    });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : String(err ?? "");

    if (msg.includes("bookingtable_no_overlap")) {
      return NextResponse.json(
        { error: "No availability at this time" },
        { status: 409 }
      );
    }

    console.error("Error in /api/hold:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}
