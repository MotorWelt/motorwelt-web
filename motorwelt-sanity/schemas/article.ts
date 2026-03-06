// schemas/article.ts
import { defineType, defineField } from "sanity";

export default defineType({
  name: "article",
  title: "Artículos / Noticias",
  type: "document",

  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "subtitle",
      title: "Bajada / Subtítulo",
      type: "text",
      rows: 2,
    }),

    defineField({
      name: "excerpt",
      title: "Resumen",
      type: "text",
      rows: 3,
    }),

    defineField({
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
      validation: (Rule) => Rule.required(),
    }),

    defineField({
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
      validation: (Rule) => Rule.required(),
    }),

    defineField({
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
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "body",
      title: "Cuerpo (texto)",
      type: "text",
      rows: 16,
    }),

    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
    }),

    // ✅ VIDEO
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
    }),
    defineField({
      name: "useVideoAsHero",
      title: "Usar video como hero",
      type: "boolean",
      initialValue: false,
    }),

    // ✅ SEO
    defineField({
      name: "seoTitle",
      title: "Título SEO",
      type: "string",
    }),
    defineField({
      name: "seoDescription",
      title: "Meta descripción",
      type: "text",
      rows: 3,
    }),

    // ✅ Autor
    defineField({
      name: "authorName",
      title: "Autor (nombre)",
      type: "string",
    }),
    defineField({
      name: "authorEmail",
      title: "Autor (email)",
      type: "string",
    }),

    // ✅ Fechas
    defineField({
      name: "publishedAt",
      title: "Fecha de publicación",
      type: "datetime",
    }),
    defineField({
      name: "updatedAt",
      title: "Última actualización",
      type: "datetime",
    }),

    // ============================================================
    // ✅ IMÁGENES — MODO 1: URLs (para que tu publicador funcione YA)
    //    (string para permitir /images/... o URLs completas)
    // ============================================================
    defineField({
      name: "mainImageUrl",
      title: "Imagen principal (URL) — desde el publicador",
      type: "string",
    }),

    defineField({
      name: "galleryUrls",
      title: "Galería (URLs) — desde el publicador",
      type: "array",
      of: [{ type: "string" }],
    }),

    // ============================================================
    // ✅ IMÁGENES — MODO 2: Assets de Sanity
    // ============================================================
    defineField({
      name: "coverImage",
      title: "Imagen de portada (Asset Sanity)",
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alt (SEO) — obligatorio",
          type: "string",
          validation: (Rule) => Rule.required(),
        }),
        defineField({ name: "caption", title: "Caption", type: "string" }),
        defineField({ name: "credit", title: "Crédito", type: "string" }),
      ],
    }),

    defineField({
      name: "gallery",
      title: "Galería (Assets Sanity)",
      type: "array",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            defineField({
              name: "alt",
              title: "Alt (SEO)",
              type: "string",
              // 👈 aquí NO lo hacemos obligatorio para no bloquearte
            }),
            defineField({ name: "caption", title: "Caption", type: "string" }),
            defineField({ name: "credit", title: "Crédito", type: "string" }),
          ],
        },
      ],
    }),
  ],

  preview: {
    select: {
      title: "title",
      subtitle: "subtitle",
      media: "coverImage",
    },
  },
});
