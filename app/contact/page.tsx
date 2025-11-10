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
  mapUrl?: string // embed URL or maps link
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
    'Get in touch for bookings, groups, private events or any questions before your visit.'

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
    'For tables of 6 or more, company dinners or special occasions, contact us directly and we’ll help you plan the evening properly.'

  // If you have a proper Google Maps embed URL in Sanity, put it in mapUrl.
  const mapEmbedUrl =
    contact?.mapUrl ||
    'https://www.google.com/maps/embed?pb=YOUR_GOOGLE_MAPS_EMBED_HERE'

  return (
    <main className="min-h-screen bg-[#f7f2ec] text-[#5b4b41]">
      <div className="mx-auto max-w-5xl px-4 pb-24 pt-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-[#e1d6c9]/70 bg-white/90 px-6 py-10 shadow-lg backdrop-blur-sm sm:px-10 sm:py-12">
          {/* Header – same style as menu */}
          <header className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8a7463]">
              Contact
            </p>
            <h1 className="mt-4 font-display text-4xl leading-tight text-[#3f3127] sm:text-5xl">
              {title}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-[#5b4b41]">
              {intro}
            </p>
            <p className="mt-4 text-[0.8rem] uppercase tracking-[0.2em] text-[#b19c88]">
              Bookings · enquiries · private events
            </p>
          </header>

          <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start">
            {/* Left column: info */}
            <section className="space-y-8 text-sm text-[#5b4b41] sm:text-[0.95rem]">
              {/* Address + contact */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h2 className="text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463]">
                    Address
                  </h2>
                  <p className="mt-2 leading-relaxed">
                    {address}
                    <br />
                    {cityLine}
                  </p>
                  {contact?.mapUrl && (
                    <a
                      href={contact.mapUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#5b4b41] underline-offset-4 hover:underline"
                    >
                      Open in Maps
                    </a>
                  )}
                </div>

                <div>
                  <h2 className="text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463]">
                    Contact
                  </h2>
                  <p className="mt-2 leading-relaxed">
                    {phone && (
                      <>
                        Phone:{' '}
                        <a
                          href={`tel:${phone.replace(/\s+/g, '')}`}
                          className="underline-offset-2 hover:underline"
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
                          className="underline-offset-2 hover:underline"
                        >
                          {email}
                        </a>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Opening hours + reservations */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <h2 className="text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463]">
                    Opening hours
                  </h2>
                  <ul className="mt-2 space-y-1 leading-relaxed">
                    {openingHours.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h2 className="text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463]">
                    Reservations
                  </h2>
                  <p className="mt-2 leading-relaxed">
                    {reservationNote}
                  </p>
                </div>
              </div>
            </section>

            {/* Right column: form */}
            <section className="rounded-2xl bg-[#f8f2ea]/70 px-4 py-5 shadow-sm ring-1 ring-[#e1d6c9]/80 sm:px-5 lg:px-6">
              <h2 className="text-[0.75rem] font-semibold uppercase tracking-[0.23em] text-[#8a7463]">
                Send us a message
              </h2>
              <p className="mt-2 text-[0.78rem] leading-relaxed text-[#8a7463]">
                This form does not automatically confirm a reservation. We’ll get back
                to you as soon as we can.
              </p>

              <div className="mt-4">
                <ContactForm />
              </div>
            </section>
          </div>

          {/* Map embedded below info + form */}
          <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-[#e1d6c9] bg-[#f8f2ea]/80">
            <div className="relative h-[320px] sm:h-[380px] lg:h-[420px]">
              <iframe
                src={mapEmbedUrl}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full w-full border-0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
