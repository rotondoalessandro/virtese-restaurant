// sanity/schemas/contactSettings.ts
import { defineField, defineType } from 'sanity'
import { DocumentIcon } from '@sanity/icons'

export default defineType({
  name: 'contactSettings',
  title: 'Contact & Location',
  type: 'document',
  icon: DocumentIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Page title',
      type: 'string',
      description: 'E.g. “Contact & reservations”',
    }),
    defineField({
      name: 'intro',
      title: 'Intro text',
      type: 'text',
      rows: 3,
      description: 'Short paragraph at the top of the contact page',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cityLine',
      title: 'City / Postcode line',
      type: 'string',
      description: 'E.g. London, WC2N XXX',
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening hours',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'One line per row, e.g. “Tue–Sun · 18:00–23:30”',
    }),
    defineField({
      name: 'reservationNote',
      title: 'Reservation note',
      type: 'text',
      rows: 3,
      description: 'Info about bookings, groups etc.',
    }),
    defineField({
      name: 'mapUrl',
      title: 'Google Maps URL',
      type: 'url',
    }),
  ],
})
