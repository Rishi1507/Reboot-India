import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'trek',
  title: 'Treks',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Trek Name',
      type: 'string',
      validation: rule => rule.required()
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: rule => rule.required()
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string'
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      type: 'string'
    }),
    defineField({
      name: 'difficulty',
      title: 'Difficulty',
      type: 'string'
    }),
    defineField({
      name: 'season',
      title: 'Best Season',
      type: 'string'
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'string'
    }),
    defineField({
      name: 'shortDescription',
      title: 'Short Description',
      type: 'text'
    }),
    defineField({
      name: 'description',
      title: 'Detailed Description',
      type: 'array',
      of: [{ type: 'block' }]
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: { hotspot: true }
    }),

    // SEO
    defineField({
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string'
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text'
    })
  ]
})
