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
    <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1 text-sm">
        <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#8a7463]">
          Name
        </label>
        <input
          className="w-full rounded-full border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1 text-sm">
        <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#8a7463]">
          Email
        </label>
        <input
          type="email"
          className="w-full rounded-full border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-1 text-sm">
        <label className="block text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-[#8a7463]">
          Message
        </label>
        <textarea
          rows={5}
          className="w-full rounded-2xl border border-[#e1d6c9] bg-white px-4 py-2.5 text-sm text-[#5b4b41] placeholder-[#b19c88] outline-none transition focus:border-[#5b4b41]"
          placeholder="Raccontaci della tua prenotazione, evento o richiesta..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-2 inline-flex items-center justify-center rounded-full bg-[#5b4b41] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Sending...' : 'Send message'}
      </button>

      {success && (
        <p className="mt-2 text-[0.75rem] text-emerald-600">
          {success}
        </p>
      )}
      {error && (
        <p className="mt-2 text-[0.75rem] text-red-500">
          {error}
        </p>
      )}

      <p className="mt-2 text-[0.7rem] text-[#8a7463]">
        Per prenotazioni in giornata ti chiediamo di chiamarci direttamente.
      </p>
    </form>
  )
}
