import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import SignOutEmail from './SignOutEmail'

export default async function Navbar() {
  const session = await getServerSession(authOptions)
  const email = session?.user?.email

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-black/40 backdrop-blur-md border-b border-zinc-800">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo / brand */}
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-wide text-amber-400 hover:text-amber-300 transition"
        >
          Virtese
        </Link>

        {/* Menu */}
        <nav className="flex items-center gap-6 text-sm font-medium text-zinc-200">
          <Link
            href="/menu"
            className="transition hover:text-amber-400"
          >
            Menu
          </Link>
          <Link
            href="/book"
            className="transition hover:text-amber-400"
          >
            Book
          </Link>
          <Link
            href="/contact"
            className="transition hover:text-amber-400"
          >
            Contact
          </Link>

          {email ? (
            <SignOutEmail email={email} />
          ) : (
            <Link
              href="/auth/signin"
              className="ml-4 text-[0.8rem] uppercase tracking-[0.2em] text-zinc-400 hover:text-amber-400 transition"
            >
              Staff
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
