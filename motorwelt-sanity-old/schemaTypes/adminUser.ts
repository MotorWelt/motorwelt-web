// schemas/adminUser.ts

export default {
  name: "adminUser",
  title: "Admin User",
  type: "document",

  fields: [
    {
      name: "name",
      title: "Nombre",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "email",
      title: "Correo",
      type: "string",
      validation: (Rule: any) => Rule.required().email(),
    },
    {
      name: "password",
      title: "Contraseña",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "active",
      title: "Activo",
      type: "boolean",
      initialValue: true,
    },
  ],

  preview: {
    select: {
      title: "name",
      subtitle: "email",
    },
  },
};