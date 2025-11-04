import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { enGB } from "date-fns/locale"

export const dynamic = "force-dynamic"

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function ManageBookingPage({ searchParams }: Props) {
  const { token } = await searchParams
  if (!token) notFound()

  const booking = await prisma.booking.findUnique({
    where: { manageToken: token },
    include: { customer: true, tables: { include: { table: true } } },
  })

  if (!booking) notFound()

  const formatted = format(
    booking.dateTime,
    "EEEE d MMMM yyyy, HH:mm",
    { locale: enGB },
  )

  return (
    <div className="max-w-xl mx-auto py-16 px-6 text-center">
      <h1 className="text-2xl font-semibold mb-4">Your Reservation</h1>
      <p className="mb-2">
        <b>{formatted}</b>
      </p>
      <p className="mb-2">
        {booking.partySize} guests{" "}
        {booking.area && `(${booking.area})`}
      </p>
      <p className="mb-6 text-gray-600">
        Status: <b>{booking.status}</b>
      </p>

      {booking.status === "CONFIRMED" ? (
        <form action="/api/cancel" method="POST">
          <input type="hidden" name="token" value={token} />
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
          >
            Cancel Reservation
          </button>
        </form>
      ) : booking.status === "CANCELLED" ? (
        <div className="p-4 bg-green-50 text-green-700 rounded mt-4">
          ✅ Your reservation has been <b>successfully cancelled</b>.
        </div>
      ) : (
        <p className="text-gray-500 italic mt-4">
          This reservation has expired or is no longer active.
        </p>
      )}
    </div>
  )
}
