// sanity/schemas/menuCategory.ts
import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'menuCategory',
  title: 'Menu Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Category name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 50,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subtitle',
      title: 'Short description (optional)',
      type: 'string',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Controls the order of categories on the menu',
    }),
  ],
})
