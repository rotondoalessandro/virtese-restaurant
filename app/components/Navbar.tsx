import Link from 'next/link'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function Navbar() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  return (
    <header className="sticky top-0 z-50 border-b border-[#e1d6c9] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link href="/" className="flex items-center gap-2" aria-label="Virtese Restaurant home">
          <Image
            src="/logo.png"
            alt="Virtese Restaurant logo"
            width={160}
            height={40}
            priority
            className="h-8 w-auto"
          />
        </Link>

        {/* NAV DESKTOP */}
        <nav className="hidden items-center gap-4 text-sm font-medium text-[#5b4b41] md:flex">
          <Link
            href="/menu"
            className="rounded-full px-2 py-1 text-[0.85rem] transition hover:bg-[#f8f2ea] hover:text-[#3f3127]"
          >
            Menu
          </Link>
          <Link
            href="/contact"
            className="rounded-full px-2 py-1 text-[0.85rem] transition hover:bg-[#f8f2ea] hover:text-[#3f3127]"
          >
            Contact
          </Link>

          <Link
            href="https://book.virtese.com/virtese-restaurant"
            className="ml-2 rounded-full bg-[#5b4b41] px-4 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c]"
          >
            Book a table
          </Link>

          {email ? (
            <Link
              href="/admin"
              className="ml-2 text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463] transition hover:text-[#5b4b41]"
            >
              {email}
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="ml-2 text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463] transition hover:text-[#5b4b41]"
            >
              Staff
            </Link>
          )}
        </nav>

        {/* NAV MOBILE – dropdown */}
        <details className="relative md:hidden">
          <summary
            className="flex cursor-pointer items-center gap-2 rounded-full border border-[#e1d6c9] bg-white/80 px-3 py-1 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#5b4b41]"
            style={{ listStyle: 'none' as const }}
          >
            Menu
            <span className="flex flex-col gap-[3px]">
              <span className="h-0.5 w-3 rounded-full bg-[#5b4b41]" />
              <span className="h-0.5 w-3 rounded-full bg-[#5b4b41]" />
            </span>
          </summary>

          <div className="absolute right-0 mt-3 w-52 rounded-2xl border border-[#e1d6c9] bg-white/95 p-3 text-sm shadow-lg">
            <Link
              href="/menu"
              className="block rounded-lg px-2 py-2 text-[#5b4b41] hover:bg-[#f8f2ea]"
            >
              Menu
            </Link>
            <Link
              href="/contact"
              className="mt-1 block rounded-lg px-2 py-2 text-[#5b4b41] hover:bg-[#f8f2ea]"
            >
              Contact
            </Link>
            <Link
              href="https://book.virtese.com/virtese-restaurant"
              className="mt-2 block rounded-full bg-[#5b4b41] px-3 py-2 text-center text-[0.75rem] font-semibold uppercase tracking-[0.18em] text-[#f5ede4] hover:bg-[#46362c]"
            >
              Book a table
            </Link>

            {email ? (
              <Link
                href="/admin"
                className="mt-3 block text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463] hover:text-[#5b4b41]"
              >
                {email}
              </Link>
            ) : (
              <Link
                href="/auth/signin"
                className="mt-3 block text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463] hover:text-[#5b4b41]"
              >
                Staff
              </Link>
            )}
          </div>
        </details>
      </div>
    </header>
  )
}
