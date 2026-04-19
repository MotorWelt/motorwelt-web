// pages/comunidad/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";

type ButtonVariant = "cyan" | "pink" | "link";
type CommunityType = "Eventos" | "Meets" | "Rutas" | "Clubes";
type AdKind = "leaderboard" | "billboard";
type ComposerKind = "Eventos" | "Galería" | "Clubes";

type CommunityItem = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  place: string;
  type: CommunityType;
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

type CommunityPageSettings = {
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

const DEFAULT_SETTINGS: CommunityPageSettings = {
  heroImageUrl: "/images/comunidad.jpg",
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

const COMMUNITY_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_COMMUNITY_CONTACT_EMAIL || "";

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

function detectCommunityType(post: RawPost): CommunityType | null {
  const metadataBlob = [
    post.section,
    post.category,
    post.subcategory,
    post.categories,
    post.tags,
  ]
    .map(normalizeText)
    .join(" ");

  if (!metadataBlob) return null;

  if (
    metadataBlob.includes("club") ||
    metadataBlob.includes("clubs") ||
    metadataBlob.includes("grupo") ||
    metadataBlob.includes("grupos") ||
    metadataBlob.includes("community") ||
    metadataBlob.includes("comunidad")
  ) {
    return "Clubes";
  }

  if (
    metadataBlob.includes("ruta") ||
    metadataBlob.includes("rutas") ||
    metadataBlob.includes("rodada") ||
    metadataBlob.includes("off-road") ||
    metadataBlob.includes("off road")
  ) {
    return "Rutas";
  }

  if (
    metadataBlob.includes("meet") ||
    metadataBlob.includes("meets") ||
    metadataBlob.includes("cars & coffee") ||
    metadataBlob.includes("cars and coffee")
  ) {
    return "Meets";
  }

  if (
    metadataBlob.includes("evento") ||
    metadataBlob.includes("eventos") ||
    metadataBlob.includes("trackday") ||
    metadataBlob.includes("track day") ||
    metadataBlob.includes("autodromo") ||
    metadataBlob.includes("autódromo") ||
    metadataBlob.includes("festival")
  ) {
    return "Eventos";
  }

  return null;
}

function getSlugValue(slug?: string | { current?: string }) {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return String(slug.current || "");
}

function sanitizePageSettings(
  raw?: any,
  fallbackHero = "/images/comunidad.jpg"
): CommunityPageSettings {
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
          imageUrl: String(item?.imageUrl || item?.logoUrl || ""),
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

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const SectionHeader: React.FC<{
  title: string;
  subtle?: string;
  glow?: "cool" | "warm";
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}> = ({
  title,
  subtle,
  glow = "cool",
  actionLabel,
  onAction,
  showAction = false,
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:items-end md:justify-between md:text-left">
        <div className="w-full">
          <h2
            className={`font-display text-3xl font-extrabold tracking-wide text-white ${
              glow === "cool" ? "glow-cool" : "glow-warm"
            }`}
          >
            {title}
          </h2>
          {subtle ? (
            <p className="mt-2 text-gray-300 max-w-2xl mx-auto md:mx-0">
              {subtle}
            </p>
          ) : null}
          <div
            className={`mt-3 h-1 w-28 rounded-full mx-auto md:mx-0 ${
              glow === "cool"
                ? "bg-gradient-to-r from-[#0CE0B2] via-[#A3FF12] to-[#E2A24C]"
                : "bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]"
            }`}
          />
        </div>

        {showAction && actionLabel && onAction ? (
          <button type="button" onClick={onAction} className={getButtonClasses("pink")}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};

function CommunityCard({ item }: { item: CommunityItem }) {
  return (
    <article className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 overflow-hidden hover:border-[#0CE0B2]/50 transition will-change-transform hover:-translate-y-[2px]">
      <Link href={item.href} className="block">
        <div className="relative h-48">
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-xs text-white/90 backdrop-blur">
            {item.type}
          </span>
        </div>

        <div className="p-5">
          <div className="text-xs text-gray-300">
            {item.when}
            {item.place ? ` • ${item.place}` : ""}
          </div>
          <h4 className="mt-1 text-white font-semibold">{item.title}</h4>
          <p className="mt-2 text-sm text-gray-300 line-clamp-3">{item.excerpt}</p>
          <div className="mt-3">
            <span className={getButtonClasses("link")}>Ver detalles</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function GalleryCard({
  img,
  caption,
}: {
  img: string;
  caption: string;
}) {
  return (
    <figure className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 overflow-hidden">
      <div className="relative h-36 md:h-40">
        <Image
          src={img}
          alt={caption}
          fill
          sizes="(max-width: 1024px) 50vw, 25vw"
          style={{ objectFit: "cover" }}
        />
      </div>
      <figcaption className="p-3 text-xs text-gray-300">{caption}</figcaption>
    </figure>
  );
}

function ClubCard({
  title,
  area,
  members,
  href,
}: {
  title: string;
  area: string;
  members: number;
  href?: string;
}) {
  return (
    <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/80 p-5">
      <h4 className="text-white font-semibold">{title}</h4>
      <p className="text-sm text-gray-300 mt-1">{area}</p>
      <p className="text-xs text-gray-400 mt-1">{members} miembros</p>
      {href ? (
        <Link href={href} className="inline-flex mt-3">
          <span className={getButtonClasses("link")}>Ver grupo</span>
        </Link>
      ) : (
        <Button type="button" variant="link" className="mt-3">
          Unirme
        </Button>
      )}
    </div>
  );
}

function PartnersRow({ partners }: { partners: PartnerLogo[] }) {
  if (!partners.length) return null;

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="Aliados de la comunidad"
          subtle="Marcas, clubes y proyectos que suman al ecosistema MotorWelt."
          glow="cool"
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
      <header className="fixed top-0 left-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-[1200px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 lg:h-[72px] lg:px-8">
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

          <div className="hidden md:flex items-center justify-center">
            <nav className="flex items-center gap-6 text-sm font-medium">
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
                className="inline-flex items-center h-10 leading-none text-white border-b-2 border-[#0CE0B2]"
                aria-current="page"
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
                className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
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
                className="block w-full rounded-xl px-3 py-3 text-base text-white"
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

type ComposerFormState = {
  title: string;
  excerpt: string;
  place: string;
  date: string;
};

type ContactFormState = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
};

const EMPTY_COMPOSER: ComposerFormState = {
  title: "",
  excerpt: "",
  place: "",
  date: "",
};

const EMPTY_CONTACT: ContactFormState = {
  fullName: "",
  email: "",
  phone: "",
  subject: "",
};

export default function ComunidadPage({
  year,
  communityItems = [],
  initialSettings = DEFAULT_SETTINGS,
}: {
  year: number;
  communityItems?: CommunityItem[];
  initialSettings?: CommunityPageSettings;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<CommunityPageSettings>(
    sanitizePageSettings(initialSettings, initialSettings?.heroImageUrl)
  );

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerKind, setComposerKind] = useState<ComposerKind>("Eventos");
  const [composerForm, setComposerForm] = useState<ComposerFormState>(EMPTY_COMPOSER);
  const [composerFile, setComposerFile] = useState<File | null>(null);
  const [composerSaving, setComposerSaving] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState<ContactFormState>(EMPTY_CONTACT);
  const [contactError, setContactError] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);
  const composerCoverInputRef = useRef<HTMLInputElement | null>(null);

  const featured = communityItems[0] || null;
  const upcoming = communityItems.filter((item) => item.type !== "Clubes").slice(0, 6);
  const galleryItems = communityItems.slice(0, 4);
  const clubItems = communityItems.filter((item) => item.type === "Clubes").slice(0, 3);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || composerOpen || contactOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, composerOpen, contactOpen]);

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

  async function persistSettings(nextSettings: CommunityPageSettings) {
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
          pageKey: "comunidad",
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

  function openComposer(kind: ComposerKind) {
    setComposerKind(kind);
    setComposerForm(EMPTY_COMPOSER);
    setComposerFile(null);
    setComposerError(null);
    setComposerOpen(true);
  }

  async function submitComposer() {
    setComposerError(null);

    if (!composerForm.title.trim()) {
      setComposerError("Agrega un título.");
      return;
    }

    if (!composerForm.excerpt.trim()) {
      setComposerError("Agrega una descripción.");
      return;
    }

    if (!composerForm.date.trim()) {
      setComposerError("Agrega una fecha.");
      return;
    }

    if (!composerForm.place.trim()) {
      setComposerError("Agrega un lugar o zona.");
      return;
    }

    if (!composerFile) {
      setComposerError("Sube una imagen.");
      return;
    }

    setComposerSaving(true);

    try {
      const uploaded = await uploadAssetToSanity(composerFile);

      const title = composerForm.title.trim();
      const excerpt = composerForm.excerpt.trim();
      const place = composerForm.place.trim();
      const slugBase = slugify(title) || `comunidad-${Date.now()}`;

      const communityCategory =
        composerKind === "Eventos"
          ? "Eventos"
          : composerKind === "Galería"
          ? "Meets"
          : "Clubes";

      const payload = {
        title,
        excerpt,
        subtitle: excerpt,
        seoDescription: excerpt,
        slug: { current: slugBase },
        section: "Comunidad",
        category: communityCategory,
        subcategory: place,
        status: "publicado",
        publishedAt: composerForm.date,
        mainImageUrl: uploaded.url,
        galleryUrls: composerKind === "Galería" ? [uploaded.url] : [],
      };

      const res = await fetch("/api/ai/admin/content/save-draft", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-mw-role": "admin",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo publicar.");
      }

      window.location.reload();
    } catch (err: any) {
      setComposerError(err?.message || "No se pudo publicar.");
    } finally {
      setComposerSaving(false);
    }
  }

  function submitContactRequest() {
    setContactError(null);

    if (!contactForm.fullName.trim()) {
      setContactError("Agrega tu nombre completo.");
      return;
    }
    if (!contactForm.email.trim()) {
      setContactError("Agrega tu correo.");
      return;
    }
    if (!contactForm.phone.trim()) {
      setContactError("Agrega tu teléfono.");
      return;
    }
    if (!contactForm.subject.trim()) {
      setContactError("Agrega un asunto.");
      return;
    }
    if (!COMMUNITY_CONTACT_EMAIL) {
      setContactError(
        "Falta configurar NEXT_PUBLIC_COMMUNITY_CONTACT_EMAIL."
      );
      return;
    }

    const body = [
      `Nombre completo: ${contactForm.fullName.trim()}`,
      `Correo: ${contactForm.email.trim()}`,
      `Teléfono: ${contactForm.phone.trim()}`,
      "",
      `Asunto / solicitud:`,
      contactForm.subject.trim(),
    ].join("\n");

    const mailto = `mailto:${encodeURIComponent(
      COMMUNITY_CONTACT_EMAIL
    )}?subject=${encodeURIComponent(
      "Solicitud de información - Comunidad MotorWelt"
    )}&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    setContactOpen(false);
    setContactForm(EMPTY_CONTACT);
  }

  const heroImage =
    settings.heroImageUrl || featured?.img || DEFAULT_SETTINGS.heroImageUrl;

  return (
    <>
      <Seo
        title="Comunidad & Eventos | MotorWelt"
        description="Trackdays, meets, rutas y comunidad con ADN MotorWelt."
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

      {composerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#041210] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                  Comunidad
                </p>
                <h3 className="mt-2 text-2xl font-extrabold text-white">
                  {composerKind === "Eventos"
                    ? "Nuevo evento"
                    : composerKind === "Galería"
                    ? "Nueva galería"
                    : "Nuevo club"}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">Título</label>
                <input
                  value={composerForm.title}
                  onChange={(e) =>
                    setComposerForm((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  placeholder={
                    composerKind === "Eventos"
                      ? "Cars & Coffee en..."
                      : composerKind === "Galería"
                      ? "Highlights de..."
                      : "Nombre del club"
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">Fecha</label>
                <input
                  type="date"
                  value={composerForm.date}
                  onChange={(e) =>
                    setComposerForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  {composerKind === "Clubes" ? "Zona / sede" : "Lugar"}
                </label>
                <input
                  value={composerForm.place}
                  onChange={(e) =>
                    setComposerForm((prev) => ({ ...prev, place: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  placeholder="CDMX, Autódromo, ruta, zona..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  Descripción
                </label>
                <textarea
                  rows={4}
                  value={composerForm.excerpt}
                  onChange={(e) =>
                    setComposerForm((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  placeholder="Contexto, brief, detalles..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">
                  Imagen principal
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => composerCoverInputRef.current?.click()}
                    className={getButtonClasses("pink")}
                  >
                    Subir imagen
                  </button>
                  <span className="text-sm text-gray-300">
                    {composerFile ? composerFile.name : "No hay archivo seleccionado"}
                  </span>
                </div>
                <input
                  ref={composerCoverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setComposerFile(file);
                    e.currentTarget.value = "";
                  }}
                />
              </div>
            </div>

            {composerError ? (
              <p className="mt-4 text-sm text-red-300">{composerError}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={submitComposer}
                disabled={composerSaving}
                className={getButtonClasses("cyan")}
              >
                {composerSaving ? "Publicando..." : "Publicar"}
              </button>
              <button
                type="button"
                onClick={() => setComposerOpen(false)}
                className={getButtonClasses("link")}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {contactOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/10 bg-[#041210] p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                  Comunidad
                </p>
                <h3 className="mt-2 text-2xl font-extrabold text-white">
                  Solicitar información
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-white hover:bg-white/10"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Nombre completo
                </label>
                <input
                  value={contactForm.fullName}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">Correo</label>
                <input
                  type="email"
                  value={contactForm.email}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-gray-300">
                  Número de teléfono
                </label>
                <input
                  value={contactForm.phone}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                />
              </div>

              <div className="md:col-span-1" />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm text-gray-300">Asunto</label>
                <textarea
                  rows={4}
                  value={contactForm.subject}
                  onChange={(e) =>
                    setContactForm((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-white/15 bg-black/30 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                />
              </div>
            </div>

            {contactError ? (
              <p className="mt-4 text-sm text-red-300">{contactError}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={submitContactRequest}
                className={getButtonClasses("pink")}
              >
                Enviar solicitud
              </button>
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className={getButtonClasses("link")}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative min-h-screen overflow-x-hidden text-gray-100">
        <div className="mw-global-bg" aria-hidden>
          <div className="mw-global-base" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(12,224,178,.16),transparent_24%),radial-gradient(circle_at_84%_18%,rgba(163,255,18,.12),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(255,122,26,.06),transparent_30%)]" />
          <div className="absolute inset-0 opacity-[0.12] bg-[linear-gradient(115deg,transparent_0%,transparent_46%,rgba(255,255,255,.05)_47%,transparent_48%,transparent_100%)]" />
        </div>

        {canEdit && (
          <div className="fixed bottom-4 left-4 z-[80] rounded-2xl border border-[#0CE0B2]/40 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2] animate-pulse" />
              <span>{spectatorMode ? "Vista espectador" : "Modo edición comunidad"}</span>
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
                src={settings.heroImageUrl || DEFAULT_SETTINGS.heroImageUrl}
                alt="Comunidad MotorWelt"
                fill
                sizes="100vw"
                style={{ objectFit: "cover", filter: "brightness(.45) saturate(1.08)" }}
                priority
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_18%,rgba(12,224,178,.18),transparent_26%),radial-gradient(circle_at_84%_20%,rgba(163,255,18,.16),transparent_28%),linear-gradient(180deg,rgba(0,0,0,.18)_0%,rgba(0,0,0,.42)_42%,rgba(2,10,10,.92)_100%)]" />
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
                      MotorWelt Comunidad
                    </div>

                    <h1 className="mt-5 font-display text-[3.1rem] font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-[4.2rem] md:text-[4.8rem] lg:text-[5.4rem]">
                      Comunidad & Eventos
                    </h1>

                    <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-200 sm:text-lg">
                      Trackdays, rutas, meets, foros y comunidad real. Un espacio para que la
                      gente quiera estar, compartir y anunciar sus eventos dentro del ecosistema MotorWelt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-4">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
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
            <section className="pt-10">
              <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
                <SectionHeader
                  title="Próximo destacado"
                  subtle="Asegura tu lugar antes de que se agote."
                  glow="cool"
                  showAction={editControlsVisible}
                  actionLabel="Publicar destacada"
                  onAction={() => openComposer("Eventos")}
                />

                <article className="relative overflow-hidden rounded-3xl border border-mw-line/70 bg-mw-surface/70">
                  <Link href={featured.href} className="block">
                    <div className="relative h-[40vh] min-h-[320px]">
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
                        {featured.when}
                        {featured.place ? ` — ${featured.place}` : ""}
                      </span>

                      <h3 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">
                        {featured.title}
                      </h3>

                      <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-200">
                        {featured.excerpt}
                      </p>

                      <div className="mt-5 flex flex-wrap gap-3">
                        <span className={getButtonClasses("cyan")}>Confirmar asistencia</span>
                        <span className={getButtonClasses("pink")}>Ver detalles</span>
                      </div>
                    </div>
                  </Link>
                </article>
              </div>
            </section>
          ) : null}

          <section className="pt-12" aria-labelledby="proximos-title">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                title="Próximos eventos"
                subtle="Agenda, lugares, encuentros y registro."
                glow="cool"
                showAction={editControlsVisible}
                actionLabel="Publicar evento"
                onAction={() => openComposer("Eventos")}
              />

              <p aria-live="polite" className="sr-only">
                {upcoming.length} eventos encontrados.
              </p>

              {upcoming.length === 0 ? (
                <div className="rounded-3xl border border-white/10 bg-black/25 p-8 text-center text-gray-300">
                  Próximamente habrá eventos publicados en esta sección.
                </div>
              ) : (
                <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {upcoming.map((item) => (
                    <CommunityCard key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="pt-2">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                title="Lo último de la comunidad"
                subtle="Highlights de encuentros, rutas y momentos recientes."
                glow="warm"
                showAction={editControlsVisible}
                actionLabel="Publicar galería"
                onAction={() => openComposer("Galería")}
              />

              {galleryItems.length > 0 ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  {galleryItems.map((item, idx) => (
                    <GalleryCard
                      key={item.id}
                      img={item.img}
                      caption={`${item.title} — ${item.when || `Highlight ${idx + 1}`}`}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/12 bg-mw-surface/60 p-8 text-center text-gray-300">
                  Próximamente tendremos highlights visuales de la comunidad.
                </div>
              )}
            </div>
          </section>

          <section className="pt-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                title="Clubes & Grupos locales"
                subtle="Conecta con la comunidad cerca de ti."
                glow="cool"
                showAction={editControlsVisible}
                actionLabel="Publicar club"
                onAction={() => openComposer("Clubes")}
              />

              {clubItems.length > 0 ? (
                <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                  {clubItems.map((club, index) => (
                    <ClubCard
                      key={club.id}
                      title={club.title}
                      area={club.place || "México"}
                      members={180 + index * 70}
                      href={club.href}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/12 bg-mw-surface/60 p-8 text-center text-gray-300">
                  Próximamente habrá clubes y grupos publicados en esta sección.
                </div>
              )}
            </div>
          </section>

          <section className="py-12">
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

          <section className="pt-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="rounded-[28px] border border-white/10 bg-black/20 p-6 md:p-8 backdrop-blur-md">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                      MotorWelt Comunidad
                    </p>
                    <h3 className="mt-2 text-3xl md:text-4xl font-extrabold text-white">
                      Publica tu evento en MotorWelt
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-300">
                      Si organizas un meet, ruta, trackday, cars & coffee o encuentro especial,
                      este espacio está pensado para darle visibilidad, contexto y presencia visual.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-gray-300">
                      Podrás integrar:
                    </p>
                    <ul className="mt-3 space-y-2 text-sm text-white/90">
                      <li>• publicación destacada del evento</li>
                      <li>• imagen oficial y brief</li>
                      <li>• fecha, sede y registro</li>
                      <li>• promoción dentro del ecosistema MotorWelt</li>
                    </ul>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setContactOpen(true)}
                        className={getButtonClasses("pink")}
                      >
                        Solicitar información
                      </button>
                    </div>
                  </div>
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
                className="h-9 w-auto"
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
        .glow-cool {
          text-shadow: 0 0 14px rgba(12, 224, 178, 0.25);
        }
        .glow-warm {
          text-shadow: 0 0 14px rgba(255, 122, 26, 0.25);
        }
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
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps() {
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const communityQuery = `
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

  const communitySettingsQuery = `
    *[
      _type in ["homeSettings", "sitePageSettings", "pageSettings"] &&
      pageKey == "comunidad"
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

  const [communityRaw, communitySettingsRaw] = await Promise.all([
    sanityReadClient.fetch(communityQuery).catch(() => []),
    sanityReadClient.fetch(communitySettingsQuery).catch(() => null),
  ]);

  const communityItems: CommunityItem[] = (communityRaw || [])
    .map((it: RawPost) => {
      const type = detectCommunityType(it);
      if (!type) return null;

      const slug = getSlugValue(it.slug);
      if (!slug) return null;

      const mainImage =
        String(it.mainImageUrl || "").trim() ||
        (Array.isArray(it.galleryUrls) && it.galleryUrls[0]
          ? String(it.galleryUrls[0])
          : "/images/comunidad.jpg");

      return {
        id: String(it._id || slug),
        title: String(it.title || ""),
        excerpt: String(
          it.excerpt ||
            it.subtitle ||
            it.seoDescription ||
            "Consulta el detalle completo dentro de MotorWelt."
        ),
        img: mainImage,
        href: `/comunidad/${slug}`,
        when: formatWhen(it.publishedAt || it._createdAt),
        place: String(it.subcategory || it.category || ""),
        type,
      };
    })
    .filter(Boolean) as CommunityItem[];

  const fallbackHero = communityItems[0]?.img || DEFAULT_SETTINGS.heroImageUrl;

  return {
    props: {
      year: new Date().getFullYear(),
      communityItems: Array.isArray(communityItems) ? communityItems : [],
      initialSettings: sanitizePageSettings(communitySettingsRaw, fallbackHero),
    },
  };
}