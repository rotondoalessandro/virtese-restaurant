import imageUrlBuilder from '@sanity/image-url'
import { sanityClient } from './sanity.client'

/** Matches all possible Sanity image shapes */
export type ImageSource =
  | { asset?: { _ref?: string; _id?: string } }
  | { _ref?: string }
  | string
  | null
  | undefined

// Reuse a single builder instance
const builder = imageUrlBuilder(sanityClient)

/**
 * Safely build a Sanity image URL.
 * Example:
 *   const url = urlForImage(image).width(800).height(600).url()
 */
export function urlForImage(source: ImageSource) {
  if (!source) return builder.image('').url()

  const validSource =
    typeof source === 'string' || '_ref' in source || 'asset' in source
      ? (source as Exclude<ImageSource, null | undefined>)
      : ''

  return builder.image(validSource)
}
