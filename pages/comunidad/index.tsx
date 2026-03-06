// pages/comunidad/index.tsx
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

/* ---------- Header unificado (dropdown accesible + buscador a la derecha) ---------- */
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

  // Enfocar primer ítem al abrir
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

          <Link href="/deportes" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
            Deportes
          </Link>
          <Link href="/lifestyle" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
            Lifestyle
          </Link>
          <Link
            href="/comunidad"
            className="inline-flex items-center h-10 leading-none text-white border-b-2 border-[#0CE0B2]"
            aria-current="page"
          >
            Comunidad
          </Link>
          <Link href="/suscripcion" className="inline-flex">
            <Button variant="pink" className="h-10 px-4 py-0 leading-none">Suscripción</Button>
          </Link>
        </nav>

        {/* Buscador en el menú */}
        <div className="hidden md:block md:ml-4 lg:ml-6">
          <div className="relative w-[300px]">
            <label htmlFor="search-comunidad" className="sr-only">
              Buscar en comunidad
            </label>
            <input
              id="search-comunidad"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar en Comunidad…"
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

/* ===================== Utilidades locales ===================== */
type AdKind = "leaderboard" | "billboard";
function AdSlot({ kind, className = "" }: { kind: AdKind; className?: string }) {
  const cfg =
    kind === "leaderboard"
      ? { h: "h-16", label: "Publicidad — Leaderboard (728×90 / 970×250)" }
      : { h: "h-44", label: "Publicidad — Billboard (970×250 / 970×90)" };
  return (
    <div
      className={`rounded-2xl border border-mw-line/70 bg-mw-surface/70 backdrop-blur-md text-gray-300 flex items-center justify-center ${cfg.h} w-full ${className}`}
      aria-label={cfg.label}
      role="complementary"
    >
      <span className="text-xs md:text-sm">{cfg.label}</span>
    </div>
  );
}

function SectionHeading({
  title,
  subtle,
  glow = "cool",
}: {
  title: string;
  subtle?: string;
  glow?: "cool" | "warm";
}) {
  return (
    <div className="mb-8 text-center">
      <h2
        className={`font-display text-3xl font-extrabold tracking-wide text-white ${
          glow === "cool" ? "glow-cool" : "glow-warm"
        }`}
      >
        {title}
      </h2>
      {subtle && <p className="mt-2 text-gray-300 max-w-2xl mx-auto">{subtle}</p>}
      <div
        className={`mx-auto mt-3 h-1 w-28 rounded-full ${
          glow === "cool"
            ? "bg-gradient-to-r from-[#0CE0B2] via-[#A3FF12] to-[#E2A24C]"
            : "bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]"
        }`}
      />
    </div>
  );
}

/* ===================== Datos mock ===================== */
const eventsSeed = Array.from({ length: 6 }).map((_, i) => ({
  id: i + 1,
  when:
    i % 3 === 0
      ? "Sábado 16 Nov • 10:00"
      : i % 3 === 1
      ? "Domingo 24 Nov • 09:30"
      : "Sábado 7 Dic • 08:00",
  title:
    i % 3 === 0
      ? "Trackday — Autódromo CDMX"
      : i % 3 === 1
      ? "Ruta Off-road — Valle de Bravo"
      : "Cars & Coffee — Marina Norte",
  place:
    i % 3 === 0
      ? "Hermanos Rodríguez"
      : i % 3 === 1
      ? "Bosque / Terracería"
      : "Marina Norte",
  img: `/images/noticia-${((i % 3) + 1).toString()}.jpg`,
  type: i % 2 === 0 ? "Eventos" : "Meets",
}));

const pastGallery = [
  { id: 1, img: "/images/noticia-1.jpg", caption: "Meet GTI — Junio" },
  { id: 2, img: "/images/noticia-2.jpg", caption: "Ruta Off-road — Julio" },
  { id: 3, img: "/images/noticia-3.jpg", caption: "Trackday — Agosto" },
  { id: 4, img: "/images/comunidad.jpg", caption: "Cars & Coffee — Sept" },
];

const clubs = [
  { id: 1, name: "Club GTI MX", area: "CDMX / Edomex", members: 320 },
  { id: 2, name: "Rally & Raid MX", area: "Centro / Bajío", members: 180 },
  { id: 3, name: "Off-road Norte", area: "Norte", members: 240 },
];

/* ===================== Página ===================== */
export default function Comunidad() {
  const [query, setQuery] = useState("");

  const upcoming = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return eventsSeed;
    return eventsSeed.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.place.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
    );
  }, [query]);

  // Evento destacado = el primero del conjunto filtrado
  const featured = upcoming[0];

  // Atajo "/" para enfocar el buscador del header
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input, textarea")) {
        e.preventDefault();
        document.getElementById("search-comunidad")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const clearSearch = () => setQuery("");

  return (
    <>
      <Seo
        title="Comunidad & Eventos | MotorWelt"
        description="Trackdays, meets, rutas y comunidad con ADN MotorWelt."
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
              { "@type": "ListItem", position: 2, name: "Comunidad", item: "https://motorwelt.mx/comunidad" },
            ],
          }),
        }}
      />

      {/* Header global */}
      <SiteHeader query={query} onQuery={setQuery} />

      {/* HERO compacto (mt-16 por header fijo) */}
      <section className="relative mt-16 h-[34vh] min-h-[240px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/comunidad.jpg"
          alt="Comunidad MotorWelt"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", filter: "brightness(.5) saturate(1.1)" }}
          priority
        />
        {/* Halos cool */}
        <div className="absolute inset-0">
          <div className="absolute -left-12 -top-16 h-80 w-80 rounded-full bg-[#0CE0B2]/25 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-[26rem] w-[26rem] rounded-full bg-[#A3FF12]/15 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white drop-shadow-[0_0_18px_rgba(12,224,178,.25)]">
            Comunidad & Eventos
          </h1>
          <p className="mt-3 text-gray-200 max-w-3xl mx-auto">
            Trackdays, rutas, meets y foros. Únete a la manada MotorWelt.
          </p>
        </div>
      </section>

      {/* Leaderboard publicidad */}
      <section className="mt-4">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <AdSlot kind="leaderboard" />
        </div>
      </section>

      {/* Contenido */}
      <main className="pb-16 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Destacado */}
        {featured && (
          <section className="pt-10">
            <SectionHeading
              title="Próximo destacado"
              subtle="Asegura tu lugar antes de que se agote."
              glow="cool"
            />
            <article className="relative overflow-hidden rounded-3xl border border-mw-line/70 bg-mw-surface/70">
              <div className="relative h-[42vh] min-h-[320px]">
                <Image
                  src={featured.img}
                  alt={featured.title}
                  fill
                  sizes="100vw"
                  style={{ objectFit: "cover" }}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute inset-0">
                  <div className="absolute -left-24 -bottom-28 h-96 w-96 rounded-full bg-[#0CE0B2]/25 blur-3xl" />
                  <div className="absolute -right-14 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#A3FF12]/15 blur-3xl" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="inline-block rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                  {featured.when} — {featured.place}
                </span>
                <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">
                  {featured.title}
                </h3>
                <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-200">
                  Brief, lineamientos y requisitos de participación. ¡Nos vemos en pista!
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button variant="cyan" type="button">Confirmar asistencia</Button>
                  <Button variant="pink" type="button">Ver detalles</Button>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* Próximos eventos */}
        <section className="pt-12" aria-labelledby="proximos-title">
          <SectionHeading title="Próximos eventos" subtle="Agenda, lugares y registro." />
          {/* Live region para screen readers */}
          <p aria-live="polite" className="sr-only">
            {upcoming.length} eventos encontrados.
          </p>

          {upcoming.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/25 p-8 text-center">
              <h3 className="text-white text-xl font-semibold">No hay eventos que coincidan</h3>
              <p className="text-gray-300 mt-2">
                Ajusta tu búsqueda o limpia el término para ver todos los eventos.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                <Button variant="cyan" onClick={clearSearch}>Limpiar búsqueda</Button>
                <a
                  href="#newsletter"
                  className="text-[#43A1AD] underline underline-offset-4 hover:opacity-80"
                >
                  Ir a newsletter
                </a>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {upcoming.slice(0, 6).map((e) => (
                <article
                  key={e.id}
                  className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 overflow-hidden hover:border-[#0CE0B2]/50 transition will-change-transform hover:-translate-y-[2px]"
                >
                  <div className="relative h-44">
                    <Image
                      src={e.img}
                      alt={e.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-xs text-white/90 backdrop-blur">
                      {e.type}
                    </span>
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-gray-300">{e.when} • {e.place}</div>
                    <h4 className="mt-1 text-white font-semibold">{e.title}</h4>
                    <div className="mt-3 flex items-center gap-3">
                      <Button type="button" className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-gray-100 hover:bg-white/5 bg-transparent">
                        RSVP
                      </Button>
                      <Button type="button" className="rounded-xl border border-white/20 px-3 py-1.5 text-sm text-gray-100 hover:bg-white/5 bg-transparent">
                        Detalles
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Billboard intermedio */}
        <section className="py-12">
          <AdSlot kind="billboard" />
        </section>

        {/* Galería: lo último de la comunidad */}
        <section className="pt-2">
          <SectionHeading
            title="Lo último de la comunidad"
            subtle="Highlights de nuestros últimos encuentros."
            glow="warm"
          />
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {pastGallery.map((g) => (
              <figure
                key={g.id}
                className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 overflow-hidden"
              >
                <div className="relative h-36 md:h-40">
                  <Image
                    src={g.img}
                    alt={g.caption}
                    fill
                    sizes="(max-width: 1024px) 50vw, 25vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <figcaption className="p-3 text-xs text-gray-300">{g.caption}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        {/* Clubs / Grupos locales */}
        <section className="pt-12">
          <SectionHeading
            title="Clubes & Grupos locales"
            subtle="Conecta con la comunidad cerca de ti."
          />
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {clubs.map((c) => (
              <div
                key={c.id}
                className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 p-5"
              >
                <h4 className="text-white font-semibold">{c.name}</h4>
                <p className="text-sm text-gray-300 mt-1">{c.area}</p>
                <p className="text-xs text-gray-400 mt-1">{c.members} miembros</p>
                <Button type="button" variant="link" className="mt-3">
                  Unirme
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Newsletter */}
        <section id="newsletter" className="mt-14">
          <div className="rounded-3xl border border-mw-line/70 bg-mw-surface/70 p-6 md:p-8 text-center">
            <h4 className="text-2xl md:text-3xl font-extrabold text-white">
              Recibe la agenda y el brief en tu correo
            </h4>
            <p className="mt-2 text-gray-300 max-w-2xl mx-auto">
              Te enviaremos trackdays, meets y rutas con cupo limitado.
            </p>
            <form
              className="mt-5 flex flex-col sm:flex-row items-stretch justify-center gap-3"
              onSubmit={(e) => e.preventDefault()}
            >
              <label htmlFor="newsletter-comunidad" className="sr-only">
                Tu correo electrónico
              </label>
              <input
                id="newsletter-comunidad"
                type="email"
                placeholder="tu@email.com"
                required
                className="w-full sm:w-[340px] rounded-2xl border border-white/20 bg-black/25 backdrop-blur-md px-4 py-3 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
              />
              <button
                type="submit"
                className="rounded-2xl px-5 py-3 font-semibold text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.32),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
              >
                Suscribirme
              </button>
            </form>
          </div>
        </section>
      </main>

      {/* Estética ligera compartida (glows) */}
      <style jsx global>{`
        .glow-cool {
          text-shadow: 0 0 14px rgba(12, 224, 178, 0.25);
        }
        .glow-warm {
          text-shadow: 0 0 14px rgba(255, 122, 26, 0.25);
        }
      `}</style>
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
