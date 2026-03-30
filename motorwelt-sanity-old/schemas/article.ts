// schemas/article.ts
export default {
  name: "article",
  title: "Artículos / Noticias",
  type: "document",

  fields: [
    {
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: "subtitle",
      title: "Bajada / Subtítulo",
      type: "text",
      rows: 2,
    },

    {
      name: "excerpt",
      title: "Resumen",
      type: "text",
      rows: 3,
    },

    {
      name: "section",
      title: "Sección",
      type: "string",
      options: {
        list: [
          { title: "Noticias Autos", value: "noticias_autos" },
          { title: "Noticias Motos", value: "noticias_motos" },
          { title: "Deportes", value: "deportes" },
          { title: "Lifestyle", value: "lifestyle" },
          { title: "Comunidad", value: "comunidad" },
        ],
        layout: "radio",
      },
      initialValue: "noticias_autos",
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: "contentType",
      title: "Tipo de pieza",
      type: "string",
      options: {
        list: [
          { title: "Noticia", value: "noticia" },
          { title: "Crónica", value: "cronica" },
          { title: "Opinión", value: "opinion" },
          { title: "Review / Prueba", value: "review" },
          { title: "Entrevista", value: "entrevista" },
        ],
      },
      initialValue: "noticia",
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: "status",
      title: "Estado",
      type: "string",
      options: {
        list: [
          { title: "Borrador", value: "borrador" },
          { title: "En revisión", value: "revision" },
          { title: "Publicado", value: "publicado" },
        ],
        layout: "radio",
      },
      initialValue: "borrador",
      validation: (Rule: any) => Rule.required(),
    },

    {
      name: "body",
      title: "Cuerpo (texto)",
      type: "text",
      rows: 16,
    },

    {
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    },

    {
      name: "videoUrl",
      title: "Video URL",
      type: "url",
    },
    {
      name: "useVideoAsHero",
      title: "Usar video como hero",
      type: "boolean",
      initialValue: false,
    },

    {
      name: "seoTitle",
      title: "Título SEO",
      type: "string",
    },
    {
      name: "seoDescription",
      title: "Meta descripción",
      type: "text",
      rows: 3,
    },

    {
      name: "authorName",
      title: "Autor (nombre)",
      type: "string",
    },
    {
      name: "authorEmail",
      title: "Autor (email)",
      type: "string",
    },

    {
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
    },
    {
      name: "updatedAt",
      title: "Última actualización",
      type: "datetime",
    },

    {
      name: "mainImageUrl",
      title: "Imagen principal (URL) — desde el publicador",
      type: "string",
    },

    {
      name: "galleryUrls",
      title: "Galería (URLs) — desde el publicador",
      type: "array",
      of: [{ type: "string" }],
    },

    {
      name: "coverImage",
      title: "Imagen de portada (Asset Sanity)",
      type: "image",
      options: { hotspot: true },
      fields: [
        {
          name: "alt",
          title: "Alt (SEO) — obligatorio",
          type: "string",
          validation: (Rule: any) => Rule.required(),
        },
        { name: "caption", title: "Caption", type: "string" },
        { name: "credit", title: "Crédito", type: "string" },
      ],
    },

    {
      name: "gallery",
      title: "Galería (Assets Sanity)",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alt (SEO)",
              type: "string",
            },
            { name: "caption", title: "Caption", type: "string" },
            { name: "credit", title: "Crédito", type: "string" },
          ],
        },
      ],
    },
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      media: "coverImage",
    },
  },
};