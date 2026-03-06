// data/productions.ts
export type Production = {
  slug: string;
  title: string;
  summary: string;
  cover: string;        // imagen de portada
  duration: string;     // ej: "08:32"
  category: "serie" | "corto" | "bts";
  teaserUrl?: string;   // url de video (si aplica)
  publishDate: string;  // ISO
  presskit?: string;    // ruta a zip/pdf del press kit (opcional)
  tags?: string[];
};

export const productions: Production[] = [
  {
    slug: "apex-chronicles-ep1",
    title: "Apex Chronicles — Ep. 1",
    summary:
      "Arrancamos la serie con una mirada cruda al setup de chasis y a la lectura del asfalto en circuito.",
    cover: "/images/noticia-1.jpg",
    duration: "08:32",
    category: "serie",
    teaserUrl: "/videos/teaser.mp4",
    publishDate: "2025-07-01",
    presskit: "/press/apex-chronicles-ep1.zip",
    tags: ["setup", "circuito", "telemetría"],
  },
  {
    slug: "drift-in-the-raw",
    title: "Drift in the Raw",
    summary:
      "Un corto que celebra el control en el límite: ángulo, humo y transición perfecta.",
    cover: "/images/noticia-2.jpg",
    duration: "05:14",
    category: "corto",
    teaserUrl: "/videos/teaser.mp4",
    publishDate: "2025-08-12",
    tags: ["drift", "styling"],
  },
  {
    slug: "bts-carbon-lab",
    title: "BTS: Carbon Lab",
    summary:
      "Detrás de cámaras del proceso de fibra de carbono: del molde a la pista.",
    cover: "/images/noticia-3.jpg",
    duration: "04:06",
    category: "bts",
    publishDate: "2025-09-04",
    presskit: "/press/carbon-lab.pdf",
    tags: ["materiales", "ligereza"],
  },
  {
    slug: "track-rituals",
    title: "Track Rituals",
    summary:
      "Pequeños hábitos que marcan décimas: presión de llantas, warm-up y enfoque.",
    cover: "/images/noticia-1.jpg",
    duration: "06:10",
    category: "corto",
    teaserUrl: "/videos/teaser.mp4",
    publishDate: "2025-09-20",
    tags: ["rutinas", "pista"],
  },
  {
    slug: "studio-bts-lighting",
    title: "BTS: Studio Lighting",
    summary:
      "Cómo iluminamos carrocerías complejas para capturar líneas y volúmenes.",
    cover: "/images/noticia-2.jpg",
    duration: "03:40",
    category: "bts",
    publishDate: "2025-09-28",
    tags: ["iluminación", "rodaje"],
  },
  {
    slug: "apex-chronicles-ep2",
    title: "Apex Chronicles — Ep. 2",
    summary:
      "Telemetría aplicada: interpretar y convertir datos en tiempo real.",
    cover: "/images/noticia-3.jpg",
    duration: "09:05",
    category: "serie",
    teaserUrl: "/videos/teaser.mp4",
    publishDate: "2025-10-01",
    presskit: "/press/apex-chronicles-ep2.zip",
    tags: ["telemetría", "data"],
  },
  // añade más items cuando quieras…
];
