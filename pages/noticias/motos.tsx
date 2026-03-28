import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

/* ---------- Botón estilo MotorWelt (consistente) ---------- */
type Variant = "cyan" | "pink" | "ghost" | "link";
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
    ghost:
      "text-gray-100 border border-white/15 bg-black/20 hover:bg-white/5 hover:border-white/25 focus-visible:ring-white/20",
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

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/"
            className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white"
          >
            Inicio
          </Link>

          <div className="relative">
            <button
              ref={btnRef}
              id="btn-noticias"
              type="button"
              className="inline-flex items-center h-10 leading-none text-white border-b-2 border-[#FF7A1A] focus-visible:ring-2 focus-visible:ring-[#FF7A1A]/40 rounded-md px-1"
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
            className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white"
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

        <div className="hidden md:block md:ml-4 lg:ml-6">
          <div className="relative w-[300px]">
            <label htmlFor="search-motos" className="sr-only">
              Buscar en motos
            </label>
            <input
              id="search-motos"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Buscar en Motos…"
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

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  tags?: string[];
  when: string;
  img: string;
  slug: string;
  publishedAt?: string | null;
};

export default function NoticiasMotos({ items = [] }: { items?: NewsItem[] }) {
  const [query, setQuery] = useState("");

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return safeItems.filter((it) => {
      return (
        !q ||
        (it.title || "").toLowerCase().includes(q) ||
        (it.excerpt || "").toLowerCase().includes(q) ||
        (it.tags || []).some((t) => (t || "").toLowerCase().includes(q))
      );
    });
  }, [safeItems, query]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !(e.target as HTMLElement)?.closest("input, textarea")) {
        e.preventDefault();
        document.getElementById("search-motos")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const clear = () => setQuery("");

  return (
    <>
      <Seo
        title="Noticias de Motos | MotorWelt"
        description="Pruebas, lanzamientos, rutas y MotoGP con ADN MotorWelt."
      />

      <SiteHeader query={query} onQuery={setQuery} />

      <section className="relative mt-16 h-[34vh] min-h-[240px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/comunidad.jpg"
          alt="Noticias de Motos MotorWelt"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", filter: "brightness(.48) saturate(1.15)" }}
          priority
        />
        <div className="absolute inset-0">
          <div className="absolute -left-12 -top-16 h-80 w-80 rounded-full bg-[#0CE0B2]/18 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-[26rem] w-[26rem] rounded-full bg-[#FF7A1A]/12 blur-3xl" />
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="mt-3 font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white drop-shadow-[0_0_18px_rgba(12,224,178,.18)]">
            Noticias de Motos
          </h1>
          <p className="mt-3 text-gray-200 max-w-3xl mx-auto">
            El mundo en dos ruedas
          </p>
        </div>
      </section>

      <section className="mt-4">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <AdSlot kind="leaderboard" />
        </div>
      </section>

      <main className="pb-16 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <section className="pt-12" aria-labelledby="feed-title">
          <SectionHeading
            title={`Últimas publicaciones ${filtered.length ? `(${filtered.length})` : ""}`}
            glow="cool"
          />
          <p aria-live="polite" className="sr-only">
            {filtered.length} publicaciones encontradas.
          </p>

          {filtered.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-black/25 p-8 text-center">
              <h3 className="text-white text-xl font-semibold">
                No hay publicaciones que coincidan
              </h3>
              <p className="text-gray-300 mt-2">
                Ajusta tu búsqueda o limpia el término para ver todo.
              </p>
              <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                <Button variant="cyan" onClick={clear}>
                  Limpiar búsqueda
                </Button>
                <a
                  href="#newsletter-motos"
                  className="text-[#43A1AD] underline underline-offset-4 hover:opacity-80"
                >
                  Ir a newsletter
                </a>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, 9).map((n) => (
                <article
                  key={n.id}
                  className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 overflow-hidden hover:border-[#0CE0B2]/45 transition will-change-transform hover:-translate-y-[2px]"
                >
                  <div className="relative h-44">
                    <Image
                      src={n.img}
                      alt={n.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      style={{ objectFit: "cover" }}
                    />
                    <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/55 px-2 py-0.5 text-xs text-white/90 backdrop-blur">
                      {n.tag}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-gray-300">{n.when}</div>
                    <h4 className="mt-1 text-white font-semibold">{n.title}</h4>
                    <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                      {n.excerpt}
                    </p>

                    <div className="mt-4 flex items-center gap-3">
                      <Link href={n.slug} className="inline-flex">
                        <Button
                          variant="pink"
                          className="rounded-xl h-10 px-4 py-0 text-sm leading-none"
                        >
                          Leer completa →
                        </Button>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="py-12">
          <AdSlot kind="billboard" />
        </section>

        <section id="newsletter-motos" className="mt-2">
          <div className="rounded-3xl border border-mw-line/70 bg-mw-surface/70 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-xs text-white/80 backdrop-blur">
                  NEWSLETTER • MOTOS
                </div>
                <h4 className="mt-3 text-2xl md:text-3xl font-extrabold text-white">
                  Recibe lo mejor de Motos en tu correo
                </h4>
                <p className="mt-2 text-gray-300 max-w-2xl">
                  Lanzamientos, pruebas y rutas. Pura gasolina.
                </p>
              </div>

              <form
                className="flex flex-col sm:flex-row items-stretch justify-center gap-3"
                onSubmit={(e) => e.preventDefault()}
              >
                <label htmlFor="newsletter-motos-email" className="sr-only">
                  Tu correo electrónico
                </label>
                <input
                  id="newsletter-motos-email"
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
          </div>
        </section>
      </main>

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
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const query = /* groq */ `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == "noticias_motos" ||
        lower(category) == "motos" ||
        "motos" in categories[]
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...30]{
      "id": _id,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "tag": coalesce(contentType, "noticia"),
      "tags": coalesce(tags, []),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt
    }
  `;

  const raw = await sanityReadClient.fetch(query);

  const items: NewsItem[] = (raw ?? []).map((it: any) => {
    const d = it?.publishedAt
      ? new Date(it.publishedAt)
      : it?._createdAt
      ? new Date(it._createdAt)
      : null;

    const when = d
      ? new Intl.DateTimeFormat("es-MX", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }).format(d)
      : "";

    return {
      id: it?.id || "",
      title: it?.title || "",
      excerpt: it?.excerpt || "",
      tag: it?.tag || "noticia",
      tags: Array.isArray(it?.tags) ? it.tags : [],
      when,
      img: it?.img || "/images/noticia-3.jpg",
      slug: `/noticias/motos/${it?.slug || ""}`,
      publishedAt: it?.publishedAt || null,
    };
  });

  return {
    props: {
      items,
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig
      )),
    },
  };
}