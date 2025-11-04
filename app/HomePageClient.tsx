'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlForImage } from '@/lib/sanity.image'

/**
 * 🔧 Definizione locale del tipo per il builder,
 * compatibile con Sanity ma senza import diretti dal modulo.
 */
type ImageUrlBuilderLike = {
  width: (n: number) => ImageUrlBuilderLike
  height: (n: number) => ImageUrlBuilderLike
  fit: (mode: string) => ImageUrlBuilderLike
  url: () => string
}

export type SanityImage = {
  asset?: { _ref?: string; _id?: string }
  alt?: string
}

/**
 * ✅ Helper per ottenere sempre una stringa URL valida
 * senza errori TypeScript o ESM.
 */
function getImageUrl(src?: SanityImage, fallback?: string): string {
  // niente immagine → ritorna subito fallback
  if (!src || !src.asset || (!src.asset._ref && !src.asset._id)) {
    return fallback || ''
  }

  try {
    const built = urlForImage(src)
    if (
      built &&
      typeof built === 'object' &&
      typeof (built as { url: () => string }).url === 'function'
    ) {
      return (built as { width: (n: number) => any; height: (n: number) => any; fit: (m: string) => any; url: () => string })
        .width(1400)
        .height(900)
        .fit('crop')
        .url()
    }
  } catch (err) {
    console.warn('⚠️ Sanity image fallback used:', err)
  }

  // fallback se qualcosa va storto
  return fallback || ''
}

type HomepageData = {
  heroTagline?: string
  heroTitle?: string
  heroSubtitle?: string
  heroPrimaryCtaLabel?: string
  heroPrimaryCtaHref?: string
  heroSecondaryCtaLabel?: string
  heroSecondaryCtaHref?: string
  heroBadges?: { label?: string }[]

  heroMainImage?: SanityImage
  heroDishImage?: SanityImage
  heroWineImage?: SanityImage

  tonightLabel?: string
  tonightTitle?: string
  tonightKitchenNote?: string

  openingHoursLabel?: string
  openingHoursText?: string
  findUsLabel?: string
  findUsText?: string
  bookingInfoLabel?: string
  bookingInfoText?: string

  galleryTitleEyebrow?: string
  galleryTitle?: string
  gallerySubtitle?: string
  galleryImages?: (SanityImage & { alt?: string })[]

  aboutEyebrow?: string
  aboutTitle?: string
  kitchenCard?: { label?: string; text?: string; image?: SanityImage }
  wineCard?: { label?: string; text?: string; image?: SanityImage }

  vibesTitle?: string
  vibesSubtitle?: string
  vibesCards?: { title?: string; text?: string }[]

  visitEyebrow?: string
  visitTitle?: string
  visitBody?: string
  addressTitle?: string
  addressLines?: string[]
  contactTitle?: string
  phone?: string
  email?: string
  reservationsTitle?: string
  reservationsBody?: string
  reservationsPrimaryLabel?: string
  reservationsPrimaryHref?: string
  reservationsSecondaryLabel?: string
  reservationsSecondaryHref?: string
}

type Props = { homepage?: HomepageData }

const fade = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export function HomePageClient({ homepage }: Props) {
  // HERO
  const heroTagline = homepage?.heroTagline || 'Virtese Restaurant · London'
  const heroTitle = homepage?.heroTitle || 'Modern Tuscan Kitchen'
  const heroSubtitle =
    homepage?.heroSubtitle ||
    'Seasonal plates, natural wines, warm hospitality.'
  const heroPrimaryCtaLabel = homepage?.heroPrimaryCtaLabel || 'Book a table'
  const heroPrimaryCtaHref = homepage?.heroPrimaryCtaHref || '/book'
  const heroSecondaryCtaLabel = homepage?.heroSecondaryCtaLabel || 'View menu'
  const heroSecondaryCtaHref = homepage?.heroSecondaryCtaHref || '/menu'
  const heroBadges =
    homepage?.heroBadges?.length
      ? homepage.heroBadges
      : [
          { label: 'Seasonal Tuscan plates' },
          { label: 'Natural wine bar' },
          { label: 'Late-night vibes' },
        ]

  const heroMainImage = getImageUrl(
    homepage?.heroMainImage,
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80'
  )
  const heroDishImage = getImageUrl(
    homepage?.heroDishImage,
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80'
  )
  const heroWineImage = getImageUrl(
    homepage?.heroWineImage,
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80'
  )

  const tonightLabel = homepage?.tonightLabel || 'Tonight at Virtese'
  const tonightTitle =
    homepage?.tonightTitle ||
    'Handmade pici, grilled meats to share, bottles of Chianti & good music.'
  const tonightKitchenNote =
    homepage?.tonightKitchenNote || 'Kitchen open until 23:00. Bar open late.'

  // QUICK INFO
  const openingHoursLabel = homepage?.openingHoursLabel || 'Opening hours'
  const openingHoursText =
    homepage?.openingHoursText || 'Tue–Sat · 18:00 – 23:00 · Kitchen late'
  const findUsLabel = homepage?.findUsLabel || 'Find us'
  const findUsText =
    homepage?.findUsText ||
    '12 Example Street, London · Near Shoreditch / Soho'
  const bookingInfoLabel = homepage?.bookingInfoLabel || 'Book easily'
  const bookingInfoText =
    homepage?.bookingInfoText ||
    'Online for up to 6 guests · Bigger groups by email'

  // GALLERY
  const galleryTitleEyebrow =
    homepage?.galleryTitleEyebrow || 'A quick look inside'
  const galleryTitle = homepage?.galleryTitle || 'Pasta, wine, candlelight.'
  const gallerySubtitle =
    homepage?.gallerySubtitle ||
    'Scroll the photos, get the vibe in 3 seconds. If it feels right, hit “Book a table”.'
  const galleryImages =
    homepage?.galleryImages?.length
      ? homepage.galleryImages
      : [
          {
            alt: 'Pasta on the table',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80',
          },
          {
            alt: 'Wine and glasses at the bar',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80',
          },
          {
            alt: 'Warm dining room',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
          },
        ]

  // ABOUT
  const aboutEyebrow = homepage?.aboutEyebrow || 'This is Virtese'
  const aboutTitle =
    homepage?.aboutTitle ||
    'A loud table, good wine, and plates made to share.'
  const kitchenCard = homepage?.kitchenCard || {
    label: 'Kitchen style',
    text: 'Handmade pasta, slow braises, grilled vegetables, big flavours and no tiny portions.',
  }
  const wineCard = homepage?.wineCard || {
    label: 'Wine & drinks',
    text: 'A short list of natural & low–intervention wines, classic cocktails and good amari to finish the night.',
  }

  // VIBES
  const vibesTitle = homepage?.vibesTitle || 'How the night looks'
  const vibesSubtitle =
    homepage?.vibesSubtitle ||
    'Quick drink, long dinner, late dessert — you can keep it simple or make an evening of it.'
  const vibesCards =
    homepage?.vibesCards?.length
      ? homepage.vibesCards
      : [
          {
            title: 'After–work',
            text: 'Drop in for wine, crostini and a couple of small plates at the bar.',
          },
          {
            title: 'Dinner with friends',
            text: 'Order a bit of everything, share the pasta, fight over the last bite.',
          },
          {
            title: 'Late night',
            text: 'Dessert, amaro, one more glass — the best part of the evening.',
          },
        ]

  // VISIT
  const visitEyebrow = homepage?.visitEyebrow || 'Visit'
  const visitTitle =
    homepage?.visitTitle || 'Book a table, bring your people, stay too long.'
  const visitBody =
    homepage?.visitBody ||
    'We recommend booking ahead for Fridays and Saturdays. Walk–ins are welcome at the bar whenever we have space.'
  const addressTitle = homepage?.addressTitle || 'Address'
  const addressLines = homepage?.addressLines || [
    '12 Example Street',
    'London, WC2N XXX',
  ]
  const contactTitle = homepage?.contactTitle || 'Contact'
  const phone = homepage?.phone || '+44 (0)20 0000 0000'
  const email = homepage?.email || 'hello@virteserestaurant.com'
  const reservationsTitle = homepage?.reservationsTitle || 'Reservations'
  const reservationsBody =
    homepage?.reservationsBody ||
    "Tables up to 6 can be booked online. For bigger groups, birthdays or takeovers, email us and we'll help you plan the night properly."
  const reservationsPrimaryLabel =
    homepage?.reservationsPrimaryLabel || 'Book a table'
  const reservationsPrimaryHref =
    homepage?.reservationsPrimaryHref || '/book'
  const reservationsSecondaryLabel =
    homepage?.reservationsSecondaryLabel || 'Email us'
  const reservationsSecondaryHref =
    homepage?.reservationsSecondaryHref || '/contact'

  return (
    <main className="min-h-screen bg-[#050505] text-zinc-50">
      {/* HERO */}
      <section className="relative flex min-h-[80vh] flex-col border-b border-zinc-800 lg:flex-row">
        <div className="relative flex flex-1 items-center px-4 py-10 sm:px-8 lg:px-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.10),_transparent_65%)]" />
          <div className="relative z-10 max-w-xl space-y-5">
            <motion.p
              variants={fade}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.25em] text-zinc-400"
            >
              <span className="h-1 w-6 rounded-full bg-amber-500" />
              {heroTagline}
            </motion.p>

            <motion.h1
              variants={fade}
              initial="hidden"
              animate="visible"
              className="font-display text-4xl sm:text-5xl lg:text-[3.2rem]"
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              variants={fade}
              initial="hidden"
              animate="visible"
              className="max-w-md text-sm text-zinc-300 sm:text-base"
            >
              {heroSubtitle}
            </motion.p>

            <motion.div
              variants={fade}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap items-center gap-3"
            >
              <Link
                href={heroPrimaryCtaHref}
                className="rounded-full bg-amber-500 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-black transition hover:bg-amber-400"
              >
                {heroPrimaryCtaLabel}
              </Link>
              <Link
                href={heroSecondaryCtaHref}
                className="rounded-full border border-zinc-600 px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 transition hover:border-amber-400 hover:text-amber-200"
              >
                {heroSecondaryCtaLabel}
              </Link>
            </motion.div>

            <div className="flex flex-wrap gap-3 text-[0.75rem] text-zinc-400">
              {heroBadges.map(
                (b, i) =>
                  b.label && (
                    <span key={i} className="inline-flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {b.label}
                    </span>
                  )
              )}
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE COLLAGE */}
        <div className="relative flex flex-1 items-stretch overflow-hidden border-t border-zinc-800 lg:border-l lg:border-t-0">
          <div className="relative grid h-full w-full grid-cols-2 gap-3 p-4 sm:p-6 lg:p-8">
            <div className="col-span-2 row-span-2 overflow-hidden rounded-3xl relative h-96">
              <Image src={heroMainImage} alt="Main hero" fill className="object-cover" />
            </div>
            <div className="overflow-hidden rounded-3xl relative h-40">
              <Image src={heroDishImage} alt="Dish" fill className="object-cover" />
            </div>
            <div className="overflow-hidden rounded-3xl relative h-40">
              <Image src={heroWineImage} alt="Wine" fill className="object-cover" />
            </div>
          </div>

          <div className="absolute bottom-5 right-5 w-64 rounded-2xl bg-black/70 p-4 text-xs text-zinc-100 backdrop-blur">
            <p className="text-[0.65rem] uppercase tracking-[0.25em] text-amber-300">
              {tonightLabel}
            </p>
            <p className="mt-2 text-sm font-medium">{tonightTitle}</p>
            <p className="mt-2 text-[0.7rem] text-zinc-300">
              {tonightKitchenNote}
            </p>
          </div>
        </div>
      </section>

      {/* QUICK INFO */}
      <section className="border-b border-zinc-800 bg-black/95">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-zinc-200 sm:flex-row sm:items-center sm:justify-between">
          <InfoBlock icon="🕰" label={openingHoursLabel} text={openingHoursText} />
          <InfoBlock icon="📍" label={findUsLabel} text={findUsText} />
          <InfoBlock icon="✨" label={bookingInfoLabel} text={bookingInfoText} />
        </div>
      </section>

      {/* GALLERY */}
      <section className="border-b border-zinc-800 bg-[#070606]">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-8">
          <Header title={galleryTitle} eyebrow={galleryTitleEyebrow} subtitle={gallerySubtitle} />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {galleryImages.map((img, i) => {
              const src = getImageUrl(img, (img as { url?: string }).url)
              return (
                <div key={i} className="overflow-hidden rounded-2xl relative h-56">
                  <Image src={src} alt={img.alt || 'Gallery'} fill className="object-cover" />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section className="border-b border-zinc-800 bg-[#050505]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-zinc-500">{aboutEyebrow}</p>
            <h2 className="mt-3 font-display text-3xl text-zinc-50">{aboutTitle}</h2>
            <p className="mt-4 text-sm text-zinc-300">
              Think of your favourite Tuscan trattoria — then bring it to the city.
            </p>
          </div>

          <div className="space-y-3">
            {[kitchenCard, wineCard].map((card, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60">
                {card.image && (
                  <div className="relative h-32">
                    <Image
                      src={getImageUrl(card.image)}
                      alt={card.image.alt || 'Card'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-4 text-sm">
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-zinc-500">
                    {card.label}
                  </p>
                  <p className="mt-2">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIBES */}
      <section className="border-b border-zinc-800 bg-[#050505]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <Header title={vibesTitle} subtitle={vibesSubtitle} />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {vibesCards.map((v, i) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 transition hover:-translate-y-1 hover:border-amber-400/70"
              >
                <h3 className="text-base font-semibold text-zinc-50">{v.title}</h3>
                <p className="mt-2 text-sm text-zinc-300">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VISIT */}
      <section className="bg-[#050505]">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-center">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.28em] text-zinc-500">{visitEyebrow}</p>
            <h2 className="mt-2 font-display text-3xl text-zinc-50">{visitTitle}</h2>
            <p className="mt-3 text-sm text-zinc-300">{visitBody}</p>
            <div className="mt-6 grid gap-6 text-sm text-zinc-300 md:grid-cols-2">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.23em] text-zinc-500">
                  {addressTitle}
                </p>
                <p className="mt-2 whitespace-pre-line">{addressLines.join('\n')}</p>
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.23em] text-zinc-500">
                  {contactTitle}
                </p>
                <p className="mt-2">
                  {phone}
                  <br />
                  {email}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-black/70 p-5 text-sm">
            <p className="text-[0.65rem] uppercase tracking-[0.23em] text-zinc-500">
              {reservationsTitle}
            </p>
            <p className="mt-3">{reservationsBody}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={reservationsPrimaryHref}
                className="rounded-full bg-amber-500 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-black hover:bg-amber-400"
              >
                {reservationsPrimaryLabel}
              </Link>
              <Link
                href={reservationsSecondaryHref}
                className="rounded-full border border-zinc-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 hover:border-amber-400 hover:text-amber-200"
              >
                {reservationsSecondaryLabel}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

/** Small reusable subcomponents **/
function InfoBlock({
  icon,
  label,
  text,
}: {
  icon: string
  label: string
  text: string
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-xs">
        {icon}
      </span>
      <div>
        <p className="text-[0.65rem] uppercase tracking-[0.24em] text-zinc-500">{label}</p>
        <p className="text-xs text-zinc-300">{text}</p>
      </div>
    </div>
  )
}

function Header({
  title,
  eyebrow,
  subtitle,
}: {
  title: string
  eyebrow?: string
  subtitle?: string
}) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
      <div>
        {eyebrow && (
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-zinc-500">
            {eyebrow}
          </p>
        )}
        <h2 className="mt-2 font-display text-2xl text-zinc-50 sm:text-3xl">{title}</h2>
      </div>
      {subtitle && <p className="max-w-md text-sm text-zinc-400">{subtitle}</p>}
    </div>
  )
}
