// app/page.tsx
import { sanityClient } from '@/lib/sanity.client'
import { prisma } from '@/lib/prisma'
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

function hmToMinutes(hm?: string | null) {
  if (!hm) return 0
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

function dayLabel(idx: number) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return labels[idx] || String(idx)
}

function groupDays(days: number[]) {
  if (!days.length) return ''
  const parts: string[] = []
  let start = days[0]
  let prev = days[0]
  for (let i = 1; i < days.length; i++) {
    const d = days[i]
    if (d === prev + 1) {
      prev = d
      continue
    }
    parts.push(start === prev ? dayLabel(start) : `${dayLabel(start)}–${dayLabel(prev)}`)
    start = prev = d
  }
  parts.push(start === prev ? dayLabel(start) : `${dayLabel(start)}–${dayLabel(prev)}`)
  return parts.join(', ')
}

async function getOpeningSummary(): Promise<string | undefined> {
  const hours = await prisma.openingHour.findMany({ orderBy: { weekday: 'asc' } })
  if (!hours.length) return undefined

  const open = hours.filter((h) => hmToMinutes(h.openTime) < hmToMinutes(h.closeTime))
  if (!open.length) return 'Closed this week'

  const timesKeySet = new Set(open.map((h) => `${h.openTime}-${h.closeTime}`))
  if (timesKeySet.size === 1) {
    const any = open[0]
    const openDays = open.map((h) => h.weekday).sort((a, b) => a - b)
    return `${groupDays(openDays)} · ${any.openTime} – ${any.closeTime}`
  }

  // If times vary by day, show a concise hint instead of a long list
  return 'See opening hours below'
}

export default async function HomePage() {
  const homepage = await getHomepageData()
  const openingSummary = await getOpeningSummary()

  return <HomePageClient homepage={{ ...homepage, openingHoursText: openingSummary }} />
}
