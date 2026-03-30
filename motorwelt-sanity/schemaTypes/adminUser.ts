import { defineType, defineField } from "sanity";

export default defineType({
  name: "adminUser",
  title: "Admin User",
  type: "document",

  fields: [
    defineField({
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "email",
      title: "Correo",
      type: "string",
      validation: (Rule) => Rule.required().email(),
    }),

    defineField({
      name: "password",
      title: "Contraseña",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "role",
      title: "Rol",
      type: "string",
      options: {
        list: [
          { title: "Admin", value: "admin" },
          { title: "Editor", value: "editor" },
          { title: "Autor", value: "autor" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: "active",
      title: "Activo",
      type: "boolean",
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "email",
    },
  },
});