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
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Categoría',
      type: 'string',
      options: {
        list: [
          { title: 'Auto', value: 'auto' },
          { title: 'Moto', value: 'moto' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Año',
      type: 'number',
    }),
    defineField({
      name: 'price',
      title: 'Precio',
      type: 'number',
    }),
    defineField({
      name: 'location',
      title: 'Ubicación',
      type: 'string',
    }),
    defineField({
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      of: [{ type: 'image' }],
    }),
    defineField({
      name: 'status',
      title: 'Estatus',
      type: 'string',
      options: {
        list: [
          { title: 'Disponible', value: 'available' },
          { title: 'Reservado', value: 'reserved' },
          { title: 'Vendido', value: 'sold' },
        ],
      },
      initialValue: 'available',
    }),
  ],
})
