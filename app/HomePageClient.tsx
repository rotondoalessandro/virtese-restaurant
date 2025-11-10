'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { urlForImage } from '@/lib/sanity.image'

/**
 * Base type for Sanity images
 */
export type SanityImage = {
  asset?: { _ref?: string; _id?: string }
  alt?: string
  url?: string
}

// Minimal builder type for Sanity
type SanityBuilder = {
  width: (n: number) => SanityBuilder
  height: (n: number) => SanityBuilder
  fit: (mode: string) => SanityBuilder
  url: () => string
}

function getImageUrl(src?: SanityImage, fallback?: string): string {
  if (!src || !src.asset || (!src.asset._ref && !src.asset._id)) {
    return fallback || ''
  }

  try {
    const built = urlForImage(src)
    if (typeof built === 'string') {
      return built || fallback || ''
    }

    const builder = built as unknown as SanityBuilder
    return builder.width(1600).height(1000).fit('crop').url()
  } catch (err) {
    console.warn('⚠️ Sanity image fallback used:', err)
    return fallback || ''
  }
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
    'Contemporary Tuscan cooking, seasonal ingredients, natural wines and warm, relaxed service.'
  const heroPrimaryCtaLabel = homepage?.heroPrimaryCtaLabel || 'Book a table'
  const heroPrimaryCtaHref = homepage?.heroPrimaryCtaHref || '/book'
  const heroSecondaryCtaLabel = homepage?.heroSecondaryCtaLabel || 'View the menu'
  const heroSecondaryCtaHref = homepage?.heroSecondaryCtaHref || '/menu'
  const heroBadges =
    homepage?.heroBadges?.length
      ? homepage.heroBadges
      : [
          { label: 'Seasonal Tuscan cooking' },
          { label: 'Natural wines & cocktails' },
          { label: 'Warm, relaxed dining room' },
        ]

  const heroMainImage = getImageUrl(
    homepage?.heroMainImage,
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1600&q=80'
  )
  const heroDishImage = getImageUrl(
    homepage?.heroDishImage,
    'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=1400&q=80'
  )
  const heroWineImage = getImageUrl(
    homepage?.heroWineImage,
    'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1400&q=80'
  )

  // QUICK INFO (used in hero)
  const openingHoursLabel = homepage?.openingHoursLabel || 'Opening hours'
  const openingHoursText =
    homepage?.openingHoursText || 'Tue–Sat · 18:00 – 23:00 · Kitchen late'
  // If needed elsewhere later, bring back findUs/booking copy.

  // ABOUT
  const aboutEyebrow = homepage?.aboutEyebrow || 'This is Virtese'
  const aboutTitle =
    homepage?.aboutTitle || 'A contemporary Tuscan trattoria in the heart of London.'
  const kitchenCard = homepage?.kitchenCard || {
    label: 'The kitchen',
    text: 'Fresh pasta every day, long-cooked ragù, grilled mains, seasonal vegetables and plates made to share in the middle of the table.',
  }
  const wineCard = homepage?.wineCard || {
    label: 'Wine & drinks',
    text: 'A short list of natural wines, Tuscan classics, simple cocktails and amari to end the night properly.',
  }

  // VIBES
  const vibesTitle = homepage?.vibesTitle || 'How people use Virtese'
  const vibesSubtitle =
    homepage?.vibesSubtitle ||
    'Drop by for a quick glass at the bar, a long dinner with friends or a late dessert with amaro.'
  const vibesCards =
    homepage?.vibesCards?.length
      ? homepage.vibesCards
      : [
          {
            title: 'After work at the bar',
            text: 'A glass of wine, a couple of crostini and a few small plates from the kitchen — before or after work.',
          },
          {
            title: 'Dinner with friends',
            text: 'Starters to share, two or three pastas in the middle, a big grilled main for the table.',
          },
          {
            title: 'Late night',
            text: 'Big desserts, amaro, one last drink and the feeling you don’t really want to go home yet.',
          },
        ]

  // GALLERY
  const galleryTitleEyebrow = homepage?.galleryTitleEyebrow || 'A quick look inside'
  const galleryTitle = homepage?.galleryTitle || 'The room, the plates, the glasses.'
  const gallerySubtitle =
    homepage?.gallerySubtitle ||
    'Scroll through the photos and get the feeling of the place before you even walk in.'
  const galleryImages =
    homepage?.galleryImages?.length
      ? homepage.galleryImages
      : [
          {
            alt: 'Fresh pasta on a plate',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80',
          },
          {
            alt: 'Wine glasses at the bar',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=80',
          },
          {
            alt: 'Dining room with warm lights',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=900&q=80',
          },
          {
            alt: 'Table setting detail',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=900&q=80',
          },
        ]

  // VISIT / CONTACT
  const visitEyebrow = homepage?.visitEyebrow || 'Visit us'
  const visitTitle =
    homepage?.visitTitle || 'Book a table, bring your people, stay a little too long.'
  const visitBody =
    homepage?.visitBody ||
    'At weekends we recommend booking ahead. We always keep a few spots at the bar for walk-ins when we can.'
  const addressTitle = homepage?.addressTitle || 'Address'
  const addressLines = homepage?.addressLines || ['12 Example Street', 'London, WC2N XXX']
  const contactTitle = homepage?.contactTitle || 'Contact'
  const phone = homepage?.phone || '+44 (0)20 0000 0000'
  const email = homepage?.email || 'hello@virteserestaurant.com'
  const reservationsTitle =
    homepage?.reservationsTitle || 'Reservations & groups'
  const reservationsBody =
    homepage?.reservationsBody ||
    'You can book online for up to 6 guests. For bigger groups, birthdays or takeovers, email us and we’ll help you plan the night properly.'
  const reservationsPrimaryLabel =
    homepage?.reservationsPrimaryLabel || 'Book a table'
  const reservationsPrimaryHref = homepage?.reservationsPrimaryHref || '/book'
  const reservationsSecondaryLabel =
    homepage?.reservationsSecondaryLabel || 'Email us'
  const reservationsSecondaryHref = homepage?.reservationsSecondaryHref || '/contact'

  // MAP (replace with your real embed URL)
  const mapEmbedUrl =
    'https://www.google.com/maps/embed?pb=YOUR_GOOGLE_MAPS_EMBED_HERE'

  return (
    <main className="min-h-screen bg-white text-[#5b4b41]">
      {/* HERO – BIG IMAGE + ESSENTIALS */}
      <section className="relative overflow-hidden border-b border-[#e1d6c9]">
        <div className="relative h-[85vh] min-h-[520px]">
          <Image
            src={heroMainImage}
            alt="Virtese dining room"
            fill
            priority
            className="object-cover"
          />
          {/* Dark overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/20" />

          <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-6 text-center">
            <motion.p
              variants={fade}
              initial="hidden"
              animate="visible"
              className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-[#f0dfcf]"
            >
              {heroTagline}
            </motion.p>

            <motion.h1
              variants={fade}
              initial="hidden"
              animate="visible"
              className="font-display text-5xl text-[#fdf7f0] drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)] sm:text-6xl lg:text-7xl"
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              variants={fade}
              initial="hidden"
              animate="visible"
              className="mt-4 max-w-2xl text-base text-[#f5ede4]/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)] sm:text-lg"
            >
              {heroSubtitle}
            </motion.p>

            <motion.p
              variants={fade}
              initial="hidden"
              animate="visible"
              className="mt-3 text-[0.8rem] uppercase tracking-[0.25em] text-[#f0dfcf]/90"
            >
              {openingHoursText}
            </motion.p>

            <motion.div
              variants={fade}
              initial="hidden"
              animate="visible"
              className="mt-8 flex flex-wrap justify-center gap-4"
            >
              <Link
                href={heroPrimaryCtaHref}
                className="rounded-full bg-[#f0dfcf] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:bg-white"
              >
                {heroPrimaryCtaLabel}
              </Link>
              <Link
                href={heroSecondaryCtaHref}
                className="rounded-full border border-[#f0dfcf]/80 bg-transparent px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:border-white hover:bg-white/10"
              >
                {heroSecondaryCtaLabel}
              </Link>
            </motion.div>

            {/* Small hero badges */}
            <motion.div
              variants={fade}
              initial="hidden"
              animate="visible"
              className="mt-6 flex flex-wrap justify-center gap-3 text-[0.8rem] text-[#f5ede4]/90"
            >
              {heroBadges.map(
                (b, i) =>
                  b.label && (
                    <span
                      key={i}
                      className="inline-flex items-center gap-2 rounded-full bg-black/40 px-3 py-1 backdrop-blur"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-[#f0dfcf]" />
                      {b.label}
                    </span>
                  )
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ABOUT / THIS IS VIRTESE */}
      <section className="border-b border-[#e1d6c9] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:py-16">
          <Header
            eyebrow={aboutEyebrow}
            title={aboutTitle}
            subtitle="Tables close together, high chatter, plates in the middle to share. Virtese is a Tuscan home transplanted to London: simple ingredients, big flavours and a team that makes you feel looked after from the moment you sit down."
          />

          <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-stretch">
            {/* Image side */}
            <div className="relative h-72 overflow-hidden rounded-3xl bg-neutral-100 sm:h-80">
              <Image
                src={heroDishImage || heroMainImage}
                alt="A corner of Virtese dining room"
                fill
                className="object-cover transition duration-700 ease-out hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-[#f0dfcf]">
                    Inside Virtese
                  </p>
                  <p className="mt-1 text-sm font-medium text-[#fdf7f0]">
                    Warm light, full tables and plates made to be shared.
                  </p>
                </div>
                <span className="hidden rounded-full bg-black/45 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-[#f5ede4] backdrop-blur sm:inline-flex">
                  Modern Tuscan Kitchen
                </span>
              </div>
            </div>

            {/* Text + kitchen / wine cards */}
            <div className="flex flex-col gap-6">
              <div className="space-y-4 text-sm leading-relaxed text-[#3f3127]">
                <p>
                  Come for a glass and a couple of small bites at the bar, for a long
                  dinner with friends or to celebrate something properly. The menu
                  changes with the seasons but stays very Tuscan: pici, slow ragù,
                  grilled meats, roasted vegetables and serious desserts.
                </p>
                <p>
                  We don&apos;t do fine dining — we do plates that make you want to order
                  “one more thing” and stay at the table a little longer than you
                  planned.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {[kitchenCard, wineCard].map((card, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-2xl border border-[#e1d6c9] bg-white shadow-sm"
                  >
                    {card.image && (
                      <div className="relative h-28">
                        <Image
                          src={getImageUrl(card.image, i === 0 ? heroDishImage : heroWineImage)}
                          alt={card.image.alt || 'Detail'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-4 text-sm">
                      <p className="text-[0.7rem] uppercase tracking-[0.23em] text-[#8a7463]">
                        {card.label}
                      </p>
                      <p className="mt-2 text-[#3f3127]">{card.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VIBES / HOW TO USE THE PLACE */}
      <section className="border-b border-[#e1d6c9] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:py-16">
          <Header title={vibesTitle} subtitle={vibesSubtitle} />
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {vibesCards.map((v, i) => (
              <div
                key={i}
                className="flex h-full flex-col rounded-2xl border border-[#e1d6c9] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-base font-semibold text-[#3f3127]">
                  {v.title}
                </h3>
                <p className="mt-2 flex-1 text-sm text-[#5b4b41]">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MENU HERO – BIG IMAGE + SIMPLE TEXT */}
      <section className="relative border-b border-[#e1d6c9]">
        <div className="relative h-[70vh] min-h-[480px]">
          <Image
            src={heroDishImage || heroWineImage}
            alt="Dishes from Virtese menu"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />

          <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
            <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-[#f5ede4]/90">
              Our menu
            </p>
            <h2 className="mt-3 max-w-3xl font-display text-3xl text-[#fdf7f0] sm:text-4xl md:text-5xl">
              A short menu, real ingredients and full flavours.
            </h2>
            <p className="mt-4 max-w-xl text-sm text-[#f5ede4]/90 sm:text-base">
              Seasonal dishes, handmade pasta, grilled vegetables and desserts to
              finish with a spoon. Take a look before you book or let us guide you
              through the menu at the table.
            </p>

            <Link
              href="/menu"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#f0dfcf]/95 px-7 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:bg-white"
            >
              View the full menu
              <span className="mt-[1px] text-xs">↗</span>
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY – HORIZONTAL SLIDER WITH TALL IMAGES */}
      <section className="border-b border-[#e1d6c9] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:py-16">
          <Header
            eyebrow={galleryTitleEyebrow}
            title={galleryTitle}
            subtitle={gallerySubtitle}
          />

          <div className="mt-8">
            <div
              className="
                flex gap-5 overflow-x-auto pb-4
                snap-x snap-mandatory
                [-ms-overflow-style:none] [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {galleryImages.map((img, i) => {
                const src = getImageUrl(img, (img as { url?: string }).url)

                return (
                  <div
                    key={i}
                    className="
                      relative h-[420px] sm:h-[520px]
                      w-[72%] sm:w-[45%] lg:w-[32%]
                      flex-shrink-0 snap-center
                      overflow-hidden rounded-[1.75rem]
                      border border-[#e1d6c9] bg-white shadow-sm
                    "
                  >
                    <Image
                      src={src}
                      alt={img.alt || 'Virtese gallery'}
                      fill
                      className="object-cover object-center"
                    />

                    {img.alt && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="inline-flex rounded-full bg-white/90 px-3 py-1 text-[0.7rem] uppercase tracking-[0.18em] text-[#5b4b41]">
                          {img.alt}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <p className="mt-3 text-center text-[0.75rem] text-[#8a7463]">
              Swipe through the photos to get a feel for the restaurant.
            </p>
          </div>
        </div>
      </section>

            {/* VISIT, CONTACT, MAP & RESERVATIONS – THE ONLY WARM BACKGROUNDS */}
      <section className="bg-white border-t border-[#e1d6c9]">
        <div className="mx-auto max-w-6xl space-y-12 px-4 py-16 sm:px-8 lg:py-20">
          {/* Centered heading */}
          <div className="text-center space-y-3">
            <p className="text-[0.8rem] font-semibold uppercase tracking-[0.26em] text-[#8a7463]">
              {visitEyebrow || 'Visit & bookings'}
            </p>
            <h2 className="font-display text-3xl text-[#3f3127] sm:text-4xl">
              {visitTitle || 'Come and see us.'}
            </h2>
            {visitBody && (
              <p className="mx-auto max-w-xl text-[0.95rem] leading-relaxed text-[#5b4b41] sm:text-base">
                {visitBody}
              </p>
            )}
          </div>

          {/* Left info / Right map */}
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] md:items-stretch">
            {/* LEFT – Address, contact, hours, reservations */}
            <div className="space-y-8">
              <div className="rounded-3xl border border-[#e1d6c9] bg-[#f8f2ea] px-6 py-6 text-[0.95rem] text-[#5b4b41] sm:px-7 sm:py-7 sm:text-base">
                <p className="text-[0.75rem] uppercase tracking-[0.23em] text-[#8a7463]">
                  {addressTitle || 'Address'}
                </p>
                <p className="mt-3 whitespace-pre-line leading-relaxed">
                  {addressLines.join('\n')}
                </p>

                <div className="mt-6 grid gap-5 text-[0.95rem] sm:grid-cols-2 sm:text-base">
                  <div>
                    <p className="text-[0.75rem] uppercase tracking-[0.23em] text-[#8a7463]">
                      {contactTitle || 'Contact'}
                    </p>
                    <p className="mt-3 leading-relaxed">
                      {phone && (
                        <>
                          <a
                            href={`tel:${phone.replace(/\s+/g, '')}`}
                            className="underline-offset-4 hover:underline"
                          >
                            {phone}
                          </a>
                          <br />
                        </>
                      )}
                      {email && (
                        <a
                          href={`mailto:${email}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {email}
                        </a>
                      )}
                    </p>
                  </div>

                  <div>
                    <p className="text-[0.75rem] uppercase tracking-[0.23em] text-[#8a7463]">
                      {openingHoursLabel || 'Opening hours'}
                    </p>
                    <p className="mt-3 leading-relaxed">
                      {openingHoursText}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#e1d6c9] bg-[#f5ede4]/90 px-6 py-6 text-center text-[0.95rem] text-[#3f3127] shadow-sm sm:px-7 sm:py-7 sm:text-left sm:text-base">
                <p className="text-[0.75rem] uppercase tracking-[0.23em] text-[#8a7463]">
                  {reservationsTitle || 'Reservations'}
                </p>
                <p className="mt-4 leading-relaxed">
                  {reservationsBody}
                </p>

                <div className="mt-5 flex flex-col items-center justify-start gap-3 sm:flex-row">
                  <Link
                    href={reservationsPrimaryHref}
                    className="w-full rounded-full bg-[#5b4b41] px-9 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-[#f5ede4] transition hover:bg-[#46362c] sm:w-auto"
                  >
                    {reservationsPrimaryLabel || 'Book a table'}
                  </Link>
                  <Link
                    href={reservationsSecondaryHref}
                    className="w-full rounded-full border border-[#5b4b41] px-9 py-3 text-[0.8rem] font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:bg-[#5b4b41] hover:text-[#f5ede4] sm:w-auto"
                  >
                    {reservationsSecondaryLabel || 'Email us'}
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT – Map */}
            <div className="overflow-hidden rounded-3xl border border-[#e1d6c9] bg-[#f8f2ea]">
              <div className="relative h-[360px] sm:h-[440px] md:h-full">
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
      </section>
    </main>
  )
}

/** Small reusable subcomponent **/

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
    <div className="flex flex-col gap-3 sm:gap-4">
      {eyebrow && (
        <p className="text-[0.8rem] font-semibold uppercase tracking-[0.28em] text-[#8a7463]">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-2xl text-[#3f3127] sm:text-3xl md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="max-w-2xl text-[0.95rem] leading-relaxed text-[#5b4b41] sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  )
}

