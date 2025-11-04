import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { sendAdminNotification } from "@/lib/email"
import { requireSameOrigin } from "@/lib/http";

function getBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.APP_BASE_URL ||
    "http://localhost:3000"
  try {
    return new URL(raw).origin
  } catch {
    return new URL("http://" + raw).origin
  }
}

export async function POST(req: NextRequest) {
  // 👇 niente `any`, lo trattiamo come Request compatibile
  const chk = requireSameOrigin(req as unknown as Request);
  if (!chk.ok) return NextResponse.json({ error: chk.error }, { status: 400 });
  
  try {
    const formData = await req.formData()
    const token = formData.get("token")?.toString()
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 })

    const booking = await prisma.booking.findUnique({
      where: { manageToken: token },
      include: { customer: true },
    })
    if (!booking) return NextResponse.json({ error: "Invalid token" }, { status: 404 })
    if (booking.status !== "CONFIRMED")
      return NextResponse.json({ error: "Already cancelled or inactive" }, { status: 409 })

    // ---- Update booking + drop allocations ATOMIC ----
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: "CANCELLED" },
      })
      await tx.bookingTable.deleteMany({ where: { bookingId: booking.id } })
    })

    // ---- Notify admin ----
    await sendAdminNotification("info@virtese.com", {
      name: booking.customer?.name ?? "Guest",
      email: booking.customer?.email ?? "",
      dateTime: booking.dateTime,
      partySize: booking.partySize,
      area: booking.area,
      notes: "Cancelled by customer via self-service link",
    })

    // ---- Redirect to confirmation page ----
    const base = getBaseUrl()
    const redirectUrl = `${base}/book/manage?token=${encodeURIComponent(token)}`
    return NextResponse.redirect(redirectUrl, { status: 303 })
  } catch (err) {
    console.error("Error in /api/cancel:", err)
    return NextResponse.json(
      { error: "Server error", details: (err as Error).message },
      { status: 500 },
    )
  }
}
