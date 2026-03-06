// components/ArticleLayout.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "./Seo";

type Section = "noticias" | "deportes" | "lifestyle";
type Accent = { name: string; hex: string };
const ACCENTS: Record<Section, Accent> = {
  noticias: { name: "warm", hex: "#FF7A1A" },
  deportes: { name: "cool", hex: "#0CE0B2" },
  lifestyle: { name: "warm", hex: "#FF7A1A" },
};

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ");
}

function estReadMins(html: string) {
  const words = stripHtml(html).trim().split(/\s+/).filter(Boolean).length || 0;
  return Math.max(1, Math.round(words / 200));
}

function fmtDate(date: string) {
  try {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 64);
}

type TocItem = { id: string; text: string; level: 2 | 3 | 4 | 5 };

function extractId(attrs: string) {
  const m = attrs.match(/id\s*=\s*["']([^"']+)["']/i);
  return m?.[1] || null;
}

function injectIdsAndExtractTOC(html: string): { htmlWithIds: string; toc: TocItem[] } {
  const toc: TocItem[] = [];
  let idx = 0;

  const htmlWithIds = html.replace(
    /<h(2|3|4|5)([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (_m, levelNum, attrs, inner) => {
      const level = Number(levelNum) as 2 | 3 | 4 | 5;
      const text = stripHtml(String(inner)).trim();
      const fallback = `sec-${idx++}`;
      const base = slugify(text) || fallback;

      const existingId = extractId(String(attrs));
      const finalId = existingId || base;

      const hasId = Boolean(existingId);
      const idAttr = hasId ? String(attrs) : `${String(attrs)} id="${finalId}"`;

      toc.push({ id: finalId, text: text || `Sección ${idx}`, level });

      return `<h${levelNum}${idAttr}>${inner}</h${levelNum}>`;
    }
  );

  return { htmlWithIds, toc };
}

/* Header con buscador a la derecha (igual al resto del sitio) */
const SiteHeader: React.FC<{
  active: Section | "comunidad";
  query: string;
  onQuery: (v: string) => void;
}> = ({ active, query, onQuery }) => {
  const activeClasses = "text-white border-b-2 border-[#0CE0B2]";
  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Ir al inicio">
            <Image
              src="/brand/motorwelt-logo.png"
              alt="MotorWelt logo"
              width={220}
              height={56}
              priority
              className="h-10 md:h-12 w-auto"
            />
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
            Inicio
          </Link>

          <div className="relative group">
            <button
              type="button"
              className={`inline-flex items-center h-10 leading-none ${
                active === "noticias" ? "text-white" : "text-gray-200 hover:text-white"
              }`}
              aria-haspopup="menu"
              aria-expanded="false"
            >
              Noticias
              <svg className="ml-2 mt-[1px] opacity-70 group-hover:opacity-100" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div className="pointer-events-none absolute left-0 top-full mt-2 opacity-0 translate-y-1 transition duration-150 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto z-50">
              <div className="min-w-[180px] rounded-xl border border-mw-line/70 bg-mw-surface/95 backdrop-blur-md p-2 shadow-xl">
                <Link href="/noticias/autos" className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5">
                  Autos
                </Link>
                <Link href="/noticias/motos" className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5">
                  Motos
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/deportes"
            className={`inline-flex items-center h-10 leading-none ${
              active === "deportes" ? activeClasses : "text-gray-200 hover:text-white"
            }`}
          >
            Deportes
          </Link>

          <Link
            href="/lifestyle"
            className={`inline-flex items-center h-10 leading-none ${
              active === "lifestyle" ? activeClasses : "text-gray-200 hover:text-white"
            }`}
          >
            Lifestyle
          </Link>

          <Link
            href="/comunidad"
            className={`inline-flex items-center h-10 leading-none ${
              active === "comunidad" ? activeClasses : "text-gray-200 hover:text-white"
            }`}
          >
            Comunidad
          </Link>

          <Link href="/suscripcion" className="inline-flex">
            <button className="inline-flex h-10 items-center rounded-2xl border-2 border-[#FF7A1A] px-4 py-0 font-semibold text-white shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5">
              Suscripción
            </button>
          </Link>
        </nav>

        <div className="hidden md:block md:ml-4 lg:ml-6">
          <div className="relative w-[300px]">
            <label htmlFor="search-site" className="sr-only">
              Buscar
            </label>
            <input
              id="search-site"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar…"
              className="w-full rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md px-4 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-80" aria-hidden>
              🔎
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export type ArticleLayoutProps = {
  section: Section;
  category?: string;
  title: string;
  excerpt: string;
  coverImage: string;
  author: { name: string; avatar?: string };
  publishedAt: string;
  updatedAt?: string;
  tags?: string[];
  contentHtml: string;

  // sugeridas / relacionados (misma data)
  related?: Array<{ title: string; href: string; img: string; date?: string }>;

  canonicalUrl?: string;
  seoImage?: string;
};

const AdBox: React.FC<{ label: string; className?: string }> = ({ label, className = "" }) => (
  <div
    className={`flex items-center justify-center rounded-xl border border-mw-line/70 bg-mw-surface/70 text-gray-400 ${className}`}
    aria-label={label}
  >
    <span className="text-xs md:text-sm">{label}</span>
  </div>
);

const ArticleLayout: React.FC<ArticleLayoutProps> = (props) => {
  const {
    section,
    category,
    title,
    excerpt,
    coverImage,
    author,
    publishedAt,
    updatedAt,
    tags = [],
    contentHtml,
    related = [],
    canonicalUrl,
    seoImage,
  } = props;

  const accent = ACCENTS[section];
  const [headerQuery, setHeaderQuery] = useState("");
  const minutes = useMemo(() => estReadMins(contentHtml), [contentHtml]);

  const { htmlWithIds, toc } = useMemo(() => injectIdsAndExtractTOC(contentHtml), [contentHtml]);

  const [shareUrl, setShareUrl] = useState(canonicalUrl || "");
  useEffect(() => {
    if (!canonicalUrl && typeof window !== "undefined") setShareUrl(window.location.href);
  }, [canonicalUrl]);

  const isNews = section === "noticias";
  const schemaType = isNews ? "NewsArticle" : "Article";

  const breadcrumbItems: any[] = [
    { "@type": "ListItem", position: 1, name: "Inicio", item: "https://motorwelt.mx/" },
    {
      "@type": "ListItem",
      position: 2,
      name: section === "noticias" ? "Noticias" : section[0].toUpperCase() + section.slice(1),
      item: `https://motorwelt.mx/${section === "noticias" ? "noticias" : section}`,
    },
  ];
  if (section === "noticias" && category) {
    breadcrumbItems.push({
      "@type": "ListItem",
      position: 3,
      name: category,
      item: `https://motorwelt.mx/noticias/${String(category).toLowerCase()}`,
    });
  }

  return (
    <>
      <Seo title={`${title} | MotorWelt`} description={excerpt} image={seoImage || coverImage} />

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: breadcrumbItems },
            {
              "@context": "https://schema.org",
              "@type": schemaType,
              headline: title,
              description: excerpt,
              image: [seoImage || coverImage],
              author: { "@type": "Person", name: author.name },
              datePublished: publishedAt,
              dateModified: updatedAt || publishedAt,
              mainEntityOfPage: canonicalUrl || undefined,
              publisher: {
                "@type": "Organization",
                name: "MotorWelt",
                logo: { "@type": "ImageObject", url: "https://motorwelt.mx/brand/motorwelt-logo.png" },
              },
            },
          ]),
        }}
      />

      {/* Hero */}
      <SiteHeader active={section} query={headerQuery} onQuery={setHeaderQuery} />
      <section className="relative mt-16 flex min-h-[38vh] items-center justify-center overflow-hidden">
        <Image
          src={coverImage}
          alt={title}
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover", filter: "brightness(.45) saturate(1.1)" }}
        />
        <div
          className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 rotate-[-16deg] rounded-full blur-3xl"
          style={{ backgroundColor: section === "deportes" ? "#0CE0B2" : "#FF7A1A", opacity: 0.22 }}
        />
        <div
          className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 rotate-[-16deg] rounded-full blur-3xl"
          style={{ backgroundColor: section === "deportes" ? "#E2A24C" : "#A3FF12", opacity: 0.24 }}
        />

        <div className="relative z-10 px-4 text-center sm:px-6 lg:px-8">
          {section === "noticias" && category && (
            <span className="inline-block rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur">
              {category}
            </span>
          )}
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white">{title}</h1>
          <p className="mx-auto mt-3 max-w-3xl text-gray-200">{excerpt}</p>
          <div className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-300">
            <span>{author.name}</span>
            <span>•</span>
            <span>{fmtDate(publishedAt)}</span>
            <span>•</span>
            <span>{minutes} min</span>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <section className="py-6">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center justify-center md:justify-end">
              <AdBox label="Publicidad — Leaderboard (728×90 / 970×250)" className="h-16 w-full max-w-[970px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-20 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1fr_300px]">
          <article className="overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md">
            <div
              className={[
                "prose prose-invert max-w-none p-5 md:p-8",
                "prose-p:text-gray-100/95",
                "prose-strong:text-white",
                "prose-a:text-white hover:prose-a:text-white/80",
                // ✅ headings bien marcados
                "prose-h2:mt-10 prose-h2:text-2xl prose-h2:font-extrabold prose-h2:tracking-wide",
                "prose-h3:mt-8 prose-h3:text-xl prose-h3:font-bold",
                "prose-h4:mt-6 prose-h4:text-lg prose-h4:font-semibold prose-h4:text-white/95",
                "prose-h5:mt-5 prose-h5:text-base prose-h5:font-semibold prose-h5:text-white/90",
                "prose-hr:border-white/10",
                // ✅ imágenes dentro del body
                "prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-[0_0_22px_rgba(0,0,0,.25)]",
              ].join(" ")}
            >
              <div dangerouslySetInnerHTML={{ __html: htmlWithIds }} />

              {/* TAGS al final del texto */}
              {Array.isArray(tags) && tags.length > 0 && (
                <div className="mt-10">
                  <div className="mb-3 text-xs uppercase tracking-widest text-gray-300/80">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-xs text-white/90 backdrop-blur"
                        style={{ boxShadow: `0 0 12px ${accent.hex}33` }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-mw-line/60 p-4">
              <AdBox label="Publicidad — In-Article (728×90 / 468×60)" className="mx-auto h-16 w-full max-w-[728px]" />
            </div>
          </article>

          <aside className="space-y-6 lg:sticky lg:top-24">
            {toc.length > 0 && (
              <nav className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 p-4">
                <h3 className="mb-2 font-semibold text-white">Contenido</h3>
                <ul className="space-y-1 text-sm">
                  {toc.map((i) => (
                    <li key={i.id} className={i.level === 5 ? "pl-8" : i.level === 4 ? "pl-6" : i.level === 3 ? "pl-3" : ""}>
                      <a href={`#${i.id}`} className="text-gray-300 hover:text-white">
                        {i.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {/* ✅ Sugeridas (SIN usar la portada actual) */}
            {Array.isArray(related) && related.length > 0 && (
              <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-white">Sugeridas</h3>
                  <span className="text-xs text-gray-300/80">Sigue explorando</span>
                </div>

                <div className="mt-4 space-y-3">
                  {related.slice(0, 6).map((r, idx) => (
                    <Link
                      key={`${r.href}-${idx}`}
                      href={r.href}
                      className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 hover:bg-white/5"
                    >
                      <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10">
                        <Image
                          src={r.img}
                          alt={r.title}
                          fill
                          sizes="56px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-white group-hover:text-white/90">{r.title}</div>
                        {r.date ? <div className="text-sm text-gray-300/80">{fmtDate(r.date)}</div> : null}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 p-4">
              <AdBox label="Publicidad — Billboard (970×250 / 970×90)" className="mx-auto h-44 w-full" />
            </div>

            <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 p-4">
              <h4 className="mb-2 font-semibold text-white">Compartir</h4>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                  target="_blank"
                  className="rounded-xl border border-white/20 px-3 py-1.5 text-gray-100 hover:bg-white/5"
                >
                  X/Twitter
                </Link>
                <Link
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  className="rounded-xl border border-white/20 px-3 py-1.5 text-gray-100 hover:bg-white/5"
                >
                  Facebook
                </Link>
                <button
                  onClick={() => navigator.clipboard?.writeText(shareUrl)}
                  className="rounded-xl border border-white/20 px-3 py-1.5 text-gray-100 hover:bg-white/5"
                >
                  Copiar enlace
                </button>
              </div>
            </div>
          </aside>
        </section>

        {/* Relacionados (grid) */}
        {Array.isArray(related) && related.length > 0 && (
          <section className="mt-12">
            <div className="mb-6 text-center">
              <h3 className="font-display text-2xl font-bold tracking-wide text-white">Relacionados</h3>
              <div className="mx-auto mt-2 h-1 w-20 rounded-full" style={{ background: `linear-gradient(90deg, ${accent.hex}, #E2A24C)` }} />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r, i) => (
                <Link
                  key={`${r.href}-${i}`}
                  href={r.href}
                  className="group relative overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/80 transition hover:-translate-y-[2px] hover:border-white/40"
                >
                  <div className="relative h-44">
                    <Image src={r.img} alt={r.title} fill sizes="(max-width:1024px) 50vw, 33vw" style={{ objectFit: "cover" }} />
                    <div className="absolute inset-0 bg-black/25 transition group-hover:bg-black/15" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold text-white">{r.title}</h4>
                    {r.date ? <div className="mt-1 text-xs text-gray-300/80">{fmtDate(r.date)}</div> : null}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ✅ Footer: Suscripción + redes (NO se quita) */}
        <section className="mt-14">
          <div className="rounded-3xl border border-white/10 bg-black/30 px-6 py-8 backdrop-blur-xl">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="font-display text-2xl font-bold tracking-wide text-white">Suscríbete a MotorWelt</h3>
                <p className="mt-2 max-w-2xl text-gray-200/85">
                  Recibe las mejores notas, estrenos, eventos y contenido premium. Sin spam.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 md:justify-end">
                <Link
                  href="/suscripcion"
                  className="inline-flex h-11 items-center rounded-2xl border-2 border-[#FF7A1A] px-5 font-semibold text-white shadow-[0_0_18px_rgba(255,122,26,.28)] hover:bg-white/5"
                >
                  Ver planes
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-11 items-center rounded-2xl border border-white/20 px-5 font-semibold text-white/90 hover:bg-white/5"
                >
                  Inicio
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
              <div className="text-sm text-gray-300/80">Síguenos</div>
              <div className="flex flex-wrap gap-2">
                <Link href="/comunidad" className="rounded-xl border border-white/20 px-3 py-2 text-sm text-gray-100 hover:bg-white/5">
                  Comunidad
                </Link>
                <Link href="https://instagram.com" target="_blank" className="rounded-xl border border-white/20 px-3 py-2 text-sm text-gray-100 hover:bg-white/5">
                  Instagram
                </Link>
                <Link href="https://tiktok.com" target="_blank" className="rounded-xl border border-white/20 px-3 py-2 text-sm text-gray-100 hover:bg-white/5">
                  TikTok
                </Link>
                <Link href="https://youtube.com" target="_blank" className="rounded-xl border border-white/20 px-3 py-2 text-sm text-gray-100 hover:bg-white/5">
                  YouTube
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default ArticleLayout;
