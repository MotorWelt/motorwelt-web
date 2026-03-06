require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@sanity/client");

const sanityWriteClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

module.exports = { sanityWriteClient };
