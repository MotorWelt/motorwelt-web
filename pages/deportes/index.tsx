// pages/deportes/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";

const nextI18NextConfig = require("../../next-i18next.config.js");

type ButtonVariant = "cyan" | "pink" | "link";
type SportKey = "F1" | "Nascar" | "MotoGP" | "WRC" | "Drift";
type AdKind = "leaderboard" | "billboard";

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

type ArticleCardData = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  sport: SportKey;
  authorName: string;
};

type RecentCardData = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  sectionLabel: string;
  authorName: string;
};

type AdConfig = {
  enabled: boolean;
  label: string;
  imageUrl: string;
  href: string;
};

type SectionHeroImages = {
  tuning: string;
  autos: string;
  motos: string;
  deportes: string;
  lifestyle: string;
  comunidad: string;
};

type DeportesPageSettings = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    billboard: AdConfig;
  };
};

type RawPost = {
  _id?: string;
  title?: string;
  excerpt?: string;
  subtitle?: string;
  seoDescription?: string;
  slug?: string | { current?: string };
  mainImageUrl?: string;
  coverImage?: { asset?: { url?: string } };
  image?: { asset?: { url?: string } };
  heroImage?: { asset?: { url?: string } };
  galleryUrls?: string[];
  publishedAt?: string;
  _createdAt?: string;
  section?: string;
  category?: string;
  subcategory?: string;
  sport?: string;
  contentType?: string;
  categories?: string[];
  tags?: Array<
    string | { title?: string; name?: string; label?: string; value?: string }
  >;
  authorName?: string;
  author?: { name?: string };
};

const SPORTS: SportKey[] = ["F1", "Nascar", "MotoGP", "WRC", "Drift"];

const DEFAULT_SECTION_HERO_IMAGES: SectionHeroImages = {
  tuning: "/images/noticia-2.jpg",
  autos: "/images/noticia-1.jpg",
  motos: "/images/noticia-3.jpg",
  deportes: "/images/noticia-3.jpg",
  lifestyle: "/images/noticia-1.jpg",
  comunidad: "/images/comunidad.jpg",
};

const DEFAULT_SETTINGS: DeportesPageSettings = {
  heroImageUrl: "/images/noticia-3.jpg",
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

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)"),
  );
  return match ? decodeURIComponent(match[2]) : "";
}

async function uploadAssetToSanity(file: File) {
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

const getButtonClasses = (variant: ButtonVariant = "cyan", className = "") => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold text-white transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

  const styles: Record<ButtonVariant, string> = {
    cyan: "border border-white/10 bg-white/[0.035] shadow-[0_0_18px_rgba(12,224,178,.22),inset_0_0_0_1px_rgba(255,255,255,.035)] hover:bg-white/5 hover:shadow-[0_0_24px_rgba(12,224,178,.32),inset_0_0_0_1px_rgba(255,255,255,.05)] focus-visible:ring-[#0CE0B2]/35",
    pink: "border border-white/10 bg-white/[0.035] shadow-[0_0_18px_rgba(255,122,26,.24),inset_0_0_0_1px_rgba(255,255,255,.035)] hover:bg-white/5 hover:shadow-[0_0_24px_rgba(255,122,26,.34),inset_0_0_0_1px_rgba(255,255,255,.05)] focus-visible:ring-[#FF7A1A]/35",
    link: "border border-white/10 bg-white/[0.035] px-4 py-2 text-xs no-underline shadow-[0_0_18px_rgba(255,122,26,.22),inset_0_0_0_1px_rgba(255,255,255,.035)] hover:bg-white/5 hover:shadow-[0_0_24px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,255,255,.05)] focus-visible:ring-[#FF7A1A]/35",
  };

  return `${base} ${styles[variant]} ${className}`.trim();
};

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
    children: React.ReactNode;
    variant?: ButtonVariant;
  }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  return (
    <button {...props} className={getButtonClasses(variant, className)}>
      {children}
    </button>
  );
};

function formatWhen(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

function normalizeText(value: unknown) {
  if (!value) return "";
  if (Array.isArray(value))
    return value.map(normalizeText).join(" ").toLowerCase();
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(item.title || item.name || item.label || item.value || "")
      .trim()
      .toLowerCase();
  }
  return String(value).trim().toLowerCase();
}

function detectSport(post: RawPost): SportKey {
  const controlledFields = [
    post.sport,
    post.category,
    post.subcategory,
    post.categories,
    post.tags,
  ]
    .map(normalizeText)
    .join(" ");

  const controlledExact = controlledFields
    .split(/\s|,|;|\||\//g)
    .map((v) => v.trim())
    .filter(Boolean);

  if (
    controlledExact.includes("f1") ||
    controlledFields.includes("formula 1") ||
    controlledFields.includes("fórmula 1") ||
    controlledFields.includes("formula uno")
  ) {
    return "F1";
  }

  if (controlledFields.includes("nascar")) return "Nascar";

  if (
    controlledFields.includes("motogp") ||
    controlledFields.includes("moto gp")
  ) {
    return "MotoGP";
  }

  if (
    controlledExact.includes("wrc") ||
    controlledFields.includes("world rally") ||
    controlledFields.includes("rally")
  ) {
    return "WRC";
  }

  if (
    controlledFields.includes("drift") ||
    controlledFields.includes("drifting")
  ) {
    return "Drift";
  }

  const titleBlob = normalizeText(post.title);

  if (
    titleBlob.includes("f1") ||
    titleBlob.includes("formula 1") ||
    titleBlob.includes("fórmula 1")
  ) {
    return "F1";
  }

  if (titleBlob.includes("nascar")) return "Nascar";
  if (titleBlob.includes("motogp") || titleBlob.includes("moto gp"))
    return "MotoGP";
  if (titleBlob.includes("wrc") || titleBlob.includes("rally")) return "WRC";
  if (titleBlob.includes("drift")) return "Drift";

  return "F1";
}

function isLifestyleMarker(value: unknown) {
  const text = normalizeText(value);
  return (
    text === "lifestyle" ||
    text.includes("lifestyle") ||
    text.includes("life style") ||
    text.includes("estilo de vida")
  );
}

function isDeportesPost(post: RawPost) {
  const section = normalizeText(post.section);
  const category = normalizeText(post.category);
  const categories = Array.isArray(post.categories)
    ? post.categories.map(normalizeText)
    : [];

  const hasLifestyleMarker =
    isLifestyleMarker(post.section) ||
    isLifestyleMarker(post.category) ||
    isLifestyleMarker(post.subcategory) ||
    (Array.isArray(post.categories) &&
      post.categories.some(isLifestyleMarker)) ||
    (Array.isArray(post.tags) && post.tags.some(isLifestyleMarker));

  if (hasLifestyleMarker) return false;

  return (
    section === "deportes" ||
    category === "deportes" ||
    categories.includes("deportes")
  );
}

function getSlugValue(slug: RawPost["slug"]) {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return slug.current || "";
}

function imageFromPost(post: RawPost) {
  return (
    post.mainImageUrl ||
    post.coverImage?.asset?.url ||
    post.image?.asset?.url ||
    post.heroImage?.asset?.url ||
    post.galleryUrls?.[0] ||
    "/images/noticia-3.jpg"
  );
}

function getSectionLabel(post: RawPost) {
  const section = normalizeText(post.section);
  const category = normalizeText(post.category);
  const categories = Array.isArray(post.categories)
    ? post.categories.map(normalizeText)
    : [];

  const value = section || category || categories[0] || "";

  if (value.includes("tuning")) return "Tuning";
  if (value.includes("autos")) return "Autos";
  if (value.includes("motos")) return "Motos";
  if (value.includes("deportes")) return "Deportes";
  if (value.includes("lifestyle")) return "Lifestyle";
  if (value.includes("comunidad")) return "Comunidad";

  return "MotorWelt";
}

function hrefFromPost(post: RawPost) {
  const slug = getSlugValue(post.slug);
  if (!slug) return "/";

  const section = normalizeText(post.section);
  const category = normalizeText(post.category);
  const categories = Array.isArray(post.categories)
    ? post.categories.map(normalizeText)
    : [];

  const value = [section, category, ...categories].join(" ");

  if (value.includes("deportes")) return `/deportes/${slug}`;
  if (value.includes("tuning")) return `/tuning/${slug}`;
  if (value.includes("motos")) return `/noticias/motos/${slug}`;
  if (value.includes("autos")) return `/noticias/autos/${slug}`;
  if (value.includes("lifestyle")) return `/lifestyle/${slug}`;
  if (value.includes("comunidad")) return `/comunidad/${slug}`;

  return `/noticias/autos/${slug}`;
}

function sanitizeAd(raw: any, fallback: AdConfig): AdConfig {
  return {
    enabled: Boolean(raw?.enabled ?? fallback.enabled),
    label: String(raw?.label || "").trim() || fallback.label,
    imageUrl: String(raw?.imageUrl || "").trim(),
    href: String(raw?.href || "").trim(),
  };
}

function sanitizePageSettings(
  raw?: Partial<DeportesPageSettings> | null,
  fallbackHero = DEFAULT_SETTINGS.heroImageUrl,
): DeportesPageSettings {
  return {
    heroImageUrl:
      String(raw?.heroImageUrl || "").trim() ||
      fallbackHero ||
      DEFAULT_SETTINGS.heroImageUrl,
    ads: {
      leaderboard: sanitizeAd(
        raw?.ads?.leaderboard,
        DEFAULT_SETTINGS.ads.leaderboard,
      ),
      billboard: sanitizeAd(
        raw?.ads?.billboard,
        DEFAULT_SETTINGS.ads.billboard,
      ),
    },
  };
}

function sanitizeSectionHeroImages(
  raw?: Partial<SectionHeroImages>,
): SectionHeroImages {
  return {
    tuning:
      String(raw?.tuning || "").trim() || DEFAULT_SECTION_HERO_IMAGES.tuning,
    autos: String(raw?.autos || "").trim() || DEFAULT_SECTION_HERO_IMAGES.autos,
    motos: String(raw?.motos || "").trim() || DEFAULT_SECTION_HERO_IMAGES.motos,
    deportes:
      String(raw?.deportes || "").trim() ||
      DEFAULT_SECTION_HERO_IMAGES.deportes,
    lifestyle:
      String(raw?.lifestyle || "").trim() ||
      DEFAULT_SECTION_HERO_IMAGES.lifestyle,
    comunidad:
      String(raw?.comunidad || "").trim() ||
      DEFAULT_SECTION_HERO_IMAGES.comunidad,
  };
}

function Card({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-mw-surface/72 backdrop-blur-md transition hover:border-white/12 ${className}`}
    >
      {children}
    </div>
  );
}

function EmptySectionNotice({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/[0.08] bg-mw-surface/60 p-8 text-center backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04]">
        <span className="h-2.5 w-2.5 rounded-full bg-[#0CE0B2]" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-300">
        {message}
      </p>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
  accent = "cool",
}: {
  eyebrow: string;
  title: string;
  description: string;
  accent?: "cool" | "warm" | "lime";
}) {
  const lineClass =
    accent === "warm"
      ? "from-[#FF7A1A]/70 via-[#E2A24C]/55 to-[#0CE0B2]/55"
      : accent === "lime"
        ? "from-[#A3FF12]/60 via-[#0CE0B2]/55 to-[#FF7A1A]/60"
        : "from-[#0CE0B2]/60 via-[#43A1AD]/55 to-[#E2A24C]/55";

  return (
    <div className="mb-8 sm:mb-10">
      <p className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
        {title}
      </h2>
      <div
        className={`mt-3 h-px w-28 rounded-full bg-gradient-to-r ${lineClass}`}
      />
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function ArticleCard({
  item,
  featured = false,
  mobileSize = false,
}: {
  item: ArticleCardData;
  featured?: boolean;
  mobileSize?: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={
        mobileSize
          ? "block h-[270px] w-[290px] min-w-[290px] shrink-0 snap-start"
          : "block h-full w-full md:max-w-[82%]"
      }
    >
      <Card className="group hover:-translate-y-[2px] hover:shadow-[0_0_24px_rgba(255,255,255,.045)]">
        <div
          className={`relative w-full ${
            featured ? "h-64 sm:h-[340px]" : mobileSize ? "h-[112px]" : "h-40"
          }`}
        >
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes={
              mobileSize
                ? "290px"
                : featured
                  ? "(max-width: 1024px) 100vw, 58vw"
                  : "(max-width: 1024px) 100vw, 27vw"
            }
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/66 via-black/14 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white/90 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
            {item.sport}
          </span>
        </div>

        <div
          className={
            mobileSize
              ? "flex min-h-0 flex-1 flex-col p-4"
              : "flex flex-1 flex-col p-4 sm:p-5"
          }
        >
          <h3
            className={`font-semibold leading-tight text-white ${
              featured
                ? "text-2xl sm:text-3xl"
                : mobileSize
                  ? "line-clamp-2 text-[1rem]"
                  : "line-clamp-2 text-lg"
            }`}
          >
            {item.title}
          </h3>
          <p
            className={
              mobileSize
                ? "mt-2 line-clamp-2 text-[12px] leading-relaxed text-gray-300"
                : "mt-2 line-clamp-2 text-sm leading-relaxed text-gray-300"
            }
          >
            {item.excerpt}
          </p>
          <div
            className={
              mobileSize
                ? "mt-auto flex flex-wrap items-center gap-1.5 pt-2 text-[10.5px] leading-tight text-gray-400"
                : "mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400"
            }
          >
            {item.authorName ? <span>Por {item.authorName}</span> : null}
            {item.authorName && item.when ? (
              <span className="text-gray-600">•</span>
            ) : null}
            {item.when ? <span>{item.when}</span> : null}
          </div>
          <div className={mobileSize ? "hidden" : "mt-auto pt-4 md:block"}>
            <span
              className={getButtonClasses(
                "pink",
                "h-10 rounded-xl px-4 py-0 text-sm leading-none",
              )}
            >
              Leer más
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function RecentMotorWeltCard({ item }: { item: RecentCardData }) {
  return (
    <article className="group h-full overflow-hidden rounded-[22px] border border-white/[0.08] bg-mw-surface/80 backdrop-blur-md transition hover:border-white/12">
      <Link href={item.href} className="flex h-full flex-col">
        <div className="relative h-36 w-full overflow-hidden">
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 78vw, 280px"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-transparent" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur">
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
      className="group relative block h-[270px] w-[290px] min-w-[290px] shrink-0 overflow-hidden rounded-[28px] border border-white/[0.08] bg-black/25 transition hover:border-white/14 sm:w-[340px] sm:min-w-[340px] lg:h-[290px] lg:w-[390px] lg:min-w-[390px]"
    >
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]"
          style={{ filter: "brightness(.42) saturate(1.08)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/32 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,.08),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(12,224,178,.07),transparent_28%)]" />
      </div>

      <div className="absolute inset-0 z-10 flex flex-col justify-end p-5 sm:p-6">
        <div className="mb-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/28 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/85 backdrop-blur">
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

function Header({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.08] bg-mw-surface/70 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-[1440px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 lg:h-[72px] xl:px-10 2xl:max-w-[1560px]">
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

          <div className="hidden items-center justify-center md:flex">
            <nav className="flex items-center gap-6 text-sm font-medium xl:gap-8 xl:text-[15px]">
              <Link
                href="/tuning"
                className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
              >
                Tuning
              </Link>
              <Link
                href="/noticias/autos"
                className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
              >
                Autos
              </Link>
              <Link
                href="/noticias/motos"
                className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
              >
                Motos
              </Link>
              <Link
                href="/deportes"
                className="inline-flex h-10 items-center leading-none text-white"
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
            </nav>
          </div>

          <div className="hidden items-center justify-end md:flex">
            <ProfileButton />
          </div>

          <div className="flex items-center justify-end gap-2 md:hidden">
            <ProfileButton />
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-mw-surface/60 backdrop-blur-md hover:bg-white/5 focus:outline-none"
              aria-label="Abrir menú"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
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
            className="absolute right-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-l border-white/[0.08] bg-mw-surface/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-4">
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
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
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
              {[
                ["Tuning", "/tuning"],
                ["Autos", "/noticias/autos"],
                ["Motos", "/noticias/motos"],
                ["Deportes", "/deportes"],
                ["Lifestyle", "/lifestyle"],
                ["Comunidad", "/comunidad"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function Footer({ year }: { year: number }) {
  return (
    <footer className="relative z-10 mt-12 border-t border-white/[0.08] bg-mw-surface/70 py-10 text-gray-300 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8 2xl:max-w-[1560px]">
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
          <h4 className="text-lg font-semibold text-white">Links</h4>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link href="/about" className="hover:text-white">
                Acerca de
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
          <h4 className="text-lg font-semibold text-white">Socials</h4>
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
        © {year} MotorWelt. Todos los derechos reservados.
      </p>
    </footer>
  );
}

function EditableAd({
  ad,
  kind,
  inputRef,
  editable,
  onPick,
  onToggle,
  onEditLink,
  onClear,
}: {
  ad: AdConfig;
  kind: AdKind;
  inputRef: React.RefObject<HTMLInputElement | null>;
  editable: boolean;
  onPick: (files?: FileList | null) => void;
  onToggle: () => void;
  onEditLink: () => void;
  onClear: () => void;
}) {
  if (!ad.enabled && !editable) return null;

  const wrapClass = `
    relative w-full mx-auto overflow-hidden rounded-2xl border border-white/[0.08] bg-mw-surface/70
    ${
      kind === "leaderboard"
        ? "max-w-[970px] aspect-[970/120] min-h-[20px] sm:min-h-[72px] md:min-h-0"
        : "max-w-[970px] aspect-[970/250]"
    }
  `;

  const imageClass = "h-full w-full object-cover object-center bg-black/20";

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
              <img
                src={ad.imageUrl}
                alt={ad.label || kind}
                className={imageClass}
              />
            </a>
          ) : (
            <img
              src={ad.imageUrl}
              alt={ad.label || kind}
              className={imageClass}
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
        editable && (
          <div className="flex h-full w-full items-center justify-center text-center text-gray-500">
            <span className="px-4 text-[11px] sm:text-xs md:text-sm">
              {ad.label} · oculto
            </span>
          </div>
        )
      )}

      {editable && (
        <div className="absolute right-2 top-2 z-20 hidden flex-wrap items-center justify-end gap-2 md:flex">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            {ad.enabled ? "Ocultar" : "Mostrar"}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            Imagen
          </button>
          <button
            type="button"
            onClick={onEditLink}
            className="rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            Link
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-red-400/35 bg-black/70 px-3 py-1 text-[10px] font-semibold text-red-200 backdrop-blur hover:bg-black/90"
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
          onPick(e.target.files);
          e.currentTarget.value = "";
        }}
      />
    </div>
  );
}

export default function DeportesPage({
  year,
  deportesItems = [],
  recentItems = [],
  initialSettings = DEFAULT_SETTINGS,
  sectionHeroImages = DEFAULT_SECTION_HERO_IMAGES,
}: {
  year: number;
  deportesItems?: ArticleCardData[];
  recentItems?: RecentCardData[];
  initialSettings?: DeportesPageSettings;
  sectionHeroImages?: SectionHeroImages;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<DeportesPageSettings>(
    sanitizePageSettings(initialSettings, initialSettings?.heroImageUrl),
  );

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);

  const featured = deportesItems[0] || null;
  const latest = deportesItems.slice(0, 8);
  const recentMotorWelt = recentItems.slice(0, 8);

  const grouped = useMemo(() => {
    return SPORTS.reduce(
      (acc, sport) => {
        acc[sport] = deportesItems.filter((item) => item.sport === sport);
        return acc;
      },
      {} as Record<SportKey, ArticleCardData[]>,
    );
  }, [deportesItems]);

  const safeSectionHeroImages = sanitizeSectionHeroImages(sectionHeroImages);
  const heroImage =
    settings.heroImageUrl || featured?.img || DEFAULT_SETTINGS.heroImageUrl;
  const editControlsVisible = canEdit && !spectatorMode;
  const desktopEditControlsVisible = editControlsVisible;
  const showLeaderboardAd =
    settings.ads.leaderboard.enabled || desktopEditControlsVisible;
  const showBillboardAd =
    settings.ads.billboard.enabled || desktopEditControlsVisible;

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [router.asPath]);

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

    setCanEdit(role === "admin" || role === "editor");
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setSpectatorMode(router.query.view === "spectator");
  }, [router.isReady, router.query.view]);

  useEffect(() => {
    setSettings(
      sanitizePageSettings(initialSettings, initialSettings?.heroImageUrl),
    );
  }, [initialSettings]);

  async function persistSettings(nextSettings: DeportesPageSettings) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/admin/home/save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageKey: "deportes",
          settings: nextSettings,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo guardar.");
      }

      setSettings(nextSettings);
    } catch (err: any) {
      setError(err?.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  }

  async function handleHeroImagePick(files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadAssetToSanity(file);
      const next = {
        ...settings,
        heroImageUrl: uploaded.url,
      };
      await persistSettings(next);
    } catch (err: any) {
      setError(err?.message || "No se pudo subir la portada.");
    }
  }

  async function handleAdImagePick(kind: AdKind, files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadAssetToSanity(file);
      const next = {
        ...settings,
        ads: {
          ...settings.ads,
          [kind]: {
            ...settings.ads[kind],
            imageUrl: uploaded.url,
          },
        },
      };
      await persistSettings(next);
    } catch (err: any) {
      setError(err?.message || "No se pudo subir el anuncio.");
    }
  }

  async function toggleAd(kind: AdKind) {
    await persistSettings({
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          enabled: !settings.ads[kind].enabled,
        },
      },
    });
  }

  async function editAdLink(kind: AdKind) {
    if (typeof window === "undefined") return;
    const current = settings.ads[kind].href || "";
    const href = window.prompt("Pega el link del anuncio:", current);
    if (href === null) return;

    await persistSettings({
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          href: href.trim(),
        },
      },
    });
  }

  async function clearAdImage(kind: AdKind) {
    await persistSettings({
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          imageUrl: "",
        },
      },
    });
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
      { shallow: true },
    );
  }

  const streaks: Streak[] = useMemo(
    () => [
      {
        top: "8%",
        left: "-35%",
        v: "cool",
        dir: "fwd",
        delay: "0s",
        dur: "12s",
        op: 0.85,
      },
      {
        top: "12%",
        left: "-28%",
        v: "warm",
        dir: "rev",
        delay: ".4s",
        dur: "10.5s",
        op: 0.75,
      },
      {
        top: "20%",
        left: "-36%",
        v: "lime",
        dir: "fwd",
        delay: "1.0s",
        dur: "13s",
        op: 0.8,
      },
      {
        top: "28%",
        left: "-22%",
        v: "cool",
        dir: "rev",
        delay: "1.6s",
        dur: "9.5s",
        op: 0.9,
      },
      {
        top: "36%",
        left: "-40%",
        v: "warm",
        dir: "fwd",
        delay: "2.1s",
        dur: "11.5s",
        op: 0.7,
      },
      {
        top: "44%",
        left: "-30%",
        v: "cool",
        dir: "rev",
        delay: "2.7s",
        dur: "12.5s",
        op: 0.85,
      },
      {
        top: "52%",
        left: "-26%",
        v: "warm",
        dir: "fwd",
        delay: "3.2s",
        dur: "10.2s",
        op: 0.8,
      },
      {
        top: "60%",
        left: "-18%",
        v: "lime",
        dir: "rev",
        delay: "3.8s",
        dur: "12.2s",
        op: 0.75,
      },
      {
        top: "68%",
        left: "-34%",
        v: "cool",
        dir: "fwd",
        delay: "4.4s",
        dur: "11.2s",
        op: 0.85,
      },
      {
        top: "76%",
        left: "-24%",
        v: "warm",
        dir: "rev",
        delay: "5.0s",
        dur: "9.8s",
        op: 0.72,
      },
      {
        top: "84%",
        left: "-20%",
        v: "cool",
        dir: "fwd",
        delay: "5.6s",
        dur: "13.2s",
        op: 0.82,
      },
      {
        top: "6%",
        left: "-38%",
        v: "cool",
        dir: "rev",
        delay: "0.6s",
        dur: "14s",
        op: 0.55,
        h: "1px",
      },
      {
        top: "18%",
        left: "-33%",
        v: "warm",
        dir: "fwd",
        delay: "1.2s",
        dur: "12.8s",
        op: 0.55,
        h: "1px",
      },
      {
        top: "22%",
        left: "-27%",
        v: "lime",
        dir: "rev",
        delay: "1.8s",
        dur: "10.8s",
        op: 0.5,
        h: "1px",
      },
      {
        top: "34%",
        left: "-31%",
        v: "cool",
        dir: "fwd",
        delay: "2.4s",
        dur: "13.6s",
        op: 0.58,
        h: "1px",
      },
      {
        top: "42%",
        left: "-36%",
        v: "warm",
        dir: "rev",
        delay: "3.0s",
        dur: "12.2s",
        op: 0.52,
        h: "1px",
      },
      {
        top: "58%",
        left: "-21%",
        v: "lime",
        dir: "fwd",
        delay: "3.6s",
        dur: "11.8s",
        op: 0.5,
        h: "1px",
      },
      {
        top: "66%",
        left: "-29%",
        v: "cool",
        dir: "rev",
        delay: "4.2s",
        dur: "14.4s",
        op: 0.55,
        h: "1px",
      },
      {
        top: "74%",
        left: "-19%",
        v: "warm",
        dir: "fwd",
        delay: "4.8s",
        dur: "12.6s",
        op: 0.5,
        h: "1px",
      },
      {
        top: "90%",
        left: "-25%",
        v: "lime",
        dir: "rev",
        delay: "5.4s",
        dur: "13.8s",
        op: 0.52,
        h: "1px",
      },
      {
        top: "14%",
        left: "-32%",
        v: "cool",
        dir: "fwd",
        delay: ".2s",
        dur: "11.4s",
        op: 0.92,
        h: "3px",
      },
      {
        top: "48%",
        left: "-35%",
        v: "warm",
        dir: "rev",
        delay: "2.9s",
        dur: "10.6s",
        op: 0.88,
        h: "3px",
      },
      {
        top: "82%",
        left: "-28%",
        v: "lime",
        dir: "fwd",
        delay: "5.3s",
        dur: "12.4s",
        op: 0.86,
        h: "3px",
      },
    ],
    [],
  );

  return (
    <>
      <Seo
        title="Deportes | MotorWelt"
        description="F1, Nascar, MotoGP, WRC y Drift. Cobertura, contexto, cultura y competencia con el enfoque MotorWelt."
        image={heroImage}
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

        {canEdit && (
          <div className="fixed bottom-4 left-4 z-[80] hidden rounded-2xl border border-[#0CE0B2]/25 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur md:block">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#0CE0B2]" />
              <span>
                {spectatorMode ? "Vista espectador" : "Modo edición deportes"}
              </span>
              {saving && <span className="text-[#0CE0B2]">Guardando…</span>}
            </div>
            {error && <div className="mt-1 text-red-300">{error}</div>}
            <button
              type="button"
              onClick={toggleSpectatorMode}
              className="mt-2 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              {spectatorMode ? "Volver a editar" : "Ver como espectador"}
            </button>
          </div>
        )}

        <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main aria-hidden={mobileOpen} className="relative z-10">
          <section className="relative isolate overflow-hidden pt-16 lg:pt-[72px]">
            <div className="relative flex min-h-[48svh] flex-col justify-end overflow-hidden sm:min-h-[54svh] lg:min-h-[60vh]">
              <Image
                src={heroImage}
                alt="Deportes | MotorWelt"
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

              {desktopEditControlsVisible && (
                <div className="absolute right-4 top-20 z-20 hidden flex-wrap gap-2 md:flex">
                  <button
                    type="button"
                    onClick={() => heroInputRef.current?.click()}
                    className="rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                  >
                    Cambiar portada
                  </button>
                </div>
              )}

              <div className="relative z-10 w-full px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-16">
                <div className="mx-auto w-full max-w-[1440px] px-0 xl:px-10 2xl:max-w-[1560px]">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-gray-200 backdrop-blur md:text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                      MotorWelt Deportes
                    </div>

                    <h1 className="mt-5 font-display text-[2.8rem] font-black leading-[0.92] tracking-[-0.05em] text-white sm:text-[4rem] md:text-[4.8rem] lg:text-[5.4rem]">
                      <span className="glow-cool block">Deportes</span>
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
                      F1, Nascar, MotoGP, WRC y Drift. Cobertura, contexto,
                      cultura, competencia y piezas con presencia visual real
                      dentro del ADN MotorWelt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {showLeaderboardAd ? (
            <section className="py-4 sm:py-6">
              <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-6 lg:px-8 2xl:max-w-[1560px]">
                <EditableAd
                  kind="leaderboard"
                  ad={settings.ads.leaderboard}
                  inputRef={leaderboardInputRef}
                  editable={desktopEditControlsVisible}
                  onPick={(files) =>
                    void handleAdImagePick("leaderboard", files)
                  }
                  onToggle={() => void toggleAd("leaderboard")}
                  onEditLink={() => void editAdLink("leaderboard")}
                  onClear={() => void clearAdImage("leaderboard")}
                />
              </div>
            </section>
          ) : null}

          <section className="py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <SectionHeader
                eyebrow="Últimas publicaciones"
                title="Lo más reciente en Deportes"
                description="La conversación más reciente del deporte motor."
                accent="warm"
              />

              {latest.length > 0 ? (
                <>
                  <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2 md:justify-items-start lg:grid-cols-3">
                    {latest.map((item) => (
                      <ArticleCard key={item.id} item={item} />
                    ))}
                  </div>

                  <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar md:hidden">
                    <div className="flex snap-x snap-mandatory gap-4">
                      {latest.map((item) => (
                        <ArticleCard key={item.id} item={item} mobileSize />
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <EmptySectionNotice
                  title="Próximas publicaciones"
                  message="Todavía no hay publicaciones de Deportes. En cuanto publiques desde el admin, aparecerán aquí sin demos ni contenido inventado."
                />
              )}
            </div>
          </section>

          <section className="py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <SectionHeader
                eyebrow="Todo Deportes"
                title="F1, Nascar, MotoGP, WRC y Drift"
                description="Aquí podrás encontrar lo último en el deporte motor, separado por categoría."
                accent="lime"
              />

              <div className="space-y-12">
                {SPORTS.map((sport) => {
                  const items = grouped[sport] || [];
                  return (
                    <section key={sport}>
                      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
                            Categoría
                          </p>
                          <h3 className="mt-1 text-2xl font-semibold text-white">
                            {sport}
                          </h3>
                        </div>
                      </div>

                      {items.length > 0 ? (
                        <>
                          <div className="hidden grid-cols-1 gap-6 md:grid md:grid-cols-2 md:justify-items-start lg:grid-cols-3">
                            {items.map((item) => (
                              <ArticleCard key={item.id} item={item} />
                            ))}
                          </div>

                          <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar md:hidden">
                            <div className="flex snap-x snap-mandatory gap-4">
                              {items.map((item) => (
                                <ArticleCard
                                  key={item.id}
                                  item={item}
                                  mobileSize
                                />
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <EmptySectionNotice
                          title="Próximamente"
                          message={`Próximamente habrá contenido disponible en ${sport}.`}
                        />
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          </section>

          {showBillboardAd ? (
            <section className="py-8">
              <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 2xl:max-w-[1560px]">
                <EditableAd
                  kind="billboard"
                  ad={settings.ads.billboard}
                  inputRef={billboardInputRef}
                  editable={desktopEditControlsVisible}
                  onPick={(files) => void handleAdImagePick("billboard", files)}
                  onToggle={() => void toggleAd("billboard")}
                  onEditLink={() => void editAdLink("billboard")}
                  onClear={() => void clearAdImage("billboard")}
                />
              </div>
            </section>
          ) : null}

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <SectionHeader
                eyebrow="MotorWelt"
                title="Lo más reciente en MotorWelt"
                description="Las últimas publicaciones del universo MotorWelt en un solo lugar."
                accent="cool"
              />

              {recentMotorWelt.length > 0 ? (
                <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar sm:-mx-6 sm:px-6 xl:-mx-10 xl:px-10">
                  <div className="flex snap-x snap-mandatory gap-4">
                    {recentMotorWelt.map((item) => (
                      <div
                        key={item.id}
                        className="h-[270px] w-[290px] min-w-[290px] shrink-0 snap-start sm:h-[285px] sm:w-[300px] sm:min-w-[300px] lg:h-[285px] lg:w-[280px] lg:min-w-[280px]"
                      >
                        <RecentMotorWeltCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptySectionNotice
                  title="Próximas publicaciones"
                  message="Aquí aparecerán las publicaciones más recientes de MotorWelt cuando haya contenido publicado."
                />
              )}
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <div className="mb-8">
                <p className="text-[11px] uppercase tracking-[0.28em] text-gray-400">
                  Explora
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                  Seguir explorando MotorWelt
                </h2>
                <div className="mt-3 h-px w-24 rounded-full bg-gradient-to-r from-[#0CE0B2]/60 to-[#E2A24C]/55" />
              </div>

              <div className="no-scrollbar overflow-x-auto pb-6">
                <div className="flex items-start gap-5 pr-12">
                  <ExploreCard
                    title="Tuning"
                    subtitle="Builds, mods, aero, stance y cultura visual."
                    href="/tuning"
                    image={safeSectionHeroImages.tuning}
                  />
                  <ExploreCard
                    title="Autos"
                    subtitle="Nuevos lanzamientos, pruebas y contexto editorial."
                    href="/noticias/autos"
                    image={safeSectionHeroImages.autos}
                  />
                  <ExploreCard
                    title="Motos"
                    subtitle="Pruebas, rutas y piezas con ADN de dos ruedas."
                    href="/noticias/motos"
                    image={safeSectionHeroImages.motos}
                  />
                  <ExploreCard
                    title="Lifestyle"
                    subtitle="La capa aspiracional y estética del universo MotorWelt."
                    href="/lifestyle"
                    image={safeSectionHeroImages.lifestyle}
                  />
                  <ExploreCard
                    title="Comunidad"
                    subtitle="Eventos, meets, rutas y cultura desde la calle."
                    href="/comunidad"
                    image={safeSectionHeroImages.comunidad}
                  />
                </div>
              </div>
            </div>
          </section>
        </main>

        <Footer year={year} />
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
          background: radial-gradient(
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
          0% {
            transform: translateX(-30%);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(130%);
            opacity: 0;
          }
        }
        @keyframes slide-rev {
          0% {
            transform: translateX(130%);
            opacity: 0;
          }
          10% {
            opacity: 0.9;
          }
          100% {
            transform: translateX(-30%);
            opacity: 0;
          }
        }
        .streak.dir-fwd {
          animation: slide-fwd 11s linear infinite;
        }
        .streak.dir-rev {
          animation: slide-rev 11s linear infinite;
        }
        .streak-cool {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(12, 224, 178, 0.72),
            transparent
          );
        }
        .streak-warm {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 122, 26, 0.72),
            transparent
          );
        }
        .streak-lime {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(163, 255, 18, 0.65),
            transparent
          );
        }
        .glow-cool {
          text-shadow: 0 0 14px rgba(12, 224, 178, 0.28);
        }
        .glow-warm {
          text-shadow: 0 0 14px rgba(255, 122, 26, 0.22);
        }
        .logo-glow {
          filter: drop-shadow(0 0 18px rgba(12, 224, 178, 0.12));
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

  const deportesQuery = /* groq */ `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      (
        lower(coalesce(section, "")) == "deportes" ||
        lower(coalesce(category, "")) == "deportes" ||
        "deportes" in coalesce(categories, [])
      ) &&
      lower(coalesce(section, "")) != "lifestyle" &&
      lower(coalesce(category, "")) != "lifestyle" &&
      !("lifestyle" in coalesce(categories, []))
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...40]{
      _id,
      title,
      subtitle,
      excerpt,
      seoDescription,
      slug,
      mainImageUrl,
      coverImage{asset->{url}},
      image{asset->{url}},
      heroImage{asset->{url}},
      galleryUrls,
      publishedAt,
      _createdAt,
      section,
      category,
      subcategory,
      sport,
      categories,
      tags,
      contentType,
      authorName,
      author->{name}
    }
  `;

  const recentQuery = /* groq */ `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado"
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...12]{
      _id,
      title,
      subtitle,
      excerpt,
      seoDescription,
      slug,
      mainImageUrl,
      coverImage{asset->{url}},
      image{asset->{url}},
      heroImage{asset->{url}},
      galleryUrls,
      publishedAt,
      _createdAt,
      section,
      category,
      subcategory,
      sport,
      categories,
      tags,
      contentType,
      authorName,
      author->{name}
    }
  `;

  const settingsQuery = /* groq */ `
    *[
      _type in ["sitePageSettings", "pageSettings", "homeSettings"] &&
      (
        pageKey == "deportes" ||
        page == "deportes" ||
        slug.current == "deportes"
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

  const [raw, recentRaw, settingsRaw, sectionSettingsRaw] = await Promise.all([
    sanityReadClient.fetch(deportesQuery),
    sanityReadClient.fetch(recentQuery).catch(() => []),
    sanityReadClient.fetch(settingsQuery).catch(() => null),
    sanityReadClient.fetch(sectionSettingsQuery).catch(() => []),
  ]);

  const deportesItems: ArticleCardData[] = (raw ?? [])
    .filter((post: RawPost) => isDeportesPost(post))
    .map((post: RawPost) => {
      const slug = getSlugValue(post.slug);

      return {
        id: String(post._id || slug || Math.random()),
        title: String(post.title || ""),
        excerpt: String(
          post.subtitle || post.excerpt || post.seoDescription || "",
        ),
        img: imageFromPost(post),
        href: slug ? `/deportes/${slug}` : "/deportes",
        when: formatWhen(post.publishedAt || post._createdAt),
        sport: detectSport(post),
        authorName: String(post.authorName || post.author?.name || "MotorWelt"),
      };
    });

  const recentItems: RecentCardData[] = (recentRaw ?? []).map(
    (post: RawPost) => {
      const slug = getSlugValue(post.slug);

      return {
        id: String(post._id || slug || Math.random()),
        title: String(post.title || ""),
        excerpt: String(
          post.subtitle || post.excerpt || post.seoDescription || "",
        ),
        img: imageFromPost(post),
        href: hrefFromPost(post),
        when: formatWhen(post.publishedAt || post._createdAt),
        sectionLabel: getSectionLabel(post),
        authorName: String(post.authorName || post.author?.name || "MotorWelt"),
      };
    },
  );

  const initialSettings = sanitizePageSettings(
    settingsRaw,
    String(settingsRaw?.heroImageUrl || "").trim() ||
      deportesItems[0]?.img ||
      DEFAULT_SETTINGS.heroImageUrl,
  );

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
    autos: settingsMap.get("autos"),
    motos: settingsMap.get("motos"),
    deportes:
      settingsMap.get("deportes") ||
      initialSettings.heroImageUrl ||
      deportesItems[0]?.img,
    lifestyle: settingsMap.get("lifestyle"),
    comunidad: settingsMap.get("comunidad"),
  });

  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig,
      )),
      year: new Date().getFullYear(),
      deportesItems,
      recentItems,
      initialSettings,
      sectionHeroImages,
    },
  };
}