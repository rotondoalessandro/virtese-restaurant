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
    console.warn('Sanity image fallback used:', err)
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
  openingHoursList?: string[]
  openingHoursSubtitle?: string
  openingHoursCtaLabel?: string
  openingHoursCtaHref?: string
  openingHoursCtaSecondaryLabel?: string
  openingHoursCtaSecondaryHref?: string
  findUsLabel?: string
  findUsText?: string
  bookingInfoLabel?: string
  bookingInfoText?: string

  aboutPrimaryCtaLabel?: string
  aboutPrimaryCtaHref?: string
  aboutSecondaryCtaLabel?: string
  aboutSecondaryCtaHref?: string

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

  menuHeroTitle?: string
  menuHeroSubtitle?: string
  menuHeroCtaLabel?: string
  menuHeroCtaHref?: string

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
  const btnPrimary = 'rounded-full bg-[#3f3127] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#fdf7f0] transition hover:bg-black'
  const btnSecondary = 'rounded-full border border-[#3f3127] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#3f3127] transition hover:bg-[#fdf7f0]'

  // HERO
  const heroTagline = homepage?.heroTagline || 'Virtese Restaurant - London'
  const heroTitle = homepage?.heroTitle || 'Modern Tuscan Kitchen'
  const heroSubtitle =
    homepage?.heroSubtitle ||
    'Contemporary Tuscan cooking, seasonal ingredients, natural wines and warm, relaxed service.'
  const heroPrimaryCtaLabel = homepage?.heroPrimaryCtaLabel || 'Book a table'
  const heroPrimaryCtaHref = homepage?.heroPrimaryCtaHref || 'https://book.virtese.com/virtese-restaurant'
  const heroSecondaryCtaLabel = homepage?.heroSecondaryCtaLabel || 'View the menu'
  const heroSecondaryCtaHref = homepage?.heroSecondaryCtaHref || '/menu'

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
    homepage?.openingHoursText || 'Tue-Sat | 18:00-23:00 | Kitchen late'
  const openingHoursList = homepage?.openingHoursList?.filter(Boolean) || []
  const openingHoursSubtitle =
    homepage?.openingHoursSubtitle ||
    "Come for a drink, stay for dinner — we're here when London gets hungry."
  const openingHoursCtaLabel = homepage?.openingHoursCtaLabel || 'Book a table'
  const openingHoursCtaHref = homepage?.openingHoursCtaHref || 'https://book.virtese.com/virtese-restaurant'
  const openingHoursCtaSecondaryLabel =
    homepage?.openingHoursCtaSecondaryLabel || 'View menu'
  const openingHoursCtaSecondaryHref = homepage?.openingHoursCtaSecondaryHref || '/menu'
  // If needed elsewhere later, bring back findUs/booking copy.

  // ABOUT
  const aboutEyebrow = homepage?.aboutEyebrow || 'This is Virtese'
  const aboutTitle =
    homepage?.aboutTitle || 'A contemporary Tuscan trattoria in the heart of London.'
  const aboutPrimaryCtaLabel = homepage?.aboutPrimaryCtaLabel || 'View menu'
  const aboutPrimaryCtaHref = homepage?.aboutPrimaryCtaHref || '/menu'
  const aboutSecondaryCtaLabel = homepage?.aboutSecondaryCtaLabel || 'Book now'
  const aboutSecondaryCtaHref = homepage?.aboutSecondaryCtaHref || 'https://book.virtese.com/virtese-restaurant'
  const kitchenCard = homepage?.kitchenCard || {
    label: 'The kitchen',
    text: 'Fresh pasta every day, long-cooked ragu, grilled mains, seasonal vegetables and plates made to share in the middle of the table.',
  }
  const wineCard = homepage?.wineCard || {
    label: 'Wine & drinks',
    text: 'A short list of natural wines, Tuscan classics, simple cocktails and amari to end the night properly.',
  }

  // VIBES
  // Vibes fields reserved for future use; not rendered currently.

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
    'You can book online for up to 6 guests. For bigger groups, birthdays or takeovers, email us and well help you plan the night properly.'
  const reservationsPrimaryLabel =
    homepage?.reservationsPrimaryLabel || 'Book a table'
  const reservationsPrimaryHref = homepage?.reservationsPrimaryHref || 'https://book.virtese.com/virtese-restaurant'
  const reservationsSecondaryLabel =
    homepage?.reservationsSecondaryLabel || 'Email us'
  const reservationsSecondaryHref = homepage?.reservationsSecondaryHref || '/contact'

  const menuHeroTitle = homepage?.menuHeroTitle || 'A short menu, real ingredients and full flavours.'
  const menuHeroSubtitle =
    homepage?.menuHeroSubtitle ||
    'Seasonal dishes, handmade pasta, grilled vegetables and desserts to finish with a spoon.'
  const menuHeroCtaLabel = homepage?.menuHeroCtaLabel || 'View the full menu'
  const menuHeroCtaHref = homepage?.menuHeroCtaHref || '/menu'

  // MAP (replace with your real embed URL)
  const mapEmbedUrl =
    'https://www.google.com/maps/embed?pb=YOUR_GOOGLE_MAPS_EMBED_HERE'

  return (
    <main className="min-h-screen bg-white text-[#5b4b41]">
      {/* HERO - BIG IMAGE + ESSENTIALS */}
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
              className="font-display text-6xl sm:text-7xl lg:text-8xl text-[#fdf7f0] font-semibold drop-shadow-[0_3px_10px_rgba(0,0,0,0.6)]"
            >
              {heroTitle}
            </motion.h1>

            <motion.p
              variants={fade}
              initial="hidden"
              animate="visible"
              className="mt-4 max-w-xl text-lg text-[#f5ede4]/95 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]"
            >
              {heroSubtitle}
            </motion.p>

            <motion.div
              variants={fade}
              initial="hidden"
              animate="visible"
              className="mt-10 flex flex-wrap justify-center gap-4"
            >
              <Link
                href={heroPrimaryCtaHref}
                className="rounded-full bg-[#f0dfcf] px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#5b4b41] transition hover:bg-white"
              >
                {heroPrimaryCtaLabel}
              </Link>

              <Link
                href={heroSecondaryCtaHref}
                className="rounded-full border border-[#f0dfcf]/80 px-8 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#f5ede4] hover:border-white hover:bg-white/10"
              >
                {heroSecondaryCtaLabel}
              </Link>
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
      subtitle="A Tuscan home in London - warm tables, big flavours, shared plates."
    />

    <div className="mt-10 grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] md:items-center">

      {/* TEXT SIDE LEFT */}
      <div className="flex flex-col gap-6">
        
        {/* SHORT TEXT */}
        <div className="space-y-4 text-sm leading-relaxed text-[#3f3127]">
          <p>
            Stop by for a glass at the bar or stay for a long dinner. Our menu is
            seasonal, simple and very Tuscan: handmade pasta, slow ragu, grilled meats,
            roasted vegetables and proper desserts.
          </p>
          <p>
            No fine dining - just plates that make you order &apos;one more thing&apos; and stay longer.
          </p>
        </div>

        {/* CTA BUTTONS */}
        <div className="mt-4 flex flex-wrap gap-4">
          <Link
            href={aboutPrimaryCtaHref}
            className={btnPrimary}
          >
            {aboutPrimaryCtaLabel}
          </Link>

          <Link
            href={aboutSecondaryCtaHref}
            className={btnSecondary}
          >
            {aboutSecondaryCtaLabel}
          </Link>
        </div>

        {/* CARDS */}
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
                <p className="mt-2 text-[#3f3127]">
                  {i === 0
                    ? "Fresh pasta, slow-cooked sauces and grills. Honest Tuscan cooking."
                    : "A tight list of Italian bottles - bold reds, crisp whites, zero pretense."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IMAGE SIDE RIGHT */}
      <div className="relative h-96 sm:h-[480px] md:h-full overflow-hidden rounded-3xl bg-neutral-100">
        <Image
          src={heroDishImage || heroMainImage}
          alt="Inside Virtese"
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
              Warm light. Full tables. Real food.
            </p>
          </div>

          <span className="hidden rounded-full bg-black/45 px-3 py-1 text-[0.7rem] uppercase tracking-[0.22em] text-[#f5ede4] backdrop-blur sm:inline-flex">
            Modern Tuscan Kitchen
          </span>
        </div>
      </div>
    </div>
  </div>
</section>



      {/* VIBES / HOW TO USE THE PLACE */}
      {/* OPENING HOURS */}
      <section className="border-b border-[#e1d6c9] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8 lg:py-16">
                    <Header
            title="Opening Hours"
            subtitle={openingHoursSubtitle}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(openingHoursList.length ? openingHoursList : [openingHoursText]).map((line, i) => (
              <div
                key={`${line}-${i}`}
                className="flex h-full items-center justify-center rounded-2xl border border-[#e1d6c9] bg-white p-5 text-center text-sm leading-relaxed text-[#3f3127] shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                {line}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-10 flex justify-center gap-4">
            <Link
              href={openingHoursCtaHref}
              className={btnPrimary}
            >
              {openingHoursCtaLabel}
            </Link>

            <Link
              href={openingHoursCtaSecondaryHref}
              className={btnSecondary}
            >
              {openingHoursCtaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* MENU HERO - BIG IMAGE + SIMPLE TEXT */}
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
              {menuHeroTitle}
            </h2>
            <p className="mt-4 max-w-xl text-sm text-[#f5ede4]/90 sm:text-base">
              {menuHeroSubtitle}
            </p>

            <Link
              href={menuHeroCtaHref}
              className={`${btnPrimary} inline-flex items-center gap-2 px-7 py-2.5 text-xs`}
            >
              {menuHeroCtaLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* GALLERY - HORIZONTAL SLIDER WITH TALL IMAGES */}
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

            {/* VISIT, CONTACT, MAP & RESERVATIONS - THE ONLY WARM BACKGROUNDS */}
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
            {/* LEFT - Address, contact, hours, reservations */}
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
                      {openingHoursList.length ? openingHoursList.join('\n') : openingHoursText}
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
                    className={`${btnPrimary} w-full sm:w-auto px-9 py-3 text-[0.8rem]`}
                  >
                    {reservationsPrimaryLabel || 'Book a table'}
                  </Link>
                  <Link
                    href={reservationsSecondaryHref}
                    className={`${btnSecondary} w-full sm:w-auto px-9 py-3 text-[0.8rem]`}
                  >
                    {reservationsSecondaryLabel || 'Email us'}
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT - Map */}
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

