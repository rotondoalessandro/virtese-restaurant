// app/page.tsx
import { sanityClient } from '@/lib/sanity.client'
import { HomePageClient } from './HomePageClient'
import { groq } from 'next-sanity'

const homepageQuery = groq`*[_type == "homepage"][0]{
  heroTagline,
  heroTitle,
  heroSubtitle,
  heroPrimaryCtaLabel,
  heroPrimaryCtaHref,
  heroSecondaryCtaLabel,
  heroSecondaryCtaHref,
  heroBadges,

  heroMainImage,
  heroDishImage,
  heroWineImage,

  tonightLabel,
  tonightTitle,
  tonightBody,
  tonightKitchenNote,

  openingHoursLabel,
  openingHoursText,
  openingHoursSubtitle,
  openingHoursCtaLabel,
  openingHoursCtaHref,
  openingHoursCtaSecondaryLabel,
  openingHoursCtaSecondaryHref,
  findUsLabel,
  findUsText,
  bookingInfoLabel,
  bookingInfoText,

  galleryTitleEyebrow,
  galleryTitle,
  gallerySubtitle,
  galleryImages,

  aboutEyebrow,
  aboutTitle,
  aboutBody,
  aboutPrimaryCtaLabel,
  aboutPrimaryCtaHref,
  aboutSecondaryCtaLabel,
  aboutSecondaryCtaHref,
  kitchenCard,
  wineCard,

  vibesTitle,
  vibesSubtitle,
  vibesCards,

  menuHeroTitle,
  menuHeroSubtitle,
  menuHeroCtaLabel,
  menuHeroCtaHref,

  visitEyebrow,
  visitTitle,
  visitBody,
  addressTitle,
  addressLines,
  contactTitle,
  phone,
  email,
  reservationsTitle,
  reservationsBody,
  reservationsPrimaryLabel,
  reservationsPrimaryHref,
  reservationsSecondaryLabel,
  reservationsSecondaryHref
}`

async function getHomepageData() {
  const data = await sanityClient.fetch(homepageQuery)
  return data
}

export default async function HomePage() {
  const homepage = await getHomepageData()
  const contact = await sanityClient.fetch<{ openingHours?: string[] }>(
    `*[_type == "contactSettings"][0]{openingHours}`
  )
  const openingLines = contact?.openingHours?.filter(Boolean) ?? []
  const openingSummary = openingLines.length ? openingLines.slice(0, 2).join(' | ') : undefined

  return (
    <HomePageClient
      homepage={{ ...homepage, openingHoursText: openingSummary, openingHoursList: openingLines }}
    />
  )
}
