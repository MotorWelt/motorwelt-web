import { defineField, defineType } from "sanity";

export default defineType({
  name: "autosPageSettings",
  title: "Autos Page Settings",
  type: "document",
  fields: [
    defineField({
      name: "leaderboard",
      title: "Leaderboard",
      type: "object",
      fields: [
        defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          initialValue: "Publicidad — Leaderboard (728×90 / 970×250)",
        }),
        defineField({ name: "imageUrl", title: "Image URL", type: "url" }),
        defineField({ name: "href", title: "Link", type: "url" }),
      ],
    }),
    defineField({
      name: "billboard",
      title: "Billboard",
      type: "object",
      fields: [
        defineField({ name: "enabled", title: "Enabled", type: "boolean", initialValue: true }),
        defineField({
          name: "label",
          title: "Label",
          type: "string",
          initialValue: "Publicidad — Billboard (970×250 / 970×90)",
        }),
        defineField({ name: "imageUrl", title: "Image URL", type: "url" }),
        defineField({ name: "href", title: "Link", type: "url" }),
      ],
    }),
    defineField({
      name: "mediaItems",
      title: "Videos & Reels",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3 }),
            defineField({ name: "when", title: "Visible date", type: "string" }),
            defineField({ name: "img", title: "Thumbnail URL", type: "url" }),
            defineField({ name: "href", title: "Link", type: "string" }),
            defineField({
              name: "type",
              title: "Type",
              type: "string",
              options: {
                list: [
                  { title: "Video", value: "video" },
                  { title: "Reel", value: "reel" },
                ],
                layout: "radio",
              },
              initialValue: "video",
            }),
          ],
          preview: {
            select: {
              title: "title",
              subtitle: "type",
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Autos Page Settings",
      };
    },
  },
});