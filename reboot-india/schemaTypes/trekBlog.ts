import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'trekBlog',
  title: 'Trek Blogs',
  type: 'document',
  fields: [
    defineField({
      name: 'trekSlug',
      title: 'Trek Slug (from website URL)',
      type: 'string',
      description: 'Example: for https://rebootindia.co.in/treks/kedarkantha use "kedarkantha".',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'string',
      initialValue: 'Admin',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      initialValue: 'DRAFT',
      options: {
        list: [
          {title: 'Draft', value: 'DRAFT'},
          {title: 'Published', value: 'PUBLISHED'},
          {title: 'Unpublished', value: 'UNPUBLISHED'},
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'publishAt',
      title: 'Publish At',
      type: 'datetime',
    }),
    defineField({
      name: 'shortIntro',
      title: 'Short Introduction',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'blockContent',
    }),
    defineField({
      name: 'featuredImage',
      title: 'Featured Image',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'imageAltText',
      title: 'Image Alt Text',
      type: 'string',
    }),
    defineField({
      name: 'highlights',
      title: 'Key Highlights',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'itinerary',
      title: 'Itinerary',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {name: 'dayNumber', title: 'Day Number', type: 'number'},
            {name: 'title', title: 'Title', type: 'string'},
            {name: 'description', title: 'Description', type: 'text'},
            {name: 'distanceKm', title: 'Distance (Km)', type: 'number'},
            {name: 'altitude', title: 'Altitude', type: 'string'},
            {name: 'stayType', title: 'Stay Type', type: 'string'},
          ],
        },
      ],
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video URL',
      type: 'url',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'showOnHomepage',
      title: 'Show on Homepage',
      type: 'boolean',
      initialValue: false,
    }),

    // SEO
    defineField({
      name: 'metaTitle',
      title: 'Meta Title',
      type: 'string',
    }),
    defineField({
      name: 'metaDescription',
      title: 'Meta Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'keywords',
      title: 'Keywords',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'openGraphImage',
      title: 'Open Graph Image',
      type: 'image',
      options: {hotspot: true},
    }),
  ],
  preview: {
    select: {
      title: 'title',
      trekSlug: 'trekSlug',
      media: 'featuredImage',
    },
    prepare({title, trekSlug, media}) {
      return {
        title,
        subtitle: trekSlug ? `Trek: ${trekSlug}` : undefined,
        media,
      }
    },
  },
})

