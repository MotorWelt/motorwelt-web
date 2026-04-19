// pages/deportes/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";

type ButtonVariant = "cyan" | "pink" | "link";
type SportKey = "F1" | "Nascar" | "MotoGP" | "WRC" | "Drift";
type AdKind = "leaderboard" | "billboard";

type ArticleCardData = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  sport: SportKey;
};

type AdConfig = {
  enabled: boolean;
  label: string;
  imageUrl: string;
  href: string;
};

type PartnerLogo = {
  id: string;
  name: string;
  imageUrl: string;
  href: string;
};

type DeportesPageSettings = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    billboard: AdConfig;
  };
  partnerLogos: PartnerLogo[];
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
  categories?: string[];
  tags?: Array<
    string | { title?: string; name?: string; label?: string; value?: string }
  >;
};

const SPORTS: SportKey[] = ["F1", "Nascar", "MotoGP", "WRC", "Drift"];

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
  partnerLogos: [],
};

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : "";
}

const getButtonClasses = (
  variant: ButtonVariant = "cyan",
  className = ""
) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition will-change-transform focus:outline-none";

  const styles: Record<ButtonVariant, string> = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus:ring-2 focus:ring-[#0CE0B2]/40 disabled:opacity-60 disabled:cursor-not-allowed",
    pink:
      "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus:ring-2 focus:ring-[#FF7A1A]/40 disabled:opacity-60 disabled:cursor-not-allowed",
    link:
      "p-0 text-[#43A1AD] hover:opacity-80 underline underline-offset-4 focus:ring-0 rounded-none shadow-none border-0",
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
  if (Array.isArray(value)) return value.map(normalizeText).join(" ").toLowerCase();
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(item.title || item.name || item.label || item.value || "")
      .trim()
      .toLowerCase();
  }
  return String(value).trim().toLowerCase();
}

function detectSport(post: RawPost): SportKey | null {
  const blob = [
    post.title,
    post.excerpt,
    post.subtitle,
    post.seoDescription,
    post.section,
    post.category,
    post.subcategory,
    post.categories,
    post.tags,
  ]
    .map(normalizeText)
    .join(" ");

  if (blob.includes("formula 1") || blob.includes(" f1") || blob.startsWith("f1")) return "F1";
  if (blob.includes("nascar")) return "Nascar";
  if (blob.includes("motogp") || blob.includes("moto gp")) return "MotoGP";
  if (blob.includes("wrc") || blob.includes("world rally") || blob.includes("rally")) return "WRC";
  if (blob.includes("drift")) return "Drift";

  return null;
}

function getSlugValue(slug?: string | { current?: string }) {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return String(slug.current || "");
}

function sanitizePageSettings(
  raw?: any,
  fallbackHero = "/images/noticia-3.jpg"
): DeportesPageSettings {
  return {
    heroImageUrl:
      String(raw?.heroImageUrl || "").trim() ||
      fallbackHero ||
      DEFAULT_SETTINGS.heroImageUrl,
    ads: {
      leaderboard: {
        enabled: Boolean(raw?.ads?.leaderboard?.enabled ?? true),
        label:
          String(raw?.ads?.leaderboard?.label || "").trim() ||
          DEFAULT_SETTINGS.ads.leaderboard.label,
        imageUrl: String(raw?.ads?.leaderboard?.imageUrl || "").trim(),
        href: String(raw?.ads?.leaderboard?.href || "").trim(),
      },
      billboard: {
        enabled: Boolean(raw?.ads?.billboard?.enabled ?? true),
        label:
          String(raw?.ads?.billboard?.label || "").trim() ||
          DEFAULT_SETTINGS.ads.billboard.label,
        imageUrl: String(raw?.ads?.billboard?.imageUrl || "").trim(),
        href: String(raw?.ads?.billboard?.href || "").trim(),
      },
    },
    partnerLogos: Array.isArray(raw?.partnerLogos)
      ? raw.partnerLogos.map((item: any, index: number) => ({
          id: String(item?.id || `partner-${index}`),
          name: String(item?.name || "Partner"),
          imageUrl: String(item?.imageUrl || ""),
          href: String(item?.href || ""),
        }))
      : [],
  };
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

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
  accent?: "warm" | "cool" | "lime";
}> = ({ eyebrow, title, description, accent = "cool" }) => {
  const lineClass =
    accent === "cool"
      ? "from-[#0CE0B2] via-[#43A1AD] to-[#E2A24C]"
      : accent === "lime"
      ? "from-[#A3FF12] via-[#0CE0B2] to-[#FF7A1A]"
      : "from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]";

  return (
    <div className="mb-8 sm:mb-10">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
        {title}
      </h2>
      <div className={`mt-3 h-1 w-28 rounded-full bg-gradient-to-r ${lineClass}`} />
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
};

function ArticleCard({
  item,
  compact = false,
}: {
  item: ArticleCardData;
  compact?: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md transition hover:border-[#0CE0B2]/50">
      <Link href={item.href} className="block">
        <div className={`relative w-full ${compact ? "h-48" : "h-64"} overflow-hidden`}>
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes={compact ? "(max-width: 1024px) 80vw, 320px" : "(max-width: 1024px) 100vw, 33vw"}
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
            {item.sport}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-gray-400">{item.when}</div>
          <h3 className="mt-2 text-xl font-semibold leading-tight text-white transition group-hover:text-[#0CE0B2]">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-300 line-clamp-3">
            {item.excerpt}
          </p>

          <div className="mt-4">
            <span className={getButtonClasses("link")}>Leer nota</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function FeaturedStory({
  item,
}: {
  item: ArticleCardData;
}) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md">
      <Link href={item.href} className="block">
        <div className="grid gap-0 lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative min-h-[280px] lg:min-h-[380px]">
            <Image
              src={item.img}
              alt={item.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              style={{ objectFit: "cover" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent lg:bg-gradient-to-r lg:from-black/15 lg:via-transparent lg:to-transparent" />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white">
              <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
              Destacada · {item.sport}
            </div>

            <div className="mt-4 text-sm text-gray-400">{item.when}</div>

            <h3 className="mt-3 text-3xl font-black leading-[0.98] text-white sm:text-4xl">
              {item.title}
            </h3>

            <p className="mt-4 text-sm leading-relaxed text-gray-300 sm:text-base">
              {item.excerpt}
            </p>

            <div className="mt-6">
              <span className={getButtonClasses("cyan")}>Leer nota destacada</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function EmptySportCard({ sport }: { sport: SportKey }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/12 bg-mw-surface/60 p-8 text-center backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF7A1A]" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{sport}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">
        Próximamente habrá contenido disponible en esta subsección.
      </p>
    </div>
  );
}

function ExploreCard({
  href,
  title,
  label,
  image,
  description,
}: {
  href: string;
  title: string;
  label: string;
  image: string;
  description: string;
}) {
  return (
    <Link href={href} className="relative w-[82%] min-w-[82%] sm:w-[420px] sm:min-w-[420px] snap-start">
      <div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-mw-line/70">
        <Image src={image} alt={title} fill style={{ objectFit: "cover" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 p-5">
          <p className="text-[11px] uppercase tracking-wide text-[#0CE0B2]">{label}</p>
          <h3 className="text-2xl font-bold text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-300 line-clamp-2">{description}</p>
        </div>
      </div>
    </Link>
  );
}

function PartnersRow({ partners }: { partners: PartnerLogo[] }) {
  if (!partners.length) return null;

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Partners"
          title="Aliados de MotorWelt"
          description="Espacio para partners y marcas vinculadas a la plataforma."
          accent="lime"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {partners.map((partner) => {
            const content = (
              <div className="relative h-24 overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70">
                <Image
                  src={partner.imageUrl}
                  alt={partner.name}
                  fill
                  sizes="220px"
                  style={{ objectFit: "contain", padding: "18px" }}
                />
              </div>
            );

            return partner.href ? (
              <a
                key={partner.id}
                href={partner.href}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {content}
              </a>
            ) : (
              <div key={partner.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Header({
  mobileOpen,
  setMobileOpen,
}: {
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-[1200px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 lg:h-[72px] lg:px-8">
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
              <Link
                href="/tuning"
                className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
              >
                Tuning
              </Link>

              <div className="group relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white focus:outline-none"
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

                <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 translate-y-1 opacity-0 transition duration-150 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="min-w-[180px] rounded-xl border border-mw-line/70 bg-mw-surface/95 p-2 shadow-xl backdrop-blur-md">
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
                className="inline-flex h-10 items-center leading-none border-b-2 border-[#0CE0B2] text-white"
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

          <div className="hidden md:flex items-center justify-end">
            <ProfileButton />
          </div>

          <div className="flex items-center justify-end gap-2 md:hidden">
            <ProfileButton />
            <button
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-mw-line/70 bg-mw-surface/60 backdrop-blur-md hover:bg-white/5 focus:outline-none"
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
            className="absolute right-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-l border-mw-line/70 bg-mw-surface/95 shadow-2xl backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-mw-line/60 px-4 py-4">
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
              <Link
                href="/tuning"
                className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Tuning
              </Link>

              <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-wide text-gray-400">
                Noticias
              </p>

              <div className="mt-1 space-y-1 pl-2">
                <Link
                  href="/noticias/autos"
                  className="block rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Autos
                </Link>
                <Link
                  href="/noticias/motos"
                  className="block rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Motos
                </Link>
              </div>

              <Link
                href="/deportes"
                className="block w-full rounded-xl px-3 py-3 text-base text-white"
                onClick={() => setMobileOpen(false)}
              >
                Deportes
              </Link>

              <Link
                href="/lifestyle"
                className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Lifestyle
              </Link>

              <Link
                href="/comunidad"
                className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Comunidad
              </Link>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function AdSlot({
  kind,
  ad,
  onToggle,
  onPick,
  onEditLink,
  onClear,
  editable,
  inputRef,
}: {
  kind: AdKind;
  ad: AdConfig;
  onToggle: () => void;
  onPick: (files?: FileList | null) => void;
  onEditLink: () => void;
  onClear: () => void;
  editable: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  if (!ad.enabled && !editable) return null;

  const isLeaderboard = kind === "leaderboard";

  return (
    <div
      className={`relative mx-auto w-full overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70 ${
        isLeaderboard
          ? "max-w-[970px] aspect-[970/120] min-h-[72px] md:min-h-0"
          : "max-w-[970px] aspect-[970/250]"
      }`}
    >
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
                alt={ad.label}
                className="h-full w-full object-cover object-center bg-black/20"
              />
            </a>
          ) : (
            <img
              src={ad.imageUrl}
              alt={ad.label}
              className="h-full w-full object-cover object-center bg-black/20"
            />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-gray-400">
            <span className="px-4 text-[11px] sm:text-xs md:text-sm">{ad.label}</span>
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
        <div className="absolute right-2 top-2 z-20 flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            {ad.enabled ? "Ocultar" : "Mostrar"}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            Imagen
          </button>
          <button
            type="button"
            onClick={onEditLink}
            className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            Link
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-red-400/50 bg-black/70 px-3 py-1 text-[10px] font-semibold text-red-200 backdrop-blur hover:bg-black/90"
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
  initialSettings = DEFAULT_SETTINGS,
}: {
  year: number;
  deportesItems?: ArticleCardData[];
  initialSettings?: DeportesPageSettings;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<DeportesPageSettings>(
    sanitizePageSettings(initialSettings, initialSettings?.heroImageUrl)
  );

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);

  const featured = deportesItems[0] || null;
  const latest = featured ? deportesItems.slice(0, 6) : [];

  const grouped = useMemo(() => {
    return SPORTS.reduce((acc, sport) => {
      acc[sport] = deportesItems.filter((item) => item.sport === sport);
      return acc;
    }, {} as Record<SportKey, ArticleCardData[]>);
  }, [deportesItems]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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

  const editControlsVisible = canEdit && !spectatorMode;

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
    const next = {
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          enabled: !settings.ads[kind].enabled,
        },
      },
    };

    await persistSettings(next);
  }

  async function editAdLink(kind: AdKind) {
    if (typeof window === "undefined") return;
    const current = settings.ads[kind].href || "";
    const href = window.prompt("Pega el link del anuncio:", current);
    if (href === null) return;

    const next = {
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          href: href.trim(),
        },
      },
    };

    await persistSettings(next);
  }

  async function clearAdImage(kind: AdKind) {
    const next = {
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          imageUrl: "",
        },
      },
    };

    await persistSettings(next);
  }

  const heroImage =
    settings.heroImageUrl || featured?.img || DEFAULT_SETTINGS.heroImageUrl;

  return (
    <>
      <Seo
        title="Deportes | MotorWelt"
        description="F1, Nascar, MotoGP, WRC y Drift en MotorWelt. Noticias, coberturas y contenido real conectado a Sanity."
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_20%,rgba(12,224,178,.15),transparent_24%),radial-gradient(circle_at_84%_16%,rgba(255,122,26,.11),transparent_28%),radial-gradient(circle_at_52%_84%,rgba(163,255,18,.05),transparent_32%)]" />
          <div className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(115deg,transparent_0%,transparent_44%,rgba(255,255,255,.06)_45%,transparent_46%,transparent_100%)]" />
        </div>

        {canEdit && (
          <div className="fixed bottom-4 left-4 z-[80] rounded-2xl border border-[#0CE0B2]/40 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2] animate-pulse" />
              <span>{spectatorMode ? "Vista espectador" : "Modo edición deportes"}</span>
              {saving && <span className="text-[#0CE0B2]">Guardando…</span>}
            </div>
            {error && <div className="mt-1 text-red-300">{error}</div>}
            <button
              type="button"
              onClick={() => setSpectatorMode((v) => !v)}
              className="mt-2 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              {spectatorMode ? "Volver a editar" : "Ver como espectador"}
            </button>
          </div>
        )}

        <Header mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

        <main aria-hidden={mobileOpen} className="relative z-10">
          <section className="relative isolate overflow-hidden pt-16 lg:pt-[72px]">
            <div className="relative flex min-h-[46svh] flex-col justify-end overflow-hidden sm:min-h-[50svh] lg:min-h-[56vh]">
              <Image
                src={heroImage}
                alt="Deportes | MotorWelt"
                fill
                sizes="100vw"
                style={{
                  objectFit: "cover",
                  filter: "brightness(.33) saturate(1.08)",
                }}
                priority
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(12,224,178,.18),transparent_26%),radial-gradient(circle_at_84%_20%,rgba(255,122,26,.18),transparent_28%),linear-gradient(180deg,rgba(0,0,0,.18)_0%,rgba(0,0,0,.42)_42%,rgba(2,10,10,.92)_100%)]" />
              <div className="absolute inset-y-0 left-0 hidden w-[56%] bg-gradient-to-r from-black/80 via-black/46 to-transparent lg:block" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#041210] via-[#041210]/70 to-transparent" />

              {editControlsVisible && (
                <div className="absolute right-4 top-20 z-20 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => heroInputRef.current?.click()}
                    className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                  >
                    Cambiar portada
                  </button>
                </div>
              )}

              <div className="relative z-10 w-full px-4 pb-10 pt-12 sm:px-6 lg:px-8 lg:pb-12">
                <div className="mx-auto w-full max-w-[1200px]">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-gray-200 backdrop-blur md:text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                      MotorWelt Deportes
                    </div>

                    <h1 className="mt-5 font-display text-[3.1rem] font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-[4.2rem] md:text-[4.8rem] lg:text-[5.4rem]">
                      Deportes
                    </h1>

                    <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-200 sm:text-lg">
                      F1, Nascar, MotoGP, WRC y Drift. Cobertura, contexto, cultura,
                      competencia y piezas con presencia visual real dentro del ADN MotorWelt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-4 sm:py-6">
            <div className="mx-auto w-full max-w-[1200px] px-2 sm:px-6 lg:px-8">
              <AdSlot
                kind="leaderboard"
                ad={settings.ads.leaderboard}
                editable={editControlsVisible}
                inputRef={leaderboardInputRef}
                onToggle={() => void toggleAd("leaderboard")}
                onPick={(files) => void handleAdImagePick("leaderboard", files)}
                onEditLink={() => void editAdLink("leaderboard")}
                onClear={() => void clearAdImage("leaderboard")}
              />
            </div>
          </section>

          {featured ? (
            <section className="py-12 sm:py-16">
              <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
                <SectionHeader
                  eyebrow="Destacada"
                  title="Lo más nuevo"
                  description="Última publicación de Deportes"
                  accent="warm"
                />
                <FeaturedStory item={featured} />
              </div>
            </section>
          ) : null}

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="Últimas publicaciones"
                title="Lo más reciente en Deportes"
                description=""
                accent="cool"
              />

              {latest.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {latest.map((item) => (
                    <ArticleCard key={item.id} item={item} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/12 bg-mw-surface/60 p-8 text-center text-gray-300">
                  Próximamente habrá contenido disponible en Deportes.
                </div>
              )}
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="Todo Deportes"
                title="F1, Nascar, MotoGP, WRC y Drift"
                description="Aquí podrás encontrar lo último en el deporte motor"
                accent="lime"
              />

              <div className="space-y-14">
                {SPORTS.map((sport) => {
                  const items = grouped[sport] || [];

                  return (
                    <section key={sport} id={sport.toLowerCase()} className="scroll-mt-28">
                      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                            Categoría
                          </p>
                          <h3 className="mt-1 text-3xl font-bold text-white">{sport}</h3>
                        </div>

                        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
                          {items.length > 0
                            ? `${items.length} publicación${items.length === 1 ? "" : "es"}`
                            : "Próximamente"}
                        </div>
                      </div>

                      {items.length > 0 ? (
                        <>
                          <div className="hidden gap-6 md:grid md:grid-cols-2 xl:grid-cols-4">
                            {items.slice(0, 4).map((item) => (
                              <ArticleCard key={item.id} item={item} compact />
                            ))}
                          </div>

                          <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar md:hidden">
                            <div className="flex gap-4 snap-x snap-mandatory">
                              {items.slice(0, 6).map((item) => (
                                <div
                                  key={item.id}
                                  className="w-[84%] min-w-[84%] shrink-0 snap-start"
                                >
                                  <ArticleCard item={item} compact />
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      ) : (
                        <EmptySportCard sport={sport} />
                      )}
                    </section>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-8">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <AdSlot
                kind="billboard"
                ad={settings.ads.billboard}
                editable={editControlsVisible}
                inputRef={billboardInputRef}
                onToggle={() => void toggleAd("billboard")}
                onPick={(files) => void handleAdImagePick("billboard", files)}
                onEditLink={() => void editAdLink("billboard")}
                onClear={() => void clearAdImage("billboard")}
              />
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
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

              <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                <div className="flex gap-4 snap-x snap-mandatory">
                  <ExploreCard
                    href="/tuning"
                    title="Tuning"
                    label="Sección"
                    image="/images/noticia-2.jpg"
                    description="Builds, mods, street culture y lenguaje visual con identidad propia."
                  />
                  <ExploreCard
                    href="/noticias/autos"
                    title="Autos"
                    label="Noticias"
                    image="/images/noticia-1.jpg"
                    description="Lanzamientos, pruebas, industria y todo lo que mueve al universo automotriz."
                  />
                  <ExploreCard
                    href="/noticias/motos"
                    title="Motos"
                    label="Noticias"
                    image="/images/noticia-3.jpg"
                    description="Pruebas, rutas y cultura de motociclismo con enfoque visual."
                  />
                  <ExploreCard
                    href="/lifestyle"
                    title="Lifestyle"
                    label="Sección"
                    image="/images/noticia-1.jpg"
                    description="Diseño, viajes, gadgets y cultura alrededor de MotorWelt."
                  />
                </div>
              </div>
            </div>
          </section>

          <PartnersRow partners={settings.partnerLogos} />
        </main>

        <footer
          aria-hidden={mobileOpen}
          className="relative z-10 mt-12 border-t border-mw-line/70 bg-mw-surface/70 py-10 text-gray-300 backdrop-blur-md"
        >
          <div className="mx-auto grid w-full max-w-[1200px] gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
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
                    About
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
                  href="https://instagram.com/motorwelt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#43A1AD] hover:text-white"
                >
                  IG
                </a>
                <a
                  href="https://facebook.com/motorwelt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#43A1AD] hover:text-white"
                >
                  FB
                </a>
                <a
                  href="https://tiktok.com/@motorwelt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#43A1AD] hover:text-white"
                >
                  TikTok
                </a>
                <a
                  href="https://youtube.com/@motorwelt"
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
            radial-gradient(120% 80% at 20% 10%, rgba(0, 0, 0, 0.15) 0%, transparent 60%),
            radial-gradient(120% 80% at 80% 90%, rgba(0, 0, 0, 0.18) 0%, transparent 60%),
            linear-gradient(180deg, rgba(4, 18, 16, 0.85), rgba(4, 18, 16, 0.92));
        }
        .logo-glow {
          filter: drop-shadow(0 0 18px rgba(12,224,178,.12));
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
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

export async function getServerSideProps() {
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const deportesQuery = `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado"
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...120]{
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

  const deportesSettingsQuery = `
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
      },
      "partnerLogos": coalesce(partnerLogos, [])
    }
  `;

  const [deportesRaw, deportesSettingsRaw] = await Promise.all([
    sanityReadClient.fetch(deportesQuery).catch(() => []),
    sanityReadClient.fetch(deportesSettingsQuery).catch(() => null),
  ]);

  const deportesItems: ArticleCardData[] = (deportesRaw || [])
    .map((it: RawPost) => {
      const sport = detectSport(it);
      if (!sport) return null;

      const slug = getSlugValue(it.slug);
      if (!slug) return null;

      const mainImage =
        String(it.mainImageUrl || "").trim() ||
        (Array.isArray(it.galleryUrls) && it.galleryUrls[0]
          ? String(it.galleryUrls[0])
          : "/images/noticia-3.jpg");

      return {
        id: String(it._id || slug),
        title: String(it.title || ""),
        excerpt: String(
          it.excerpt ||
            it.subtitle ||
            it.seoDescription ||
            "Lee la nota completa en MotorWelt."
        ),
        img: mainImage,
        href: `/noticias/deportes/${slug}`,
        when: formatWhen(it.publishedAt || it._createdAt),
        sport,
      };
    })
    .filter(Boolean) as ArticleCardData[];

  const fallbackHero = deportesItems[0]?.img || DEFAULT_SETTINGS.heroImageUrl;

  return {
    props: {
      year: new Date().getFullYear(),
      deportesItems: Array.isArray(deportesItems) ? deportesItems : [],
      initialSettings: sanitizePageSettings(deportesSettingsRaw, fallbackHero),
    },
  };
}