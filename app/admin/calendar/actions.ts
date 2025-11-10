"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { computeAllocationWindow } from "@/lib/reservationWindow";
import { assertRole } from "@/lib/authz";
import { Role } from "@prisma/client";

export async function moveBookingAction({
  bookingId,
  dateTimeISO,
  tableId,      // nuovo tavolo target
}: { bookingId: string; dateTimeISO: string; tableId: string }) {
  await assertRole([Role.OWNER, Role.MANAGER]);
  
  const dt = new Date(dateTimeISO);

  const rule = await prisma.reservationRule.findFirst();
  const seatDuration = rule?.seatDuration ?? 90;
  const bufferBefore = rule?.bufferBefore ?? 0;
  const bufferAfter  = rule?.bufferAfter ?? 0;

  const { start_at, end_at } = computeAllocationWindow(dt, {
    seatDuration, bufferBefore, bufferAfter
  });

  try {
    // Capacity guard: prevent moving a party onto a too-small table
    const [booking, table] = await Promise.all([
      prisma.booking.findUnique({ where: { id: bookingId }, select: { partySize: true } }),
      prisma.table.findUnique({ where: { id: tableId }, select: { capacity: true, code: true } }),
    ]);
    if (!booking || !table) throw new Error("Booking or table not found");
    if (table.capacity < booking.partySize) {
      throw new Error(
        `Cannot place party of ${booking.partySize} on table ${table.code} (${table.capacity} seats).`
      );
    }

    await prisma.$transaction(async (tx) => {
      // (opzionale) quick check/lock: impedisci conflitti sul tavolo target in quell'intervallo
      await tx.$queryRawUnsafe(`
        SELECT 1
        FROM "BookingTable" bt
        JOIN "Booking" b ON b.id = bt."bookingId"
        WHERE bt."tableId" = $1
          AND b.status IN ('PENDING','CONFIRMED')
          AND tstzrange(bt."start_at", bt."end_at", '[]')
              && tstzrange($2::timestamptz, $3::timestamptz, '[]')
        FOR UPDATE NOWAIT
      `, tableId, start_at, end_at);

      // reset join (vecchi tavoli) → ricrea con il nuovo tavolo e nuovi range
      await tx.bookingTable.deleteMany({ where: { bookingId } });
      await tx.booking.update({
        where: { id: bookingId },
        data: {
          dateTime: dt,
          tables: { create: [{ tableId, start_at, end_at }] },
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  } catch (err: unknown) {
    // 👇 gestione type-safe dell’errore
    const msg =
      err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();

    if (
      msg.includes("bookingtable_no_overlap") ||
      msg.includes("nowait") ||
      msg.includes("could not obtain lock")
    ) {
      throw new Error("Conflict: table already allocated in that time window.");
    }

    throw err;
  }
}
