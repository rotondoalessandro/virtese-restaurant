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
  kitchenCard,
  wineCard,

  vibesTitle,
  vibesSubtitle,
  vibesCards,

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

  return <HomePageClient homepage={homepage} />
}
