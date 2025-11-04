// app/api/availability/route.ts
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Area } from "@prisma/client";
import { getSlots } from "@/lib/availability";

const Query = z.object({
  date: z.string(),                      // "YYYY-MM-DD"
  party: z.coerce.number().min(1),
  area: z.nativeEnum(Area).optional(),   // optional seating preference
});

export async function GET(req: NextRequest) {
  const parsed = Query.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }

  const { date, party, area } = parsed.data;

  try {
    const slots = await getSlots({ dateISO: date, party, area });
    // slots: [{ time, available, suggestedArea? }]
    return NextResponse.json({ slots });
  } catch (err) {
    console.error("Error in /api/availability:", err);
    return NextResponse.json(
      { error: "Server error", details: (err as Error).message },
      { status: 500 }
    );
  }
}
