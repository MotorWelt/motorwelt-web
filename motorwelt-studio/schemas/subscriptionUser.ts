import { defineField, defineType } from "sanity";

export default defineType({
  name: "subscriptionUser",
  title: "Usuarios suscritos",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastName",
      title: "Apellido",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Correo electrónico",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),
    defineField({
      name: "age",
      title: "Edad",
      type: "number",
      validation: (Rule) => Rule.required().min(13).max(100),
    }),
    defineField({
      name: "sex",
      title: "Sexo",
      type: "string",
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: "Hombre", value: "hombre" },
          { title: "Mujer", value: "mujer" },
          { title: "Otro", value: "otro" },
        ],
      },
    }),
    defineField({
      name: "country",
      title: "País",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "city",
      title: "Estado / provincia",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "interests",
      title: "Intereses",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Autos", value: "autos" },
          { title: "Motos", value: "motos" },
          { title: "Tuning", value: "tuning" },
          { title: "Deportes", value: "deportes" },
          { title: "Lifestyle", value: "lifestyle" },
          { title: "Comunidad", value: "comunidad" },
        ],
      },
    }),
    defineField({
      name: "source",
      title: "Fuente",
      type: "string",
      initialValue: "perfil",
    }),
    defineField({
      name: "createdAt",
      title: "Fecha de registro",
      type: "datetime",
    }),
    defineField({
      name: "updatedAt",
      title: "Última actualización",
      type: "datetime",
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "email",
    },
  },
});
