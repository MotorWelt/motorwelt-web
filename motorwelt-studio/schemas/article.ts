import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'article',
  title: 'Artículos / Noticias',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Título',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'section',
      title: 'Sección',
      type: 'string',
      options: {
        list: [
          { title: 'Autos', value: 'noticias_autos' },
          { title: 'Motos', value: 'noticias_motos' },
        ],
      },
    }),
    defineField({
      name: 'status',
      title: 'Estado',
      type: 'string',
      options: {
        list: [
          { title: 'Borrador', value: 'borrador' },
          { title: 'Publicado', value: 'publicado' },
        ],
      },
    }),
    defineField({
      name: 'body',
      title: 'Contenido',
      type: 'text',
    }),
  ],
})