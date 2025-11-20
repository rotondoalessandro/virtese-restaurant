'use client'

import type { FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function SignInPage() {
  const [email, setEmail] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    signIn('email', { email, callbackUrl: '/admin' })
  }

  return (
    <main className="min-h-screen bg-[#f7f2ec] text-[#5b4b41]">
      <div className="mx-auto flex min-h-[70vh] max-w-5xl flex-col justify-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
          <section className="space-y-6">
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#8a7463]">
              Staff access
            </p>
            <div className="space-y-3">
              <h1 className="font-display text-4xl leading-tight text-[#3f3127] sm:text-5xl">
                Sign in to the Virtese team area
              </h1>
              <p className="max-w-xl text-base leading-relaxed text-[#5b4b41]">
                Use your work email and we&apos;ll send a one-time link to access admin tools,
                handle menu updates and booking notes. No passwords to remember.
              </p>
            </div>

            <div className="grid gap-3 rounded-2xl border border-[#e1d6c9]/80 bg-white/80 px-5 py-4 shadow-sm sm:grid-cols-2 sm:items-center">
              <div className="space-y-1">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-[#8a7463]">
                  Need help?
                </p>
                <p className="text-sm leading-relaxed text-[#5b4b41]">
                  If the link does not arrive within a minute, check spam or ask the manager on duty.
                  Access is limited to authorised staff emails.
                </p>
              </div>
              <div className="rounded-xl border border-dashed border-[#e1d6c9] bg-[#f8f2ea]/70 px-4 py-3 text-sm leading-relaxed text-[#5b4b41] sm:text-[0.92rem]">
                For issues, email{' '}
                <a
                  href="mailto:admin@virteserestaurant.com"
                  className="font-semibold underline decoration-[#d7c4b3] underline-offset-4 hover:text-[#3f3127]"
                >
                  info@virtese.com
                </a>{' '}
                or call the office.
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-[#e1d6c9] bg-white/90 p-7 shadow-lg backdrop-blur-sm sm:p-8">
            <div className="border-b border-[#f8f2ea] pb-5">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.26em] text-[#8a7463]">
                Secure magic link
              </p>
              <h2 className="mt-3 font-display text-2xl text-[#3f3127]">
                Send sign-in link
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#8a7463]">
                We will email you a one-time link that stays valid for a short time.
              </p>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-1 text-sm">
                <label
                  htmlFor="email"
                  className="block text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[#8a7463]"
                >
                  Work email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  placeholder="owner@virteserestaurant.com"
                  className="w-full rounded-full border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-[#5b4b41] px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c]"
              >
                Send link
              </button>

              <p className="text-xs leading-relaxed text-[#8a7463]">
                You can open the link on this device or another one. For security it expires if unused.
              </p>
            </form>
          </section>
        </div>
      </div>
    </main>
  )
}
