import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import trekSeo from './schemas/trekSeo'

export default defineConfig({
  name: 'default',
  title: 'Reboot India',

  projectId: 'q0df9xfw',
  dataset: 'reboot_india_data',

  plugins: [structureTool(), visionTool()],

  schema: {
    types: schemaTypes,
    types: [trekSeo],
  },
})
