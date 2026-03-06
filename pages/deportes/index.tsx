// pages/deportes/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

/* ---------- Botón estilo MotorWelt ---------- */
type Variant = "cyan" | "pink" | "link";
const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition focus:outline-none focus-visible:ring-2";
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

/* ---------- Encabezado accesible con buscador a la derecha ---------- */
const SiteHeader: React.FC<{
  query: string;
  onQuery: (v: string) => void;
}> = ({ query, onQuery }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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

        {/* Nav centrado */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
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
              onClick={() => setOpen(v => !v)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
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
                open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none",
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
            className="inline-flex items-center h-10 leading-none text-white border-b-2 border-[#0CE0B2]"
            aria-current="page"
          >
            Deportes
          </Link>
          <Link href="/lifestyle" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
            Lifestyle
          </Link>
          <Link href="/comunidad" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
            Comunidad
          </Link>
          <Link href="/suscripcion" className="inline-flex">
            <Button variant="pink" className="h-10 px-4 py-0 leading-none">Suscripción</Button>
          </Link>
        </nav>

        {/* Buscador (derecha) */}
        <div className="hidden md:block md:ml-4 lg:ml-6">
          <div className="relative w-[300px]">
            <label htmlFor="search-deportes" className="sr-only">Buscar</label>
            <input
              id="search-deportes"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar en Deportes…"
              className="w-full rounded-2xl border border-white/20 bg-black/30 backdrop-blur-md px-4 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-80" aria-hidden>🔎</span>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ---------- Slugs demo por tag para darle navegación real ---------- */
const DEMO_BY_TAG: Record<string, string> = {
  Rally: "/noticias/autos/compuestos-2025-cambios-y-setup-recomendado",
  Drift: "/noticias/autos/aero-activa-20-que-aporta-realmente",
  "Off-Road": "/noticias/autos/ceramicos-vs-acero-frenadas-sin-fading",
};

export default function Deportes() {
  const [visible, setVisible] = useState(9);
  const [query, setQuery] = useState("");

  // Atajo "/" para enfocar el buscador
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input, textarea")) {
        e.preventDefault();
        document.getElementById("search-deportes")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Data de ejemplo
  const allItems = useMemo(
    () =>
      Array.from({ length: 27 }).map((_, i) => ({
        id: i + 1,
        title:
          i % 3 === 0
            ? "Rally: cómo leer pacenotes sin perder ritmo"
            : i % 3 === 1
            ? "Drift: ángulo, freno de mano y presión ideal"
            : "Off-Road: setup de suspensión en dunas",
        excerpt:
          i % 3 === 0
            ? "Navegación, ritmo y mecánica en etapas maratón."
            : i % 3 === 1
            ? "Líneas, derrape controlado y trazado para puntuar alto."
            : "Altura, rebote y compresión para tracción real.",
        image: `/images/noticia-${((i % 3) + 1).toString()}.jpg`,
        tag: i % 3 === 0 ? "Rally" : i % 3 === 1 ? "Drift" : "Off-Road",
      })),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allItems;
    return allItems.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.excerpt.toLowerCase().includes(q) ||
        it.tag.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  const visibleItems = filtered.slice(0, visible);
  const canLoadMore = visible < filtered.length;

  const clearSearch = () => setQuery("");

  return (
    <>
      <Seo
        title="Deportes | MotorWelt"
        description="Rally, drift, off-road y más: técnica, equipamiento y competencias."
      />

      {/* JSON-LD breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Inicio", item: "https://motorwelt.mx/" },
              { "@type": "ListItem", position: 2, name: "Deportes", item: "https://motorwelt.mx/deportes" },
            ],
          }),
        }}
      />

      {/* Header */}
      <SiteHeader query={query} onQuery={setQuery} />

      {/* Hero */}
      <section className="relative mt-16 flex min-h-[38vh] items-center justify-center overflow-hidden">
        <Image
          src="/images/noticia-2.jpg"
          alt="Deportes MotorWelt"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover", filter: "brightness(.45) saturate(1.1)" }}
        />
        <div className="pointer-events-none absolute -left-10 -top-10 h-72 w-72 rotate-[-16deg] rounded-full bg-[#0CE0B2]/22 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 -bottom-16 h-80 w-80 rotate-[-16deg] rounded-full bg-[#FF7A1A]/24 blur-3xl" />
        <div className="relative z-10 px-4 text-center sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white">
            Deportes
          </h1>
          <p className="mx-auto mt-3 max-w-3xl text-gray-200">
            Rally, drift, off-road y trackdays: técnica, preparación y pasión por competir.
          </p>
        </div>
      </section>

      {/* Publicidad Leaderboard */}
      <section className="py-6">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-black/30 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center justify-center md:justify-end">
              <div
                className="flex h-16 w-full max-w-[970px] items-center justify-center rounded-2xl border border-mw-line/70 bg-mw-surface/60 text-gray-400"
                aria-label="Publicidad — Leaderboard (728×90 / 970×250)"
              >
                <span className="text-xs md:text-sm">Publicidad — Leaderboard (728×90 / 970×250)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destacado + Más vistos */}
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Competencia de la semana */}
          <article className="relative overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70">
            <div className="relative h-72 w-full md:h-96">
              <Image
                src="/images/noticia-3.jpg"
                alt="Competencia de la semana"
                fill
                sizes="(max-width: 1024px) 100vw, 66vw"
                style={{ objectFit: "cover" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <span className="inline-block rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                Competencia de la semana
              </span>
              <h3 className="mt-3 text-2xl font-extrabold text-white md:text-3xl">
                Rally de montaña: navegación, ritmo y supervivencia mecánica
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-gray-200 md:text-base">
                Ajustes de suspensión, lectura de notas y estrategia para etapas maratón.
              </p>

              {/* Botones con navegación real */}
              <div className="mt-4 flex gap-3">
                <Link href="/noticias/autos/ceramicos-vs-acero-frenadas-sin-fading">
                  <Button variant="cyan" type="button">Ver reporte</Button>
                </Link>
                <Link href="/noticias/autos/compuestos-2025-cambios-y-setup-recomendado">
                  <Button variant="pink" type="button">Reglamento</Button>
                </Link>
              </div>
            </div>
          </article>

          {/* Más vistos (sticky) */}
          <aside className="lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70">
              <div className="border-b border-mw-line/60 p-4">
                <h4 className="font-semibold text-white">Más vistos</h4>
              </div>
              <ul className="divide-y divide-mw-line/60">
                {[
                  { title: "Los secretos del pace-note en rally", href: "/noticias/autos/prueba-sedan-turbo-equilibrio-en-pista" },
                  { title: "Claves para puntuar en drift", href: "/noticias/autos/aero-activa-20-que-aporta-realmente" },
                  { title: "Cómo no romper en off-road", href: "/noticias/autos/ceramicos-vs-acero-frenadas-sin-fading" },
                  { title: "Compuestos 2025: qué cambia", href: "/noticias/autos/compuestos-2025-cambios-y-setup-recomendado" },
                  { title: "Ergonomía en touring", href: "/noticias/motos/sport-touring-ergonomia-y-consumo-real" },
                ].map((it, i) => (
                  <li key={`mv-${i}`} className="p-4 transition hover:bg-white/5">
                    <Link href={it.href} className="flex gap-3">
                      <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-mw-line/70">
                        <Image
                          src={`/images/noticia-${((i % 3) + 1).toString()}.jpg`}
                          alt={`Más visto ${i}`}
                          fill
                          sizes="100px"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-white">{it.title}</p>
                        <span className="mt-1 block text-xs text-gray-400">4–6 min</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        {/* Últimas publicaciones */}
        <div className="mb-8 mt-12 text-center">
          <h2 className="font-display text-3xl font-bold tracking-wide text-white">
            Últimas publicaciones
          </h2>
          <div className="mx-auto mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]" />
        </div>

        {/* Live region para accesibilidad */}
        <p aria-live="polite" className="sr-only">
          {filtered.length} publicaciones encontradas.
        </p>

        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-black/25 p-8 text-center">
            <h3 className="text-white text-xl font-semibold">No hay publicaciones que coincidan</h3>
            <p className="text-gray-300 mt-2">
              Ajusta tu búsqueda o limpia el término para ver todo el contenido.
            </p>
            <div className="mt-5">
              <Button variant="cyan" onClick={clearSearch}>Limpiar búsqueda</Button>
            </div>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleItems.map((it) => (
                <article
                  key={it.id}
                  className="overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md transition hover:border-[#0CE0B2]/50"
                >
                  <div className="relative h-48 w-full">
                    <Image
                      src={it.image}
                      alt={it.title}
                      fill
                      sizes="(max-width:1024px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-xs text-white/90 backdrop-blur">
                      {it.tag}
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white">{it.title}</h3>
                    <p className="mt-2 text-sm text-gray-300">{it.excerpt}</p>
                    {/* Link real según tag */}
                    <div className="mt-2">
                      <Link href={DEMO_BY_TAG[it.tag] ?? "/noticias/autos/prueba-sedan-turbo-equilibrio-en-pista"}>
                        <Button variant="link" type="button">Leer más</Button>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {canLoadMore && (
              <div className="mt-8 text-center">
                <Button variant="cyan" onClick={() => setVisible((v) => v + 9)}>
                  Cargar más
                </Button>
              </div>
            )}
          </>
        )}

        {/* Billboard intermedio */}
        <section className="py-8">
          <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-4">
            <div
              className="mx-auto flex h-44 w-full max-w-[970px] items-center justify-center rounded-xl border border-mw-line/60 bg-black/40 text-gray-400"
              aria-label="Publicidad — Billboard (970×250 / 970×90)"
            >
              <span className="text-xs md:text-sm">Publicidad — Billboard (970×250 / 970×90)</span>
            </div>
          </div>
        </section>

        {/* Top clips */}
        <section className="py-4">
          <div className="mb-6 text-center">
            <h3 className="font-display text-2xl font-bold tracking-wide text-white">Top clips</h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Link
                key={`clip-${i}`}
                href={`/noticias/autos/${i === 1 ? "aero-activa-20-que-aporta-realmente" : i === 2 ? "ceramicos-vs-acero-frenadas-sin-fading" : "compuestos-2025-cambios-y-setup-recomendado"}`}
                className="group relative overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70 transition hover:border-[#0CE0B2]/50"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={`/images/noticia-${((i % 3) + 1).toString()}.jpg`}
                    alt={`Clip ${i}`}
                    fill
                    sizes="(max-width: 1024px) 33vw, 400px"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
                  <span className="absolute right-3 top-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white/90 backdrop-blur">
                    0{i}:24
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white">
                    {i === 1 ? "Best moments — drift" : i === 2 ? "Rally onboard" : "Off-road POV"}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Explora MotorWelt */}
        <section className="pt-8">
          <div className="mb-6 text-center">
            <h3 className="font-display text-2xl font-bold tracking-wide text-white">
              Explora MotorWelt
            </h3>
            <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {[
              { title: "Autos", href: "/noticias/autos", img: "/images/noticia-1.jpg" },
              { title: "Motos", href: "/noticias/motos", img: "/images/noticia-3.jpg" },
              { title: "Lifestyle", href: "/lifestyle", img: "/images/comunidad.jpg" },
            ].map((c) => (
              <Link
                key={c.title}
                href={c.href}
                className="group relative overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70 transition hover:border-[#0CE0B2]/50"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={c.img}
                    alt={c.title}
                    fill
                    sizes="(max-width: 1024px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-black/30 transition group-hover:bg-black/20" />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-white">{c.title}</h4>
                  <p className="mt-1 text-sm text-gray-300">Más contenido con ADN MotorWelt.</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Suscripción */}
        <section className="mt-12">
          <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-6 text-center">
            <h4 className="text-2xl font-extrabold text-white">Suscríbete a MotorWelt</h4>
            <p className="mx-auto mt-2 max-w-2xl text-gray-300">
              Recibe resúmenes de competencias, guías de setup y clips directo a tu correo.
            </p>
            <form
              className="mt-5 flex flex-col items-stretch justify-center gap-3 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="newsletter-deportes" className="sr-only">
                Tu correo electrónico
              </label>
              <input
                id="newsletter-deportes"
                type="email"
                placeholder="tu@email.com"
                required
                className="w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-3 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40 sm:w-[320px]"
              />
              <Button type="submit" variant="pink">Suscribirme</Button>
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
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
    },
  };
}
