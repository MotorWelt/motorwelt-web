import React, { useEffect, useMemo, useRef, useState } from "react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Seo from "../../../components/Seo";
import ProfileButton from "../../../components/ProfileButton";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const nextI18NextConfig = require("../../../next-i18next.config.js");

type Category = "autos" | "motos";
type ButtonVariant = "cyan" | "pink" | "ghost" | "link";
type AdKind = "leaderboard" | "billboard";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
};

const Button: React.FC<ButtonProps> = ({
  className = "",
  children,
  variant = "cyan",
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold text-white transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60";

  const styles: Record<ButtonVariant, string> = {
    cyan: "border border-white/[0.06] bg-white/[0.035] shadow-[0_0_18px_rgba(12,224,178,.22),inset_0_0_0_1px_rgba(255,255,255,.035)] hover:bg-white/5 hover:shadow-[0_0_24px_rgba(12,224,178,.32),inset_0_0_0_1px_rgba(255,255,255,.05)] focus-visible:ring-[#0CE0B2]/35",
    pink: "border border-white/[0.06] bg-white/[0.035] shadow-[0_0_18px_rgba(255,122,26,.24),inset_0_0_0_1px_rgba(255,255,255,.035)] hover:bg-white/5 hover:shadow-[0_0_24px_rgba(255,122,26,.34),inset_0_0_0_1px_rgba(255,255,255,.05)] focus-visible:ring-[#FF7A1A]/35",
    ghost:
      "border border-white/[0.06] bg-white/[0.035] text-gray-100 hover:bg-white/5 hover:border-white/12 focus-visible:ring-white/20",
    link: "rounded-none border-0 p-0 text-[#43A1AD] underline underline-offset-4 shadow-none hover:opacity-80 focus-visible:ring-0",
  };

  return (
    <button {...props} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
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

type NewsArticle = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  body: string;
  section: string;
  contentType: string;
  status: string;
  tags: string[];
  authorName: string;
  authorEmail: string;
  seoTitle: string;
  seoDescription: string;
  updatedAt: string;
  publishedAt: string | null;
  mainImageUrl: string;
  galleryUrls: string[];
  videoUrl: string;
  reelUrl: string;
  useVideoAsHero: boolean;
};

type SidebarArticle = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string | null;
  mainImageUrl: string;
  href: string;
};

type NewsAdConfig = {
  enabled: boolean;
  label: string;
  imageUrl: string;
  href: string;
};

type NewsSettings = {
  ads: {
    leaderboard: NewsAdConfig;
    billboard: NewsAdConfig;
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

type BodyBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "h5"; text: string }
  | { type: "quote"; text: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; url: string };

const GLOBAL_SLUG_ADS_PAGE_KEY = "globalSlugAds";

const DEFAULT_NEWS_SETTINGS: NewsSettings = {
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

function sanitizeNewsSettings(raw?: any): NewsSettings {
  return {
    ads: {
      leaderboard: {
        enabled: Boolean(raw?.ads?.leaderboard?.enabled ?? true),
        label:
          String(raw?.ads?.leaderboard?.label || "").trim() ||
          DEFAULT_NEWS_SETTINGS.ads.leaderboard.label,
        imageUrl: String(raw?.ads?.leaderboard?.imageUrl || "").trim(),
        href: String(raw?.ads?.leaderboard?.href || "").trim(),
      },
      billboard: {
        enabled: Boolean(raw?.ads?.billboard?.enabled ?? true),
        label:
          String(raw?.ads?.billboard?.label || "").trim() ||
          DEFAULT_NEWS_SETTINGS.ads.billboard.label,
        imageUrl: String(raw?.ads?.billboard?.imageUrl || "").trim(),
        href: String(raw?.ads?.billboard?.href || "").trim(),
      },
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

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function normalizeUrl(url?: string | null) {
  return (url || "").trim();
}

function normalizeSectionText(value: unknown) {
  if (!value) return "";
  if (Array.isArray(value)) return value.map(normalizeSectionText).join(" ");
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(item.title || item.name || item.label || item.value || "")
      .trim()
      .toLowerCase();
  }
  return String(value).trim().toLowerCase();
}

function hrefFromRelatedPost(post: any) {
  const slug = String(post?.slug || "").trim();
  if (!slug) return "/";

  const blob = [
    post?.section,
    post?.category,
    post?.subcategory,
    post?.categories,
    post?.tags,
  ]
    .map(normalizeSectionText)
    .join(" ");

  if (blob.includes("tuning")) return `/tuning/${slug}`;
  if (blob.includes("deportes")) return `/deportes/${slug}`;
  if (blob.includes("lifestyle")) return `/lifestyle/${slug}`;
  if (blob.includes("comunidad")) return `/comunidad/${slug}`;
  if (blob.includes("noticias_motos") || blob.includes("motos")) {
    return `/noticias/motos/${slug}`;
  }
  if (blob.includes("noticias_autos") || blob.includes("autos")) {
    return `/noticias/autos/${slug}`;
  }

  return `/noticias/${post?.category === "motos" ? "motos" : "autos"}/${slug}`;
}

function getYoutubeEmbedUrl(url: string) {
  const clean = normalizeUrl(url);
  if (!clean) return "";

  try {
    const u = new URL(clean);

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.replace("/", "").trim();
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) {
        const id = u.searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }

      if (u.pathname.startsWith("/shorts/")) {
        const id = u.pathname.split("/shorts/")[1]?.split("/")[0];
        return id ? `https://www.youtube.com/embed/${id}` : "";
      }

      if (u.pathname.startsWith("/embed/")) {
        return clean;
      }
    }
  } catch {}

  return "";
}

function detectPlatform(url: string): "youtube" | "unknown" {
  const clean = normalizeUrl(url);
  if (!clean) return "unknown";
  const lower = clean.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be"))
    return "youtube";
  return "unknown";
}

function getEmbedUrl(url: string) {
  const platform = detectPlatform(url);
  if (platform === "youtube") return getYoutubeEmbedUrl(url);
  return "";
}

function parseBody(body: string): BodyBlock[] {
  const lines = (body || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: BodyBlock[] = [];
  let paragraphBuffer: string[] = [];

  const flushParagraph = () => {
    if (paragraphBuffer.length === 0) return;
    const text = paragraphBuffer.join(" ").replace(/\s+/g, " ").trim();
    if (text) blocks.push({ type: "p", text });
    paragraphBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      flushParagraph();
      blocks.push({
        type: "image",
        alt: imageMatch[1] || "Imagen",
        url: imageMatch[2] || "",
      });
      continue;
    }

    const videoMatch = line.match(/^@\[video\]\((.*?)\)$/);
    if (videoMatch) {
      flushParagraph();
      blocks.push({
        type: "video",
        url: videoMatch[1] || "",
      });
      continue;
    }

    if (line.startsWith("##### ")) {
      flushParagraph();
      blocks.push({ type: "h5", text: line.replace(/^##### /, "").trim() });
      continue;
    }

    if (line.startsWith("#### ")) {
      flushParagraph();
      blocks.push({ type: "h4", text: line.replace(/^#### /, "").trim() });
      continue;
    }

    if (line.startsWith("### ")) {
      flushParagraph();
      blocks.push({ type: "h3", text: line.replace(/^### /, "").trim() });
      continue;
    }

    if (line.startsWith("## ")) {
      flushParagraph();
      blocks.push({ type: "h2", text: line.replace(/^## /, "").trim() });
      continue;
    }

    if (line.startsWith("> ")) {
      flushParagraph();
      blocks.push({ type: "quote", text: line.replace(/^> /, "").trim() });
      continue;
    }

    paragraphBuffer.push(line);
  }

  flushParagraph();
  return blocks;
}

function InlineEmbed({ url, title }: { url: string; title?: string }) {
  const embedUrl = getEmbedUrl(url);
  const platform = detectPlatform(url);

  if (platform === "youtube" && embedUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-[24px] border border-white/[0.06] bg-black">
        <div className="relative aspect-[16/9] w-full">
          <iframe
            src={embedUrl}
            title={title || "Video"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/[0.06] bg-black/30 p-5 text-center">
      <p className="text-sm text-gray-300">Contenido externo disponible.</p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/[0.08] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
      >
        Abrir enlace
      </a>
    </div>
  );
}

function AdSlot({
  ad,
  editable,
  kind,
  layout = "default",
  onToggle,
  onPick,
  onEditLink,
  onClear,
  inputRef,
}: {
  ad: NewsAdConfig;
  editable: boolean;
  kind: AdKind;
  layout?: "default" | "sidebarTall";
  onToggle: () => void;
  onPick: (files?: FileList | null) => void;
  onEditLink: () => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  if (!ad.enabled) {
    if (!editable) return null;

    return (
      <div className="relative mx-auto hidden w-full rounded-2xl border border-white/[0.06] bg-mw-surface/70 py-8 text-center text-gray-500 md:block">
        <span className="px-4 text-[11px] sm:text-xs md:text-sm">
          {ad.label} · oculto
        </span>

        <div className="absolute left-1/2 top-3 z-20 hidden w-[calc(100%-1.5rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 md:flex">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            Mostrar
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            Imagen
          </button>
          <button
            type="button"
            onClick={onEditLink}
            className="rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
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

  const isLeaderboard = kind === "leaderboard";
  const isSidebarTall = layout === "sidebarTall";

  const boxClass = isLeaderboard
    ? "w-full min-h-[84px] aspect-[970/120] md:max-w-[1100px] md:min-h-0"
    : isSidebarTall
      ? "w-full min-h-[210px] lg:min-h-[250px]"
      : "max-w-[1100px] aspect-[970/250]";

  return (
    <div
      className={`relative mx-auto overflow-hidden rounded-2xl border border-white/[0.06] bg-mw-surface/70 ${boxClass}`}
    >
      {ad.imageUrl ? (
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
              className={`h-full w-full bg-black/20 ${
                isSidebarTall ? "object-cover" : "object-cover object-center"
              }`}
            />
          </a>
        ) : (
          <img
            src={ad.imageUrl}
            alt={ad.label}
            className={`h-full w-full bg-black/20 ${
              isSidebarTall ? "object-cover" : "object-cover object-center"
            }`}
          />
        )
      ) : (
        <div className="flex h-full w-full items-center justify-center px-4 pt-14 text-center text-gray-400">
          <span className="text-[11px] sm:text-xs md:text-sm">
            {ad.label}
          </span>
        </div>
      )}

      {editable && (
        <div className="absolute left-1/2 top-3 z-20 hidden w-[calc(100%-1.5rem)] -translate-x-1/2 flex-wrap items-center justify-center gap-2 md:flex">
          <button
            type="button"
            onClick={onToggle}
            className="rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            Ocultar
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
          >
            Imagen
          </button>
          <button
            type="button"
            onClick={onEditLink}
            className="rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
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

function SidebarArticleCard({
  item,
  category,
}: {
  item: SidebarArticle;
  category: Category;
}) {
  return (
    <Link
      href={item.href || `/noticias/${category}/${item.slug}`}
      className="group flex items-stretch gap-3 overflow-hidden rounded-[22px] border border-white/[0.06] bg-black/20 p-3 transition hover:border-white/12"
    >
      <div className="relative h-[82px] w-[96px] shrink-0 overflow-hidden rounded-[16px] sm:h-[88px] sm:w-[108px]">
        <img
          src={item.mainImageUrl || "/images/noticia-2.jpg"}
          alt={item.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        {item.publishedAt ? (
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
            {formatDate(item.publishedAt)}
          </p>
        ) : null}

        <h3 className="mt-1 line-clamp-2 text-[0.98rem] font-semibold leading-snug text-white">
          {item.title}
        </h3>

        {item.excerpt ? (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-300">
            {item.excerpt}
          </p>
        ) : null}
      </div>
    </Link>
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
      className="group relative block h-[270px] w-[290px] shrink-0 overflow-hidden rounded-[28px] border border-white/[0.06] bg-black/25 transition hover:border-white/12 sm:w-[340px] lg:h-[290px] lg:w-[390px]"
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
          <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/28 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/85 backdrop-blur">
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

function prettyCategory(cat: Category) {
  return cat === "autos" ? "Autos" : "Motos";
}

function categoryTheme(cat: Category) {
  if (cat === "autos") {
    return {
      label: "Autos",
      accent: "#0CE0B2",
      accentClass: "text-[#0CE0B2]",
      badgeDot: "bg-[#0CE0B2]",
      buttonVariant: "cyan" as ButtonVariant,
      pageKey: "autos",
      listingHref: "/noticias/autos",
      emptyImage: "/images/noticia-1.jpg",
    };
  }

  return {
    label: "Motos",
    accent: "#FF7A1A",
    accentClass: "text-[#FF7A1A]",
    badgeDot: "bg-[#FF7A1A]",
    buttonVariant: "pink" as ButtonVariant,
    pageKey: "motos",
    listingHref: "/noticias/motos",
    emptyImage: "/images/noticia-2.jpg",
  };
}

export default function NewsDetailPage({
  category,
  article,
  latestArticles,
  newsSettings,
  sectionHeroImages,
  year,
}: {
  category: Category;
  article: NewsArticle;
  latestArticles: SidebarArticle[];
  newsSettings: NewsSettings;
  sectionHeroImages: SectionHeroImages;
  year: number;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState<number | null>(
    null,
  );
  const [standaloneImage, setStandaloneImage] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settings, setSettings] = useState<NewsSettings>(
    sanitizeNewsSettings(newsSettings),
  );

  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);

  const theme = categoryTheme(category);

  const heroImage =
    article.mainImageUrl || article.galleryUrls?.[0] || theme.emptyImage;

  const gallery = Array.from(
    new Set(
      [article.mainImageUrl, ...(article.galleryUrls || [])]
        .map((u) => normalizeUrl(u))
        .filter(Boolean),
    ),
  );

  const bodyBlocks = useMemo(
    () => parseBody(article.body || ""),
    [article.body],
  );
  const heroVideoEmbed = getYoutubeEmbedUrl(article.videoUrl || "");
  const hasVideo = Boolean(heroVideoEmbed);
  const hasGallery = gallery.length > 1;
  const headerDate = article.publishedAt || article.updatedAt;

  const isImageModalOpen =
    activeGalleryIndex !== null || Boolean(standaloneImage);

  const currentModalImage =
    standaloneImage ||
    (activeGalleryIndex !== null ? gallery[activeGalleryIndex] : null);

  const canNavigateGallery = activeGalleryIndex !== null && gallery.length > 1;

  const streaks: Streak[] = useMemo(
    () => [
      {
        top: "7%",
        left: "-35%",
        v: "warm",
        dir: "fwd",
        delay: "0s",
        dur: "12s",
        op: 0.82,
      },
      {
        top: "14%",
        left: "-28%",
        v: "cool",
        dir: "rev",
        delay: ".7s",
        dur: "10.6s",
        op: 0.72,
      },
      {
        top: "23%",
        left: "-34%",
        v: "lime",
        dir: "fwd",
        delay: "1.2s",
        dur: "13.5s",
        op: 0.72,
      },
      {
        top: "31%",
        left: "-25%",
        v: "warm",
        dir: "rev",
        delay: "1.8s",
        dur: "11.4s",
        op: 0.8,
      },
      {
        top: "43%",
        left: "-38%",
        v: "cool",
        dir: "fwd",
        delay: "2.6s",
        dur: "12.8s",
        op: 0.78,
      },
      {
        top: "57%",
        left: "-27%",
        v: "warm",
        dir: "rev",
        delay: "3.2s",
        dur: "10.3s",
        op: 0.8,
      },
      {
        top: "69%",
        left: "-32%",
        v: "cool",
        dir: "fwd",
        delay: "4.1s",
        dur: "12.2s",
        op: 0.84,
      },
      {
        top: "81%",
        left: "-24%",
        v: "lime",
        dir: "rev",
        delay: "5.1s",
        dur: "13.4s",
        op: 0.7,
      },
      {
        top: "10%",
        left: "-37%",
        v: "warm",
        dir: "fwd",
        delay: ".2s",
        dur: "11.8s",
        op: 0.55,
        h: "1px",
      },
      {
        top: "36%",
        left: "-31%",
        v: "cool",
        dir: "rev",
        delay: "2.1s",
        dur: "13.2s",
        op: 0.5,
        h: "1px",
      },
      {
        top: "76%",
        left: "-20%",
        v: "lime",
        dir: "fwd",
        delay: "4.9s",
        dur: "12.6s",
        op: 0.48,
        h: "1px",
      },
    ],
    [],
  );

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
    document.body.style.overflow =
      mobileOpen || isImageModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, isImageModalOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveGalleryIndex(null);
    setStandaloneImage(null);
  }, [router.asPath]);

  function closeImageModal() {
    setActiveGalleryIndex(null);
    setStandaloneImage(null);
  }

  function openImage(url: string) {
    const idx = gallery.findIndex((item) => item === url);
    if (idx >= 0) {
      setStandaloneImage(null);
      setActiveGalleryIndex(idx);
      return;
    }
    setActiveGalleryIndex(null);
    setStandaloneImage(url);
  }

  function goToPrevImage() {
    if (activeGalleryIndex === null || gallery.length === 0) return;
    setActiveGalleryIndex(
      (activeGalleryIndex - 1 + gallery.length) % gallery.length,
    );
  }

  function goToNextImage() {
    if (activeGalleryIndex === null || gallery.length === 0) return;
    setActiveGalleryIndex((activeGalleryIndex + 1) % gallery.length);
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        closeImageModal();
      }

      if (activeGalleryIndex !== null) {
        if (e.key === "ArrowLeft") goToPrevImage();
        if (e.key === "ArrowRight") goToNextImage();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeGalleryIndex, gallery.length]);

  const adEditVisible = canEdit && !spectatorMode;

  async function persistSettings(nextSettings: NewsSettings) {
    setSavingSettings(true);
    setSettingsError(null);

    try {
      const res = await fetch("/api/ai/admin/home/save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageKey: GLOBAL_SLUG_ADS_PAGE_KEY,
          settings: {
            ads: nextSettings.ads,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo guardar.");
      }

      setSettings(nextSettings);
    } catch (err: any) {
      setSettingsError(err?.message || "No se pudo guardar.");
    } finally {
      setSavingSettings(false);
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
      setSettingsError(err?.message || "No se pudo subir el anuncio.");
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

  return (
    <>
      <Seo
        title={`${article.seoTitle || article.title} | MotorWelt`}
        description={
          article.seoDescription ||
          article.excerpt ||
          article.subtitle ||
          `${theme.label} en MotorWelt`
        }
        image={heroImage}
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
          <div className="fixed bottom-4 left-4 z-[80] hidden rounded-2xl border border-[#0CE0B2]/40 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur md:block">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2] animate-pulse" />
              <span>
                {spectatorMode ? "Vista espectador" : "Modo edición ads global"}
              </span>
              {savingSettings && (
                <span className="text-[#0CE0B2]">Guardando…</span>
              )}
            </div>
            {settingsError && (
              <div className="mt-1 text-red-300">{settingsError}</div>
            )}
            <button
              type="button"
              onClick={() => setSpectatorMode((v) => !v)}
              className="mt-2 rounded-full border border-white/[0.1] bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              {spectatorMode ? "Volver a editar" : "Ver como espectador"}
            </button>
          </div>
        )}

        <header className="fixed left-0 top-0 z-50 w-full border-b border-white/[0.06] bg-mw-surface/70 backdrop-blur-md">
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

            <div className="hidden md:flex items-center justify-center">
              <nav className="flex items-center gap-6 text-sm font-medium xl:gap-8 xl:text-[15px]">
                <Link
                  href="/tuning"
                  className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white"
                >
                  Tuning
                </Link>
                <Link
                  href="/noticias/autos"
                  className={`inline-flex h-10 items-center leading-none ${
                    category === "autos"
                      ? "text-white"
                      : "text-gray-200 hover:text-white"
                  }`}
                >
                  Autos
                </Link>
                <Link
                  href="/noticias/motos"
                  className={`inline-flex h-10 items-center leading-none ${
                    category === "motos"
                      ? "text-white"
                      : "text-gray-200 hover:text-white"
                  }`}
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
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-mw-surface/60 backdrop-blur-md hover:bg-white/5 focus:outline-none"
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
              className="absolute right-0 top-0 h-full w-[88%] max-w-[340px] overflow-y-auto border-l border-white/[0.06] bg-mw-surface/95 shadow-2xl backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
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
                  className={`block w-full rounded-xl px-3 py-3 text-base ${
                    category === "autos"
                      ? "text-white"
                      : "text-gray-100 hover:bg-white/5"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  Autos
                </Link>
                <Link
                  href="/noticias/motos"
                  className={`block w-full rounded-xl px-3 py-3 text-base ${
                    category === "motos"
                      ? "text-white"
                      : "text-gray-100 hover:bg-white/5"
                  }`}
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
                  className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Comunidad
                </Link>
              </nav>
            </aside>
          </div>
        )}

        {isImageModalOpen && currentModalImage && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5">
            <button
              type="button"
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={closeImageModal}
              aria-label="Cerrar imagen"
            />

            <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/[0.06] bg-black">
              <img
                src={currentModalImage}
                alt="Imagen ampliada"
                className="max-h-[92vh] w-full object-contain"
              />

              {canNavigateGallery ? (
                <>
                  <button
                    type="button"
                    onClick={goToPrevImage}
                    className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.06] bg-black/45 text-white backdrop-blur-md hover:bg-black/65"
                    aria-label="Imagen anterior"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M15 6l-6 6 6 6"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={goToNextImage}
                    className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.06] bg-black/45 text-white backdrop-blur-md hover:bg-black/65"
                    aria-label="Imagen siguiente"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M9 6l6 6-6 6"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-white/[0.06] bg-black/45 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                    {activeGalleryIndex! + 1} / {gallery.length}
                  </div>
                </>
              ) : null}

              <button
                type="button"
                onClick={closeImageModal}
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.06] bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
                aria-label="Cerrar imagen"
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
          </div>
        )}

        <main
          aria-hidden={mobileOpen || isImageModalOpen}
          className="relative z-10 pt-16 lg:pt-[72px]"
        >
          <section className="relative overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt={article.title}
                className="h-full w-full object-cover"
                style={{ filter: "brightness(.3) saturate(1.12)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-[#041210]" />
            </div>

            <div className="relative mx-auto flex min-h-[58svh] w-full max-w-[1440px] items-end px-4 pb-10 pt-20 sm:px-6 xl:px-10 2xl:max-w-[1560px] lg:min-h-[66vh] lg:pb-14">
              <div className="max-w-5xl">
                <div className="mb-4 flex flex-wrap items-start gap-2">
                  <Link
                    href={theme.listingHref}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.06] bg-black/30 text-white/75 backdrop-blur transition hover:text-white"
                    aria-label={`Volver a ${theme.label}`}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden
                    >
                      <path
                        d="M15 6l-6 6 6 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </Link>

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/30 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-gray-200 backdrop-blur">
                    <span
                      className={`h-2 w-2 rounded-full ${theme.badgeDot}`}
                    />
                    {theme.label}
                  </div>
                </div>

                <h1 className="font-display text-[2.35rem] font-extrabold leading-[0.92] tracking-tight text-white sm:text-5xl md:text-6xl xl:text-[5.35rem]">
                  {article.title}
                </h1>

                {article.subtitle ? (
                  <p className="mt-5 max-w-4xl text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl xl:text-[1.55rem]">
                    {article.subtitle}
                  </p>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-gray-300 xl:text-[1.02rem]">
                  {article.authorName ? (
                    <span>
                      Por{" "}
                      <span className="font-semibold text-white">
                        {article.authorName}
                      </span>
                    </span>
                  ) : null}
                  {article.authorName && headerDate ? (
                    <span className="text-gray-500">•</span>
                  ) : null}
                  {headerDate ? (
                    <span>Actualizado {formatDate(headerDate)}</span>
                  ) : null}
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  {hasVideo ? (
                    <a href="#video-principal">
                      <Button variant="pink">Ver video</Button>
                    </a>
                  ) : null}

                  {hasGallery ? (
                    <a href="#galeria-principal">
                      <Button variant={theme.buttonVariant}>Ver galería</Button>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 sm:py-10">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <AdSlot
                kind="leaderboard"
                ad={settings.ads.leaderboard}
                editable={adEditVisible}
                inputRef={leaderboardInputRef}
                onToggle={() => void toggleAd("leaderboard")}
                onPick={(files) => void handleAdImagePick("leaderboard", files)}
                onEditLink={() => void editAdLink("leaderboard")}
                onClear={() => void clearAdImage("leaderboard")}
              />

              <div className="mt-8 grid gap-8 xl:gap-10 lg:grid-cols-[1.55fr_.72fr]">
                <article className="min-w-0">
                  {hasVideo && article.useVideoAsHero ? (
                    <div id="video-principal" className="mb-8">
                      <InlineEmbed
                        url={article.videoUrl}
                        title={article.title}
                      />
                    </div>
                  ) : null}

                  <div className="rounded-[30px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md sm:p-8 xl:p-10">
                    <div className="prose-reset">
                      {bodyBlocks.length > 0 ? (
                        bodyBlocks.map((block, index) => {
                          if (block.type === "p") {
                            return (
                              <p
                                key={index}
                                className="mb-5 text-base leading-8 text-gray-200 sm:text-[1.05rem] xl:text-[1.1rem]"
                              >
                                {block.text}
                              </p>
                            );
                          }

                          if (block.type === "h2") {
                            return (
                              <h2
                                key={index}
                                className="mb-4 mt-10 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
                              >
                                {block.text}
                              </h2>
                            );
                          }

                          if (block.type === "h3") {
                            return (
                              <h3
                                key={index}
                                className="mb-3 mt-8 text-2xl font-semibold text-white sm:text-3xl"
                              >
                                {block.text}
                              </h3>
                            );
                          }

                          if (block.type === "h4") {
                            return (
                              <h4
                                key={index}
                                className="mb-3 mt-7 text-xl font-semibold text-white sm:text-2xl"
                              >
                                {block.text}
                              </h4>
                            );
                          }

                          if (block.type === "h5") {
                            return (
                              <h5
                                key={index}
                                className={`mb-2 mt-6 text-lg font-semibold uppercase tracking-[0.16em] ${theme.accentClass}`}
                              >
                                {block.text}
                              </h5>
                            );
                          }

                          if (block.type === "quote") {
                            return (
                              <blockquote
                                key={index}
                                className="my-8 rounded-[24px] border border-white/[0.06] bg-white/5 px-5 py-4 text-lg italic leading-8 text-white"
                              >
                                {block.text}
                              </blockquote>
                            );
                          }

                          if (block.type === "image") {
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => openImage(block.url)}
                                className="group my-8 block w-full overflow-hidden rounded-[24px] border border-white/[0.06] bg-black text-left"
                              >
                                <img
                                  src={block.url}
                                  alt={block.alt || "Imagen"}
                                  className="w-full object-cover transition group-hover:scale-[1.01]"
                                />
                              </button>
                            );
                          }

                          if (block.type === "video") {
                            const embed = getYoutubeEmbedUrl(block.url);
                            if (!embed) return null;
                            return (
                              <div key={index} className="my-8">
                                <InlineEmbed
                                  url={block.url}
                                  title={article.title}
                                />
                              </div>
                            );
                          }

                          return null;
                        })
                      ) : (
                        <p className="text-base leading-8 text-gray-200">
                          {article.excerpt ||
                            article.subtitle ||
                            "Contenido próximamente."}
                        </p>
                      )}
                    </div>
                  </div>

                  {hasVideo && !article.useVideoAsHero ? (
                    <div id="video-principal" className="mt-10">
                      <div className="mb-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#FF7A1A]">
                          Video
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-white">
                          Pieza principal en movimiento
                        </h2>
                      </div>
                      <InlineEmbed
                        url={article.videoUrl}
                        title={article.title}
                      />
                    </div>
                  ) : null}

                  {hasGallery ? (
                    <div id="galeria-principal" className="mt-12">
                      <div className="mb-5">
                        <p
                          className={`text-[11px] uppercase tracking-[0.24em] ${theme.accentClass}`}
                        >
                          Gallery
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-white">
                          Más frames del proyecto
                        </h2>
                      </div>

                      <div className="no-scrollbar overflow-x-auto sm:max-h-[760px] sm:overflow-y-auto sm:overflow-x-hidden sm:pr-2 sidebar-scroll">
                        <div className="flex gap-4 pb-2 sm:grid sm:grid-cols-2 sm:pb-0">
                          {gallery.map((url, index) => (
                            <button
                              key={`${url}-${index}`}
                              type="button"
                              onClick={() => {
                                setStandaloneImage(null);
                                setActiveGalleryIndex(index);
                              }}
                              className={`group w-[82vw] max-w-[380px] shrink-0 overflow-hidden rounded-[24px] border border-white/[0.06] bg-black text-left sm:w-auto sm:max-w-none sm:shrink sm:min-w-0 ${
                                index === 0 ? "sm:col-span-2" : ""
                              }`}
                            >
                              <div
                                className={`relative w-full ${
                                  index === 0 ? "aspect-[16/9]" : "aspect-[4/3]"
                                }`}
                              >
                                <img
                                  src={url}
                                  alt={`${article.title} ${index + 1}`}
                                  className="h-full w-full object-cover transition group-hover:scale-[1.02]"
                                />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </article>

                <aside className="space-y-6">
                  <div className="rounded-[28px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md">
                    <p
                      className={`text-[11px] uppercase tracking-[0.24em] ${theme.accentClass}`}
                    >
                      Nota
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      Ficha editorial
                    </h3>

                    <div className="mt-5 space-y-4 text-sm text-gray-300">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                          Sección
                        </p>
                        <p className="mt-1 text-white">{theme.label}</p>
                      </div>

                      {article.contentType ? (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                            Tipo
                          </p>
                          <p className="mt-1 text-white">
                            {article.contentType}
                          </p>
                        </div>
                      ) : null}

                      {article.authorName ? (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                            Autor
                          </p>
                          <p className="mt-1 text-white">
                            {article.authorName}
                          </p>
                        </div>
                      ) : null}

                      {article.publishedAt ? (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                            Publicación
                          </p>
                          <p className="mt-1 text-white">
                            {formatDate(article.publishedAt)}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {article.tags?.length ? (
                    <div className="rounded-[28px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md">
                      <p
                        className={`text-[11px] uppercase tracking-[0.24em] ${theme.accentClass}`}
                      >
                        Tags
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-white/[0.06] bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.14em] text-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <AdSlot
                    kind="billboard"
                    layout="sidebarTall"
                    ad={settings.ads.billboard}
                    editable={adEditVisible}
                    inputRef={billboardInputRef}
                    onToggle={() => void toggleAd("billboard")}
                    onPick={(files) =>
                      void handleAdImagePick("billboard", files)
                    }
                    onEditLink={() => void editAdLink("billboard")}
                    onClear={() => void clearAdImage("billboard")}
                  />

                  <div className="rounded-[28px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#A3FF12]">
                      Últimas publicaciones
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      Publicaciones relacionadas
                    </h3>

                    <div className="mt-5 max-h-[640px] space-y-3 overflow-y-auto pr-1 sidebar-scroll">
                      {latestArticles.length > 0 ? (
                        latestArticles.map((item) => (
                          <SidebarArticleCard
                            key={item.id}
                            item={item}
                            category={category}
                          />
                        ))
                      ) : (
                        <div className="rounded-[22px] border border-dashed border-white/12 bg-white/5 p-5 text-sm text-gray-300">
                          Próximamente aparecerán más publicaciones
                          relacionadas.
                        </div>
                      )}
                    </div>
                  </div>
                </aside>
              </div>

              <div className="mt-14">
                <div className="mb-6 text-center">
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                    Explora
                  </p>
                  <h2 className="mt-2 font-display text-3xl font-bold text-white">
                    Seguir explorando MotorWelt
                  </h2>
                </div>

                <div className="-mx-4 overflow-x-auto px-4 pb-6 no-scrollbar sm:-mx-6 sm:px-6 xl:-mx-10 xl:px-10">
                  <div className="flex snap-x snap-mandatory items-start gap-4 md:gap-5 md:pr-12">
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
                      title="Tuning"
                      subtitle="Builds, mods, aero, stance y cultura visual."
                      href="/tuning"
                      image={sectionHeroImages.tuning}
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
            </div>
          </section>
        </main>

        <footer
          aria-hidden={mobileOpen || isImageModalOpen}
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
              rgba(0, 0, 0, 0.16) 0%,
              transparent 60%
            ),
            radial-gradient(
              120% 80% at 80% 90%,
              rgba(0, 0, 0, 0.2) 0%,
              transparent 60%
            ),
            linear-gradient(180deg, rgba(4, 18, 16, 0.9), rgba(4, 18, 16, 0.92));
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
            rgba(12, 224, 178, 0.95),
            transparent
          );
        }
        .streak-warm {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 122, 26, 0.95),
            transparent
          );
        }
        .streak-lime {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(163, 255, 18, 0.85),
            transparent
          );
        }
        .prose-reset p:last-child {
          margin-bottom: 0;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.18) transparent;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 999px;
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
            contain-intrinsic-size: 1px 1200px;
          }
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({
  locale,
  params,
}) => {
  const { sanityReadClient } = await import("../../../lib/sanityClient");

  const categoryParam = String(params?.category || "autos")
    .trim()
    .toLowerCase();
  const category: Category = categoryParam === "motos" ? "motos" : "autos";
  const slug = String(params?.slug || "").trim();

  if (!slug) {
    return { notFound: true };
  }

  const section = category === "autos" ? "noticias_autos" : "noticias_motos";
  const articleQuery = /* groq */ `
    *[
      _type in ["article", "post"] &&
      slug.current == $slug &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == $section ||
        lower(category) == $category ||
        $category in categories[]
      )
    ][0]{
      "id": _id,
      "slug": slug.current,
      "title": coalesce(title, ""),
      "subtitle": coalesce(subtitle, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "body": coalesce(body, ""),
      "section": coalesce(section, ""),
      "contentType": coalesce(contentType, "noticia"),
      "status": coalesce(status, "publicado"),
      "tags": coalesce(tags, []),
      "authorName": coalesce(authorName, ""),
      "authorEmail": coalesce(authorEmail, ""),
      "seoTitle": coalesce(seoTitle, title, ""),
      "seoDescription": coalesce(seoDescription, excerpt, subtitle, ""),
      "updatedAt": updatedAt,
      "publishedAt": coalesce(publishedAt, _createdAt),
      "mainImageUrl": coalesce(mainImageUrl, coverImage.asset->url, legacyImageUrl, ""),
      "galleryUrls": coalesce(galleryUrls, []),
      "videoUrl": coalesce(videoUrl, ""),
      "reelUrl": coalesce(reelUrl, ""),
      "useVideoAsHero": coalesce(useVideoAsHero, false)
    }
  `;

  const relatedQuery = /* groq */ `
    *[
      _type in ["article", "post"] &&
      coalesce(status, "publicado") == "publicado" &&
      defined(slug.current) &&
      slug.current != $slug &&
      (
        section == $section ||
        lower(category) == $category ||
        $category in categories[]
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...12]{
      "id": _id,
      "slug": slug.current,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "publishedAt": coalesce(publishedAt, _createdAt),
      "mainImageUrl": coalesce(mainImageUrl, coverImage.asset->url, legacyImageUrl, ""),
      "section": coalesce(section, ""),
      "category": coalesce(category, ""),
      "subcategory": coalesce(subcategory, ""),
      "categories": coalesce(categories, []),
      "tags": coalesce(tags, [])
    }
  `;

  const recentSitewideQuery = /* groq */ `
    *[
      _type in ["article", "post"] &&
      coalesce(status, "publicado") == "publicado" &&
      defined(slug.current) &&
      slug.current != $slug
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...24]{
      "id": _id,
      "slug": slug.current,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "publishedAt": coalesce(publishedAt, _createdAt),
      "mainImageUrl": coalesce(mainImageUrl, coverImage.asset->url, legacyImageUrl, ""),
      "section": coalesce(section, ""),
      "category": coalesce(category, ""),
      "subcategory": coalesce(subcategory, ""),
      "categories": coalesce(categories, []),
      "tags": coalesce(tags, [])
    }
  `;

  const newsSettingsQuery = /* groq */ `
    *[
      _type in ["homeSettings", "sitePageSettings", "pageSettings"] &&
      pageKey in ["globalSlugAds", "globalslugads"]
    ][0]{
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
      _type in ["homeSettings", "sitePageSettings", "pageSettings"] &&
      pageKey in ["tuning", "deportes", "lifestyle", "comunidad", "autos", "motos"]
    ]{
      pageKey,
      "heroImageUrl": coalesce(heroImageUrl, "")
    }
  `;

  const autosFallbackQuery = /* groq */ `
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
      "image": coalesce(mainImageUrl, coverImage.asset->url, legacyImageUrl, "")
    }
  `;

  const motosFallbackQuery = /* groq */ `
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
      "image": coalesce(mainImageUrl, coverImage.asset->url, legacyImageUrl, "")
    }
  `;

  const [
    article,
    relatedArticles,
    recentSitewideArticles,
    newsSettingsRaw,
    sectionSettingsRaw,
    autosFallback,
    motosFallback,
  ] = await Promise.all([
    sanityReadClient.fetch(articleQuery, { slug, section, category }),
    sanityReadClient
      .fetch(relatedQuery, { slug, section, category })
      .catch(() => []),
    sanityReadClient.fetch(recentSitewideQuery, { slug }).catch(() => []),
    sanityReadClient.fetch(newsSettingsQuery).catch(() => null),
    sanityReadClient.fetch(sectionSettingsQuery).catch(() => []),
    sanityReadClient.fetch(autosFallbackQuery).catch(() => null),
    sanityReadClient.fetch(motosFallbackQuery).catch(() => null),
  ]);

  if (!article?.id) {
    return { notFound: true };
  }

  const mergedLatest = [
    ...(Array.isArray(relatedArticles) ? relatedArticles : []),
    ...(Array.isArray(recentSitewideArticles) ? recentSitewideArticles : []),
  ];

  const seen = new Set<string>();
  const latestArticles = mergedLatest
    .filter((item) => {
      const id = String(item?.id || "");
      const itemSlug = String(item?.slug || "");
      if (!id || !itemSlug || itemSlug === slug || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((item) => ({
      ...item,
      href: hrefFromRelatedPost(item),
    }));

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
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig,
      )),
      year: new Date().getFullYear(),
      category,
      article,
      latestArticles,
      newsSettings: sanitizeNewsSettings(newsSettingsRaw),
      sectionHeroImages,
    },
  };
};
