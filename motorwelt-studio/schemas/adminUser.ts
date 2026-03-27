import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'adminUser',
  title: 'Admin User',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Nombre',
      type: 'string',
    }),
    defineField({
      name: 'email',
      title: 'Correo',
      type: 'string',
    }),
    defineField({
      name: 'password',
      title: 'Contraseña',
      type: 'string',
    }),
    defineField({
      name: 'role',
      title: 'Rol',
      type: 'string',
    }),
    defineField({
      name: 'active',
      title: 'Activo',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})