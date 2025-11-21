// sanity/schemas/homepage.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepage',
  title: 'Homepage',
  type: 'document',
  groups: [
    { name: 'hero', title: 'Hero' },
    { name: 'quickInfo', title: 'Quick info strip' },
    { name: 'gallery', title: 'Mini gallery' },
    { name: 'about', title: '"This is Virtese"' },
    { name: 'vibes', title: 'Vibes section' },
    { name: 'visit', title: 'Visit / Contact' },
    { name: 'menuHero', title: 'Menu hero' },
  ],
  fields: [
    /* HERO ------------------------------------------------------ */
    defineField({
      name: 'heroTagline',
      title: 'Small label above title',
      type: 'string',
      initialValue: 'Virtese Restaurant · London',
      group: 'hero',
    }),
    defineField({
      name: 'heroTitle',
      title: 'Hero title',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'hero',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero subtitle',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'heroPrimaryCtaLabel',
      title: 'Primary button label',
      type: 'string',
      initialValue: 'Book a table',
      group: 'hero',
    }),
    defineField({
      name: 'heroPrimaryCtaHref',
      title: 'Primary button link',
      type: 'string',
      initialValue: 'https://book.virtese.com/virtese',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCtaLabel',
      title: 'Secondary button label',
      type: 'string',
      initialValue: 'View menu',
      group: 'hero',
    }),
    defineField({
      name: 'heroSecondaryCtaHref',
      title: 'Secondary button link',
      type: 'string',
      initialValue: '/menu',
      group: 'hero',
    }),
    defineField({
      name: 'heroBadges',
      title: 'Hero highlights',
      description: 'Small bullet points under the buttons',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
          ],
        },
      ],
      group: 'hero',
    }),

    // Hero images
    defineField({
      name: 'heroMainImage',
      title: 'Main hero image (big)',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
      group: 'hero',
    }),
    defineField({
      name: 'heroDishImage',
      title: 'Hero side image – dish',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
      group: 'hero',
    }),
    defineField({
      name: 'heroWineImage',
      title: 'Hero side image – wine / bar',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Alt text',
          type: 'string',
        }),
      ],
      group: 'hero',
    }),

    // “Tonight” card in hero
    defineField({
      name: 'tonightLabel',
      title: '"Tonight" card label',
      type: 'string',
      initialValue: 'Tonight at Virtese',
      group: 'hero',
    }),
    defineField({
      name: 'tonightTitle',
      title: '"Tonight" card title',
      type: 'string',
      group: 'hero',
    }),
    defineField({
      name: 'tonightBody',
      title: '"Tonight" card body',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    defineField({
      name: 'tonightKitchenNote',
      title: '"Tonight" kitchen / bar note',
      type: 'string',
      group: 'hero',
    }),

    /* QUICK INFO STRIP ------------------------------------------ */
    defineField({
      name: 'openingHoursLabel',
      title: 'Opening hours label',
      type: 'string',
      initialValue: 'Opening hours',
      group: 'quickInfo',
    }),
    defineField({
      name: 'openingHoursText',
      title: 'Opening hours text',
      type: 'string',
      group: 'quickInfo',
    }),
    defineField({
      name: 'openingHoursSubtitle',
      title: 'Opening hours subtitle',
      type: 'string',
      group: 'quickInfo',
    }),
    defineField({
      name: 'openingHoursCtaLabel',
      title: 'Opening hours primary button label',
      type: 'string',
      initialValue: 'Book a table',
      group: 'quickInfo',
    }),
    defineField({
      name: 'openingHoursCtaHref',
      title: 'Opening hours primary button link',
      type: 'string',
      initialValue: 'https://book.virtese.com/virtese',
      group: 'quickInfo',
    }),
    defineField({
      name: 'openingHoursCtaSecondaryLabel',
      title: 'Opening hours secondary button label',
      type: 'string',
      initialValue: 'View menu',
      group: 'quickInfo',
    }),
    defineField({
      name: 'openingHoursCtaSecondaryHref',
      title: 'Opening hours secondary button link',
      type: 'string',
      initialValue: '/menu',
      group: 'quickInfo',
    }),
    defineField({
      name: 'findUsLabel',
      title: 'Find us label',
      type: 'string',
      initialValue: 'Find us',
      group: 'quickInfo',
    }),
    defineField({
      name: 'findUsText',
      title: 'Find us text',
      type: 'string',
      group: 'quickInfo',
    }),
    defineField({
      name: 'bookingInfoLabel',
      title: 'Booking info label',
      type: 'string',
      initialValue: 'Book easily',
      group: 'quickInfo',
    }),
    defineField({
      name: 'bookingInfoText',
      title: 'Booking info text',
      type: 'string',
      group: 'quickInfo',
    }),

    /* MINI GALLERY ---------------------------------------------- */
    defineField({
      name: 'galleryTitleEyebrow',
      title: 'Gallery eyebrow',
      type: 'string',
      initialValue: 'A quick look inside',
      group: 'gallery',
    }),
    defineField({
      name: 'galleryTitle',
      title: 'Gallery title',
      type: 'string',
      group: 'gallery',
    }),
    defineField({
      name: 'gallerySubtitle',
      title: 'Gallery subtitle',
      type: 'text',
      rows: 2,
      group: 'gallery',
    }),
    defineField({
      name: 'galleryImages',
      title: 'Gallery images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
            defineField({
              name: 'caption',
              title: 'Caption (optional)',
              type: 'string',
            }),
          ],
        },
      ],
      validation: (Rule) => Rule.max(6),
      group: 'gallery',
    }),

    /* “THIS IS VIRTESE” ----------------------------------------- */
    defineField({
      name: 'aboutEyebrow',
      title: '"This is Virtese" eyebrow',
      type: 'string',
      initialValue: 'This is Virtese',
      group: 'about',
    }),
    defineField({
      name: 'aboutTitle',
      title: 'Main title',
      type: 'string',
      group: 'about',
    }),
    defineField({
      name: 'aboutBody',
      title: 'Body text',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'about',
    }),
    defineField({
      name: 'aboutPrimaryCtaLabel',
      title: 'About primary CTA label',
      type: 'string',
      initialValue: 'View menu',
      group: 'about',
    }),
    defineField({
      name: 'aboutPrimaryCtaHref',
      title: 'About primary CTA link',
      type: 'string',
      initialValue: '/menu',
      group: 'about',
    }),
    defineField({
      name: 'aboutSecondaryCtaLabel',
      title: 'About secondary CTA label',
      type: 'string',
      initialValue: 'Book now',
      group: 'about',
    }),
    defineField({
      name: 'aboutSecondaryCtaHref',
      title: 'About secondary CTA link',
      type: 'string',
      initialValue: 'https://book.virtese.com/virtese',
      group: 'about',
    }),

    defineField({
      name: 'kitchenCard',
      title: 'Kitchen card',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        }),
      ],
      group: 'about',
    }),

    defineField({
      name: 'wineCard',
      title: 'Wine & drinks card',
      type: 'object',
      fields: [
        defineField({ name: 'label', title: 'Label', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'text', title: 'Text', type: 'text', rows: 2 }),
        defineField({
          name: 'image',
          title: 'Image',
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              title: 'Alt text',
              type: 'string',
            }),
          ],
        }),
      ],
      group: 'about',
    }),

    /* VIBES SECTION --------------------------------------------- */
    defineField({
      name: 'vibesTitle',
      title: 'Vibes section title',
      type: 'string',
      group: 'vibes',
    }),
    defineField({
      name: 'vibesSubtitle',
      title: 'Vibes section subtitle',
      type: 'text',
      rows: 2,
      group: 'vibes',
    }),
    defineField({
      name: 'vibesCards',
      title: 'Vibes cards',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'text',
              title: 'Text',
              type: 'text',
              rows: 2,
            }),
          ],
        },
      ],
      group: 'vibes',
    }),

    /* VISIT / CONTACT / CTA ------------------------------------- */
    defineField({
      name: 'visitEyebrow',
      title: 'Visit eyebrow',
      type: 'string',
      initialValue: 'Visit',
      group: 'visit',
    }),
    defineField({
      name: 'visitTitle',
      title: 'Visit title',
      type: 'string',
      group: 'visit',
    }),
    defineField({
      name: 'visitBody',
      title: 'Visit body',
      type: 'text',
      rows: 3,
      group: 'visit',
    }),

    defineField({
      name: 'addressTitle',
      title: 'Address label',
      type: 'string',
      initialValue: 'Address',
      group: 'visit',
    }),
    defineField({
      name: 'addressLines',
      title: 'Address lines',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'visit',
    }),

    defineField({
      name: 'contactTitle',
      title: 'Contact label',
      type: 'string',
      initialValue: 'Contact',
      group: 'visit',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
      group: 'visit',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      group: 'visit',
    }),

    defineField({
      name: 'reservationsTitle',
      title: 'Reservations title',
      type: 'string',
      initialValue: 'Reservations',
      group: 'visit',
    }),
    defineField({
      name: 'reservationsBody',
      title: 'Reservations body',
      type: 'text',
      rows: 3,
      group: 'visit',
    }),
    defineField({
      name: 'reservationsPrimaryLabel',
      title: 'Primary booking button label',
      type: 'string',
      initialValue: 'Book a table',
      group: 'visit',
    }),
    defineField({
      name: 'reservationsPrimaryHref',
      title: 'Primary booking button link',
      type: 'string',
      initialValue: 'https://book.virtese.com/virtese',
      group: 'visit',
    }),
    defineField({
      name: 'reservationsSecondaryLabel',
      title: 'Secondary button label',
      type: 'string',
      initialValue: 'Email us',
      group: 'visit',
    }),
    defineField({
      name: 'reservationsSecondaryHref',
      title: 'Secondary button link',
      type: 'string',
      initialValue: '/contact',
      group: 'visit',
    }),

    /* MENU HERO -------------------------------------------------- */
    defineField({
      name: 'menuHeroTitle',
      title: 'Menu hero title',
      type: 'string',
      group: 'menuHero',
    }),
    defineField({
      name: 'menuHeroSubtitle',
      title: 'Menu hero subtitle',
      type: 'text',
      rows: 3,
      group: 'menuHero',
    }),
    defineField({
      name: 'menuHeroCtaLabel',
      title: 'Menu hero CTA label',
      type: 'string',
      initialValue: 'View the full menu',
      group: 'menuHero',
    }),
    defineField({
      name: 'menuHeroCtaHref',
      title: 'Menu hero CTA link',
      type: 'string',
      initialValue: '/menu',
      group: 'menuHero',
    }),
  ],
})
