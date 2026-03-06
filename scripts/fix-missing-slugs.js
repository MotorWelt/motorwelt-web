// scripts/fix-missing-slugs.js
require("dotenv").config({ path: ".env.local" });

const { createClient } = require("@sanity/client");

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_WRITE_TOKEN;
const apiVersion = process.env.SANITY_API_VERSION || "2026-01-24";

if (!projectId) throw new Error("Missing env: SANITY_PROJECT_ID");
if (!dataset) throw new Error("Missing env: SANITY_DATASET");
if (!token) throw new Error("Missing env: SANITY_WRITE_TOKEN");

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function slugExists(slug, excludeIds = []) {
  const q = `*[_type=="article" && slug.current == $slug && !(_id in $excludeIds)][0]{_id}`;
  const found = await client.fetch(q, { slug, excludeIds });
  return !!found?._id;
}

async function makeUniqueSlug(base, excludeIds = []) {
  const cleanBase = slugify(base);
  const fallback = cleanBase || `nota-${Date.now()}`;

  let candidate = fallback;
  let n = 1;

  while (n <= 120) {
    const exists = await slugExists(candidate, excludeIds);
    if (!exists) return candidate;
    n += 1;
    candidate = `${fallback}-${n}`;
  }

  return `${fallback}-${Date.now()}`;
}

async function setSlugOnId(docId, slugCurrent) {
  await client
    .patch(docId)
    .set({ slug: { _type: "slug", current: slugCurrent } })
    .commit();
}

async function run() {
  // Trae publicados y drafts que NO tienen slug.current o está null/vacío
  const query = `
    *[
      _type == "article" &&
      (
        !defined(slug.current) ||
        slug.current == null ||
        slug.current == ""
      )
    ]{
      _id,
      title
    } | order(_createdAt asc)
  `;

  const docs = await client.fetch(query);
  console.log(`Found ${docs.length} docs (including drafts) with missing slug`);

  let fixed = 0;

  for (const d of docs) {
    const id = d._id;
    const baseId = id.startsWith("drafts.") ? id.replace("drafts.", "") : id;
    const draftId = `drafts.${baseId}`;

    // Excluimos ambos IDs (draft y published) al checar unicidad
    const excludeIds = [baseId, draftId];

    const title = d.title || "nota";
    const unique = await makeUniqueSlug(title, excludeIds);

    // Si estamos procesando draft, ponemos slug en draft y en published si existe.
    // Si estamos procesando published, ponemos slug en published y en draft si existe.
    const idsToPatch = new Set([baseId, draftId]);

    // Patch sólo los que existan (para no tronar si no hay draft/published)
    for (const patchId of idsToPatch) {
      const exists = await client.fetch(`*[_id == $id][0]{_id}`, { id: patchId });
      if (exists?._id) {
        await setSlugOnId(patchId, unique);
      }
    }

    fixed += 1;
    console.log(`✓ ${fixed}/${docs.length} -> ${baseId} | "${title}" -> ${unique}`);
  }

  console.log("DONE ✅");
}

run().catch((e) => {
  console.error("ERROR:", e?.message || e);
  process.exit(1);
});
