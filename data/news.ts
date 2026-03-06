// data/news.ts
export type NewsItem = {
  id: string;
  category: "autos" | "motos";
  title: string;
  excerpt: string;
  cover: string;        // imagen principal
  thumb?: string;       // opcional, miniatura distinta
  slug: string;
  publishedAt: string;
  tags?: string[];
};

export const NEWS_AUTOS: NewsItem[] = [
  {
    id: "a1",
    category: "autos",
    title: "Prueba sedán turbo: equilibrio en pista",
    excerpt: "Telemetría y tiempos en stint de 10 vueltas.",
    cover: "/images/noticia-1.jpg",
    thumb: "/images/comunidad.jpg",
    slug: "prueba-sedan-turbo-equilibrio-en-pista",
    publishedAt: "2025-09-03T10:00:00Z",
    tags: ["prueba", "pista", "setup"],
  },
  {
    id: "a2",
    category: "autos",
    title: "Aero activa 2.0: qué aporta realmente",
    excerpt: "Medimos drag vs. carga en recta larga.",
    cover: "/images/noticia-2.jpg",
    slug: "aero-activa-20-que-aporta-realmente",
    publishedAt: "2025-09-12T09:00:00Z",
    tags: ["aerodinámica"],
  },
  {
    id: "a3",
    category: "autos",
    title: "Cerámicos vs. acero: frenadas sin fading",
    excerpt: "Comparativa en trackday caluroso.",
    cover: "/images/noticia-3.jpg",
    thumb: "/images/noticia-1.jpg",
    slug: "ceramicos-vs-acero-frenadas-sin-fading",
    publishedAt: "2025-09-20T15:00:00Z",
    tags: ["frenos", "trackday"],
  },
  {
    id: "a4",
    category: "autos",
    title: "Compuestos 2025: cambios y setup recomendado",
    excerpt: "Presiones, camber y temperaturas objetivo.",
    cover: "/images/comunidad.jpg",
    thumb: "/images/noticia-2.jpg",
    slug: "compuestos-2025-cambios-y-setup-recomendado",
    publishedAt: "2025-10-01T13:30:00Z",
    tags: ["llantas", "setup"],
  },
];

export const NEWS_MOTOS: NewsItem[] = [
  {
    id: "m1",
    category: "motos",
    title: "Naked 900: agilidad y par en ciudad y curva",
    excerpt: "Electrónica al límite en cambios de apoyo.",
    cover: "/images/noticia-3.jpg",
    slug: "naked-900-agilidad-y-par",
    publishedAt: "2025-08-28T12:00:00Z",
    tags: ["naked", "agilidad"],
  },
  {
    id: "m2",
    category: "motos",
    title: "Trail media: electrónica en terracería",
    excerpt: "ABS off-road y control de tracción, ¿cuánto ayudan?",
    cover: "/images/noticia-1.jpg",
    thumb: "/images/noticia-3.jpg",
    slug: "trail-media-electronica-en-terraceria",
    publishedAt: "2025-09-10T08:00:00Z",
    tags: ["trail", "off-road"],
  },
  {
    id: "m3",
    category: "motos",
    title: "Sport touring: ergonomía y consumo real",
    excerpt: "1000 km de prueba con maletas completas.",
    cover: "/images/noticia-2.jpg",
    slug: "sport-touring-ergonomia-y-consumo-real",
    publishedAt: "2025-09-25T11:15:00Z",
    tags: ["touring"],
  },
  {
    id: "m4",
    category: "motos",
    title: "Neumáticos mixtos: ¿cuál conviene para viaje?",
    excerpt: "Durabilidad vs. agarre en lluvia.",
    cover: "/images/comunidad.jpg",
    thumb: "/images/noticia-1.jpg",
    slug: "neumaticos-mixtos-cual-conviene-para-viaje",
    publishedAt: "2025-10-03T17:45:00Z",
    tags: ["llantas", "viaje"],
  },
];

export function getByCategory(cat: "autos" | "motos") {
  return cat === "autos" ? NEWS_AUTOS : NEWS_MOTOS;
}

export function findBySlug(cat: "autos" | "motos", slug: string) {
  return getByCategory(cat).find((n) => n.slug === slug) || null;
}

export function findRelated(cat: "autos" | "motos", currentSlug: string, n = 3) {
  const pool = getByCategory(cat).filter((x) => x.slug !== currentSlug);
  return pool.slice(0, n).map((p) => ({
    title: p.title,
    href: `/noticias/${cat}/${p.slug}`,
    img: p.thumb ?? p.cover,
  }));
}
