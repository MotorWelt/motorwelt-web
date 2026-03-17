const fs = require("fs");
const path = require("path");

const inputPath = path.join(
  process.cwd(),
  "scripts",
  "output",
  "motorwelt_articles_selected.json"
);

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "output",
  "motorwelt_sanity_import.ndjson"
);

/**
 * AJUSTA SOLO ESTO SI TU SCHEMA USA OTROS NOMBRES
 */
const SCHEMA_TYPE = "post"; // por ejemplo: "post", "article", "news"
const CATEGORY_FIELD_MODE = "string"; // "string" o "reference"

/**
 * Si usas categorías como string:
 *   category: "motos"
 *
 * Si usas referencias:
 *   category: {_type:"reference", _ref:"..."}
 * y aquí tendrías que poner los _id reales de tus categorías.
 */
const CATEGORY_REF_MAP = {
  autos: "category-autos",
  motos: "category-motos",
  deportes: "category-deportes",
  lifestyle: "category-lifestyle",
};

function toIsoDateSpanish(visibleDate) {
  if (!visibleDate) return null;

  const months = {
    enero: "01",
    febrero: "02",
    marzo: "03",
    abril: "04",
    mayo: "05",
    junio: "06",
    julio: "07",
    agosto: "08",
    septiembre: "09",
    setiembre: "09",
    octubre: "10",
    noviembre: "11",
    diciembre: "12",
  };

  const m = visibleDate
    .toLowerCase()
    .trim()
    .match(/^(\d{1,2})\s+de\s+([a-záéíóú]+)\s+de\s+(\d{4})$/i);

  if (!m) return null;

  const day = String(m[1]).padStart(2, "0");
  const monthName = m[2]
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const year = m[3];
  const month = months[monthName];

  if (!month) return null;

  return `${year}-${month}-${day}T12:00:00.000Z`;
}

function paragraphBlocks(text) {
  const paragraphs = (text || "")
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return paragraphs.map((p, i) => ({
    _key: `p${i + 1}`,
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [
      {
        _key: `c${i + 1}`,
        _type: "span",
        marks: [],
        text: p,
      },
    ],
  }));
}

function buildCategoryValue(category) {
  if (CATEGORY_FIELD_MODE === "reference") {
    const ref = CATEGORY_REF_MAP[category];
    if (!ref) return null;
    return {
      _type: "reference",
      _ref: ref,
    };
  }

  return category || "autos";
}

function main() {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const docs = raw.map((item) => {
    const publishedAt = toIsoDateSpanish(item.visibleDate);

    const doc = {
      _id: `legacy-${item.slug}`,
      _type: SCHEMA_TYPE,
      title: item.title,
      slug: {
        _type: "slug",
        current: item.slug,
      },
      excerpt: item.excerpt || "",
      body: paragraphBlocks(item.body || ""),
      publishedAt,
      category: buildCategoryValue(item.category),
      legacyUrl: item.sourceUrl,
      legacyPath: item.oldPath,
      newPath: item.newPath,
      legacyImageUrl: item.image || "",
      migrationSource: "godaddy",
      migrationStatus: "imported",
    };

    return JSON.stringify(doc);
  });

  fs.writeFileSync(outputPath, docs.join("\n"), "utf8");

  console.log("DONE");
  console.log(`Documents prepared: ${docs.length}`);
  console.log(`Saved to ${outputPath}`);
  console.log(`Schema type used: ${SCHEMA_TYPE}`);
  console.log(`Category mode used: ${CATEGORY_FIELD_MODE}`);
}

main();