import {defineType, defineField} from 'sanity'

export default defineType({
  name: 'trek',
  title: 'Trek SEO Content',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Trek Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),

    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 200
      },
      validation: Rule => Rule.required()
    }),

    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string'
    }),

    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3
    }),

    defineField({
      name: 'content',
      title: 'Full SEO Content',
      type: 'blockContent'
    })
  ]
})