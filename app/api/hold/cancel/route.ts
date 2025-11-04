import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Cancella solo se è PENDING (hold)
    const b = await prisma.booking.findUnique({ where: { id: bookingId }, select: { status: true } });
    if (!b) return NextResponse.json({ ok: true }); // già sparito = ok
    if (b.status !== "PENDING") return NextResponse.json({ ok: true });

    await prisma.$transaction([
      prisma.booking.update({ where: { id: bookingId }, data: { status: "CANCELLED" } }),
      prisma.bookingTable.deleteMany({ where: { bookingId } }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cancel hold error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
