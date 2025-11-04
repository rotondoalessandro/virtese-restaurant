import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-[#050505] text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div>
          <h3 className="font-display text-xl font-semibold text-amber-400">Virtese</h3>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            12 Example Street<br />
            London, WC2N XXX
          </p>
          <p className="mt-2 text-sm text-zinc-500">
            Tue–Sun · 18:00 – 23:30<br />
            <span className="italic text-zinc-400">Closed Mondays</span>
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Explore
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/menu" className="hover:text-amber-400 transition">
                Menu
              </Link>
            </li>
            <li>
              <Link href="/book" className="hover:text-amber-400 transition">
                Reservations
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-amber-400 transition">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-amber-400 transition">
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Follow / Social */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Follow
          </h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href="https://instagram.com"
                target="_blank"
                className="hover:text-amber-400 transition"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://tiktok.com"
                target="_blank"
                className="hover:text-amber-400 transition"
              >
                TikTok
              </a>
            </li>
            <li>
              <a
                href="https://maps.google.com"
                target="_blank"
                className="hover:text-amber-400 transition"
              >
                Google Maps
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Newsletter
          </h4>
          <p className="mt-4 text-sm text-zinc-400">
            Get updates about seasonal menus, events, and special dinners.
          </p>
          <form className="mt-4 flex gap-2">
            <input
              className="flex-1 rounded-full border border-zinc-700 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              placeholder="Your email"
            />
            <button
              type="submit"
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-black transition hover:bg-amber-400"
            >
              Join
            </button>
          </form>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800 bg-black/40 py-6 text-center text-[0.75rem] text-zinc-500">
        <p>
          © {new Date().getFullYear()} <span className="text-zinc-300">Virtese Restaurant</span>. All
          rights reserved.
        </p>
        <p className="mt-1 text-zinc-600">Designed with 🍷 in London</p>
      </div>
    </footer>
  )
}
