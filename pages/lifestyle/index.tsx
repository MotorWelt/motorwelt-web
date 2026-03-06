// pages/lifestyle/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

/* ---------- Botón estilo MotorWelt (consistente) ---------- */
type Variant = "cyan" | "pink" | "link";
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";
  const map: Record<Variant, string> = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus-visible:ring-[#0CE0B2]/40",
    pink:
      "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus-visible:ring-[#FF7A1A]/40",
    link:
      "p-0 text-[#43A1AD] underline underline-offset-4 hover:opacity-80 focus:ring-0",
  };
  return (
    <button {...props} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </button>
  );
};

/* ---------- Header con Lifestyle activo + buscador (dropdown accesible) ---------- */
const SiteHeader: React.FC<{ query: string; onQuery: (v: string) => void }> = ({
  query,
  onQuery,
}) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Cerrar con click-fuera
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (
        !menuRef.current.contains(e.target as Node) &&
        !btnRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Cerrar con ESC
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Al abrir, enfocar el primer link
  useEffect(() => {
    if (open) {
      const first = menuRef.current?.querySelector<HTMLAnchorElement>("a");
      first?.focus();
    }
  }, [open]);

  return (
    <header className="fixed top-0 left-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
      <div className="mx-auto grid h-16 w-full max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
            aria-label="Ir al inicio"
          >
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

        {/* Nav centrado */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white"
          >
            Inicio
          </Link>

          {/* Noticias accesible */}
          <div className="relative">
            <button
              ref={btnRef}
              id="btn-noticias"
              type="button"
              className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white focus-visible:ring-2 focus-visible:ring-[#FF7A1A]/40 rounded-md px-1"
              aria-haspopup="menu"
              aria-controls="menu-noticias"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              onKeyDown={(e) => {
                if (
                  e.key === "ArrowDown" ||
                  e.key === "Enter" ||
                  e.key === " "
                ) {
                  e.preventDefault();
                  setOpen(true);
                }
              }}
            >
              Noticias
              <svg
                className="ml-2 mt-[1px] opacity-70"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M6 9l6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div
              ref={menuRef}
              id="menu-noticias"
              role="menu"
              aria-labelledby="btn-noticias"
              className={[
                "absolute left-0 top-full z-50 mt-2 min-w-[180px] rounded-xl border border-mw-line/70 bg-mw-surface/95 p-2 backdrop-blur-md shadow-xl transition origin-top",
                open
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95 pointer-events-none",
              ].join(" ")}
            >
              <Link
                href="/noticias/autos"
                role="menuitem"
                tabIndex={open ? 0 : -1}
                className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                onClick={() => setOpen(false)}
              >
                Autos
              </Link>
              <Link
                href="/noticias/motos"
                role="menuitem"
                tabIndex={open ? 0 : -1}
                className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5 focus:bg-white/5 focus:outline-none"
                onClick={() => setOpen(false)}
              >
                Motos
              </Link>
            </div>
          </div>

          <Link
            href="/deportes"
            className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white"
          >
            Deportes
          </Link>
          <Link
            href="/lifestyle"
            className="inline-flex items-center h-10 leading-none text-white border-b-2 border-[#0CE0B2]"
            aria-current="page"
          >
            Lifestyle
          </Link>
          <Link
            href="/comunidad"
            className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white"
          >
            Comunidad
          </Link>
          <Link href="/suscripcion" className="inline-flex">
            <Button variant="pink" className="h-10 px-4 py-0 leading-none">
              Suscripción
            </Button>
          </Link>
        </nav>

        {/* Buscador (derecha) */}
        <div className="hidden md:block md:ml-4 lg:ml-6">
          <div className="relative w-[300px]">
            <label htmlFor="search-lifestyle" className="sr-only">
              Buscar en Lifestyle
            </label>
            <input
              id="search-lifestyle"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar en Lifestyle…"
              className="w-full rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md px-4 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
            />
            <span
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-80"
              aria-hidden
            >
              🔎
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

function SectionHeading({
  title,
  subtle,
  id,
}: {
  title: string;
  subtle?: string;
  id?: string;
}) {
  return (
    <div className="mb-8 text-center" id={id}>
      <h2 className="font-display text-3xl font-extrabold tracking-wide text-white">
        {title}
      </h2>
      {subtle && (
        <p className="mt-2 text-gray-300 max-w-2xl mx-auto">{subtle}</p>
      )}
      <div className="mx-auto mt-3 h-1 w-28 rounded-full bg-gradient-to-r from-[#FF7A1A] via-[#F3B15A] to-[#A3FF12]" />
    </div>
  );
}

function AdSlot({
  kind,
  className = "",
}: {
  kind: "leaderboard" | "billboard";
  className?: string;
}) {
  const cfg =
    kind === "leaderboard"
      ? { h: "h-16", label: "Publicidad — Leaderboard (728×90 / 970×250)" }
      : { h: "h-44", label: "Publicidad — Billboard (970×250 / 970×90)" };
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/25 backdrop-blur-lg text-gray-300 flex items-center justify-center ${cfg.h} w-full ${className}`}
      aria-label={cfg.label}
      role="complementary"
    >
      <span className="text-xs md:text-sm">{cfg.label}</span>
    </div>
  );
}

function FeaturedStory({
  img,
  tag = "Selección MW",
  title,
  excerpt,
  href,
}: {
  img: string;
  tag?: string;
  title: string;
  excerpt: string;
  href?: string; // si viene, Link; si no, botón placeholder
}) {
  return (
    <article className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20">
      <div className="relative h-[56vh] min-h-[380px] md:min-h-[380px]">
        <Image
          src={img}
          alt={title}
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
        />
        {/* Overlay cálido */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent" />
        <div className="absolute inset-0">
          <div className="absolute -left-20 -bottom-28 h-80 w-80 rounded-full bg-[#FF7A1A]/25 blur-3xl" />
          <div className="absolute -right-16 -top-24 h-96 w-96 rounded-full bg-[#A3FF12]/20 blur-3xl" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
        <span className="inline-block rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
          {tag}
        </span>
        <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-white drop-shadow-[0_0_18px_rgba(255,122,26,.25)]">
          {title}
        </h3>
        <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-200">
          {excerpt}
        </p>

        {href && href !== "#" ? (
          <Link
            href={href}
            className="mt-5 inline-block rounded-2xl border-2 border-[#FF7A1A] bg-white/5 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]/40"
          >
            Ver artículo
          </Link>
        ) : (
          <Button variant="pink" className="mt-5" type="button">
            Ver artículo
          </Button>
        )}
      </div>
    </article>
  );
}

function CategoryCard({
  title,
  img,
  href,
}: {
  title: string;
  img: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/20 hover:border-[#FF7A1A]/50 transition"
    >
      <div className="relative h-40 w-full">
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: "cover" }}
          className="transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent group-hover:from-black/50 transition" />
      </div>
      <div className="p-4">
        <h4 className="text-white font-semibold">{title}</h4>
        <p className="text-sm text-gray-300 mt-1">Curaduría MotorWelt.</p>
      </div>
    </Link>
  );
}

function StoryCard({
  title,
  excerpt,
  img,
  href,
}: {
  title: string;
  excerpt: string;
  img: string;
  href: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 overflow-hidden hover:border-[#FF7A1A]/40 transition">
      <div className="relative h-48">
        <Image
          src={img}
          alt={title}
          fill
          sizes="(max-width: 1024px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="p-5">
        <h4 className="text-white font-semibold">{title}</h4>
        <p className="mt-2 text-sm text-gray-300">{excerpt}</p>
        {/* misma vista, pero ahora sí navega */}
        <Link href={href} className="inline-flex mt-2">
          <Button variant="link" type="button">
            Leer más
          </Button>
        </Link>
      </div>
    </article>
  );
}

/* ===================== Quick Filters (píldoras) ===================== */
const FILTERS = [
  { slug: "", label: "Todo" },
  { slug: "relojeria", label: "Relojería" },
  { slug: "ropa", label: "Ropa & Merch" },
  { slug: "accesorios", label: "Accesorios" },
  { slug: "arte", label: "Arte Automotriz" },
];

function QuickFilters({
  current,
  onPick,
}: {
  current: string;
  onPick: (slug: string) => void;
}) {
  return (
    <div className="sticky top-16 z-40 bg-gradient-to-b from-black/60 via-black/40 to-transparent backdrop-blur-md">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {FILTERS.map((f) => {
            const active = current === f.slug;
            return (
              <button
                key={f.slug || "all"}
                onClick={() => onPick(f.slug)}
                className={[
                  "whitespace-nowrap rounded-full border px-3 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7A1A]/40",
                  active
                    ? "border-[#FF7A1A] text-white shadow-[0_0_14px_rgba(255,122,26,.35)]"
                    : "border-white/15 text-gray-200 hover:border-white/30 hover:text-white",
                ].join(" ")}
                aria-pressed={active}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============================================================================= */

const CATEGORIES = [
  { title: "Relojería", img: "/images/noticia-1.jpg", href: "/lifestyle#relojeria" },
  { title: "Ropa & Merch", img: "/images/noticia-2.jpg", href: "/lifestyle#ropa" },
  { title: "Accesorios", img: "/images/noticia-3.jpg", href: "/lifestyle#accesorios" },
  { title: "Arte Automotriz", img: "/images/comunidad.jpg", href: "/lifestyle#arte" },
];

export default function Lifestyle() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<string>("");

  // Historias demo con categoría para filtros
  const allStories = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => {
        const catIndex = i % 4;
        const catSlug = ["relojeria", "ropa", "accesorios", "arte"][catIndex];

        const title =
          catSlug === "relojeria"
            ? "Cronógrafos inspirados en Le Mans"
            : catSlug === "ropa"
            ? "Colaboración cápsula: street & pista"
            : catSlug === "accesorios"
            ? "Accesorios con ADN de paddock"
            : "Artistas que pintan velocidad";

        const excerpt =
          catSlug === "relojeria"
            ? "Esferas con taquímetro, correas de caucho y calibres automáticos."
            : catSlug === "ropa"
            ? "Prendas técnicas con guiños a paddock: funcionalidad y estilo."
            : catSlug === "accesorios"
            ? "Lentes, guantes y mochilas que combinan forma y función."
            : "Lienzos, esculturas y prints con olor a gasolina.";

        const img = `/images/noticia-${((catIndex % 3) + 1).toString()}.jpg`;

        // slug/href demo para que la tarjeta tenga destino
        const slug =
          catSlug === "relojeria"
            ? "cronografos-inspirados-en-le-mans"
            : catSlug === "ropa"
            ? "colaboracion-capsula-street-y-pista"
            : catSlug === "accesorios"
            ? "accesorios-con-adn-de-paddock"
            : "artistas-que-pintan-velocidad";

        const href = `/lifestyle/${slug}`;

        return { id: i + 1, title, excerpt, img, cat: catSlug, href };
      }),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allStories.filter((s) => {
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.excerpt.toLowerCase().includes(q);
      const matchesFilter = !filter || s.cat === filter;
      return matchesQuery && matchesFilter;
    });
  }, [allStories, query, filter]);

  // label legible para accesibilidad
  const currentFilterLabel =
    FILTERS.find((f) => f.slug === filter)?.label || "todas las categorías";

  /* ======= Mejoras UX/SEO ======= */

  // 1) Título <title> dinámico por filtro
  useEffect(() => {
    const label: Record<string, string> = {
      "": "Lifestyle",
      relojeria: "Lifestyle — Relojería",
      ropa: "Lifestyle — Ropa & Merch",
      accesorios: "Lifestyle — Accesorios",
      arte: "Lifestyle — Arte Automotriz",
    };
    document.title = `${label[filter] ?? "Lifestyle"} | MotorWelt`;
  }, [filter]);

  // 2) Persistir último filtro (solo sesión)
  useEffect(() => {
    const saved = sessionStorage.getItem("mw_life_filter");
    if (saved) setFilter(saved);
  }, []);
  useEffect(() => {
    sessionStorage.setItem("mw_life_filter", filter);
  }, [filter]);

  // 3) Hash (#relojeria, etc.) → activa filtro y hace scroll a Historias
  useEffect(() => {
    const valid = new Set(["relojeria", "ropa", "accesorios", "arte"]);
    const applyFromHash = () => {
      const h = (window.location.hash || "").replace("#", "");
      if (valid.has(h)) {
        setFilter(h);
        const target = document.getElementById("historias");
        if (target)
          target.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (!h) {
        // Mantener el recordado si no hay hash
      }
    };
    applyFromHash();
    window.addEventListener("hashchange", applyFromHash);
    return () => window.removeEventListener("hashchange", applyFromHash);
  }, []);

  // Atajo "/" para enfocar búsqueda del header
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !(e.target as HTMLElement)?.closest("input, textarea")
      ) {
        e.preventDefault();
        document.getElementById("search-lifestyle")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Helpers UI (empty state)
  const clearFilters = () => {
    setFilter("");
    setQuery("");
    if (history.pushState) history.pushState(null, "", "/lifestyle");
    const target = document.getElementById("historias");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToCollections = () => {
    const sec = document.getElementById("colecciones");
    if (sec) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <Seo
        title="Lifestyle | MotorWelt"
        description="Relojería, ropa & merch, accesorios y arte automotriz."
      />

      {/* Header unificado con buscador */}
      <SiteHeader query={query} onQuery={setQuery} />

      {/* HERO cálido (compensa header fijo con mt-16) */}
      <section className="relative mt-16 h-[34vh] min-h-[240px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/comunidad.jpg"
          alt="Lifestyle MotorWelt"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
            filter: "brightness(.55) saturate(1.1)",
          }}
          priority
        />
        {/* halos cálidos */}
        <div className="absolute inset-0">
          <div className="absolute -left-10 -top-16 h-80 w-80 rounded-full bg-[#FF7A1A]/25 blur-3xl" />
          <div className="absolute -right-16 -bottom-16 h-96 w-96 rounded-full bg-[#A3FF12]/20 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white drop-shadow-[0_0_18px_rgba(255,122,26,.25)]">
            Lifestyle
          </h1>
          <p className="mt-3 text-gray-200 max-w-3xl mx-auto">
            Estilo de vida con ADN automotriz.
          </p>
        </div>
      </section>

      {/* Leaderboard publicidad */}
      <section className="mt-4">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <AdSlot kind="leaderboard" />
        </div>
      </section>

      {/* Quick Filters (píldoras) */}
      <QuickFilters
        current={filter}
        onPick={(slug) => {
          setFilter(slug);
          const hash = slug ? `#${slug}` : "#";
          if (history.pushState)
            history.pushState(null, "", `/lifestyle${hash}`);
          const target = document.getElementById("historias");
          if (target)
            target.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      />

      {/* Contenido */}
      <main className="pb-16 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Categorías (colecciones) */}
        <section id="colecciones" className="pt-10">
          <SectionHeading
            title="Colecciones"
            subtle="Curaduría de piezas y tendencias con el toque MotorWelt."
          />
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <CategoryCard
                key={c.title}
                title={c.title}
                img={c.img}
                href={c.href}
              />
            ))}
          </div>
        </section>

        {/* Destacado editorial */}
        <section className="pt-12">
          <FeaturedStory
            img="/images/noticia-2.jpg"
            title="Edición limitada: cronógrafo & chaqueta técnica"
            excerpt="Una cápsula que combina precisión mecánica y textiles de alto rendimiento, inspirada en la pista."
            // href="/lifestyle/edicion-limitada" // si luego tienes ruta real, activa este href
          />
        </section>

        {/* Historias & Entrevistas */}
        <section className="pt-12" aria-labelledby="historias-title">
          <SectionHeading title="Historias & Entrevistas" id="historias" />
          {/* Accesibilidad: anunciar cantidad y filtro actual */}
          <p aria-live="polite" className="sr-only">
            {filtered.length} artículos en {currentFilterLabel}.
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/25 p-8 text-center">
              <h3 className="text-white text-xl font-semibold">
                No encontramos resultados
              </h3>
              <p className="text-gray-300 mt-2">
                Prueba ajustando tu búsqueda o limpiando filtros. También puedes
                explorar las colecciones destacadas.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                <Button variant="cyan" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
                <Button variant="link" onClick={goToCollections}>
                  Ir a Colecciones
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((s) => (
                <StoryCard
                  key={s.id}
                  title={s.title}
                  excerpt={s.excerpt}
                  img={s.img}
                  href={s.href}
                />
              ))}
            </div>
          )}
        </section>

        {/* Billboard intermedio */}
        <section className="py-12">
          <AdSlot kind="billboard" />
        </section>

        {/* Lookbook (mosaico ligero) */}
        <section className="pt-4" aria-labelledby="lookbook-title">
          <SectionHeading
            title="Lookbook"
            subtle="Texturas, materiales y detalles en movimiento."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              "/images/noticia-1.jpg",
              "/images/noticia-2.jpg",
              "/images/noticia-3.jpg",
              "/images/comunidad.jpg",
              "/images/noticia-2.jpg",
              "/images/noticia-3.jpg",
              "/images/noticia-1.jpg",
              "/images/comunidad.jpg",
            ].map((src, i) => (
              <div
                key={i}
                className="relative h-36 md:h-44 rounded-xl overflow-hidden"
              >
                <Image
                  src={src}
                  alt={`Lookbook ${i + 1}`}
                  fill
                  sizes="25vw"
                  style={{ objectFit: "cover" }}
                />
              </div>
            ))}
          </div>
        </section>

        {/* CTA Suscripción */}
        <section className="mt-14">
          <div className="rounded-3xl border border-white/10 bg-black/25 p-6 md:p-8 text-center">
            <h4 className="text-2xl md:text-3xl font-extrabold text-white">
              Únete a la cultura MotorWelt
            </h4>
            <p className="mt-2 text-gray-300 max-w-2xl mx-auto">
              Historias, colaboraciones, lanzamientos y arte automotriz directo
              en tu buzón.
            </p>
            <form
              className="mt-5 flex flex-col sm:flex-row items-stretch justify-center gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="newsletter-lifestyle" className="sr-only">
                Tu correo electrónico
              </label>
              <input
                id="newsletter-lifestyle"
                type="email"
                placeholder="tu@email.com"
                required
                className="w-full sm:w-[340px] rounded-2xl border border-white/20 bg-black/35 backdrop-blur-md px-4 py-3 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              />
              <button
                type="submit"
                className="rounded-2xl px-5 py-3 font-semibold text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig
      )),
    },
  };
}
