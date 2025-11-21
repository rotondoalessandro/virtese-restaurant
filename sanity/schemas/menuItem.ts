import { defineField, defineType } from 'sanity'
import { TagIcon } from '@sanity/icons'

export default defineType({
  name: 'menuItem',
  title: 'Menu Item',
  type: 'document',
  icon: TagIcon, // ✅ stabile e sempre disponibile
  fields: [
    defineField({
      name: 'name',
      title: 'Dish name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Short description of the dish (optional)',
    }),

    defineField({
      name: 'price',
      title: 'Price',
      type: 'string', // e.g. "£14" o "12.5"
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'highlight',
      title: 'Chef’s favourite',
      type: 'boolean',
      description: 'Mark as recommended / highlighted on the menu',
    }),

    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'e.g. vegetarian, vegan, gluten-free',
    }),

    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'menuCategory' }],
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'order',
      title: 'Order inside category',
      type: 'number',
      description: 'Use this to control the order of dishes within the same category',
    }),

    defineField({
      name: 'image',
      title: 'Dish image',
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
})
