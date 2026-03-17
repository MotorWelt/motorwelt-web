const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const urls = [
  "https://motorwelt.com.mx/deportes-1/f/royal-enfield-shotgun-650",
  "https://motorwelt.com.mx/deportes-1/f/fip-platinum-cdmx-por-cupra",
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
  "https://motorwelt.com.mx/deportes-1/f/bmw-ce-02-la-forma-m%C3%A1s-sencilla-de-moverte-en-la-ciudad",
];

function normalizeWhitespace(text) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function cleanupBody(text) {
  let cleaned = text || "";

  // corta todo lo que venga después de estas secciones
  const cutMarkers = [
    "Compartir esta publicación:",
    "Suscríbete para recibir las últimas noticias",
    "Copyright ©",
    "Usamos cookies para analizar el tráfico",
  ];

  for (const marker of cutMarkers) {
    const idx = cleaned.indexOf(marker);
    if (idx !== -1) {
      cleaned = cleaned.slice(0, idx).trim();
    }
  }

  // elimina líneas basura al inicio o en medio
  cleaned = cleaned
    .replace(/^@[\w.]+/gm, "")
    .replace(/^Todas las Publicaciones$/gm, "")
    .replace(/^Inicio$/gm, "")
    .replace(/^AUTOS$/gm, "")
    .replace(/^MOTOS$/gm, "")
    .replace(/^DEPORTES$/gm, "")
    .replace(/^MAS QUE AUTOS$/gm, "")
    .replace(/^TECNOLOGIA$/gm, "")
    .replace(/^Productions$/gm, "")
    .replace(/^\s*\d{1,2}\s+de\s+\w+\s+de\s+\d{4}\s+\|\s+\w+\s*$/gim, "")
    .trim();

  return normalizeWhitespace(cleaned);
}

function slugFromUrl(url) {
  const raw = url.split("/f/")[1] || "";
  return decodeURIComponent(raw)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[“”‘’´`]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function guessCategory(url, title = "", body = "") {
  const sample = `${url} ${title} ${body}`.toLowerCase();

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

async function scrape() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (const url of urls) {
    console.log("Scraping:", url);

    await page.goto(url, { waitUntil: "networkidle2" });
    await new Promise(r => setTimeout(r, 2500));

    const data = await page.evaluate(() => {
      const text = (el) => (el?.innerText || "").trim();

      const headings = Array.from(document.querySelectorAll("h1, h2, h3"))
        .map((el) => text(el))
        .filter(Boolean);

      // elegir el heading más probable como título real
      const titleCandidates = headings.filter((t) => {
        const bad = ["DEPORTES", "AUTOS", "MOTOS", "Productions", "Inicio"];
        return !bad.includes(t) && t.length > 8;
      });

      const title =
        titleCandidates.sort((a, b) => b.length - a.length)[0] || "";

      // agarrar el texto completo visible
      const body = document.body.innerText || "";

      // buscar imagen grande más útil
      const imageCandidates = Array.from(document.querySelectorAll("img"))
        .map((img) => img.src)
        .filter((src) => src && src.startsWith("http"));

      const image =
        imageCandidates.find((src) => src.includes("wsimg.com/isteam")) ||
        imageCandidates[0] ||
        "";

      return { title, body, image };
    });

    const cleanedBody = cleanupBody(data.body)
      .replace(data.title, "")
      .trim();

    results.push({
      sourceUrl: url,
      oldPath: new URL(url).pathname,
      slug: slugFromUrl(url),
      title: data.title,
      image: data.image,
      category: guessCategory(url, data.title, cleanedBody),
      body: cleanedBody,
      scrapedAt: new Date().toISOString(),
    });
  }

  await browser.close();

  const outDir = path.join(process.cwd(), "scripts", "output");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, "motorwelt_rendered_clean.json"),
    JSON.stringify(results, null, 2),
    "utf8"
  );

  console.log("DONE");
  console.log("Saved to scripts/output/motorwelt_rendered_clean.json");
}

scrape().catch((err) => {
  console.error(err);
  process.exit(1);
});