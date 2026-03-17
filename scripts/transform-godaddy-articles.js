const fs = require("fs");
const path = require("path");

const inputPath = path.join(
  process.cwd(),
  "scripts",
  "output",
  "motorwelt_rendered_clean.json"
);

const outputPath = path.join(
  process.cwd(),
  "scripts",
  "output",
  "motorwelt_articles_review.json"
);

function normalizeWhitespace(text) {
  return (text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function extractTitleAndMeta(body, fallbackTitle, fallbackCategory) {
  const cleaned = normalizeWhitespace(body);
  const lines = cleaned.split("\n").map((l) => l.trim()).filter(Boolean);

  const title = lines[0] || fallbackTitle || "";

  let visibleDate = "";
  let visibleCategory = fallbackCategory || "";

  if (lines[1]) {
    const metaLine = lines[1];
    const parts = metaLine.split("|").map((p) => p.trim()).filter(Boolean);

    if (parts[0]) visibleDate = parts[0];
    if (parts[1]) visibleCategory = parts[1].toLowerCase();
  }

  const remainingLines = lines.slice(2);
  const cleanedBody = normalizeWhitespace(remainingLines.join("\n\n"));

  return {
    title,
    visibleDate,
    visibleCategory,
    cleanedBody,
  };
}

function makeExcerpt(text, max = 220) {
  const clean = normalizeWhitespace(text).replace(/\n/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim() + "...";
}

function mapCategory(cat) {
  const value = (cat || "").toLowerCase().trim();

  if (value.includes("moto")) return "motos";
  if (value.includes("deporte")) return "deportes";
  return "autos";
}

function makeNewPath(category, slug) {
  if (category === "motos") return `/noticias/motos/${slug}`;
  if (category === "deportes") return `/deportes/${slug}`;
  return `/noticias/autos/${slug}`;
}

function main() {
  const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));

  const transformed = raw.map((item) => {
    const { title, visibleDate, visibleCategory, cleanedBody } =
      extractTitleAndMeta(item.body, item.title, item.category);

    const category = mapCategory(visibleCategory || item.category);
    const excerpt = makeExcerpt(cleanedBody);
    const newPath = makeNewPath(category, item.slug);

    return {
      sourceUrl: item.sourceUrl,
      oldPath: item.oldPath,
      newPath,
      slug: item.slug,
      title,
      image: item.image,
      category,
      visibleDate,
      excerpt,
      body: cleanedBody,
      status: "pendiente_revision",
      action: "revisar",
      scrapedAt: item.scrapedAt,
    };
  });

  fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), "utf8");

  console.log("DONE");
  console.log(`Saved to ${outputPath}`);
  console.log(`Articles transformed: ${transformed.length}`);
}

main();