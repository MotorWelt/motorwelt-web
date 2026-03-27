import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'marketListing',
  title: 'Market Listing',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
    }),
    defineField({
      name: 'price',
      title: 'Precio',
      type: 'number',
    }),
  ],
})