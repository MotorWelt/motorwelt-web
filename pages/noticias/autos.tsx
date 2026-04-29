import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ProfileButton from "../../components/ProfileButton";

const nextI18NextConfig = require("../../next-i18next.config.js");

/* ---------- Botón estilo MotorWelt ---------- */
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
      "text-gray-100 border border-white/15 bg-black/20 hover:bg-white/5 hover:border-white/20 focus-visible:ring-white/20",
    link:
      "p-0 text-[#43A1AD] underline underline-offset-4 hover:opacity-80 focus:ring-0 rounded-none shadow-none border-0",
  };
  return (
    <button {...props} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </button>
  );
};

const LinkButton: React.FC<{
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: Variant;
}> = ({ href, className = "", children, variant = "cyan" }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition focus:outline-none focus-visible:ring-2";
  const map: Record<Variant, string> = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus-visible:ring-[#0CE0B2]/40",
    pink:
      "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus-visible:ring-[#FF7A1A]/40",
    ghost:
      "text-gray-100 border border-white/15 bg-black/20 hover:bg-white/5 hover:border-white/20 focus-visible:ring-white/20",
    link:
      "p-0 text-[#43A1AD] underline underline-offset-4 hover:opacity-80 focus:ring-0 rounded-none shadow-none border-0",
  };

  return (
    <Link href={href} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </Link>
  );
};

/* ---------- Helpers ---------- */
function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : "";
}

async function uploadImageToSanity(file: File) {
  const fd = new FormData();
  fd.append("file", file);

  const res = await fetch("/api/ai/admin/content/upload-image", {
    method: "POST",
    body: fd,
  });

  const data = await res.json();
  if (!res.ok || !data?.ok) {
    throw new Error(data?.error || "Upload failed");
  }

  return data as { ok: true; assetId: string; url: string };
}

function sectionMeta(section: string) {
  if (section === "noticias_motos") {
    return {
      label: "Motos",
      href: "/noticias/motos",
      accentDot: "bg-[#43A1AD]",
      glow: "from-[#43A1AD]/40 via-[#43A1AD]/10 to-transparent",
    };
  }

  if (section === "deportes") {
    return {
      label: "Deportes",
      href: "/deportes",
      accentDot: "bg-[#A3FF12]",
      glow: "from-[#A3FF12]/35 via-[#A3FF12]/10 to-transparent",
    };
  }

  if (section === "lifestyle") {
    return {
      label: "Lifestyle",
      href: "/lifestyle",
      accentDot: "bg-[#E2A24C]",
      glow: "from-[#E2A24C]/40 via-[#E2A24C]/10 to-transparent",
    };
  }

  if (section === "tuning") {
    return {
      label: "Tuning",
      href: "/tuning",
      accentDot: "bg-[#FF7A1A]",
      glow: "from-[#FF7A1A]/45 via-[#FF7A1A]/10 to-transparent",
    };
  }

  return {
    label: "MotorWelt",
    href: "/",
    accentDot: "bg-[#0CE0B2]",
    glow: "from-[#0CE0B2]/40 via-[#0CE0B2]/10 to-transparent",
  };
}

type Streak = {
  top: string;
  left: string;
  v: "cool" | "warm" | "lime";
  dir: "fwd" | "rev";
  delay: string;
  dur: string;
  op: number;
  h?: string;
};

/* ---------- Header ---------- */
const SiteHeader: React.FC<{ query: string; onQuery: (v: string) => void }> = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const navLinkClass =
    "inline-flex h-10 items-center leading-none text-gray-200 hover:text-white";

  const mobileLinkClass =
    "block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5";

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-mw-surface/70 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-[1440px] 2xl:max-w-[1560px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 lg:h-[72px] lg:px-8">
          <div className="flex items-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2"
              aria-label="Ir al inicio MotorWelt"
            >
              <Image
                src="/brand/motorwelt-logo.png"
                alt="MotorWelt logo"
                width={280}
                height={64}
                priority
                className="logo-glow h-10 w-auto sm:h-11 md:h-12 lg:h-14"
              />
            </Link>
          </div>

          <div className="hidden md:flex items-center justify-center">
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/tuning" className={navLinkClass}>
                Tuning
              </Link>
              <Link href="/noticias/autos" className={navLinkClass}>
                Autos
              </Link>
              <Link href="/noticias/motos" className={navLinkClass}>
                Motos
              </Link>
              <Link href="/deportes" className={navLinkClass}>
                Deportes
              </Link>
              <Link href="/lifestyle" className={navLinkClass}>
                Lifestyle
              </Link>
              <Link href="/comunidad" className={navLinkClass}>
                Comunidad
              </Link>
            </nav>
          </div>

          <div className="hidden md:flex items-center justify-end">
            <ProfileButton />
          </div>

          <div className="flex items-center justify-end gap-2 md:hidden">
            <ProfileButton />

            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-mw-surface/60 backdrop-blur-md hover:bg-white/5 focus:outline-none"
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />

          <aside
            id="mobile-menu"
            className="absolute right-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-l border-white/10 bg-mw-surface/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
              <Image
                src="/brand/motorwelt-logo.png"
                alt="MotorWelt logo"
                width={140}
                height={32}
                className="h-8 w-auto"
              />
              <button
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5"
                aria-label="Cerrar menú"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d="M6 6l12 12M18 6l-12 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <nav className="px-4 py-3">
              <Link href="/tuning" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Tuning
              </Link>
              <Link href="/noticias/autos" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Autos
              </Link>
              <Link href="/noticias/motos" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Motos
              </Link>
              <Link href="/deportes" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Deportes
              </Link>
              <Link href="/lifestyle" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Lifestyle
              </Link>
              <Link href="/comunidad" className={mobileLinkClass} onClick={() => setMobileOpen(false)}>
                Comunidad
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
};
function SectionHeading({
  title,
  subtle,
  glow = "cool",
  align = "center",
}: {
  title: string;
  subtle?: string;
  glow?: "cool" | "warm";
  align?: "center" | "left";
}) {
  const isLeft = align === "left";

  return (
    <div className={`mb-8 ${isLeft ? "text-left" : "text-center"}`}>
      <h2
        className={`font-display text-3xl font-extrabold tracking-wide text-white ${
          glow === "cool" ? "glow-cool" : "glow-warm"
        }`}
      >
        {title}
      </h2>
      {subtle && (
        <p
          className={`mt-2 text-gray-300 ${
            isLeft ? "max-w-2xl" : "max-w-2xl mx-auto"
          }`}
        >
          {subtle}
        </p>
      )}
      <div
        className={`mt-3 h-1 w-28 rounded-full ${
          isLeft ? "" : "mx-auto"
        } ${
          glow === "cool"
            ? "bg-gradient-to-r from-[#0CE0B2] via-[#A3FF12] to-[#E2A24C]"
            : "bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]"
        }`}
      />
    </div>
  );
}

/* ---------- Types ---------- */
type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  tag: string;
  tags?: string[];
  autoSection?: string;
  autoSectionLabel?: string;
  when: string;
  img: string;
  slug: string;
  publishedAt?: string | null;
};

type LatestArticleData = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  sectionLabel: string;
};

type ExploreItem = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  when: string;
  section: string;
  sectionLabel: string;
  href: string;
};

type EditableAdKind = "leaderboard" | "billboard";

type EditableAdConfig = {
  enabled: boolean;
  label: string;
  imageUrl: string;
  href: string;
};

type AutosPageSettings = {
  heroImageUrl: string;
  ads: {
    leaderboard: EditableAdConfig;
    billboard: EditableAdConfig;
  };
};

type SectionHeroImages = {
  tuning: string;
  autos: string;
  motos: string;
  deportes: string;
  lifestyle: string;
  comunidad: string;
};

const DEFAULT_SECTION_HERO_IMAGES: SectionHeroImages = {
  tuning: "/images/noticia-3.jpg",
  autos: "/images/noticia-1.jpg",
  motos: "/images/noticia-2.jpg",
  deportes: "/images/noticia-3.jpg",
  lifestyle: "/images/comunidad.jpg",
  comunidad: "/images/comunidad.jpg",
};

function sanitizeSectionHeroImages(
  raw?: Partial<SectionHeroImages>
): SectionHeroImages {
  return {
    tuning: String(raw?.tuning || "").trim() || DEFAULT_SECTION_HERO_IMAGES.tuning,
    autos: String(raw?.autos || "").trim() || DEFAULT_SECTION_HERO_IMAGES.autos,
    motos: String(raw?.motos || "").trim() || DEFAULT_SECTION_HERO_IMAGES.motos,
    deportes:
      String(raw?.deportes || "").trim() || DEFAULT_SECTION_HERO_IMAGES.deportes,
    lifestyle:
      String(raw?.lifestyle || "").trim() || DEFAULT_SECTION_HERO_IMAGES.lifestyle,
    comunidad:
      String(raw?.comunidad || "").trim() || DEFAULT_SECTION_HERO_IMAGES.comunidad,
  };
}

const AUTOS_PAGE_SETTINGS_KEY = "mw_autos_page_settings_v1";

const DEFAULT_AUTOS_PAGE_SETTINGS: AutosPageSettings = {
  heroImageUrl: "",
  ads: {
    leaderboard: {
      enabled: true,
      label: "Publicidad — Leaderboard (728×90 / 970×250)",
      imageUrl: "",
      href: "",
    },
    billboard: {
      enabled: true,
      label: "Publicidad — Billboard (970×250 / 970×90)",
      imageUrl: "",
      href: "",
    },
  },
};

function getSlugValue(slug?: string | { current?: string } | null) {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return String(slug.current || "");
}

function normalizeText(value: unknown) {
  if (!value) return "";
  if (Array.isArray(value)) return value.map(normalizeText).join(" ").toLowerCase();
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(item.title || item.name || item.label || item.value || "")
      .trim()
      .toLowerCase();
  }
  return String(value).trim().toLowerCase();
}

function getLatestSectionData(post: any): { label: string; hrefBase: string } | null {
  const blob = [post.section, post.category, post.subcategory, post.categories, post.tags]
    .map(normalizeText)
    .join(" ");

  if (blob.includes("noticias_autos") || blob.includes("autos") || blob.includes("auto")) {
    return { label: "Autos", hrefBase: "/noticias/autos" };
  }
  if (blob.includes("noticias_motos") || blob.includes("motos") || blob.includes("moto")) {
    return { label: "Motos", hrefBase: "/noticias/motos" };
  }
  if (blob.includes("tuning") || blob.includes("builds") || blob.includes("mods")) {
    return { label: "Tuning", hrefBase: "/tuning" };
  }
  if (blob.includes("deportes") || blob.includes("f1") || blob.includes("nascar") || blob.includes("motogp") || blob.includes("wrc") || blob.includes("drift") || blob.includes("rally")) {
    return { label: "Deportes", hrefBase: "/deportes" };
  }
  if (blob.includes("lifestyle") || blob.includes("moda") || blob.includes("relojería") || blob.includes("relojeria") || blob.includes("cine") || blob.includes("fuera del volante")) {
    return { label: "Lifestyle", hrefBase: "/lifestyle" };
  }
  if (blob.includes("comunidad") || blob.includes("evento") || blob.includes("eventos") || blob.includes("meet") || blob.includes("meets") || blob.includes("rutas") || blob.includes("club")) {
    return { label: "Comunidad", hrefBase: "/comunidad" };
  }
  return null;
}

function splitFive(items: NewsItem[]) {
  return {
    left: items.slice(0, 2),
    right: items.slice(2, 5),
  };
}

function normalizeAutoSection(value?: string | null) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (["gasolina", "combustion", "ice", "gas"].includes(raw)) return "gasolina";
  if (["hibridos", "hibrido", "hybrid", "hev", "phev"].includes(raw)) return "hibridos";
  if (["electricos", "electrico", "electric", "ev"].includes(raw)) return "electricos";
  return raw;
}

function autoSectionLabel(value?: string | null) {
  const normalized = normalizeAutoSection(value);
  if (normalized === "gasolina") return "Gasolina";
  if (normalized === "hibridos") return "Híbridos";
  if (normalized === "electricos") return "Eléctricos";
  return "";
}

function itemMatchesAutoSection(
  item: NewsItem,
  sectionKey: "gasolina" | "hibridos" | "electricos",
  fallbackTerms: string[]
) {
  const normalized = normalizeAutoSection(item.autoSection);
  if (normalized) return normalized === sectionKey;

  const haystack = [
    item.title,
    item.excerpt,
    item.tag,
    ...(Array.isArray(item.tags) ? item.tags : []),
  ]
    .join(" ")
    .toLowerCase();

  return fallbackTerms.some((term) => haystack.includes(term.toLowerCase()));
}

function CategoryRail({
  title,
  subtle,
  items,
}: {
  title: string;
  subtle: string;
  items: NewsItem[];
}) {
  return (
    <section className="py-10 sm:py-12">
      <SectionHeading title={title} subtle={subtle} glow="cool" align="left" />

      {items.length > 0 ? (
        <>
          <div className="md:hidden -mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
            <div className="flex gap-4 snap-x snap-mandatory">
              {items.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="h-[320px] w-[320px] min-w-[320px] shrink-0 snap-start"
                      >
                        <NewsCard item={item} imageHeight="h-36" compact />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
            {items.slice(0, 6).map((item) => (
              <NewsCard key={item.id} item={item} imageHeight="h-48" compact />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-[28px] border border-dashed border-white/10 bg-black/25 p-7 text-center backdrop-blur-md">
          <h3 className="text-lg font-semibold text-white">
            Próximas publicaciones
          </h3>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
            Muy pronto aparecerán aquí publicaciones de {title.toLowerCase()}.
          </p>
        </div>
      )}
    </section>
  );
}

function NewsCard({
  item,
  imageHeight = "h-48",
  compact = false,
}: {
  item: NewsItem;
  imageHeight?: string;
  compact?: boolean;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-mw-surface/80 transition will-change-transform hover:-translate-y-[2px] hover:border-white/10">
      <Link href={item.slug} className="block">
        <div className={`relative ${imageHeight}`}>
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes="(max-width: 1280px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-white/10 bg-black/55 px-2 py-0.5 text-xs text-white/90 backdrop-blur">
            {item.tag}
          </span>
        </div>
      </Link>

      <div className={`${compact ? "p-4" : "p-5"} flex flex-1 flex-col`}>
        <div className="text-xs text-gray-300">{item.when}</div>
        <h3
          className={`mt-1 text-white font-semibold leading-tight ${
            compact ? "text-base" : "text-lg"
          }`}
        >
          {item.title}
        </h3>
        <p className="mt-2 text-sm text-gray-300 line-clamp-2">{item.excerpt}</p>

        <div className="mt-auto pb-3 pt-3">
          <LinkButton
            href={item.slug}
            variant={compact ? "link" : "pink"}
            className={
              compact
                ? "text-sm leading-none"
                : "rounded-xl h-10 px-4 py-0 text-sm leading-none"
            }
          >
            {compact ? "Leer más" : "Leer completa →"}
          </LinkButton>
        </div>
      </div>
    </article>
  );
}

function LatestArticleCard({ item }: { item: LatestArticleData }) {
  return (
    <article className="group h-full overflow-hidden rounded-[22px] border border-white/10 bg-mw-surface/80 backdrop-blur-md transition hover:border-white/10">
      <Link href={item.href} className="flex h-full flex-col">
        <div className="relative h-36 w-full overflow-hidden">
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 78vw, 260px"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-transparent" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0CE0B2]" />
            {item.sectionLabel}
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="text-[11px] text-gray-400">{item.when}</div>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-tight text-white transition group-hover:text-[#0CE0B2]">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-300">
            {item.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}

function ExploreCard({
  title,
  subtitle,
  href,
  image,
}: {
  title: string;
  subtitle: string;
  href: string;
  image: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block h-[320px] w-[320px] min-w-[320px] shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-black/25 transition hover:border-white/10 sm:w-[340px] sm:min-w-[340px] lg:h-[290px] lg:w-[390px] lg:min-w-[390px]"
    >
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
          style={{ filter: "brightness(.42) saturate(1.08)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/32 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.09),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(12,224,178,.08),transparent_28%)]" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-6">
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/85 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0CE0B2]" />
            Explora
          </span>
        </div>

        <h3 className="max-w-[85%] text-[2.1rem] font-extrabold leading-[0.92] tracking-tight text-white drop-shadow-[0_6px_20px_rgba(0,0,0,.5)] sm:text-[2.45rem]">
          {title}
        </h3>

        <p className="mt-3 max-w-[88%] text-sm leading-relaxed text-white/88 drop-shadow-[0_4px_14px_rgba(0,0,0,.42)] sm:text-[0.98rem]">
          {subtitle}
        </p>
      </div>
    </Link>
  );
}

export default function NoticiasAutos({
  items = [],
  initialPageSettings = DEFAULT_AUTOS_PAGE_SETTINGS,
  sectionHeroImages = DEFAULT_SECTION_HERO_IMAGES,
  latestItems = [],
}: {
  items?: NewsItem[];
  initialPageSettings?: AutosPageSettings;
  sectionHeroImages?: SectionHeroImages;
  latestItems?: LatestArticleData[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [canEditPage, setCanEditPage] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [pageSettings, setPageSettings] = useState<AutosPageSettings>(
    initialPageSettings || DEFAULT_AUTOS_PAGE_SETTINGS
  );
  const [pageError, setPageError] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);

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
      if (
        e.key === "/" &&
        !(e.target as HTMLElement)?.closest("input, textarea")
      ) {
        e.preventDefault();
        document.getElementById("search-autos")?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    let role = readCookie("mw_role");

    if (!role && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("mw_admin_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          role = parsed?.role || "";
        }
      } catch {
        // ignore
      }
    }

    setCanEditPage(role === "admin" || role === "editor");
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setSpectatorMode(router.query.view === "spectator");
  }, [router.isReady, router.query.view]);

  useEffect(() => {
    setPageSettings(initialPageSettings || DEFAULT_AUTOS_PAGE_SETTINGS);
  }, [initialPageSettings]);



  async function persistPageSettings(next: AutosPageSettings) {
    setPageError(null);

    try {
      const res = await fetch("/api/ai/admin/home/save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageKey: "autos",
          settings: next,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo guardar.");
      }

      setPageSettings(next);
    } catch (err: any) {
      setPageError(err?.message || "No se pudo guardar la configuración de Autos.");
    }
  }

  async function handleHeroImagePick(files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      setPageError(null);
      const uploaded = await uploadImageToSanity(file);
      const next = {
        ...pageSettings,
        heroImageUrl: uploaded.url,
      };
      await persistPageSettings(next);
    } catch (err: any) {
      setPageError(err?.message || "No se pudo subir la portada.");
    }
  }

  async function handleAdImagePick(
    kind: EditableAdKind,
    files?: FileList | null
  ) {
    const file = files?.[0];
    if (!file) return;

    try {
      setPageError(null);
      const uploaded = await uploadImageToSanity(file);
      const next = {
        ...pageSettings,
        ads: {
          ...pageSettings.ads,
          [kind]: {
            ...pageSettings.ads[kind],
            imageUrl: uploaded.url,
          },
        },
      };
      await persistPageSettings(next);
    } catch (err: any) {
      setPageError(err?.message || "No se pudo subir el anuncio.");
    }
  }

  async function toggleAd(kind: EditableAdKind) {
    const next = {
      ...pageSettings,
      ads: {
        ...pageSettings.ads,
        [kind]: {
          ...pageSettings.ads[kind],
          enabled: !pageSettings.ads[kind].enabled,
        },
      },
    };
    void persistPageSettings(next);
  }

  function editAdLink(kind: EditableAdKind) {
    if (typeof window === "undefined") return;
    const current = pageSettings.ads[kind].href || "";
    const href = window.prompt("Pega el link del anuncio:", current);
    if (href === null) return;

    const next = {
      ...pageSettings,
      ads: {
        ...pageSettings.ads,
        [kind]: {
          ...pageSettings.ads[kind],
          href: href.trim(),
        },
      },
    };
    void persistPageSettings(next);
  }

  function clearAdImage(kind: EditableAdKind) {
    const next = {
      ...pageSettings,
      ads: {
        ...pageSettings.ads,
        [kind]: {
          ...pageSettings.ads[kind],
          imageUrl: "",
        },
      },
    };
    void persistPageSettings(next);
  }

  function toggleSpectatorMode() {
    const nextQuery = { ...router.query };

    if (spectatorMode) {
      delete nextQuery.view;
    } else {
      nextQuery.view = "spectator";
    }

    router.push(
      {
        pathname: router.pathname,
        query: nextQuery,
      },
      undefined,
      { shallow: true }
    );
  }

  function renderEditableAd(kind: EditableAdKind, className = "") {
    const ad = pageSettings.ads[kind];
    const editControlsVisible = canEditPage && !spectatorMode;

    if (!ad.enabled && !editControlsVisible) return null;

    const inputRef =
      kind === "leaderboard" ? leaderboardInputRef : billboardInputRef;

    const wrapClass = `
      relative w-full mx-auto overflow-hidden rounded-2xl border border-white/10 bg-mw-surface/70
      ${!ad.enabled && editControlsVisible ? "hidden md:block" : ""}
      ${
        kind === "leaderboard"
          ? "max-w-[970px] aspect-[970/120] min-h-[20px] sm:min-h-[72px] md:min-h-0"
          : "max-w-[970px] aspect-[970/250]"
      }
      ${className}
    `;

    return (
      <div className={wrapClass}>
        {ad.enabled ? (
          ad.imageUrl ? (
            ad.href ? (
              <a
                href={ad.href}
                target="_blank"
                rel="noreferrer"
                className="block h-full w-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ad.imageUrl}
                  alt={ad.label || kind}
                  className="h-full w-full object-cover object-center bg-black/20"
                />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ad.imageUrl}
                alt={ad.label || kind}
                className="h-full w-full object-cover object-center bg-black/20"
              />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-gray-400">
              <span className="px-4 text-[11px] sm:text-xs md:text-sm">
                {ad.label}
              </span>
            </div>
          )
        ) : (
          editControlsVisible && (
            <div className="flex h-full w-full items-center justify-center text-center text-gray-500">
              <span className="px-4 text-[11px] sm:text-xs md:text-sm">
                {ad.label} · oculto
              </span>
            </div>
          )
        )}

        {editControlsVisible && (
          <div className="absolute right-2 top-2 z-20 hidden flex-wrap items-center justify-end gap-2 md:flex">
            <button
              type="button"
              onClick={() => toggleAd(kind)}
              className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              {ad.enabled ? "Ocultar" : "Mostrar"}
            </button>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              Imagen
            </button>
            <button
              type="button"
              onClick={() => editAdLink(kind)}
              className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => clearAdImage(kind)}
              className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-semibold text-red-200 backdrop-blur hover:bg-black/90"
            >
              Limpiar
            </button>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleAdImagePick(kind, e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>
    );
  }

  const editControlsVisible = canEditPage && !spectatorMode;
  const displayItems = filtered.length > 0 ? filtered : safeItems;
  const latestFive = displayItems.slice(0, 5);
  const latestColumns = splitFive(latestFive);
  const moreNews = displayItems.slice(5, 17);
  const gasolineItems = safeItems.filter((item) =>
    itemMatchesAutoSection(item, "gasolina", ["gasolina", "combustión", "combustion", "ice"])
  );
  const hybridItems = safeItems.filter((item) =>
    itemMatchesAutoSection(item, "hibridos", ["híbrido", "hibrido", "hybrid", "phev", "hev"])
  );
  const electricItems = safeItems.filter((item) =>
    itemMatchesAutoSection(item, "electricos", ["eléctrico", "electrico", "electric", "ev"])
  );
  const heroImageSrc =
    pageSettings.heroImageUrl ||
    sectionHeroImages.autos ||
    displayItems[0]?.img ||
    "/images/noticia-2.jpg";

  const streaks: Streak[] = useMemo(
    () => [
      { top: "8%", left: "-35%", v: "cool", dir: "fwd", delay: "0s", dur: "12s", op: 0.85 },
      { top: "12%", left: "-28%", v: "warm", dir: "rev", delay: ".4s", dur: "10.5s", op: 0.75 },
      { top: "20%", left: "-36%", v: "lime", dir: "fwd", delay: "1.0s", dur: "13s", op: 0.8 },
      { top: "28%", left: "-22%", v: "cool", dir: "rev", delay: "1.6s", dur: "9.5s", op: 0.9 },
      { top: "36%", left: "-40%", v: "warm", dir: "fwd", delay: "2.1s", dur: "11.5s", op: 0.7 },
      { top: "44%", left: "-30%", v: "cool", dir: "rev", delay: "2.7s", dur: "12.5s", op: 0.85 },
      { top: "52%", left: "-26%", v: "warm", dir: "fwd", delay: "3.2s", dur: "10.2s", op: 0.8 },
      { top: "60%", left: "-18%", v: "lime", dir: "rev", delay: "3.8s", dur: "12.2s", op: 0.75 },
      { top: "68%", left: "-34%", v: "cool", dir: "fwd", delay: "4.4s", dur: "11.2s", op: 0.85 },
      { top: "76%", left: "-24%", v: "warm", dir: "rev", delay: "5.0s", dur: "9.8s", op: 0.72 },
      { top: "84%", left: "-20%", v: "cool", dir: "fwd", delay: "5.6s", dur: "13.2s", op: 0.82 },
    ],
    []
  );

  return (
    <>
      <Seo
        title="Noticias de Autos | MotorWelt"
        description="Lanzamientos, pruebas y tecnología con ADN MotorWelt."
      />

      <input
        ref={heroInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleHeroImagePick(e.target.files);
          e.currentTarget.value = "";
        }}
      />

      <div className="relative min-h-screen overflow-x-hidden text-gray-100">
        <div className="mw-global-bg" aria-hidden>
          <div className="mw-global-base" />
          {streaks.map((s, i) => (
            <div
              key={i}
              className="streak-wrap"
              style={{
                top: s.top as any,
                left: s.left as any,
                height: s.h ?? undefined,
              }}
            >
              <div
                className={`streak streak-${s.v} ${
                  s.dir === "rev" ? "dir-rev" : "dir-fwd"
                }`}
                style={{
                  opacity: s.op as any,
                  animationDelay: s.delay as any,
                  animationDuration: s.dur as any,
                }}
              />
            </div>
          ))}
        </div>

        {canEditPage && (
          <div className="fixed bottom-4 left-4 z-[80] hidden rounded-2xl border border-white/10 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur md:block">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2] animate-pulse" />
              <span>{spectatorMode ? "Vista espectador" : "Modo edición autos"}</span>
            </div>
            {pageError && <div className="mt-1 text-red-300">{pageError}</div>}
            <button
              type="button"
              onClick={toggleSpectatorMode}
              className="mt-2 rounded-full border border-white/10 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              {spectatorMode ? "Volver a editar" : "Ver como espectador"}
            </button>
          </div>
        )}

        <SiteHeader query={query} onQuery={setQuery} />

        <section className="relative isolate overflow-hidden pt-16 lg:pt-[72px]">
          <div className="relative flex min-h-[48svh] flex-col justify-end overflow-hidden sm:min-h-[54svh] lg:min-h-[60vh]">
            <Image
              src={heroImageSrc}
              alt={displayItems[0]?.title || "Noticias de Autos MotorWelt"}
              fill
              sizes="100vw"
              style={{
                objectFit: "cover",
                filter: "brightness(.38) saturate(1.14)",
              }}
              priority
            />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(12,224,178,.14),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(255,122,26,.16),transparent_30%),linear-gradient(180deg,rgba(0,0,0,.24)_0%,rgba(0,0,0,.45)_38%,rgba(2,10,10,.88)_100%)]" />
            <div className="absolute inset-y-0 left-0 hidden w-[58%] bg-gradient-to-r from-black/75 via-black/45 to-transparent lg:block" />
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#041210] via-[#041210]/70 to-transparent" />

            {editControlsVisible && (
              <div className="absolute right-4 top-20 z-20 hidden flex-wrap gap-2 md:flex">
                <button
                  type="button"
                  onClick={() => heroInputRef.current?.click()}
                  className="rounded-full border border-white/10 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                >
                  Cambiar portada
                </button>
              </div>
            )}

            <div className="relative z-10 w-full px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-16">
              <div className="mx-auto w-full max-w-[1440px] 2xl:max-w-[1560px]">
                <div className="max-w-4xl">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-gray-200 backdrop-blur md:text-[11px]">
                    <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                    Noticias • Autos
                  </div>

                  <h1 className="mt-5 font-display text-[2.8rem] font-black leading-[0.92] tracking-[-0.05em] text-white sm:text-[4rem] md:text-[4.8rem] lg:text-[5.4rem]">
                    <span className="glow-cool block">Noticias</span>
                    <span className="block text-white/95">de Autos</span>
                  </h1>

                  <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
                    Lanzamientos, pruebas, tecnología, diseño y cultura sobre
                    cuatro ruedas con el pulso editorial de MotorWelt.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {pageError && (
          <div className="relative z-20 mx-auto mt-4 w-full max-w-[1440px] 2xl:max-w-[1560px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-white/10 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {pageError}
            </div>
          </div>
        )}

        <section className={`${!pageSettings.ads.leaderboard.enabled && editControlsVisible ? "hidden md:block" : ""} py-4 sm:py-6 relative z-10`}>
          <div className="mx-auto w-full max-w-[1440px] 2xl:max-w-[1560px] px-4 sm:px-6 lg:px-8">
            {renderEditableAd("leaderboard")}
          </div>
        </section>

        <main className="relative z-10 pb-16 mx-auto w-full max-w-[1440px] 2xl:max-w-[1560px] px-4 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <section className="pt-12" aria-labelledby="feed-title">
              <SectionHeading
                title="Sin resultados"
                subtle="Ajusta tu búsqueda o limpia el término para volver a ver todas las publicaciones."
                glow="cool"
              />

              <div className="rounded-[28px] border border-white/10 bg-black/25 p-8 text-center backdrop-blur-md">
                <h3 className="text-white text-xl font-semibold">
                  No hay publicaciones que coincidan
                </h3>
                <p className="text-gray-300 mt-2">
                  Intenta con otro término o regresa al feed completo.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
                  <Button variant="cyan" onClick={() => setQuery("")}>
                    Limpiar búsqueda
                  </Button>
                </div>
              </div>
            </section>
          ) : (
            <>
              <section className="md:hidden py-10 sm:py-12">
                <SectionHeading
                  title="Últimas publicaciones"
                  subtle="La conversación más reciente del universo automotriz."
                  glow="cool"
                  align="left"
                />
                <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                  <div className="flex gap-4 snap-x snap-mandatory">
                    {latestFive.map((item) => (
                      <div
                        key={item.id}
                        className="h-[320px] w-[320px] min-w-[320px] shrink-0 snap-start"
                      >
                        <NewsCard item={item} imageHeight="h-36" compact />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section
                className="hidden md:block py-10 sm:py-12"
                aria-labelledby="feed-title"
              >
                <SectionHeading
                  title="Últimas publicaciones"
                  subtle="La conversación más reciente del universo automotriz."
                  glow="cool"
                  align="left"
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-6">
                    {latestColumns.left.map((item) => (
                      <NewsCard key={item.id} item={item} imageHeight="h-56" />
                    ))}
                  </div>

                  <div className="grid gap-6">
                    {latestColumns.right.map((item) => (
                      <NewsCard
                        key={item.id}
                        item={item}
                        imageHeight="h-44"
                        compact
                      />
                    ))}
                  </div>
                </div>
              </section>

              {moreNews.length > 0 && (
                <>
                  <section className="md:hidden py-10 sm:py-12">
                    <SectionHeading
                      title="Más noticias"
                      subtle="Más cobertura, pruebas, lanzamientos y tecnología."
                      glow="cool"
                      align="left"
                    />
                    <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                      <div className="flex gap-4 snap-x snap-mandatory">
                        {moreNews.slice(0, 5).map((item) => (
                          <div
                            key={item.id}
                            className="h-[320px] w-[320px] min-w-[320px] shrink-0 snap-start"
                      >
                        <NewsCard item={item} imageHeight="h-36" compact />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section
                    className="hidden md:block py-10 sm:py-12"
                    aria-labelledby="grid-title"
                  >
                    <SectionHeading
                      title="Más noticias"
                      subtle="Más cobertura, pruebas, lanzamientos y tecnología."
                      glow="cool"
                      align="left"
                    />

                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 items-stretch">
                      {moreNews.map((n) => (
                        <NewsCard key={n.id} item={n} imageHeight="h-48" />
                      ))}
                    </div>
                  </section>
                </>
              )}
            </>
          )}

          <CategoryRail
            title="Gasolina"
            subtle="Cobertura, pruebas y lanzamientos con motor de combustión."
            items={gasolineItems}
          />

          <CategoryRail
            title="Híbridos"
            subtle="Tecnología híbrida, transición energética y nuevas propuestas."
            items={hybridItems}
          />

          <CategoryRail
            title="Eléctricos"
            subtle="Autos eléctricos, movilidad cero emisiones y performance EV."
            items={electricItems}
          />

          <section className={`${!pageSettings.ads.billboard.enabled && editControlsVisible ? "hidden md:block" : ""} py-8 sm:py-10`}>{renderEditableAd("billboard")}</section>

          <section className="py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1440px] 2xl:max-w-[1560px] px-4 sm:px-6 lg:px-8">
              <SectionHeading
                title="Lo más reciente en MotorWelt"
                subtle="Una selección actualizada con las publicaciones más nuevas de todas las secciones."
                glow="cool"
                align="left"
              />

              {latestItems.length > 0 ? (
                <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
                  <div className="flex snap-x snap-mandatory gap-4">
                    {latestItems.map((item) => (
                      <div
                        key={item.id}
                        className="h-[320px] w-[320px] min-w-[320px] snap-start sm:h-auto sm:w-[300px] sm:min-w-[300px] lg:w-[280px] lg:min-w-[280px]"
                      >
                        <LatestArticleCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-white/10 bg-black/25 p-7 text-center backdrop-blur-md">
                  <h3 className="text-lg font-semibold text-white">
                    Próximas publicaciones
                  </h3>
                  <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-gray-300">
                    En cuanto publiques más contenido en MotorWelt, aparecerá aquí automáticamente.
                  </p>
                </div>
              )}
            </div>
          </section>

          <section className="pt-10 pb-4 sm:py-12">
            <div className="mx-auto w-full max-w-[1440px] 2xl:max-w-[1560px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                  Explore MotorWelt
                </p>

                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                  Seguir explorando MotorWelt
                </h2>

                <div className="mt-3 h-1 w-24 rounded-full bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]" />

                <p className="mt-4 max-w-2xl text-sm text-gray-300">
                  Sigue navegando entre más historias, coberturas y cultura editorial dentro del universo MotorWelt.
                </p>
              </div>

              <div className="no-scrollbar overflow-x-auto pb-3 sm:pb-6">
                <div className="flex items-start gap-5 pr-12">
                  <ExploreCard
                    title="Tuning"
                    subtitle="Builds, mods, aero, stance y cultura visual."
                    href="/tuning"
                    image={sectionHeroImages.tuning}
                  />
                  <ExploreCard
                    title="Autos"
                    subtitle="Nuevos lanzamientos, pruebas y contexto editorial."
                    href="/noticias/autos"
                    image={sectionHeroImages.autos}
                  />
                  <ExploreCard
                    title="Motos"
                    subtitle="Pruebas, rutas y piezas con ADN de dos ruedas."
                    href="/noticias/motos"
                    image={sectionHeroImages.motos}
                  />
                  <ExploreCard
                    title="Deportes"
                    subtitle="Competencia, paddock y piezas con peso visual real."
                    href="/deportes"
                    image={sectionHeroImages.deportes}
                  />
                  <ExploreCard
                    title="Lifestyle"
                    subtitle="La capa aspiracional y estética del universo MotorWelt."
                    href="/lifestyle"
                    image={sectionHeroImages.lifestyle}
                  />
                  <ExploreCard
                    title="Comunidad"
                    subtitle="Eventos, meets, rutas y cultura desde la calle."
                    href="/comunidad"
                    image={sectionHeroImages.comunidad}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="relative z-10 mt-0 border-t border-white/10 bg-mw-surface/70 py-10 text-gray-300 backdrop-blur-md">
          <div className="mx-auto grid w-full max-w-[1440px] 2xl:max-w-[1560px] gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            <div>
              <Image
                src="/brand/motorwelt-logo.png"
                alt="MotorWelt logo"
                width={160}
                height={36}
                className="logo-glow h-9 w-auto"
              />
              <p className="mt-2 text-sm">
                Cultura automotriz, motociclismo, tuning y comunidad con enfoque
                visual, editorial y aspiracional.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Enlaces</h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    Sobre nosotros
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link href="/terminos" className="hover:text-white">
                    Términos y condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/privacidad" className="hover:text-white">
                    Política de privacidad
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">
                Redes sociales
              </h4>
              <div className="mt-2 flex gap-4">
                <a
                  href="https://www.instagram.com/motorwelt_?igsh=Nmc4bGRmdmJsenBm"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#43A1AD] hover:text-white"
                >
                  IG
                </a>
                <a
                  href="https://www.facebook.com/share/18JRxV8AAu/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#43A1AD] hover:text-white"
                >
                  FB
                </a>
                <a
                  href="https://www.tiktok.com/@itsgabicho?_r=1&_t=ZS-95i81zqyEei"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#43A1AD] hover:text-white"
                >
                  TikTok
                </a>
                <a
                  href="https://youtube.com/@motorweltmx?si=mNFID1x-2Z81Q4yo"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#43A1AD] hover:text-white"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>

          <p className="mt-6 px-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} MotorWelt. Todos los derechos
            reservados.
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .mw-global-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }
        .mw-global-base {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(
              120% 80% at 20% 10%,
              rgba(0, 0, 0, 0.15) 0%,
              transparent 60%
            ),
            radial-gradient(
              120% 80% at 80% 90%,
              rgba(0, 0, 0, 0.18) 0%,
              transparent 60%
            ),
            linear-gradient(
              180deg,
              rgba(4, 18, 16, 0.85),
              rgba(4, 18, 16, 0.85)
            );
        }
        .streak-wrap {
          position: absolute;
          width: 220%;
          height: 2px;
          transform: rotate(-12deg);
        }
        .streak {
          position: absolute;
          left: 0;
          top: 0;
          width: 220%;
          height: 100%;
          will-change: transform, opacity;
          filter: blur(0.5px);
        }
        @keyframes slide-fwd {
          0% { transform: translateX(-30%); opacity: 0; }
          10% { opacity: 0.9; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        @keyframes slide-rev {
          0% { transform: translateX(130%); opacity: 0; }
          10% { opacity: 0.9; }
          100% { transform: translateX(-30%); opacity: 0; }
        }
        .streak.dir-fwd { animation: slide-fwd 11s linear infinite; }
        .streak.dir-rev { animation: slide-rev 11s linear infinite; }
        .streak-cool {
          background: linear-gradient(90deg, transparent, rgba(12, 224, 178, 0.95), transparent);
        }
        .streak-warm {
          background: linear-gradient(90deg, transparent, rgba(255, 122, 26, 0.95), transparent);
        }
        .streak-lime {
          background: linear-gradient(90deg, transparent, rgba(163, 255, 18, 0.9), transparent);
        }
        .glow-cool {
          text-shadow: 0 0 14px rgba(12, 224, 178, 0.25);
        }
        .glow-warm {
          text-shadow: 0 0 14px rgba(255, 122, 26, 0.25);
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .streak {
            animation: none !important;
            opacity: 0.35;
          }
        }

        @supports (content-visibility: auto) {
          main > section {
            content-visibility: auto;
            contain-intrinsic-size: 1px 1000px;
          }
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps({ locale }: { locale: string }) {
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const autosQuery = /* groq */ `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == "noticias_autos" ||
        lower(category) == "autos" ||
        "autos" in categories[]
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...30]{
      "id": _id,
      "title": coalesce(title, ""),
      "excerpt": coalesce(subtitle, excerpt, seoDescription, ""),
      "tag": coalesce(contentType, "noticia"),
      "tags": coalesce(tags, []),
      "autoSection": coalesce(autoSection, autosSection, autoCategory, propulsionType, powertrainType, fuelType, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt
    }
  `;

  const autosSettingsQuery = /* groq */ `
    *[
      _type in ["sitePageSettings", "pageSettings", "homeSettings"] &&
      (
        pageKey == "autos" ||
        page == "autos" ||
        slug.current == "autos"
      )
    ][0]{
      "heroImageUrl": coalesce(heroImageUrl, ""),
      "ads": {
        "leaderboard": {
          "enabled": coalesce(ads.leaderboard.enabled, true),
          "label": coalesce(ads.leaderboard.label, "Publicidad — Leaderboard (728×90 / 970×250)"),
          "imageUrl": coalesce(ads.leaderboard.imageUrl, ""),
          "href": coalesce(ads.leaderboard.href, "")
        },
        "billboard": {
          "enabled": coalesce(ads.billboard.enabled, true),
          "label": coalesce(ads.billboard.label, "Publicidad — Billboard (970×250 / 970×90)"),
          "imageUrl": coalesce(ads.billboard.imageUrl, ""),
          "href": coalesce(ads.billboard.href, "")
        }
      }
    }
  `;

  const sectionSettingsQuery = /* groq */ `
    *[
      _type in ["sitePageSettings", "pageSettings", "homeSettings"] &&
      pageKey in ["tuning", "autos", "motos", "deportes", "lifestyle", "comunidad"]
    ]{
      pageKey,
      "heroImageUrl": coalesce(heroImageUrl, "")
    }
  `;

  const latestQuery = /* groq */ `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado"
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...24]{
      _id,
      title,
      excerpt,
      subtitle,
      seoDescription,
      slug,
      publishedAt,
      _createdAt,
      section,
      category,
      subcategory,
      categories,
      tags,
      "mainImageUrl": coalesce(
        mainImageUrl,
        coverImage.asset->url,
        mainImage.asset->url,
        heroImage.asset->url,
        image.asset->url,
        galleryUrls[0]
      ),
      "galleryUrls": coalesce(galleryUrls, [])
    }
  `;

  const [raw, autosSettingsRaw, sectionSettingsRaw, latestRaw] = await Promise.all([
    sanityReadClient.fetch(autosQuery),
    sanityReadClient.fetch(autosSettingsQuery).catch(() => null),
    sanityReadClient.fetch(sectionSettingsQuery).catch(() => []),
    sanityReadClient.fetch(latestQuery).catch(() => []),
  ]);

  const formatWhen = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  };

  const items: NewsItem[] = (raw ?? []).map((it: any) => ({
    id: String(it?.id || ""),
    title: String(it?.title || ""),
    excerpt: String(it?.excerpt || ""),
    tag: String(it?.tag || "noticia"),
    tags: Array.isArray(it?.tags) ? it.tags.filter(Boolean).map((tag: unknown) => String(tag)) : [],
    autoSection: normalizeAutoSection(it?.autoSection),
    autoSectionLabel: autoSectionLabel(it?.autoSection),
    when: formatWhen(it?.publishedAt || it?._createdAt),
    img: String(it?.img || "/images/noticia-2.jpg"),
    slug: `/noticias/autos/${String(it?.slug || "")}`,
    publishedAt: it?.publishedAt || null,
  }));

  const latestItems: LatestArticleData[] = (Array.isArray(latestRaw) ? latestRaw : [])
    .map((it: any) => {
      const slug = getSlugValue(it?.slug);
      if (!slug) return null;

      const sectionData = getLatestSectionData(it);
      if (!sectionData) return null;

      const img =
        String(it?.mainImageUrl || "").trim() ||
        (Array.isArray(it?.galleryUrls) && it.galleryUrls[0]
          ? String(it.galleryUrls[0])
          : "/images/noticia-3.jpg");

      return {
        id: String(it?._id || slug),
        title: String(it?.title || ""),
        excerpt: String(
          it?.excerpt ||
            it?.subtitle ||
            it?.seoDescription ||
            "Lee la publicación completa en MotorWelt."
        ),
        img,
        href: `${sectionData.hrefBase}/${slug}`,
        when: formatWhen(it?.publishedAt || it?._createdAt),
        sectionLabel: sectionData.label,
      };
    })
    .filter(Boolean)
    .slice(0, 18) as LatestArticleData[];

  const initialPageSettings: AutosPageSettings = {
    heroImageUrl:
      String(autosSettingsRaw?.heroImageUrl || "").trim() ||
      DEFAULT_AUTOS_PAGE_SETTINGS.heroImageUrl,
    ads: {
      leaderboard: {
        enabled: Boolean(autosSettingsRaw?.ads?.leaderboard?.enabled ?? true),
        label:
          String(autosSettingsRaw?.ads?.leaderboard?.label || "").trim() ||
          DEFAULT_AUTOS_PAGE_SETTINGS.ads.leaderboard.label,
        imageUrl: String(autosSettingsRaw?.ads?.leaderboard?.imageUrl || "").trim(),
        href: String(autosSettingsRaw?.ads?.leaderboard?.href || "").trim(),
      },
      billboard: {
        enabled: Boolean(autosSettingsRaw?.ads?.billboard?.enabled ?? true),
        label:
          String(autosSettingsRaw?.ads?.billboard?.label || "").trim() ||
          DEFAULT_AUTOS_PAGE_SETTINGS.ads.billboard.label,
        imageUrl: String(autosSettingsRaw?.ads?.billboard?.imageUrl || "").trim(),
        href: String(autosSettingsRaw?.ads?.billboard?.href || "").trim(),
      },
    },
  };

  const settingsMap = new Map<string, string>();
  if (Array.isArray(sectionSettingsRaw)) {
    for (const item of sectionSettingsRaw) {
      const key = String(item?.pageKey || "").trim();
      const value = String(item?.heroImageUrl || "").trim();
      if (key && value) settingsMap.set(key, value);
    }
  }

  const sectionHeroImages = sanitizeSectionHeroImages({
    tuning: settingsMap.get("tuning"),
    autos: settingsMap.get("autos") || initialPageSettings.heroImageUrl || items[0]?.img,
    motos: settingsMap.get("motos"),
    deportes: settingsMap.get("deportes"),
    lifestyle: settingsMap.get("lifestyle"),
    comunidad: settingsMap.get("comunidad"),
  });

  return {
    props: {
      items,
      initialPageSettings,
      sectionHeroImages,
      latestItems,
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig
      )),
    },
  };
}
