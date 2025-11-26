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
    'https://images.unsplash.com/photo-1712746784067-e9e1bd86c043?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
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
            url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          },
          {
            alt: 'Dining room with warm lights',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1722587544083-057ef8a58925?q=80&w=1330&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          },
          {
            alt: 'Table setting detail',
            asset: { _ref: '' },
            url: 'https://images.unsplash.com/photo-1712746785117-6aec15c9f368?q=80&w=1187&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/30 to-black/10" />

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
  <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 lg:py-24">

    <div className="grid gap-16 md:grid-cols-2 md:gap-20 md:items-start">

      {/* LEFT COLUMN — ALL TEXT (INCLUDING HEADER) */}
      <div className="flex flex-col gap-10">

        <Header
          eyebrow={aboutEyebrow}
          title={aboutTitle}
          subtitle="A Tuscan home in London — warm tables, big flavours, shared plates."
        />

        {/* INTRO TEXT */}
        <div className="space-y-5 text-[0.98rem] leading-relaxed text-[#3f3127]">
          <p>
            Stop by for a glass at the bar or stay for a long dinner. Our menu is
            seasonal, simple and very Tuscan: handmade pasta, slow ragu, grilled meats,
            roasted vegetables and proper desserts.
          </p>
          <p>
            No fine dining — just plates that make you order &apos;one more thing&apos;
            and stay longer.
          </p>
        </div>

        {/* CTA BUTTONS */}
        <div className="flex flex-wrap gap-4 pt-2">
          <Link href={aboutPrimaryCtaHref} className={btnPrimary}>
            {aboutPrimaryCtaLabel}
          </Link>

          <Link href={aboutSecondaryCtaHref} className={btnSecondary}>
            {aboutSecondaryCtaLabel}
          </Link>
        </div>
      </div>

      {/* RIGHT COLUMN — FULL-HEIGHT IMAGE, NO TEXT */}
      <div className="relative w-full h-full overflow-hidden rounded-3xl bg-neutral-100 shadow-sm">
        <Image
          src={heroDishImage || heroMainImage}
          alt="Inside Virtese"
          fill
          className="object-cover object-center"
        />
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
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/15 to-transparent" />

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
              className={`${btnPrimary} inline-flex items-center gap-2 px-7 mt-5 py-2.5 text-xs`}
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

     {/* VISIT / CONTACT / MAP */}
<section className="border-t border-[#e1d6c9] bg-white">
  <div className="mx-auto max-w-6xl px-4 py-20 sm:px-8 lg:py-24">

    <div className="grid gap-16 md:grid-cols-2 md:gap-20 md:items-start">

      {/* LEFT COLUMN — ALL TEXT */}
      <div className="flex flex-col gap-10">

        {/* TEXT HEADER */}
        <div className="flex flex-col gap-4">
          <p className="text-[0.8rem] font-semibold uppercase tracking-[0.28em] text-[#8a7463]">
            {visitEyebrow}
          </p>

          <h2 className="font-display text-3xl sm:text-4xl text-[#3f3127]">
            {visitTitle}
          </h2>

          {visitBody && (
            <p className="text-[0.95rem] leading-relaxed text-[#5b4b41] sm:text-base">
              {visitBody}
            </p>
          )}
        </div>

        {/* ADDRESS */}
        <div className="space-y-2">
          <p className="text-[0.75rem] uppercase tracking-[0.23em] text-[#8a7463]">
            {addressTitle}
          </p>
          <p className="text-[0.97rem] leading-relaxed text-[#3f3127] whitespace-pre-line">
            {addressLines.join('\n')}
          </p>
        </div>

        {/* CONTACT */}
        <div className="space-y-2">
          <p className="text-[0.75rem] uppercase tracking-[0.23em] text-[#8a7463]">
            {contactTitle}
          </p>
          <p className="text-[0.97rem] leading-relaxed text-[#3f3127]">
            <a href={`tel:${phone.replace(/\s+/g, '')}`} className="underline-offset-4 hover:underline">
              {phone}
            </a>
            <br />
            <a href={`mailto:${email}`} className="underline-offset-4 hover:underline">
              {email}
            </a>
          </p>
        </div>

        {/* HOURS */}
        <div className="space-y-2">
          <p className="text-[0.75rem] uppercase tracking-[0.23em] text-[#8a7463]">
            {openingHoursLabel}
          </p>
          <p className="text-[0.97rem] leading-relaxed text-[#3f3127] whitespace-pre-line">
            {openingHoursList.length ? openingHoursList.join('\n') : openingHoursText}
          </p>
        </div>

        {/* RESERVATIONS */}
        <div className="space-y-4 pt-4">
          <p className="text-[0.75rem] uppercase tracking-[0.23em] text-[#8a7463]">
            {reservationsTitle}
          </p>

          <p className="text-[0.97rem] leading-relaxed text-[#5b4b41]">
            {reservationsBody}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={reservationsPrimaryHref}
              className={`${btnPrimary} px-9 py-3 text-[0.8rem]`}
            >
              {reservationsPrimaryLabel}
            </Link>
            <Link
              href={reservationsSecondaryHref}
              className={`${btnSecondary} px-9 py-3 text-[0.8rem]`}
            >
              {reservationsSecondaryLabel}
            </Link>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN — MAP */}
      <div className="relative w-full h-[420px] sm:h-[520px] overflow-hidden rounded-3xl border border-[#e1d6c9] bg-white shadow-sm">
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

