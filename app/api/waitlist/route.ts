export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { Area } from "@prisma/client";
import { requireSameOrigin } from "@/lib/http";

const Body = z.object({
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  partySize: z.number().int().min(1),
  area: z.nativeEnum(Area).optional(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  // 👇 niente any
  const chk = requireSameOrigin(req as unknown as Request);
  if (!chk.ok) return NextResponse.json({ error: chk.error }, { status: 400 });

  try {
    const json = await req.json();
    const parsed = Body.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid", issues: parsed.error.format() },
        { status: 400 }
      );
    }

    const { dateISO, partySize, area, name, email, phone, notes } = parsed.data;

    const entry = await prisma.waitlistEntry.create({
      data: { dateISO, partySize, area, name, email, phone, notes },
    });

    return NextResponse.json({ ok: true, id: entry.id });
  } catch (e) {
    console.error("waitlist POST", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
