export const runtime = "nodejs"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { randomUUID } from "crypto"
import { sendAdminNotification, sendBookingConfirmation } from "@/lib/email"
import { requireSameOrigin } from "@/lib/http";

const BookSchema = z.object({
  bookingId: z.string(),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  // ⬇️ niente `any`, lo trattiamo come un normale Request
  const chk = requireSameOrigin(req as unknown as Request);
  if (!chk.ok) return NextResponse.json({ error: chk.error }, { status: 400 });

  const data = await req.json()
  const parsed = BookSchema.safeParse(data)
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 })
  const { bookingId, name, email, phone, notes } = parsed.data

  const hold = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tables: true },
  })
  if (!hold) return NextResponse.json({ error: "Not found" }, { status: 404 })
  if (hold.status !== "PENDING")
    return NextResponse.json(
      { error: "Already confirmed or invalid" },
      { status: 409 },
    )
  if (hold.holdExpiresAt && new Date() > hold.holdExpiresAt)
    return NextResponse.json({ error: "Hold expired" }, { status: 410 })

  const manageToken = randomUUID()
  await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email },
      update: { name, phone },
      create: { name, email, phone },
    })
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        notes,
        manageToken,
        holdExpiresAt: null,
        customerId: customer.id,
      },
    })
  })

  const customer = await prisma.customer.findUnique({ where: { email } })
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

  if (customer && booking) {
    sendBookingConfirmation(customer.email!, {
      name: customer.name ?? "Guest",
      dateTime: booking.dateTime,
      partySize: booking.partySize,
      area: booking.area,
      manageToken,
    }).catch(console.error)

    sendAdminNotification("info@virtese.com", {
      name: customer.name ?? "Guest",
      email: customer.email!,
      dateTime: booking.dateTime,
      partySize: booking.partySize,
      area: booking.area,
      notes,
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
