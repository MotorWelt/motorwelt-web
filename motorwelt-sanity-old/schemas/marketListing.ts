export default {
  name: 'marketListing',
  title: 'Market Listing',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'year',
      title: 'Año',
      type: 'number',
    },
    {
      name: 'price',
      title: 'Precio',
      type: 'number',
    },
    {
      name: 'location',
      title: 'Ubicación',
      type: 'string',
    },
    {
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      of: [{ type: 'image' }],
    },
    {
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
    },
  ],
}