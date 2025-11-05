export const runtime = "nodejs"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { randomUUID } from "crypto"
import { sendAdminNotification, sendBookingConfirmation } from "@/lib/email"
import { requireSameOrigin } from "@/lib/http";

const ConsentSchema = z
  .object({
    marketing: z.boolean().optional(),
    profiling: z.boolean().optional(),
    privacy: z.boolean().optional(), // se vuoi puoi forzare a true lato schema
  })
  .optional();

const BookSchema = z.object({
  bookingId: z.string(),
  name: z.string().min(1),      // nome
  surname: z.string().min(1),   // cognome
  email: z.string().email(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  consent: ConsentSchema,
})

export async function POST(req: NextRequest) {
  const chk = requireSameOrigin(req as unknown as Request);
  if (!chk.ok) return NextResponse.json({ error: chk.error }, { status: 400 });

  const data = await req.json()
  const parsed = BookSchema.safeParse(data)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 })
  }

  const { bookingId, name, surname, email, phone, notes, consent } = parsed.data

  const hold = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tables: true },
  })
  if (!hold) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  if (hold.status !== "PENDING") {
    return NextResponse.json(
      { error: "Already confirmed or invalid" },
      { status: 409 },
    )
  }
  if (hold.holdExpiresAt && new Date() > hold.holdExpiresAt) {
    return NextResponse.json({ error: "Hold expired" }, { status: 410 })
  }

  const manageToken = randomUUID()

  const marketingConsent = !!consent?.marketing
  const profilingConsent = !!consent?.profiling
  const privacyConsent = !!consent?.privacy
  const now = new Date()

  await prisma.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { email },
      update: {
        name,
        surname,
        phone,
        marketingConsent,
        profilingConsent,
        privacyConsent,
        consentUpdatedAt: now,
      },
      create: {
        email,
        phone,
        name,
        surname,
        marketingConsent,
        profilingConsent,
        privacyConsent,
        consentUpdatedAt: now,
      },
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

  // ricarico per mandare email con i dati aggiornati
  const customer = await prisma.customer.findUnique({ where: { email } })
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })

  if (customer && booking) {
    const fullName =
      [customer.name, customer.surname].filter(Boolean).join(" ") || "Guest"

    await sendBookingConfirmation(customer.email!, {
      name: fullName,
      dateTime: booking.dateTime,
      partySize: booking.partySize,
      area: booking.area,
      manageToken,
    }).catch(console.error)

    await sendAdminNotification("info@virtese.com", {
      name: fullName,
      email: customer.email!,
      dateTime: booking.dateTime,
      partySize: booking.partySize,
      area: booking.area,
      notes,
    }).catch(console.error)
  }

  return NextResponse.json({ ok: true })
}
