import { defineField, defineType } from "sanity";

export default defineType({
  name: "homeSettings",
  title: "Home Settings",
  type: "document",
  fields: [
    defineField({
      name: "heroImageUrl",
      title: "Hero image URL",
      type: "string",
    }),

    defineField({
      name: "ads",
      title: "Ads",
      type: "object",
      fields: [
        defineField({
          name: "leaderboard",
          title: "Leaderboard",
          type: "object",
          fields: [
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
            }),
            defineField({
              name: "imageUrl",
              title: "Image URL",
              type: "string",
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
            }),
          ],
        }),

        defineField({
          name: "mpu",
          title: "MPU",
          type: "object",
          fields: [
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
            }),
            defineField({
              name: "imageUrl",
              title: "Image URL",
              type: "string",
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
            }),
          ],
        }),

        defineField({
          name: "billboard",
          title: "Billboard",
          type: "object",
          fields: [
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "label",
              title: "Label",
              type: "string",
            }),
            defineField({
              name: "imageUrl",
              title: "Image URL",
              type: "string",
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
            }),
          ],
        }),
      ],
    }),

    defineField({
      name: "partnerLogos",
      title: "Partner logos",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Name",
              type: "string",
            }),
            defineField({
              name: "logoUrl",
              title: "Logo URL",
              type: "string",
            }),
            defineField({
              name: "href",
              title: "Link",
              type: "string",
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Home Settings",
        subtitle: "Portada, anuncios y partners",
      };
    },
  },
});