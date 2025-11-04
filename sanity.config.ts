// sanity.config.ts
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'virteseRestaurant',
  title: 'Virtese Restaurant CMS',

  projectId: 'a7viqlei',
  dataset: 'production',

  apiVersion: '2025-11-03',
  basePath: '/admin/studio',

  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
})
