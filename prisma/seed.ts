import { PrismaClient, Area, BookingStatus } from "@prisma/client";
import { addMinutes, setHours, setMinutes, setSeconds } from "date-fns";

const prisma = new PrismaClient();
const areas: Area[] = ["INDOOR", "OUTDOOR", "BAR"];

// === Utility per calcolare start_at / end_at ===
function computeAllocationWindow(
  dateTime: Date,
  opts?: { seatDuration?: number; bufferBefore?: number; bufferAfter?: number }
) {
  const seatDuration = opts?.seatDuration ?? 90;
  const bufferBefore = opts?.bufferBefore ?? 0;
  const bufferAfter = opts?.bufferAfter ?? 0;

  const start_at = addMinutes(dateTime, -bufferBefore);
  const end_at = addMinutes(dateTime, seatDuration + bufferAfter);
  return { start_at, end_at };
}

async function run() {
  // Precompute 18 tables: I1..I6, O7..O12, B13..B18
  const tables = areas.flatMap((area, aIdx) =>
    Array.from({ length: 6 }).map((_, i) => ({
      code: `${area[0]}${aIdx * 6 + i + 1}`,
      capacity: i < 3 ? 2 : 4,
      area,
      active: true,
    }))
  );

  await prisma.$transaction(async (tx) => {
    // Opening hours Mon–Sun 12:00–23:00
    for (let weekday = 0; weekday < 7; weekday++) {
      await tx.openingHour.upsert({
        where: { weekday },
        update: { openTime: "12:00", closeTime: "23:00" },
        create: { weekday, openTime: "12:00", closeTime: "23:00" },
      });
    }

    // Reservation rules (singleton)
    const rule =
      (await tx.reservationRule.findFirst()) ??
      (await tx.reservationRule.create({
        data: {
          seatDuration: 90,
          slotInterval: 15,
          bufferBefore: 0,
          bufferAfter: 0,
        },
      }));

    // Tables (skip duplicates by unique code)
    await tx.table.createMany({ data: tables, skipDuplicates: true });

    // Menu categories/items
    const starters = await tx.menuCategory.upsert({
      where: { name: "Starters" },
      update: { order: 1 },
      create: { name: "Starters", order: 1 },
    });
    const mains = await tx.menuCategory.upsert({
      where: { name: "Mains" },
      update: { order: 2 },
      create: { name: "Mains", order: 2 },
    });
    await tx.menuItem.createMany({
      data: [
        {
          categoryId: starters.id,
          name: "Bruschetta",
          priceCents: 700,
          tags: ["veg"],
          allergens: ["gluten"],
        },
        {
          categoryId: starters.id,
          name: "Arancini",
          priceCents: 850,
          tags: ["veg"],
          allergens: ["gluten", "milk"],
        },
        {
          categoryId: mains.id,
          name: "Tagliatelle al Ragù",
          priceCents: 1500,
          tags: [],
          allergens: ["gluten", "egg"],
        },
      ],
      skipDuplicates: true,
    });

    // Owner user
    await tx.user.upsert({
      where: { email: "owner@restaurant.local" },
      update: { role: "OWNER", name: "Owner" },
      create: {
        email: "owner@restaurant.local",
        name: "Owner",
        role: "OWNER",
      },
    });

    // =============================
    // DEMO BOOKINGS (con start/end)
    // =============================

    const sampleTable = await tx.table.findFirst({ where: { area: "INDOOR" } });
    if (sampleTable) {
      const now = new Date();
      const bookingTime = setSeconds(setMinutes(setHours(now, 19), 0), 0); // oggi alle 19:00
      const { start_at, end_at } = computeAllocationWindow(bookingTime, rule);

      const customer = await tx.customer.upsert({
        where: { email: "guest@example.com" },
        update: { name: "Guest Example" },
        create: { email: "guest@example.com", name: "Guest Example" },
      });

      await tx.booking.create({
        data: {
          dateTime: bookingTime,
          partySize: 2,
          area: "INDOOR",
          status: BookingStatus.CONFIRMED,
          customerId: customer.id,
          tables: {
            create: [{ tableId: sampleTable.id, start_at, end_at }],
          },
        },
      });
    }
  });
}

run()
  .then(() => {
    console.log("✅ Seed complete with sample booking");
  })
  .catch((e) => {
    console.error("❌ Seed failed", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
