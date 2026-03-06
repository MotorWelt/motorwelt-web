// pages/producciones/index.tsx
import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

/* ========== Botón contorno estilo MW (por si lo necesitas aquí) ========== */
type Variant = "cyan" | "pink" | "link";
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition focus:outline-none";
  const map: Record<Variant, string> = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus:ring-2 focus:ring-[#0CE0B2]/40",
    pink:
      "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus:ring-2 focus:ring-[#FF7A1A]/40",
    link:
      "p-0 text-[#43A1AD] underline underline-offset-4 hover:opacity-80 focus:ring-0",
  };
  return (
    <button {...props} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </button>
  );
};

/* ========== Header con nav centrado + filtros/buscador a la derecha ========== */
const SiteHeader: React.FC<{
  query: string;
  onQuery: (v: string) => void;
  category: string;
  onCategory: (c: string) => void;
}> = ({ query, onQuery, category, onCategory }) => {
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
            className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
          >
            Inicio
          </Link>

          <div className="relative group">
            <button
              type="button"
              className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
              aria-haspopup="menu"
              aria-expanded="false"
            >
              Noticias
              <svg
                className="ml-2 mt-[1px] opacity-70 group-hover:opacity-100"
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
            <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 translate-y-1 opacity-0 transition duration-150 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              <div className="min-w-[180px] rounded-xl border border-mw-line/70 bg-mw-surface/95 p-2 backdrop-blur-md shadow-xl">
                <Link
                  href="/noticias/autos"
                  className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5"
                >
                  Autos
                </Link>
                <Link
                  href="/noticias/motos"
                  className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5"
                >
                  Motos
                </Link>
              </div>
            </div>
          </div>

          <Link
            href="/deportes"
            className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
          >
            Deportes
          </Link>
          <Link
            href="/lifestyle"
            className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
          >
            Lifestyle
          </Link>
          <Link
            href="/comunidad"
            className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
          >
            Comunidad
          </Link>
          <Link href="/suscripcion" className="inline-flex">
            <button className="inline-flex h-10 items-center justify-center rounded-2xl px-4 py-0 font-semibold text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40">
              Suscripción
            </button>
          </Link>
        </nav>

        {/* Filtros + búsqueda */}
        <div className="hidden md:flex items-center justify-end gap-3 lg:gap-4 pl-2 lg:pl-4">
          {/* Categoría */}
          <div className="relative">
            <select
              aria-label="Filtrar por categoría"
              value={category}
              onChange={(e) => onCategory(e.target.value)}
              className="h-10 w-[130px] md:w-[150px] lg:w-[160px] appearance-none rounded-2xl border border-white/20 bg-black/30 px-3 pr-8 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
            >
              <option value="">Todo</option>
              <option value="serie">Series</option>
              <option value="corto">Cortos</option>
              <option value="bts">Detrás de cámaras</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 opacity-80"
              width="16"
              height="16"
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
          </div>

          {/* Buscador */}
          <div className="relative w-[260px] lg:w-[320px]">
            <label htmlFor="search-producciones" className="sr-only">
              Buscar
            </label>
            <input
              id="search-producciones"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar producciones..."
              className="h-10 w-full rounded-2xl border border-white/20 bg-black/30 px-4 pr-8 text-sm text-gray-100 placeholder-gray-400 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
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

/* ================== Datos mock de producciones ================== */
type ProdCat = "serie" | "corto" | "bts";
type Production = {
  slug: string;
  title: string;
  category: ProdCat;
  duration: string;
  thumb: string;
  summary: string;
};

const productions: Production[] = [
  {
    slug: "ruta-sierra-ep1",
    title: "Ruta Sierra — Episodio 1",
    category: "serie",
    duration: "12:30",
    thumb: "/images/noticia-1.jpg",
    summary: "Primera etapa: setup, clima y navegación.",
  },
  {
    slug: "behind-the-scenes-gti",
    title: "Behind the scenes: GTI Night",
    category: "bts",
    duration: "06:40",
    thumb: "/images/noticia-2.jpg",
    summary: "Luces, rigs, tomas y anécdotas del rodaje.",
  },
  {
    slug: "drift-solo-corto",
    title: "Drift solo — Corto",
    category: "corto",
    duration: "03:10",
    thumb: "/images/noticia-3.jpg",
    summary: "Una toma continua en el skidpad.",
  },
  {
    slug: "ruta-sierra-ep2",
    title: "Ruta Sierra — Episodio 2",
    category: "serie",
    duration: "11:05",
    thumb: "/images/comunidad.jpg",
    summary: "Etapa 2: altura, frenos y consumo.",
  },
  {
    slug: "detalles-de-camara",
    title: "Detalles de cámara",
    category: "bts",
    duration: "07:50",
    thumb: "/images/noticia-1.jpg",
    summary: "Lentes, estabilización y filtraje en pista.",
  },
  {
    slug: "sprint-en-montana",
    title: "Sprint en montaña — Corto",
    category: "corto",
    duration: "02:24",
    thumb: "/images/noticia-2.jpg",
    summary: "Mini historia de 2 minutos a tope.",
  },
];

/* ================== Página ================== */
export default function Producciones() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return productions.filter((p) => {
      const matchCat = !category || p.category === category;
      const matchQ =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  const featured = filtered[0] ?? productions[0];

  return (
    <>
      <Seo
        title="Producciones | MotorWelt"
        description="Series, cortos y detrás de cámaras con el sello MotorWelt."
      />

      {/* HERO compacto */}
      <section className="relative mt-16 h-[34vh] min-h-[240px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/noticia-2.jpg"
          alt="Producciones MotorWelt"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover", filter: "brightness(.5) saturate(1.1)" }}
        />
        <div className="absolute inset-0">
          <div className="absolute -left-12 -top-16 h-80 w-80 rounded-full bg-[#0CE0B2]/25 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-[26rem] w-[26rem] rounded-full bg-[#A3FF12]/15 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white drop-shadow-[0_0_18px_rgba(12,224,178,.25)]">
            Producciones
          </h1>
          <p className="mt-3 text-gray-200 max-w-3xl mx-auto">
            Series originales, cortos y detrás de cámaras.
          </p>
        </div>
      </section>

      {/* Header con filtros/búsqueda */}
      <SiteHeader
        query={query}
        onQuery={setQuery}
        category={category}
        onCategory={setCategory}
      />

      {/* Leaderboard */}
      <section className="mt-4">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div
            className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 h-16 flex items-center justify-center text-gray-300"
            aria-label="Publicidad — Leaderboard (728×90 / 970×250)"
          >
            <span className="text-xs md:text-sm">
              Publicidad — Leaderboard (728×90 / 970×250)
            </span>
          </div>
        </div>
      </section>

      {/* Contenido */}
      <main className="pb-16 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Destacado */}
        {featured && (
          <section className="pt-10">
            <article className="relative overflow-hidden rounded-3xl border border-mw-line/70 bg-mw-surface/70">
              <div className="relative h-[42vh] min-h-[320px]">
                <Image
                  src={featured.thumb}
                  alt={featured.title}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="inline-block rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                  {featured.category.toUpperCase()} • {featured.duration}
                </span>
                <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">
                  {featured.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-200">
                  {featured.summary}
                </p>
                <div className="mt-5">
                  <Link
                    href={`/producciones/${featured.slug}`}
                    className="inline-flex rounded-2xl border-2 border-[#0CE0B2] px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  >
                    Ver producción
                  </Link>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Grid de producciones */}
        <section className="pt-12">
          <div className="mb-6 text-center">
            <h2 className="font-display text-3xl font-bold tracking-wide text-white">
              Catálogo
            </h2>
            <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-[#0CE0B2] via-[#A3FF12] to-[#E2A24C]" />
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link
                key={p.slug}
                href={`/producciones/${p.slug}`}
                className="group overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/80 transition hover:border-[#0CE0B2]/50"
              >
                <div className="relative h-48">
                  <Image
                    src={p.thumb}
                    alt={p.title}
                    fill
                    sizes="(max-width:1024px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                  <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-xs text-white/90 backdrop-blur">
                    {p.category.toUpperCase()} • {p.duration}
                  </span>
                  <div className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
                </div>
                <div className="p-5">
                  <h3 className="text-white font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-gray-300">{p.summary}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Billboard intermedio */}
        <section className="py-12">
          <div
            className="mx-auto flex h-44 w-full max-w-[970px] items-center justify-center rounded-2xl border border-mw-line/70 bg-mw-surface/70 text-gray-300"
            aria-label="Publicidad — Billboard (970×250 / 970×90)"
          >
            <span className="text-xs md:text-sm">
              Publicidad — Billboard (970×250 / 970×90)
            </span>
          </div>
        </section>

        {/* CTA Suscripción (opcional) */}
        <section className="mt-4 text-center">
          <p className="text-gray-300 mb-3">
            ¿Te gustó el contenido? Recibe los nuevos capítulos.
          </p>
          <Link href="/suscripcion">
            <Button variant="pink">Suscribirme</Button>
          </Link>
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
