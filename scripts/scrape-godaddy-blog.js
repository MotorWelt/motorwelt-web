const fs = require("fs");
const path = require("path");

const POSTS = [
  "https://motorwelt.com.mx/deportes-1/f/fip-platinum-cdmx-por-cupra",
  "https://motorwelt.com.mx/deportes-1/f/royal-enfield-shotgun-650",
  "https://motorwelt.com.mx/deportes-1/f/cupra-essentials",
  "https://motorwelt.com.mx/deportes-1/f/cupra-leon-vz-tcr-en-imsa-michelin-pilot-challenge-2025",
  "https://motorwelt.com.mx/deportes-1/f/%E2%80%9Chuellas%E2%80%9D-inspirada-en-hechos-reales-por-volkswagen",
  "https://motorwelt.com.mx/deportes-1/f/master-class-con-exxon-mobil-m%C3%A9xico-y-pablo-tarroba",
  "https://motorwelt.com.mx/deportes-1/f/husqvarna-vitpilen-801",
  "https://motorwelt.com.mx/deportes-1/f/tesla-cybertruck-ya-est%C3%A1-en-m%C3%A9xico",
  "https://motorwelt.com.mx/deportes-1/f/pato-o%C2%B4ward-se-sube-al-f1-de-mclaren-este-a%C3%B1o-en-el-gp-de-m%C3%A9xico",
  "https://motorwelt.com.mx/deportes-1/f/mercedes-benz-esprinter-un-trabajo-cero-emisiones",
  "https://motorwelt.com.mx/deportes-1/f/acura-mdx-2025-ya-est%C3%A1-en-m%C3%A9xico",
  "https://motorwelt.com.mx/deportes-1/f/cupra-terramar-el-nuevo-suv-deportivo-que-esperabas",
  "https://motorwelt.com.mx/deportes-1/f/leclerc-conquista-monza-ferrari-triunfa-en-casa",
  "https://motorwelt.com.mx/deportes-1/f/volvo-xc40-recharge-el-el%C3%A9ctrico-ideal",
  "https://motorwelt.com.mx/deportes-1/f/byd-song-pro-el-nuevo-suv-h%C3%ADbrido-enchufable",
  "https://motorwelt.com.mx/deportes-1/f/el-nuevo-jetta-2025-ya-est%C3%A1-en-m%C3%A9xico",
  "https://motorwelt.com.mx/deportes-1/f/bmw-ce-02-la-forma-m%C3%A1s-sencilla-de-moverte-en-la-ciudad"
];

function stripTags(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeSlugFromUrl(url) {
  const raw = url.split("/f/")[1] || "";
  try {
    return decodeURIComponent(raw).trim().toLowerCase();
  } catch {
    return raw.trim().toLowerCase();
  }
}

function normalizeSlug(slug) {
  return slug
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”‘’´`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractMeta(html, property, attr = "property") {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${property}["'][^>]+content=["']([^"']+)["'][^>]*>`,
    "i"
  );
  const m = html.match(re);
  return m ? m[1].trim() : "";
}

function extractTitle(html) {
  return (
    extractMeta(html, "og:title", "property") ||
    extractMeta(html, "twitter:title", "name") ||
    (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "").trim()
  );
}

function extractDescription(html) {
  return (
    extractMeta(html, "description", "name") ||
    extractMeta(html, "og:description", "property") ||
    extractMeta(html, "twitter:description", "name") ||
    ""
  );
}

function extractImage(html) {
  return (
    extractMeta(html, "og:image", "property") ||
    extractMeta(html, "twitter:image", "name") ||
    ""
  );
}

function extractBodyText(html, title, description) {
  const text = stripTags(html);

  let cleaned = text;

  if (title) cleaned = cleaned.replace(title, " ");
  if (description) cleaned = cleaned.replace(description, " ");

  cleaned = cleaned
    .replace(/This XML file does not appear to have any style information associated with it\./gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleaned;
}

function guessCategory(url, title = "", text = "") {
  const sample = `${url} ${title} ${text}`.toLowerCase();

  if (
    sample.includes("royal enfield") ||
    sample.includes("husqvarna") ||
    sample.includes("bmw ce-02") ||
    sample.includes("vitpilen") ||
    sample.includes("moto")
  ) {
    return "motos";
  }

  if (
    sample.includes("f1") ||
    sample.includes("imsa") ||
    sample.includes("monza") ||
    sample.includes("mclaren") ||
    sample.includes("leclerc") ||
    sample.includes("pato o")
  ) {
    return "deportes";
  }

  return "autos";
}

async function scrapeOne(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 MotorWelt Migration Bot"
    }
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} on ${url}`);
  }

  const html = await res.text();
  const rawSlug = decodeSlugFromUrl(url);
  const slug = normalizeSlug(rawSlug);

  let title = extractTitle(html);
  const description = extractDescription(html);
  const image = extractImage(html);
  const bodyText = extractBodyText(html, title, description);

  if (!title) {
    title = rawSlug.replace(/-/g, " ");
  }

  title = title
    .replace(/\s*-\s*motorwelt\.com\.mx\s*$/i, "")
    .trim();

  return {
    sourceUrl: url,
    oldPath: new URL(url).pathname,
    rawSlug,
    slug,
    title,
    description,
    image,
    category: guessCategory(url, title, bodyText),
    bodyText,
    scrapedAt: new Date().toISOString()
  };
}

async function main() {
  const results = [];
  const errors = [];

  for (const url of POSTS) {
    try {
      console.log(`Scraping: ${url}`);
      const article = await scrapeOne(url);
      results.push(article);
    } catch (error) {
      console.error(`Error on ${url}:`, error.message);
      errors.push({
        url,
        error: error.message
      });
    }
  }

  const outDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "motorwelt_articulos_raw.json"),
    JSON.stringify(results, null, 2),
    "utf8"
  );

  fs.writeFileSync(
    path.join(outDir, "motorwelt_articulos_errors.json"),
    JSON.stringify(errors, null, 2),
    "utf8"
  );

  console.log(`\nDone.`);
  console.log(`Articles saved: ${results.length}`);
  console.log(`Errors saved: ${errors.length}`);
  console.log(`Output: scripts/output/motorwelt_articulos_raw.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});