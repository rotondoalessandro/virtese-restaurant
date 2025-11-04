// lib/sanity.client.ts
import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: 'a7viqlei',
  dataset: 'production',
  apiVersion: '2025-11-03',
  useCdn: true,
})
