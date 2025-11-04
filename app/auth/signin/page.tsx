'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-black/40 p-8 shadow-xl backdrop-blur-md">
        <h1 className="font-display text-2xl font-semibold text-zinc-50">
          Staff Sign-In
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Enter your work email to receive a one-time secure sign-in link.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            signIn('email', { email, callbackUrl: '/admin' })
          }}
          className="mt-6 space-y-4"
        >
          <div className="space-y-1 text-sm">
            <label
              htmlFor="email"
              className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-500"
            >
              Work Email
            </label>
            <input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              name="email"
              type="email"
              required
              placeholder="owner@virteserestaurant.com"
              className="w-full rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-amber-500 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
          >
            Send Link
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-zinc-500">
          For any access issues, contact{' '}
          <a
            href="mailto:admin@virteserestaurant.com"
            className="text-amber-400 hover:underline"
          >
            admin@virteserestaurant.com
          </a>
        </p>
      </div>
    </main>
  )
}
