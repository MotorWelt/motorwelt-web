// pages/comunidad/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";

type ButtonVariant = "cyan" | "pink" | "link";
type CommunityType = "Eventos" | "Meets" | "Rutas" | "Clubes";
type CommunityRegion = "Nacionales" | "Internacionales";
type CommunityEditorialGroup =
  | "Cars & Coffee"
  | "Trackdays"
  | "Club Culture"
  | "Rutas"
  | "Underground"
  | "Meets";
type AdKind = "leaderboard" | "billboard";
type ComposerKind = "Eventos" | "Galería" | "Clubes";

type CommunityItem = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  day: string;
  time: string;
  place: string;
  registrationUrl: string;
  type: CommunityType;
  region: CommunityRegion;
  editorialGroup: CommunityEditorialGroup;
  filterKey: string;
  isGallery: boolean;
};

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

type SectionHeroImages = {
  tuning: string;
  autos: string;
  motos: string;
  deportes: string;
  lifestyle: string;
  comunidad: string;
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

type PhotoGalleryEntry = {
  id: string;
  title: string;
  subtitle: string;
  coverImageUrl: string;
  galleryUrls: string[];
  when: string;
};

type CommunityPageSettings = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    billboard: AdConfig;
  };
  partnerLogos: PartnerLogo[];
  photoGalleries: PhotoGalleryEntry[];
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
  eventDate?: string;
  eventDateTime?: string;
  eventTime?: string;
  eventLocationName?: string;
  eventLocationUrl?: string;
  locationName?: string;
  locationUrl?: string;
  place?: string;
  placeName?: string;
  placeUrl?: string;
  googleMapsUrl?: string;
  googleMapsLink?: string;
  mapsUrl?: string;
  eventMapsUrl?: string;
  eventMapUrl?: string;
  registrationUrl?: string;
  registerUrl?: string;
  ticketUrl?: string;
  ticketsUrl?: string;
  externalUrl?: string;
  contentType?: string;
  communitySection?: string;
  communityRegion?: string;
  communityEditorialGroup?: string;
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
  photoGalleries: [],
};

const DEFAULT_SECTION_HERO_IMAGES: SectionHeroImages = {
  tuning: "/images/noticia-3.jpg",
  autos: "/images/noticia-1.jpg",
  motos: "/images/noticia-2.jpg",
  deportes: "/images/noticia-2.jpg",
  lifestyle: "/images/comunidad.jpg",
  comunidad: "/images/comunidad.jpg",
};

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)"),
  );
  return match ? decodeURIComponent(match[2]) : "";
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

function formatWeekday(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
  }).format(d);
}

function formatEventTime(value?: string | null) {
  const clean = String(value || "").trim();
  if (!clean) return "";

  if (/^\d{2}:\d{2}$/.test(clean)) {
    return `${clean} hrs`;
  }

  return clean;
}

function prettyCommunityLabel(value?: string | null) {
  const clean = String(value || "").trim();
  if (!clean) return "";

  const labels: Record<string, string> = {
    comunidad_eventos_nacionales: "Eventos nacionales",
    comunidad_eventos_internacionales: "Eventos internacionales",
    comunidad_meets: "Meets",
    comunidad_cars_coffee: "Cars & Coffee",
    comunidad_trackdays: "Trackdays",
    comunidad_clubes: "Club Culture",
    comunidad_rutas: "Rutas",
    comunidad_underground: "Underground",
    comunidad_galerias: "Galerías",
    eventos_nacionales: "Eventos nacionales",
    eventos_internacionales: "Eventos internacionales",
    meets: "Meets",
    cars_coffee: "Cars & Coffee",
    trackdays: "Trackdays",
    clubes: "Club Culture",
    rutas: "Rutas",
    underground: "Underground",
    galerias: "Galerías",
  };

  const key = clean.toLowerCase();
  return labels[key] || clean.replace(/_/g, " ");
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

function getPostMetadataBlob(post: RawPost) {
  return [
    post.section,
    post.category,
    post.subcategory,
    post.categories,
    post.tags,
  ]
    .map(normalizeText)
    .join(" ");
}

function getExplicitCommunityFields(post: RawPost) {
  return [
    post.communitySection,
    post.communityEditorialGroup,
    post.communityRegion,
    post.subcategory,
    post.category,
    post.section,
    post.contentType,
    post.categories,
  ]
    .map(normalizeText)
    .join(" ");
}

function getCommunityFilterKey(post: RawPost) {
  const explicit = getExplicitCommunityFields(post);

  if (
    explicit.includes("comunidad_eventos_nacionales") ||
    explicit.includes("eventos_nacionales")
  )
    return "eventos_nacionales";
  if (
    explicit.includes("comunidad_eventos_internacionales") ||
    explicit.includes("eventos_internacionales")
  )
    return "eventos_internacionales";
  if (
    explicit.includes("comunidad_cars_coffee") ||
    explicit.includes("cars_coffee") ||
    explicit.includes("cars & coffee")
  )
    return "cars_coffee";
  if (
    explicit.includes("comunidad_trackdays") ||
    explicit.includes("trackdays")
  )
    return "trackdays";
  if (
    explicit.includes("comunidad_clubes") ||
    explicit.includes("clubes") ||
    explicit.includes("club culture")
  )
    return "clubes";
  if (explicit.includes("comunidad_rutas") || explicit.includes("rutas"))
    return "rutas";
  if (
    explicit.includes("comunidad_underground") ||
    explicit.includes("underground")
  )
    return "underground";
  if (
    explicit.includes("comunidad_galerias") ||
    explicit.includes("galerias") ||
    explicit.includes("galería") ||
    explicit.includes("galeria")
  )
    return "galerias";
  if (explicit.includes("comunidad_meets") || explicit.includes("meets"))
    return "meets";

  return "";
}

function isCommunityPost(post: RawPost) {
  const explicit = getExplicitCommunityFields(post);
  return explicit.includes("comunidad") || Boolean(getCommunityFilterKey(post));
}

function detectCommunityType(post: RawPost): CommunityType | null {
  const explicit = getExplicitCommunityFields(post);
  const filterKey = getCommunityFilterKey(post);

  if (!explicit || !isCommunityPost(post)) return null;

  if (filterKey === "clubes") return "Clubes";
  if (filterKey === "rutas") return "Rutas";
  if (
    filterKey === "meets" ||
    filterKey === "cars_coffee" ||
    filterKey === "galerias"
  )
    return "Meets";

  return "Eventos";
}

function detectGalleryPost(post: RawPost) {
  const filterKey = getCommunityFilterKey(post);
  const contentType = normalizeText(post.contentType);
  const galleryCount = Array.isArray(post.galleryUrls)
    ? post.galleryUrls.length
    : 0;

  return (
    filterKey === "galerias" ||
    contentType === "galeria" ||
    contentType === "galería" ||
    galleryCount > 1
  );
}

function detectCommunityRegion(post: RawPost): CommunityRegion {
  const filterKey = getCommunityFilterKey(post);
  const explicitRegion = normalizeText(post.communityRegion);

  if (
    filterKey === "eventos_internacionales" ||
    explicitRegion.includes("internacional")
  ) {
    return "Internacionales";
  }

  return "Nacionales";
}

function detectEditorialGroup(
  post: RawPost,
  type: CommunityType,
): CommunityEditorialGroup {
  const filterKey = getCommunityFilterKey(post);

  if (filterKey === "cars_coffee") return "Cars & Coffee";
  if (filterKey === "trackdays") return "Trackdays";
  if (filterKey === "clubes") return "Club Culture";
  if (filterKey === "rutas") return "Rutas";
  if (filterKey === "underground") return "Underground";
  if (filterKey === "meets") return "Meets";

  if (type === "Clubes") return "Club Culture";
  if (type === "Rutas") return "Rutas";

  return "Meets";
}

function getSlugValue(slug?: string | { current?: string }) {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return String(slug.current || "");
}

function getMainImage(it: RawPost, fallback = "/images/comunidad.jpg") {
  return (
    String(it.mainImageUrl || "").trim() ||
    (Array.isArray(it.galleryUrls) && it.galleryUrls[0]
      ? String(it.galleryUrls[0])
      : fallback)
  );
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


function uniqueStrings(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean),
    ),
  );
}

function normalizeGalleryEntry(raw: any): PhotoGalleryEntry {
  const cover = String(raw?.coverImageUrl || raw?.img || "").trim();
  const urls = uniqueStrings([
    cover,
    ...(Array.isArray(raw?.galleryUrls)
      ? raw.galleryUrls.map((value: unknown) => String(value || ""))
      : []),
  ]);

  return {
    id: String(raw?.id || `community-gallery-${Date.now()}`),
    title: String(raw?.title || "Nueva galería"),
    subtitle: String(raw?.subtitle || raw?.excerpt || ""),
    coverImageUrl: cover || urls[0] || "/images/comunidad.jpg",
    galleryUrls: urls.length > 0 ? urls : ["/images/comunidad.jpg"],
    when: String(raw?.when || ""),
  };
}

function sanitizePageSettings(
  raw?: any,
  fallbackHero = "/images/comunidad.jpg",
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
    photoGalleries: Array.isArray(raw?.photoGalleries)
      ? raw.photoGalleries.map(normalizeGalleryEntry)
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
            <p className="mx-auto mt-2 max-w-2xl text-gray-300 md:mx-0">
              {subtle}
            </p>
          ) : null}
          <div
            className={`mx-auto mt-3 h-px w-28 rounded-full md:mx-0 ${
              glow === "cool"
                ? "bg-gradient-to-r from-[#0CE0B2]/65 via-[#A3FF12]/55 to-[#E2A24C]/55"
                : "bg-gradient-to-r from-[#FF7A1A]/70 via-[#E2A24C]/55 to-[#0CE0B2]/55"
            }`}
          />
        </div>

        {showAction && actionLabel && onAction ? (
          <button
            type="button"
            onClick={onAction}
            className={`${getButtonClasses("pink")} hidden md:inline-flex`}
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
};

function CommunityCard({
  item,
  mobileSize = false,
}: {
  item: CommunityItem;
  mobileSize?: boolean;
}) {
  const compactDate = [item.day, item.when].filter(Boolean).join(" · ");
  const metaLine = [compactDate, formatEventTime(item.time)]
    .filter(Boolean)
    .join(" • ");

  return (
    <article
      className={`overflow-hidden rounded-[28px] border border-white/[0.08] bg-mw-surface/80 transition duration-300 hover:-translate-y-[4px] hover:border-white/14 hover:shadow-[0_0_34px_rgba(12,224,178,.13)] ${
        mobileSize ? "h-full" : ""
      }`}
    >
      <Link href={item.href} className="group flex h-full flex-col">
        <div
          className={`relative overflow-hidden ${mobileSize ? "h-[130px] md:h-[112px]" : "h-52"}`}
        >
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes={mobileSize ? "(max-width: 768px) 262px, 288px" : "(max-width: 1024px) 50vw, 33vw"}
            style={{ objectFit: "cover" }}
            className="transition duration-700 group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/24 to-black/10 transition-opacity duration-500 group-hover:opacity-90" />
          <span className="absolute left-3 top-3 rounded-full border border-white/[0.12] bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/90 backdrop-blur">
            {item.type}
          </span>
        </div>

        <div
          className={
            mobileSize ? "flex flex-1 flex-col p-4 md:p-3.5" : "flex flex-1 flex-col p-5"
          }
        >
          <div
            className={
              mobileSize
                ? "flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#0CE0B2]"
                : "flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-[#0CE0B2]"
            }
          >
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0CE0B2]" />
            <span className="line-clamp-1">
              {metaLine || "Fecha por confirmar"}
            </span>
          </div>

          {item.place ? (
            <p className="mt-2 line-clamp-1 text-[11px] uppercase tracking-[0.16em] text-gray-400">
              {item.place}
            </p>
          ) : null}

          <h4
            className={
              mobileSize
                ? "mt-2 line-clamp-2 text-base font-semibold leading-tight text-white transition group-hover:text-[#0CE0B2] md:text-[15px]"
                : "mt-2 line-clamp-2 text-xl font-semibold leading-tight text-white transition group-hover:text-[#0CE0B2]"
            }
          >
            {item.title}
          </h4>
          <p
            className={
              mobileSize
                ? "hidden md:mt-1 md:line-clamp-1 md:block md:text-[11px] md:leading-tight md:text-gray-300"
                : "mt-3 line-clamp-3 text-sm leading-relaxed text-gray-300"
            }
          >
            {item.excerpt}
          </p>

          <div className={mobileSize ? "mt-auto pt-2" : "mt-auto pt-5"}>
            <span
              className={
                mobileSize
                  ? "inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 transition group-hover:border-[#0CE0B2]/35 group-hover:text-[#0CE0B2]"
                  : "inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/85 transition group-hover:border-[#0CE0B2]/35 group-hover:text-[#0CE0B2]"
              }
            >
              Ver info / registro
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function CuratedCommunityRail({
  title,
  eyebrow,
  subtle,
  items,
  emptyText,
  glow = "cool",
}: {
  title: string;
  eyebrow?: string;
  subtle: string;
  items: CommunityItem[];
  emptyText: string;
  glow?: "cool" | "warm";
}) {
  return (
    <section className="pt-12">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
        {eyebrow ? (
          <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-gray-500">
            {eyebrow}
          </p>
        ) : null}

        <SectionHeader title={title} subtle={subtle} glow={glow} />

        {items.length > 0 ? (
          <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar sm:-mx-6 sm:px-6 xl:-mx-10 xl:px-10">
            <div
              className={`grid auto-cols-max grid-flow-col gap-4 md:gap-5 ${
                items.length > 1 ? "grid-rows-2" : "grid-rows-1"
              }`}
            >
              {items.map((item) => (
                <div
                  key={`${title}-${item.id}`}
                  className="h-[253px] w-[262px] min-w-[262px] shrink-0 snap-start md:h-[280px] md:w-[288px] md:min-w-[288px]"
                >
                  <CommunityCard item={item} mobileSize />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/[0.08] bg-mw-surface/50 p-8 text-center text-sm text-gray-300 md:text-base">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
}

function GalleryTile({
  gallery,
  editable,
  onOpen,
  onEdit,
}: {
  gallery: PhotoGalleryEntry;
  editable: boolean;
  onOpen: () => void;
  onEdit: () => void;
}) {
  return (
    <article className="group relative h-full overflow-hidden rounded-[28px] border border-white/[0.08] bg-mw-surface/80 transition hover:-translate-y-[4px] hover:border-white/14 hover:shadow-[0_0_34px_rgba(255,122,26,.13)]">
      <button type="button" onClick={onOpen} className="block h-full w-full text-left">
        <div className="relative h-[130px] w-full overflow-hidden md:h-[112px]">
          <Image
            src={gallery.coverImageUrl || gallery.galleryUrls?.[0] || "/images/comunidad.jpg"}
            alt={gallery.title}
            fill
            sizes="(max-width: 768px) 262px, 288px"
            style={{ objectFit: "cover" }}
            className="transition duration-700 group-hover:scale-[1.06]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/86 via-black/22 to-black/10" />
          <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white/90 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#FF7A1A]" />
            Fotos
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4 md:p-3.5">
          {gallery.when ? (
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#FF7A1A]">
              {gallery.when}
            </p>
          ) : null}
          <h4 className="mt-2 line-clamp-2 text-base font-semibold leading-tight text-white transition group-hover:text-[#FF7A1A] md:text-[15px]">
            {gallery.title}
          </h4>
          {gallery.subtitle ? (
            <p className="hidden md:mt-1 md:line-clamp-1 md:block md:text-[11px] md:leading-tight md:text-gray-300">
              {gallery.subtitle}
            </p>
          ) : null}
          <div className="mt-auto pt-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/85 transition group-hover:border-[#FF7A1A]/35 group-hover:text-[#FF7A1A]">
              Ver galería
              <span aria-hidden>→</span>
            </span>
          </div>
        </div>
      </button>

      {editable ? (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onEdit();
          }}
          className="absolute right-3 top-3 z-20 rounded-full border border-white/15 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur hover:bg-black/90"
        >
          Editar
        </button>
      ) : null}
    </article>
  );
}

function PhotoGalleryEditorModal({
  draft,
  setDraft,
  onClose,
  onSave,
  onDelete,
  canDelete,
  onUploadCover,
  onUploadImages,
  onRemoveImage,
  onSetCover,
  saving,
}: {
  draft: PhotoGalleryEntry | null;
  setDraft: React.Dispatch<React.SetStateAction<PhotoGalleryEntry | null>>;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onUploadCover: (files?: FileList | null) => void;
  onUploadImages: (files?: FileList | null) => void;
  onRemoveImage: (url: string) => void;
  onSetCover: (url: string) => void;
  saving: boolean;
}) {
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const imagesInputRef = useRef<HTMLInputElement | null>(null);

  if (!draft) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar editor de galería"
      />

      <div className="relative z-10 flex max-h-[calc(100dvh-1rem)] w-full max-w-[min(1180px,calc(100vw-1rem))] flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#071412]/95 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.22em] text-[#0CE0B2]">
              Editor de galería
            </div>
            <h3 className="mt-1 text-xl font-semibold text-white sm:text-2xl">
              {draft.title || "Nueva galería"}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/5 text-white hover:bg-white/10"
            aria-label="Cerrar editor"
          >
            ×
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-[1.15fr_.85fr]">
          <div className="min-h-0 border-b border-white/[0.08] lg:border-b-0 lg:border-r lg:border-white/[0.08]">
            <div className="relative aspect-[16/10] max-h-[46vh] bg-black lg:max-h-[52vh]">
              <img
                src={draft.coverImageUrl || draft.galleryUrls?.[0] || "/images/comunidad.jpg"}
                alt={draft.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-full border border-white/[0.08] bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                >
                  Subir portada
                </button>

                <button
                  type="button"
                  onClick={() => imagesInputRef.current?.click()}
                  className="rounded-full border border-white/[0.08] bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                >
                  Subir nuevas fotos
                </button>
              </div>

              <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onUploadCover(e.target.files); e.currentTarget.value = ""; }} />
              <input ref={imagesInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onUploadImages(e.target.files); e.currentTarget.value = ""; }} />

              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Galería</p>
                <div className="mt-3 grid max-h-[36vh] grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:max-h-[34vh]">
                  {draft.galleryUrls?.map((url) => {
                    const isCover = url === draft.coverImageUrl;
                    return (
                      <div key={url} className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/20">
                        <div className="relative aspect-square">
                          <img src={url} alt={draft.title} className="h-full w-full object-cover" />
                        </div>
                        <div className="space-y-2 p-2">
                          <button
                            type="button"
                            onClick={() => onSetCover(url)}
                            className={`w-full rounded-xl px-2 py-1 text-[10px] font-semibold ${isCover ? "border border-[#0CE0B2]/40 bg-[#0CE0B2]/10 text-[#0CE0B2]" : "border border-white/[0.08] bg-white/5 text-white hover:bg-white/10"}`}
                          >
                            {isCover ? "Portada" : "Usar portada"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onRemoveImage(url)}
                            className="w-full rounded-xl border border-red-400/30 bg-red-500/10 px-2 py-1 text-[10px] font-semibold text-red-200 hover:bg-red-500/15"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-0 p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-gray-400">Título</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-gray-400">Fecha / etiqueta</label>
                <input
                  value={draft.when}
                  onChange={(e) => setDraft((prev) => (prev ? { ...prev, when: e.target.value } : prev))}
                  placeholder="24 may 2026"
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-gray-400">Descripción / historia corta</label>
                <textarea
                  rows={6}
                  value={draft.subtitle}
                  onChange={(e) => setDraft((prev) => (prev ? { ...prev, subtitle: e.target.value } : prev))}
                  className="w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/50"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                <button type="button" onClick={onSave} disabled={saving} className={getButtonClasses("pink")}>
                  {saving ? "Guardando..." : "Guardar galería"}
                </button>

                {canDelete ? (
                  <button
                    type="button"
                    onClick={onDelete}
                    className="inline-flex items-center justify-center rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
                  >
                    Eliminar galería
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/[0.08] px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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

function PartnersRow({ partners }: { partners: PartnerLogo[] }) {
  if (!partners.length) return null;

  return (
    <section className="py-14 sm:py-16">
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
        <SectionHeader
          title="Aliados de la comunidad"
          subtle="Marcas, clubes y proyectos que suman al ecosistema MotorWelt."
          glow="cool"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {partners.map((partner) => {
            const content = (
              <div className="relative h-24 overflow-hidden rounded-2xl border border-white/[0.08] bg-mw-surface/70">
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
      <header className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.08] bg-mw-surface/70 backdrop-blur-md">
        <div className="mx-auto grid h-16 w-full max-w-[1440px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
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
                className="inline-flex h-10 items-center leading-none border-b-2 border-[#0CE0B2] text-white"
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
              <Link
                href="/tuning"
                className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Tuning
              </Link>
              <Link
                href="/noticias/autos"
                className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Autos
              </Link>
              <Link
                href="/noticias/motos"
                className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Motos
              </Link>
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
      className={`relative mx-auto w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-mw-surface/70 ${
        isLeaderboard
          ? "max-w-[970px] aspect-[970/120] min-h-[20px] sm:min-h-[72px] md:min-h-0"
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
                className="h-full w-full bg-black/20 object-cover object-center"
              />
            </a>
          ) : (
            <img
              src={ad.imageUrl}
              alt={ad.label}
              className="h-full w-full bg-black/20 object-cover object-center"
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
          <div className="hidden h-full w-full items-center justify-center text-center text-gray-500 md:flex">
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
  sectionHeroImages = DEFAULT_SECTION_HERO_IMAGES,
}: {
  year: number;
  communityItems?: CommunityItem[];
  initialSettings?: CommunityPageSettings;
  sectionHeroImages?: SectionHeroImages;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<CommunityPageSettings>(
    sanitizePageSettings(initialSettings, initialSettings?.heroImageUrl),
  );

  const [editingGallery, setEditingGallery] = useState<PhotoGalleryEntry | null>(null);
  const [activeGallery, setActiveGallery] = useState<PhotoGalleryEntry | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const [composerOpen, setComposerOpen] = useState(false);
  const [composerKind, setComposerKind] = useState<ComposerKind>("Eventos");
  const [composerForm, setComposerForm] =
    useState<ComposerFormState>(EMPTY_COMPOSER);
  const [composerFile, setComposerFile] = useState<File | null>(null);
  const [composerSaving, setComposerSaving] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  const [contactOpen, setContactOpen] = useState(false);
  const [contactForm, setContactForm] =
    useState<ContactFormState>(EMPTY_CONTACT);
  const [contactError, setContactError] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);
  const composerCoverInputRef = useRef<HTMLInputElement | null>(null);

  const eventItems = communityItems.filter((item) => !item.isGallery);
  const featured = eventItems[0] || null;
  const nationalItems = communityItems
    .filter((item) => item.filterKey === "eventos_nacionales")
    .slice(0, 8);
  const internationalItems = communityItems
    .filter((item) => item.filterKey === "eventos_internacionales")
    .slice(0, 8);
  const carsCoffeeItems = communityItems
    .filter((item) => item.filterKey === "cars_coffee")
    .slice(0, 8);
  const trackdayItems = communityItems
    .filter((item) => item.filterKey === "trackdays")
    .slice(0, 8);
  const clubCultureItems = communityItems
    .filter((item) => item.filterKey === "clubes")
    .slice(0, 8);
  const routeItems = communityItems
    .filter((item) => item.filterKey === "rutas")
    .slice(0, 8);
  const undergroundItems = communityItems
    .filter((item) => item.filterKey === "underground")
    .slice(0, 8);
  const galleryItems = (settings.photoGalleries || []).slice(0, 8);

  const activeGalleryUrls = activeGallery
    ? uniqueStrings([
        activeGallery.coverImageUrl,
        ...(activeGallery.galleryUrls || []),
      ])
    : [];

  const activeGalleryImage =
    activeGalleryUrls[activeGalleryIndex] ||
    activeGalleryUrls[0] ||
    activeGallery?.coverImageUrl ||
    "";

  const canDeleteEditingGallery = Boolean(
    editingGallery &&
      (settings.photoGalleries || []).some((gallery) => gallery.id === editingGallery.id),
  );

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

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen || composerOpen || contactOpen || editingGallery || activeGallery || fullscreenImage ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, composerOpen, contactOpen, editingGallery, activeGallery, fullscreenImage]);

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
            ? "Galería"
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
        tags: composerKind === "Galería" ? ["galeria", "highlights"] : [],
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

  function openGalleryEditor(gallery?: PhotoGalleryEntry) {
    if (gallery) {
      setEditingGallery(normalizeGalleryEntry(gallery));
      return;
    }

    setEditingGallery(
      normalizeGalleryEntry({
        id: `community-gallery-${Date.now()}`,
        title: "Nueva galería",
        subtitle: "",
        coverImageUrl: "/images/comunidad.jpg",
        galleryUrls: ["/images/comunidad.jpg"],
        when: "",
      }),
    );
  }

  async function saveGalleryDraft() {
    if (!editingGallery) return;

    const normalized = normalizeGalleryEntry(editingGallery);
    const currentGalleries = settings.photoGalleries || [];
    const exists = currentGalleries.some((gallery) => gallery.id === normalized.id);

    const nextSettings: CommunityPageSettings = {
      ...settings,
      photoGalleries: exists
        ? currentGalleries.map((gallery) =>
            gallery.id === normalized.id ? normalized : gallery,
          )
        : [normalized, ...currentGalleries],
    };

    await persistSettings(nextSettings);
    setEditingGallery(null);
  }

  async function deleteGalleryDraft() {
    if (!editingGallery) return;

    const ok =
      typeof window !== "undefined"
        ? window.confirm("¿Seguro que quieres eliminar esta galería?")
        : false;

    if (!ok) return;

    const nextSettings: CommunityPageSettings = {
      ...settings,
      photoGalleries: (settings.photoGalleries || []).filter(
        (gallery) => gallery.id !== editingGallery.id,
      ),
    };

    await persistSettings(nextSettings);
    setEditingGallery(null);
    setActiveGallery(null);
  }

  async function uploadGalleryCover(files?: FileList | null) {
    const file = files?.[0];
    if (!file || !editingGallery) return;

    try {
      const uploaded = await uploadAssetToSanity(file);
      setEditingGallery((prev) => {
        if (!prev) return prev;
        const nextGalleryUrls = uniqueStrings([
          uploaded.url,
          ...(prev.galleryUrls || []),
        ]);
        return {
          ...prev,
          coverImageUrl: uploaded.url,
          galleryUrls: nextGalleryUrls,
        };
      });
    } catch (err: any) {
      setError(err?.message || "No se pudo subir la portada de la galería.");
    }
  }

  async function uploadGalleryImages(files?: FileList | null) {
    if (!files || files.length === 0 || !editingGallery) return;

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const uploaded = await uploadAssetToSanity(file);
        uploadedUrls.push(uploaded.url);
      }

      setEditingGallery((prev) => {
        if (!prev) return prev;
        const nextGalleryUrls = uniqueStrings([
          ...(prev.galleryUrls || []),
          ...uploadedUrls,
        ]);
        return {
          ...prev,
          galleryUrls: nextGalleryUrls,
          coverImageUrl:
            prev.coverImageUrl || nextGalleryUrls[0] || "/images/comunidad.jpg",
        };
      });
    } catch (err: any) {
      setError(err?.message || "No se pudieron subir las fotos de la galería.");
    }
  }

  function setGalleryCover(url: string) {
    setEditingGallery((prev) => (prev ? { ...prev, coverImageUrl: url } : prev));
  }

  function removeGalleryImage(url: string) {
    setEditingGallery((prev) => {
      if (!prev) return prev;
      const nextGalleryUrls = (prev.galleryUrls || []).filter((item) => item !== url);
      const safeGalleryUrls =
        nextGalleryUrls.length > 0 ? nextGalleryUrls : ["/images/comunidad.jpg"];
      const nextCover =
        prev.coverImageUrl === url ? safeGalleryUrls[0] : prev.coverImageUrl;

      return {
        ...prev,
        galleryUrls: safeGalleryUrls,
        coverImageUrl: nextCover,
      };
    });
  }

  async function submitContactRequest() {
    setContactError(null);

    const fullName = contactForm.fullName.trim();
    const email = contactForm.email.trim();
    const phone = contactForm.phone.trim();
    const subject = contactForm.subject.trim();

    if (!fullName) {
      setContactError("Agrega tu nombre completo.");
      return;
    }
    if (!email) {
      setContactError("Agrega tu correo.");
      return;
    }
    if (!phone) {
      setContactError("Agrega tu teléfono.");
      return;
    }
    if (!subject) {
      setContactError("Agrega un asunto.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          phone,
          subject,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo enviar el mensaje.");
      }

      setContactOpen(false);
      setContactForm(EMPTY_CONTACT);
    } catch (err: any) {
      setContactError(
        err?.message || "No se pudo enviar el mensaje. Intenta de nuevo.",
      );
    }
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
          <div className="w-full max-w-2xl rounded-[28px] border border-white/[0.08] bg-[#041210] p-6 shadow-2xl backdrop-blur-xl">
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
                <label className="mb-2 block text-sm text-gray-300">
                  Título
                </label>
                <input
                  value={composerForm.title}
                  onChange={(e) =>
                    setComposerForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
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
                <label className="mb-2 block text-sm text-gray-300">
                  Fecha
                </label>
                <input
                  type="date"
                  value={composerForm.date}
                  onChange={(e) =>
                    setComposerForm((prev) => ({
                      ...prev,
                      date: e.target.value,
                    }))
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
                    setComposerForm((prev) => ({
                      ...prev,
                      place: e.target.value,
                    }))
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
                    setComposerForm((prev) => ({
                      ...prev,
                      excerpt: e.target.value,
                    }))
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
                    {composerFile
                      ? composerFile.name
                      : "No hay archivo seleccionado"}
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
          <div className="w-full max-w-2xl rounded-[28px] border border-white/[0.08] bg-[#041210] p-6 shadow-2xl backdrop-blur-xl">
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
                <label className="mb-2 block text-sm text-gray-300">
                  Correo
                </label>
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
                <label className="mb-2 block text-sm text-gray-300">
                  Asunto
                </label>
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

      {editingGallery && (
        <PhotoGalleryEditorModal
          draft={editingGallery}
          setDraft={setEditingGallery}
          onClose={() => setEditingGallery(null)}
          onSave={saveGalleryDraft}
          onDelete={deleteGalleryDraft}
          canDelete={canDeleteEditingGallery}
          onUploadCover={uploadGalleryCover}
          onUploadImages={uploadGalleryImages}
          onRemoveImage={removeGalleryImage}
          onSetCover={setGalleryCover}
          saving={saving}
        />
      )}

      {activeGallery && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-5">
          <button
            type="button"
            className="absolute inset-0 bg-black/85 backdrop-blur-md"
            onClick={() => setActiveGallery(null)}
            aria-label="Cerrar galería"
          />

          <div className="relative z-10 flex max-h-[calc(100dvh-1rem)] w-full max-w-[calc(100vw-.75rem)] flex-col overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#071412]/95 shadow-2xl sm:max-w-6xl">
            <div className="flex shrink-0 items-center justify-between border-b border-white/[0.08] px-4 py-3 sm:px-6 sm:py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                  Fotos Preview{activeGallery.when ? ` · ${activeGallery.when}` : ""}
                </div>
                <h3 className="mt-1 truncate text-lg font-semibold text-white sm:text-2xl">
                  {activeGallery.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveGallery(null)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/5 text-white hover:bg-white/10"
                aria-label="Cerrar preview"
              >
                ×
              </button>
            </div>

            <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[1.5fr_.7fr]">
              <div className="min-w-0 bg-black">
                <div className="relative h-[52dvh] min-h-[300px] max-h-[560px] bg-black sm:h-[64vh] lg:h-auto lg:aspect-[16/10] lg:max-h-none">
                  <button
                    type="button"
                    onClick={() => setFullscreenImage(activeGalleryImage)}
                    className="block h-full w-full cursor-zoom-in"
                    aria-label="Ver foto en pantalla completa"
                  >
                    <img
                      src={activeGalleryImage}
                      alt={activeGallery.title}
                      className="h-full w-full object-contain"
                    />
                  </button>

                  {activeGalleryUrls.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveGalleryIndex((prev) =>
                            prev === 0 ? activeGalleryUrls.length - 1 : prev - 1,
                          )
                        }
                        className="absolute left-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/60 md:inline-flex"
                        aria-label="Foto anterior"
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setActiveGalleryIndex((prev) =>
                            prev === activeGalleryUrls.length - 1 ? 0 : prev + 1,
                          )
                        }
                        className="absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/60 md:inline-flex"
                        aria-label="Foto siguiente"
                      >
                        ›
                      </button>
                    </>
                  ) : null}
                </div>

                {activeGalleryUrls.length > 1 ? (
                  <div className="relative z-20 flex touch-pan-x gap-3 overflow-x-auto overscroll-x-contain border-t border-white/[0.08] bg-black/95 p-3 no-scrollbar">
                    {activeGalleryUrls.map((url, index) => (
                      <button
                        key={`${url}-${index}`}
                        type="button"
                        onClick={() => setActiveGalleryIndex(index)}
                        className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border transition ${index === activeGalleryIndex ? "border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.28)]" : "border-white/[0.08]"}`}
                      >
                        <img src={url} alt={`${activeGallery.title} ${index + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-col justify-between p-5 sm:p-6">
                <div className="min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-300">
                    <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                    Fotos
                  </div>

                  <p className="mt-4 max-w-full break-words text-sm leading-relaxed text-gray-300 sm:text-base">
                    {activeGallery.subtitle || "Galería visual de la comunidad MotorWelt."}
                  </p>

                  <p className="mt-4 max-w-full break-words text-sm leading-relaxed text-gray-400">
                    Da clic en la foto principal para verla en pantalla completa.
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveGallery(null)}
                    className="inline-flex w-full items-center justify-center rounded-2xl border border-white/[0.08] px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
                  >
                    Cerrar preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {fullscreenImage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 p-4">
          <button
            type="button"
            className="absolute inset-0"
            onClick={() => setFullscreenImage(null)}
            aria-label="Cerrar imagen"
          />
          <img
            src={fullscreenImage}
            alt="Imagen en pantalla completa"
            className="relative z-10 max-h-[92vh] max-w-[96vw] object-contain"
          />
          <button
            type="button"
            onClick={() => setFullscreenImage(null)}
            className="absolute right-4 top-4 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white backdrop-blur hover:bg-white/15"
            aria-label="Cerrar imagen"
          >
            ×
          </button>
        </div>
      )}

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
                className={`streak streak-${s.v} ${s.dir === "rev" ? "dir-rev" : "dir-fwd"}`}
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
                {spectatorMode ? "Vista espectador" : "Modo edición comunidad"}
              </span>
              {saving && <span className="text-[#0CE0B2]">Guardando…</span>}
            </div>
            {error && <div className="mt-1 text-red-300">{error}</div>}
            <button
              type="button"
              onClick={() => setSpectatorMode((v) => !v)}
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
                src={settings.heroImageUrl || DEFAULT_SETTINGS.heroImageUrl}
                alt="Comunidad | MotorWelt"
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
                    className="rounded-full border border-white/15 bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                  >
                    Cambiar portada
                  </button>
                </div>
              )}

              <div className="relative z-10 w-full px-4 pb-14 pt-14 sm:px-6 lg:pb-16 xl:px-10">
                <div className="mx-auto w-full max-w-[1440px] 2xl:max-w-[1560px]">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-gray-200 backdrop-blur md:text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                      MotorWelt Comunidad
                    </div>

                    <h1 className="mt-5 font-display text-[3.1rem] font-black leading-[0.9] tracking-[-0.05em] text-white glow-cool sm:text-[4.2rem] md:text-[4.8rem] lg:text-[5.4rem]">
                      Comunidad & Eventos
                    </h1>

                    <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-200 sm:text-lg">
                      Eventos, rutas, meets y cultura automotriz curada desde la visión editorial de MotorWelt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {(settings.ads.leaderboard.enabled || editControlsVisible) && (
            <section
              className={`${!settings.ads.leaderboard.enabled ? "hidden md:block" : ""} py-4 sm:py-6`}
            >
              <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
                <AdSlot
                  kind="leaderboard"
                  ad={settings.ads.leaderboard}
                  editable={editControlsVisible}
                  inputRef={leaderboardInputRef}
                  onToggle={() => void toggleAd("leaderboard")}
                  onPick={(files) =>
                    void handleAdImagePick("leaderboard", files)
                  }
                  onEditLink={() => void editAdLink("leaderboard")}
                  onClear={() => void clearAdImage("leaderboard")}
                />
              </div>
            </section>
          )}

          {featured ? (
            <section className="pt-10">
              <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
                <SectionHeader
                  title="Próximo destacado"
                  subtle="El último evento publicado dentro de MotorWelt Comunidad."
                  glow="cool"
                />

                <article className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-mw-surface/70">
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
                        <div className="absolute -bottom-28 -left-24 h-96 w-96 rounded-full bg-[#0CE0B2]/20 blur-3xl" />
                        <div className="absolute -right-14 -top-24 h-[28rem] w-[28rem] rounded-full bg-[#A3FF12]/12 blur-3xl" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                      <span className="inline-block rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                        {[featured.day, featured.when]
                          .filter(Boolean)
                          .join(" · ") || "Fecha por confirmar"}
                        {featured.time
                          ? ` • ${formatEventTime(featured.time)}`
                          : ""}
                        {featured.place ? ` — ${featured.place}` : ""}
                      </span>

                      <h3 className="mt-3 text-3xl font-extrabold text-white md:text-4xl">
                        {featured.title}
                      </h3>

                      <p className="mt-3 max-w-2xl text-sm text-gray-200 md:text-base">
                        {featured.excerpt}
                      </p>

                      <div className="mt-5 hidden flex-wrap gap-3 md:flex">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setContactOpen(true);
                          }}
                          className={getButtonClasses("cyan")}
                        >
                          Solicitar información
                        </button>
                        <span className={getButtonClasses("pink")}>
                          Ver información del evento
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              </div>
            </section>
          ) : null}

          <CuratedCommunityRail
            title="Nacionales"
            eyebrow="Curaduría México"
            subtle="Eventos, rutas y clubes dentro de México seleccionados por presencia visual y comunidad."
            items={nationalItems}
            emptyText="Próximamente aparecerán aquí eventos nacionales curados por MotorWelt."
            glow="cool"
          />

          <CuratedCommunityRail
            title="Internacionales"
            eyebrow="Global watchlist"
            subtle="Eventos y referencias fuera de México que elevan la conversación: cultura, diseño, performance y comunidad global."
            items={internationalItems}
            emptyText="Próximamente aparecerán aquí referencias internacionales seleccionadas por MotorWelt."
            glow="warm"
          />

          <CuratedCommunityRail
            title="Cars & Coffee"
            eyebrow="Morning culture"
            subtle="Mañanas entre motores, conversaciones y autos que cuentan historias."
            items={carsCoffeeItems}
            emptyText="Próximamente habrá Cars & Coffee publicados en esta sección."
            glow="cool"
          />

          <CuratedCommunityRail
            title="Trackdays"
            eyebrow="Performance calendar"
            subtle="Días de pista, experiencias de manejo y eventos donde la velocidad también necesita contexto."
            items={trackdayItems}
            emptyText="Próximamente habrá trackdays curados dentro de MotorWelt Comunidad."
            glow="warm"
          />

          <CuratedCommunityRail
            title="Club Culture"
            eyebrow="Crews & garages"
            subtle="Clubes, grupos y comunidades con identidad propia: la gente detrás de los autos."
            items={clubCultureItems}
            emptyText="Próximamente habrá clubes y grupos publicados en esta sección."
            glow="cool"
          />

          <CuratedCommunityRail
            title="Rutas"
            eyebrow="Road stories"
            subtle="Salidas, rodadas y viajes donde el destino importa, pero la historia está en el camino."
            items={routeItems}
            emptyText="Próximamente habrá rutas publicadas dentro de MotorWelt Comunidad."
            glow="warm"
          />

          <CuratedCommunityRail
            title="Underground"
            eyebrow="Street selected"
            subtle="La parte más cruda y visual de la cultura automotriz: stance, drift, crews y escenas locales, siempre curadas."
            items={undergroundItems}
            emptyText="Próximamente habrá contenido underground seleccionado por MotorWelt."
            glow="cool"
          />

          <section className="pt-12">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <SectionHeader
                title="Últimas galerías"
                subtle="Highlights visuales de encuentros, rutas y momentos recientes de la comunidad."
                glow="warm"
                showAction={editControlsVisible}
                actionLabel="Publicar galería"
                onAction={() => openGalleryEditor()}
              />

              {galleryItems.length > 0 ? (
                <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar sm:-mx-6 sm:px-6 xl:-mx-10 xl:px-10">
                  <div
                    className={`grid auto-cols-max grid-flow-col gap-4 md:gap-5 ${
                      galleryItems.length > 1 ? "grid-rows-2" : "grid-rows-1"
                    }`}
                  >
                    {galleryItems.map((gallery) => (
                      <div
                        key={`galeria-${gallery.id}`}
                        className="h-[253px] w-[262px] min-w-[262px] shrink-0 snap-start md:h-[280px] md:w-[288px] md:min-w-[288px]"
                      >
                        <GalleryTile
                          gallery={gallery}
                          editable={editControlsVisible}
                          onOpen={() => {
                            setActiveGallery(gallery);
                            setActiveGalleryIndex(0);
                          }}
                          onEdit={() => openGalleryEditor(gallery)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/[0.08] bg-mw-surface/60 p-8 text-center text-gray-300">
                  Próximamente tendremos highlights visuales de la comunidad.
                </div>
              )}
            </div>
          </section>

          {(settings.ads.billboard.enabled || editControlsVisible) && (
            <section
              className={`${!settings.ads.billboard.enabled ? "hidden md:block" : ""} py-8`}
            >
              <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
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
          )}

          <section className="pt-12">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <div className="rounded-[28px] border border-white/[0.08] bg-black/20 p-6 backdrop-blur-md md:p-8">
                <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr] lg:items-center">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                      MotorWelt Comunidad
                    </p>
                    <h3 className="mt-2 text-3xl font-extrabold text-white md:text-4xl">
                      Publica tu evento en MotorWelt
                    </h3>
                    <p className="mt-3 max-w-2xl text-sm text-gray-300 md:text-base">
                      Si organizas un meet, ruta, trackday, cars & coffee o
                      encuentro especial, este espacio está pensado para darle
                      visibilidad, contexto y presencia visual.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/[0.08] bg-white/5 p-5">
                    <p className="text-sm text-gray-300">Podrás integrar:</p>
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

          <PartnersRow partners={settings.partnerLogos} />
        </main>

        <footer
          aria-hidden={mobileOpen}
          className="relative z-10 mt-12 border-t border-white/[0.08] bg-mw-surface/70 py-10 text-gray-300 backdrop-blur-md"
        >
          <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 md:grid-cols-3 xl:px-10 2xl:max-w-[1560px]">
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
                  <Link href="/perfil" className="hover:text-white">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setContactOpen(true)}
                    className="hover:text-white"
                  >
                    Contacto
                  </button>
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
          text-shadow:
            0 0 12px rgba(12, 224, 178, 0.28),
            0 0 26px rgba(12, 224, 178, 0.22),
            0 0 50px rgba(12, 224, 178, 0.14);
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

export async function getServerSideProps() {
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const allPostsQuery = `
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
      eventDate,
      eventDateTime,
      eventTime,
      eventLocationName,
      eventLocationUrl,
      locationName,
      locationUrl,
      place,
      placeName,
      placeUrl,
      googleMapsUrl,
      googleMapsLink,
      mapsUrl,
      eventMapsUrl,
      eventMapUrl,
      registrationUrl,
      registerUrl,
      ticketUrl,
      ticketsUrl,
      externalUrl,
      contentType,
      communitySection,
      communityRegion,
      communityEditorialGroup,
      section,
      category,
      subcategory,
      categories,
      tags,
      "mainImageUrl": coalesce(mainImageUrl, coverImage.asset->url, mainImage.asset->url, heroImage.asset->url, image.asset->url, galleryUrls[0]),
      "galleryUrls": coalesce(galleryUrls, [])
    }
  `;

  const communitySettingsQuery = `
    *[_type in ["homeSettings", "sitePageSettings", "pageSettings"] && pageKey == "comunidad"][0]{
      "heroImageUrl": coalesce(heroImageUrl, ""),
      "ads": {
        "leaderboard": { "enabled": coalesce(ads.leaderboard.enabled, true), "label": coalesce(ads.leaderboard.label, "Publicidad — Leaderboard (728×90 / 970×250)"), "imageUrl": coalesce(ads.leaderboard.imageUrl, ""), "href": coalesce(ads.leaderboard.href, "") },
        "billboard": { "enabled": coalesce(ads.billboard.enabled, true), "label": coalesce(ads.billboard.label, "Publicidad — Billboard (970×250 / 970×90)"), "imageUrl": coalesce(ads.billboard.imageUrl, ""), "href": coalesce(ads.billboard.href, "") }
      },
      "partnerLogos": coalesce(partnerLogos, []),
      "photoGalleries": coalesce(photoGalleries, [])
    }
  `;

  const sectionSettingsQuery = `
    *[_type in ["sitePageSettings", "pageSettings", "homeSettings"] && pageKey in ["tuning", "deportes", "lifestyle", "comunidad", "autos", "motos"]]{
      pageKey,
      "heroImageUrl": coalesce(heroImageUrl, "")
    }
  `;

  const autosFallbackQuery = `
    *[
      _type in ["article", "post"] &&
      coalesce(status, "publicado") == "publicado" &&
      defined(slug.current) &&
      (
        section == "autos" ||
        section == "noticias_autos" ||
        lower(category) == "autos" ||
        "autos" in categories[]
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0]{
      "image": coalesce(mainImageUrl, coverImage.asset->url, mainImage.asset->url, heroImage.asset->url, image.asset->url, galleryUrls[0], "")
    }
  `;

  const motosFallbackQuery = `
    *[
      _type in ["article", "post"] &&
      coalesce(status, "publicado") == "publicado" &&
      defined(slug.current) &&
      (
        section == "motos" ||
        section == "noticias_motos" ||
        lower(category) == "motos" ||
        "motos" in categories[]
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0]{
      "image": coalesce(mainImageUrl, coverImage.asset->url, mainImage.asset->url, heroImage.asset->url, image.asset->url, galleryUrls[0], "")
    }
  `;

  const [
    allPostsRaw,
    communitySettingsRaw,
    sectionSettingsRaw,
    autosFallback,
    motosFallback,
  ] = await Promise.all([
    sanityReadClient.fetch(allPostsQuery).catch(() => []),
    sanityReadClient.fetch(communitySettingsQuery).catch(() => null),
    sanityReadClient.fetch(sectionSettingsQuery).catch(() => []),
    sanityReadClient.fetch(autosFallbackQuery).catch(() => null),
    sanityReadClient.fetch(motosFallbackQuery).catch(() => null),
  ]);

  const rawPosts = Array.isArray(allPostsRaw) ? allPostsRaw : [];

  const communityItems: CommunityItem[] = rawPosts
    .map((it: RawPost) => {
      const type = detectCommunityType(it);
      if (!type) return null;
      const slug = getSlugValue(it.slug);
      if (!slug) return null;

      const filterKey = getCommunityFilterKey(it);
      const eventIso =
        it.eventDateTime ||
        it.eventDate ||
        it.publishedAt ||
        it._createdAt ||
        "";
      const place = String(
        it.eventLocationName ||
          it.locationName ||
          it.placeName ||
          it.place ||
          "",
      ).trim();
      const registrationUrl = String(
        it.registrationUrl ||
          it.registerUrl ||
          it.ticketUrl ||
          it.ticketsUrl ||
          it.externalUrl ||
          it.eventLocationUrl ||
          it.locationUrl ||
          it.googleMapsUrl ||
          it.googleMapsLink ||
          it.mapsUrl ||
          it.eventMapsUrl ||
          it.eventMapUrl ||
          it.placeUrl ||
          "",
      ).trim();

      return {
        id: String(it._id || slug),
        title: String(it.title || ""),
        excerpt: String(
          it.excerpt ||
            it.subtitle ||
            it.seoDescription ||
            "Consulta el detalle completo dentro de MotorWelt.",
        ),
        img: getMainImage(it, "/images/comunidad.jpg"),
        href: `/comunidad/${slug}`,
        when: formatWhen(eventIso),
        day: formatWeekday(eventIso),
        time: String(it.eventTime || ""),
        place,
        registrationUrl,
        type,
        region: detectCommunityRegion(it),
        editorialGroup: detectEditorialGroup(it, type),
        filterKey,
        isGallery: detectGalleryPost(it),
      };
    })
    .filter(Boolean) as CommunityItem[];

  const fallbackHero = communityItems[0]?.img || DEFAULT_SETTINGS.heroImageUrl;

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
    autos: settingsMap.get("autos") || String(autosFallback?.image || ""),
    motos: settingsMap.get("motos") || String(motosFallback?.image || ""),
    deportes: settingsMap.get("deportes"),
    lifestyle: settingsMap.get("lifestyle"),
    comunidad: settingsMap.get("comunidad"),
  });

  return {
    props: {
      year: new Date().getFullYear(),
      communityItems: Array.isArray(communityItems) ? communityItems : [],
      initialSettings: sanitizePageSettings(communitySettingsRaw, fallbackHero),
      sectionHeroImages,
    },
  };
}
