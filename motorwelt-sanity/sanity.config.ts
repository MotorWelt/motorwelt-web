import { defineConfig } from "sanity";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "default",
  title: "MotorWelt",
  projectId: "juiaa7d6",
  dataset: "production",

  plugins: [visionTool()],

  schema: {
    types: schemaTypes,
  },
});