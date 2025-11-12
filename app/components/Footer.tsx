import Link from 'next/link'
import { prisma } from '@/lib/prisma'

function hmToMinutes(hm?: string | null) {
  if (!hm) return 0;
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

function dayLabel(idx: number) {
  // Prisma: 0 = Sun ... 6 = Sat
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return labels[idx] || String(idx)
}

function groupDays(days: number[]) {
  if (days.length === 0) return ''
  const parts: string[] = []
  let start = days[0]
  let prev = days[0]
  for (let i = 1; i < days.length; i++) {
    const d = days[i]
    if (d === prev + 1) {
      prev = d
      continue
    }
    parts.push(start === prev ? dayLabel(start) : `${dayLabel(start)}–${dayLabel(prev)}`)
    start = prev = d
  }
  parts.push(start === prev ? dayLabel(start) : `${dayLabel(start)}–${dayLabel(prev)}`)
  return parts.join(', ')
}

export default async function Footer() {
  const year = new Date().getFullYear()

  // Pull opening hours from DB
  const hours = await prisma.openingHour.findMany({ orderBy: { weekday: 'asc' } })

  // Build summary
  let hoursNode: React.ReactNode = null
  if (hours.length) {
    const openDays = hours
      .filter((h) => hmToMinutes(h.openTime) < hmToMinutes(h.closeTime))
      .map((h) => h.weekday)
      .sort((a, b) => a - b)
    const closedDays = hours
      .filter((h) => hmToMinutes(h.openTime) >= hmToMinutes(h.closeTime))
      .map((h) => h.weekday)
      .sort((a, b) => a - b)

    const openKeySet = new Set(
      hours
        .filter((h) => hmToMinutes(h.openTime) < hmToMinutes(h.closeTime))
        .map((h) => `${h.openTime}-${h.closeTime}`)
    )

    if (openDays.length === 0) {
      hoursNode = (
        <p className="mt-3 text-sm text-[#5b4b41]">
          <span className="italic text-[#8a7463]">Closed this week</span>
        </p>
      )
    } else if (openKeySet.size === 1) {
      // Uniform opening times: show compact summary
      const anyOpen = hours.find((h) => hmToMinutes(h.openTime) < hmToMinutes(h.closeTime))!
      const openTimes = `${anyOpen.openTime} – ${anyOpen.closeTime}`
      const openDaysLabel = groupDays(openDays)
      const closedLabel = closedDays.length ? groupDays(closedDays) : ''
      hoursNode = (
        <p className="mt-3 text-sm text-[#5b4b41]">
          {openDaysLabel} · {openTimes}
          {closedLabel ? (
            <>
              <br />
              <span className="italic text-[#8a7463]">Closed {closedLabel}</span>
            </>
          ) : null}
        </p>
      )
    } else {
      // Varying times: list days
      hoursNode = (
        <ul className="mt-3 space-y-1 text-sm text-[#5b4b41]">
          {hours.map((h) => {
            const closed = hmToMinutes(h.openTime) >= hmToMinutes(h.closeTime)
            return (
              <li key={h.weekday} className="flex justify-between gap-3">
                <span className="text-[#8a7463] w-16">{dayLabel(h.weekday)}</span>
                <span>{closed ? 'Closed' : `${h.openTime} – ${h.closeTime}`}</span>
              </li>
            )
          })}
        </ul>
      )
    }
  }

  return (
    <footer className="border-t border-[#e1d6c9] bg-white text-[#5b4b41]">
      {/* Main area */}
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8 lg:py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-semibold text-[#3f3127]">
              Virtese Restaurant
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#5b4b41]">
              12 Example Street
              <br />
              London, WC2N XXX
            </p>
            {hoursNode}
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
              Explore
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link
                  href="/menu"
                  className="transition hover:text-[#3f3127]"
                >
                  Menu
                </Link>
              </li>
              <li>
                <Link
                  href="https://book.virtese.com/virtese"
                  className="transition hover:text-[#3f3127]"
                >
                  Reservations
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="transition hover:text-[#3f3127]"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition hover:text-[#3f3127]"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
              Follow
            </h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#3f3127]"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#3f3127]"
                >
                  TikTok
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#3f3127]"
                >
                  Google Maps
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
              Newsletter
            </h4>
            <p className="mt-4 text-sm text-[#5b4b41]">
              Updates su menu di stagione, cene speciali e serate a tema.
            </p>
            <form className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input
                className="flex-1 rounded-full border border-[#e1d6c9] bg-white px-4 py-2 text-sm text-[#5b4b41] placeholder-[#b19c88] focus:outline-none focus:border-[#5b4b41]"
                placeholder="Your email"
              />
              <button
                type="submit"
                className="rounded-full bg-[#5b4b41] px-5 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#f5ede4] transition hover:bg-[#46362c]"
              >
                Join
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#e1d6c9] bg-[#f8f2ea] py-5 text-center text-[0.8rem] text-[#8a7463]">
        <p>
          © {year}{' '}
          <span className="text-[#5b4b41] font-medium">
            Virtese Restaurant
          </span>
          . All rights reserved.
        </p>
        <p className="mt-1 text-[#b19c88]">
          Designed with 🍷 in London
        </p>
      </div>
    </footer>
  )
}
