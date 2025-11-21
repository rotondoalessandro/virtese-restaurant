import Link from 'next/link'
import { sanityClient } from '@/lib/sanity.client'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SignOutEmail from './SignOutEmail'

export default async function Footer() {
  const year = new Date().getFullYear()
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  const contact = await sanityClient.fetch<{ openingHours?: string[] }>(
    `*[_type == "contactSettings"][0]{openingHours}`
  )

  const openingLines = contact?.openingHours?.filter(Boolean) ?? []

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
            {openingLines.length ? (
              <ul className="mt-3 space-y-1 text-sm text-[#5b4b41]">
                {openingLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-[#5b4b41]">
                Opening hours available in Sanity contact settings.
              </p>
            )}
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
        <div className="flex flex-col items-center gap-2">
          <p>
            (c) {year}{' '}
            <span className="text-[#5b4b41] font-medium">
              Virtese Restaurant
            </span>
            . Developed and designed by{' '}
            <a
              className="font-semibold text-[#5b4b41] underline-offset-4 hover:underline"
              href="https://virtese.com"
              target="_blank"
              rel="noreferrer"
            >
              virtese.com
            </a>
            .
          </p>
          {email ? (
            <div className="inline-flex items-center rounded-full border border-[#e1d6c9] bg-white px-3 py-1 text-[0.78rem] text-[#5b4b41]">
              <SignOutEmail email={email} />
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  )
}
