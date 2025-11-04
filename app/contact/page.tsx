// app/contact/page.tsx
import { sanityClient } from '@/lib/sanity.client'
import ContactForm from './ContactForm'

export const metadata = { title: 'Contact — Virtese Restaurant' }

type ContactSettings = {
  title?: string
  intro?: string
  address?: string
  cityLine?: string
  phone?: string
  email?: string
  openingHours?: string[]
  reservationNote?: string
  mapUrl?: string
}

async function getContactData(): Promise<ContactSettings | null> {
  const query = `*[_type == "contactSettings"][0]`
  const data = await sanityClient.fetch(query)
  return data
}

export default async function ContactPage() {
  const contact = await getContactData()

  const title = contact?.title || 'Contact & reservations'
  const intro =
    contact?.intro ||
    "Get in touch for bookings, private events or if you have any questions before your visit."

  const address = contact?.address || '12 Example Street'
  const cityLine = contact?.cityLine || 'London, WC2N XXX'
  const phone = contact?.phone || '+44 (0)20 0000 0000'
  const email = contact?.email || 'hello@virteserestaurant.com'
  const openingHours =
    contact?.openingHours && contact.openingHours.length > 0
      ? contact.openingHours
      : ['Tue–Sun · 18:00–23:30', 'Closed Mondays']

  const reservationNote =
    contact?.reservationNote ||
    'For tables of 6 or more, private events or special requests, please contact us directly and we’ll help you plan the evening.'

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 pb-20 pt-24 sm:px-6 lg:px-0">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:items-start">
          {/* Left column: info */}
          <section>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-zinc-500">
              Contact
            </p>
            <h1 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-zinc-300">
              {intro}
            </p>

            <div className="mt-8 grid gap-6 text-sm text-zinc-200 sm:grid-cols-2">
              <div>
                <h2 className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
                  Address
                </h2>
                <p className="mt-2">
                  {address}
                  <br />
                  {cityLine}
                </p>
                {contact?.mapUrl && (
                  <a
                    href={contact.mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block text-xs font-medium uppercase tracking-[0.18em] text-amber-300 underline-offset-4 hover:underline"
                  >
                    Open in Maps
                  </a>
                )}
              </div>

              <div>
                <h2 className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
                  Contact
                </h2>
                <p className="mt-2">
                  {phone && (
                    <>
                      Phone:{' '}
                      <a
                        href={`tel:${phone.replace(/\s+/g, '')}`}
                        className="hover:text-amber-300"
                      >
                        {phone}
                      </a>
                      <br />
                    </>
                  )}
                  {email && (
                    <>
                      Email:{' '}
                      <a
                        href={`mailto:${email}`}
                        className="hover:text-amber-300"
                      >
                        {email}
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 text-sm text-zinc-200 sm:grid-cols-2">
              <div>
                <h2 className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
                  Opening hours
                </h2>
                <ul className="mt-2 space-y-1">
                  {openingHours.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="text-[0.7rem] uppercase tracking-[0.23em] text-zinc-500">
                  Reservations
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                  {reservationNote}
                </p>
              </div>
            </div>
          </section>

          {/* Right column: form */}
          <section className="rounded-2xl border border-zinc-800 bg-black/50 p-5 sm:p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.23em] text-zinc-500">
              Send us a message
            </h2>
            <p className="mt-2 text-xs text-zinc-400">
              This form does not confirm a reservation. We&apos;ll get back to you as soon as we
              can.
            </p>

            <ContactForm />
          </section>
        </div>
      </div>
    </main>
  )
}
