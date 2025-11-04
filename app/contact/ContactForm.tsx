'use client'

import { FormEvent, useState } from 'react'

export default function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSuccess(null)
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Errore invio messaggio')
      }

      setSuccess('Messaggio inviato con successo! Ti risponderemo al più presto.')
      setName('')
      setEmail('')
      setMessage('')
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Si è verificato un errore. Riprova più tardi.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
      <div className="space-y-1 text-sm">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
          Name
        </label>
        <input
          className="w-full rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1 text-sm">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
          Email
        </label>
        <input
          type="email"
          className="w-full rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1 text-sm">
        <label className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-400">
          Message
        </label>
        <textarea
          rows={5}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-amber-400"
          placeholder="Tell us about your booking, event or question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-amber-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>

      {success && (
        <p className="mt-2 text-[0.7rem] text-emerald-400">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-2 text-[0.7rem] text-red-400">
          {error}
        </p>
      )}

      <p className="mt-2 text-[0.7rem] text-zinc-500">
        For same-day bookings, please call us directly.
      </p>
    </form>
  )
}
