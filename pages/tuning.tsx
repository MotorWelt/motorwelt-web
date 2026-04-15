// pages/tuning.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Seo from "../components/Seo";
import Image from "next/image";
import ProfileButton from "../components/ProfileButton";

const nextI18NextConfig = require("../next-i18next.config.js");

type ButtonVariant = "cyan" | "pink" | "link";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
};

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

const Button: React.FC<ButtonProps> = ({
  className = "",
  children,
  variant = "cyan",
  ...props
}) => {
  return (
    <button {...props} className={getButtonClasses(variant, className)}>
      {children}
    </button>
  );
};

const Card: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className = "",
  children,
}) => (
  <div
    className={`h-full rounded-2xl border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md transition hover:border-[#0CE0B2]/50 flex flex-col ${className}`}
  >
    {children}
  </div>
);

const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <div className={`p-5 flex flex-1 flex-col ${className}`}>{children}</div>
);

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

type TuningItem = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  typeLabel: string;
  galleryUrls: string[];
  videoUrl: string;
  reelUrl: string;
};

type VisualMediaKind = "photo" | "video" | "reel";
type MediaPlatform = "youtube" | "instagram" | "tiktok" | "unknown";

type VisualMediaItem = {
  id: string;
  title: string;
  subtitle: string;
  img: string;
  href: string;
  when: string;
  kind: VisualMediaKind;
  mediaUrl?: string;
  embedUrl?: string;
  platform?: MediaPlatform;
  galleryUrls?: string[];
  editableGalleryId?: string;
};

type AdKind = "leaderboard" | "billboard";

type AdConfig = {
  enabled: boolean;
  label: string;
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

type TuningPageSettings = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    billboard: AdConfig;
  };
  photoGalleries: PhotoGalleryEntry[];
};

const DEFAULT_TUNING_SETTINGS: TuningPageSettings = {
  heroImageUrl: "/images/noticia-2.jpg",
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
  photoGalleries: [],
};

function fallbackItem(
  id: string,
  title: string,
  excerpt: string,
  img: string,
  href: string,
  typeLabel = "Build"
): TuningItem {
  return {
    id,
    title,
    excerpt,
    img,
    href,
    when: "",
    typeLabel,
    galleryUrls: [],
    videoUrl: "",
    reelUrl: "",
  };
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

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : "";
}

function splitFiveItemLayout<T>(items: T[]) {
  return {
    left: items.slice(0, 2),
    right: items.slice(2, 5),
  };
}

function detailHref(slug?: string | null) {
  const cleanSlug = String(slug || "").trim();
  if (!cleanSlug) return "/tuning";
  return `/tuning/${cleanSlug}`;
}

function detectMediaPlatform(url?: string | null): MediaPlatform {
  const value = String(url || "").toLowerCase();
  if (!value) return "unknown";
  if (value.includes("youtube.com") || value.includes("youtu.be")) return "youtube";
  if (value.includes("instagram.com")) return "instagram";
  if (value.includes("tiktok.com")) return "tiktok";
  return "unknown";
}

function getYoutubeEmbedUrl(url?: string | null): string {
  const value = String(url || "").trim();
  if (!value) return "";

  try {
    if (value.includes("youtu.be/")) {
      const id = value.split("youtu.be/")[1]?.split(/[?&#]/)[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    const parsed = new URL(value);
    const v = parsed.searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;

    const path = parsed.pathname;
    if (path.includes("/shorts/")) {
      const id = path.split("/shorts/")[1]?.split("/")[0];
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (path.includes("/embed/")) return value;

    return "";
  } catch {
    return "";
  }
}

function getInstagramEmbedUrl(url?: string | null): string {
  const value = String(url || "").trim();
  if (!value) return "";

  try {
    const parsed = new URL(value);
    if (!parsed.hostname.includes("instagram.com")) return "";
    return `${parsed.origin}${parsed.pathname.replace(/\/$/, "")}/embed`;
  } catch {
    return "";
  }
}

function getTikTokEmbedUrl(url?: string | null): string {
  const value = String(url || "").trim();
  if (!value) return "";

  try {
    const parsed = new URL(value);
    if (!parsed.hostname.includes("tiktok.com")) return "";

    const parts = parsed.pathname.split("/").filter(Boolean);
    const videoIndex = parts.findIndex((part) => part === "video");
    const id = videoIndex >= 0 ? parts[videoIndex + 1] : "";

    return id ? `https://www.tiktok.com/embed/v2/${id}` : "";
  } catch {
    return "";
  }
}

function getEmbedUrl(kind: VisualMediaKind, url?: string | null): string {
  if (!url || kind === "photo") return "";

  const platform = detectMediaPlatform(url);

  if (platform === "youtube") return getYoutubeEmbedUrl(url);
  if (platform === "instagram") return getInstagramEmbedUrl(url);
  if (platform === "tiktok") return getTikTokEmbedUrl(url);

  return "";
}

function buildVisualItems(
  items: TuningItem[],
  kind: VisualMediaKind,
  fallback: TuningItem[]
): VisualMediaItem[] {
  const source = items.length > 0 ? items : fallback;

  return source.map((item, index) => {
    const mediaUrl =
      kind === "video" ? item.videoUrl : kind === "reel" ? item.reelUrl : "";
    const platform = detectMediaPlatform(mediaUrl);
    const embedUrl = getEmbedUrl(kind, mediaUrl);

    return {
      id: `${kind}-${item.id || index}`,
      title: item.title,
      subtitle:
        item.excerpt ||
        (kind === "photo"
          ? "Frames con fuerza visual, detalle y actitud."
          : kind === "video"
          ? "Cortes con movimiento, atmósfera y presencia."
          : "Formato corto con impacto inmediato y energía visual."),
      img: item.img || item.galleryUrls?.[0] || "/images/noticia-2.jpg",
      href: item.href || "/tuning",
      when: item.when || "",
      kind,
      mediaUrl,
      embedUrl,
      platform,
    };
  });
}

function getKindLabel(kind: VisualMediaKind) {
  if (kind === "photo") return "Fotos";
  if (kind === "video") return "Video";
  return "Reel";
}

function getKindAccent(kind: VisualMediaKind) {
  if (kind === "photo") return "bg-[#0CE0B2]";
  if (kind === "video") return "bg-[#FF7A1A]";
  return "bg-[#A3FF12]";
}

function getKindBorder(kind: VisualMediaKind) {
  if (kind === "photo") return "border-[#0CE0B2]/25 hover:border-[#0CE0B2]/55";
  if (kind === "video") return "border-[#FF7A1A]/25 hover:border-[#FF7A1A]/55";
  return "border-[#A3FF12]/25 hover:border-[#A3FF12]/55";
}

function getPlayGlow(kind: VisualMediaKind) {
  if (kind === "photo") return "shadow-[0_0_18px_rgba(12,224,178,.35)]";
  if (kind === "video") return "shadow-[0_0_18px_rgba(255,122,26,.35)]";
  return "shadow-[0_0_18px_rgba(163,255,18,.28)]";
}

function uniqueStrings(values: string[]) {
  return Array.from(
    new Set(values.filter(Boolean).map((v) => String(v).trim()).filter(Boolean))
  );
}

function normalizeGalleryEntry(raw: any): PhotoGalleryEntry {
  const cover = String(raw?.coverImageUrl || raw?.img || "").trim();
  const urls = uniqueStrings([
    cover,
    ...(Array.isArray(raw?.galleryUrls)
      ? raw.galleryUrls.map((v: unknown) => String(v))
      : []),
  ]);

  return {
    id: String(raw?.id || `gallery-${Date.now()}`),
    title: String(raw?.title || "Nueva galería"),
    subtitle: String(raw?.subtitle || raw?.excerpt || ""),
    coverImageUrl: cover || urls[0] || "/images/noticia-2.jpg",
    galleryUrls: urls.length > 0 ? urls : ["/images/noticia-2.jpg"],
    when: String(raw?.when || ""),
  };
}

function sanitizeTuningSettings(
  raw?: any,
  fallbackHero = "/images/noticia-2.jpg"
): TuningPageSettings {
  return {
    heroImageUrl:
      String(raw?.heroImageUrl || "").trim() ||
      fallbackHero ||
      DEFAULT_TUNING_SETTINGS.heroImageUrl,
    ads: {
      leaderboard: {
        enabled: Boolean(raw?.ads?.leaderboard?.enabled ?? true),
        label:
          String(raw?.ads?.leaderboard?.label || "").trim() ||
          DEFAULT_TUNING_SETTINGS.ads.leaderboard.label,
        imageUrl: String(raw?.ads?.leaderboard?.imageUrl || "").trim(),
        href: String(raw?.ads?.leaderboard?.href || "").trim(),
      },
      billboard: {
        enabled: Boolean(raw?.ads?.billboard?.enabled ?? true),
        label:
          String(raw?.ads?.billboard?.label || "").trim() ||
          DEFAULT_TUNING_SETTINGS.ads.billboard.label,
        imageUrl: String(raw?.ads?.billboard?.imageUrl || "").trim(),
        href: String(raw?.ads?.billboard?.href || "").trim(),
      },
    },
    photoGalleries: Array.isArray(raw?.photoGalleries)
      ? raw.photoGalleries.map(normalizeGalleryEntry)
      : [],
  };
}

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  description: string;
  accent?: "warm" | "cool" | "lime";
  action?: React.ReactNode;
}> = ({ eyebrow, title, description, accent = "warm", action }) => {
  const lineClass =
    accent === "cool"
      ? "from-[#0CE0B2] via-[#43A1AD] to-[#E2A24C]"
      : accent === "lime"
      ? "from-[#A3FF12] via-[#0CE0B2] to-[#FF7A1A]"
      : "from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]";

  return (
    <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
          {eyebrow}
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <div className={`mt-3 h-1 w-28 rounded-full bg-gradient-to-r ${lineClass}`} />
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
          {description}
        </p>
      </div>

      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
};

function TuningFeatureCard({
  item,
  onPreview,
}: {
  item: TuningItem;
  onPreview: () => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-[0_0_24px_rgba(255,255,255,.06)]">
      <div className="relative h-44 w-full">
        <Image
          src={item.img}
          alt={item.title}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          style={{ objectFit: "cover" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
      </div>

      <CardContent className="p-4 sm:p-5">
        <div className="text-xs text-gray-400">{item.when}</div>
        <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-gray-300 line-clamp-2">
          {item.excerpt}
        </p>

        <div className="mt-4 mt-auto flex items-center justify-between gap-3">
          <Link href={item.href}>
            <span className={getButtonClasses("link")}>Leer más</span>
          </Link>

          <button
            type="button"
            onClick={onPreview}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-gray-300 transition hover:bg-white/5"
          >
            Preview
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function PhotoGalleryEditorModal({
  draft,
  setDraft,
  onClose,
  onSave,
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
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cerrar editor de galería"
      />

      <div className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#071412]/95 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
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
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
            aria-label="Cerrar editor"
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

        <div className="grid gap-0 lg:grid-cols-[1.2fr_.8fr]">
          <div className="border-b border-white/10 lg:border-b-0 lg:border-r">
            <div className="relative aspect-[16/10] bg-black">
              <img
                src={
                  draft.coverImageUrl ||
                  draft.galleryUrls?.[0] ||
                  "/images/noticia-2.jpg"
                }
                alt={draft.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="rounded-full border border-white/20 bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                >
                  Subir portada
                </button>

                <button
                  type="button"
                  onClick={() => imagesInputRef.current?.click()}
                  className="rounded-full border border-white/20 bg-black/70 px-3 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-black/90"
                >
                  Subir nuevas fotos
                </button>
              </div>

              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  onUploadCover(e.target.files);
                  e.currentTarget.value = "";
                }}
              />

              <input
                ref={imagesInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  onUploadImages(e.target.files);
                  e.currentTarget.value = "";
                }}
              />

              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Galería
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {draft.galleryUrls?.map((url) => {
                    const isCover = url === draft.coverImageUrl;
                    return (
                      <div
                        key={url}
                        className="overflow-hidden rounded-2xl border border-white/10 bg-black/20"
                      >
                        <div className="relative aspect-[4/5]">
                          <img
                            src={url}
                            alt={draft.title}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="space-y-2 p-2">
                          <button
                            type="button"
                            onClick={() => onSetCover(url)}
                            className={`w-full rounded-xl px-2 py-1 text-[10px] font-semibold ${
                              isCover
                                ? "border border-[#0CE0B2]/40 bg-[#0CE0B2]/10 text-[#0CE0B2]"
                                : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                            }`}
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

          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Título
                </label>
                <input
                  value={draft.title}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev ? { ...prev, title: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Fecha / etiqueta
                </label>
                <input
                  value={draft.when}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev ? { ...prev, when: e.target.value } : prev
                    )
                  }
                  placeholder="07 abr 2026"
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/50"
                />
              </div>

              <div>
                <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Descripción / historia corta
                </label>
                <textarea
                  rows={6}
                  value={draft.subtitle}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev ? { ...prev, subtitle: e.target.value } : prev
                    )
                  }
                  className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/50"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Button variant="pink" onClick={onSave} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar galería"}
                </Button>

                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
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

export default function TuningPage({
  year,
  tuningItems = [],
  initialTuningSettings = DEFAULT_TUNING_SETTINGS,
}: {
  year: number;
  tuningItems: TuningItem[];
  initialTuningSettings?: TuningPageSettings;
}) {
  const { t } = useTranslation("home");
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<VisualMediaItem | null>(null);
  const [activeGalleryIndex, setActiveGalleryIndex] = useState(0);

  const [canEditTuning, setCanEditTuning] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [tuningSettings, setTuningSettings] = useState<TuningPageSettings>(
    sanitizeTuningSettings(
      initialTuningSettings || DEFAULT_TUNING_SETTINGS,
      initialTuningSettings?.heroImageUrl ||
        DEFAULT_TUNING_SETTINGS.heroImageUrl
    )
  );
  const [savingTuning, setSavingTuning] = useState(false);
  const [tuningError, setTuningError] = useState<string | null>(null);

  const [editingGallery, setEditingGallery] = useState<PhotoGalleryEntry | null>(
    null
  );

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);

  const featured =
    tuningItems[0] ??
    fallbackItem(
      "fallback-tuning-main",
      "Builds con identidad propia",
      "Proyectos donde el performance, la estética y la cultura visual se mezclan para crear algo que va mucho más allá de un simple coche modificado.",
      "/images/noticia-2.jpg",
      "/tuning",
      "Destacada"
    );

  const secondary =
    tuningItems.slice(1, 5).length > 0
      ? tuningItems.slice(1, 5)
      : [
          fallbackItem(
            "fallback-tuning-1",
            "Street builds que sí tienen narrativa",
            "No solo se trata de piezas. Se trata de intención, proporción, lenguaje visual y presencia.",
            "/images/noticia-1.jpg",
            "/tuning",
            "Build"
          ),
          fallbackItem(
            "fallback-tuning-2",
            "Mods que cambian el carácter",
            "Suspensión, ruedas, aero, interiores y detalle fino: cuando cada cambio suma al statement completo.",
            "/images/noticia-2.jpg",
            "/tuning",
            "Mods"
          ),
          fallbackItem(
            "fallback-tuning-3",
            "Garage culture sin filtro",
            "La parte más obsesiva, adictiva y visual del mundo automotriz vive aquí.",
            "/images/noticia-3.jpg",
            "/tuning",
            "Cultura"
          ),
          fallbackItem(
            "fallback-tuning-4",
            "El tuning también es diseño",
            "Hay builds que se leen como producto, otros como manifiesto, y otros como una declaración personal.",
            "/images/noticia-1.jpg",
            "/tuning",
            "Editorial"
          ),
        ];

  const videoSource = useMemo(() => {
    const withVideos = tuningItems.filter((item) => !!item.videoUrl);
    return withVideos.slice(0, 4);
  }, [tuningItems]);

  const reelSource = useMemo(() => {
    const withReels = tuningItems.filter((item) => !!item.reelUrl);
    return withReels.slice(0, 4);
  }, [tuningItems]);

  const heroImage =
    tuningSettings?.heroImageUrl ||
    featured.img ||
    DEFAULT_TUNING_SETTINGS.heroImageUrl;

  const fallbackPhotoItems = useMemo<VisualMediaItem[]>(
    () =>
      buildVisualItems(
        tuningItems
          .filter(
            (item) =>
              !!item.img ||
              (Array.isArray(item.galleryUrls) && item.galleryUrls.length > 0)
          )
          .slice(0, 6),
        "photo",
        [{ ...featured, img: heroImage }, ...secondary.slice(0, 2)]
      ).map((item, index) => {
        const original = tuningItems[index] || featured;
        const galleryUrls = uniqueStrings([
          item.img,
          ...(Array.isArray(original.galleryUrls) ? original.galleryUrls : []),
        ]);
        return {
          ...item,
          galleryUrls: galleryUrls.length > 0 ? galleryUrls : [item.img],
        };
      }),
    [featured, heroImage, secondary, tuningItems]
  );

  const photoItems = useMemo<VisualMediaItem[]>(
    () =>
      (tuningSettings.photoGalleries || []).length > 0
        ? (tuningSettings.photoGalleries || []).map((gallery) => ({
            id: gallery.id,
            title: gallery.title,
            subtitle: gallery.subtitle,
            img:
              gallery.coverImageUrl ||
              gallery.galleryUrls?.[0] ||
              "/images/noticia-2.jpg",
            href: "/tuning",
            when: gallery.when,
            kind: "photo" as const,
            galleryUrls: uniqueStrings([
              gallery.coverImageUrl,
              ...(gallery.galleryUrls || []),
            ]),
            editableGalleryId: gallery.id,
          }))
        : fallbackPhotoItems,
    [fallbackPhotoItems, tuningSettings.photoGalleries]
  );

  const videoItems = useMemo(
    () =>
      buildVisualItems(videoSource, "video", [
        secondary[0] ?? featured,
        secondary[1] ?? featured,
      ]),
    [featured, secondary, videoSource]
  );

  const reelItems = useMemo(
    () =>
      buildVisualItems(reelSource, "reel", [
        featured,
        secondary[0] ?? featured,
        secondary[1] ?? featured,
        secondary[2] ?? featured,
      ]),
    [featured, reelSource, secondary]
  );

  const mainTuningItems = useMemo(() => {
    const source =
      tuningItems.length >= 5
        ? tuningItems.slice(0, 5)
        : [featured, ...secondary].slice(0, 5);

    if (source.length === 5) return source;

    return [featured, ...secondary].slice(0, 5);
  }, [featured, secondary, tuningItems]);

  const tuningDesktopColumns = useMemo(
    () => splitFiveItemLayout(mainTuningItems),
    [mainTuningItems]
  );

  const activePhotoGalleryUrls = useMemo(() => {
    if (!activeMedia || activeMedia.kind !== "photo") return [];
    const gallery = uniqueStrings([
      activeMedia.img,
      ...(Array.isArray(activeMedia.galleryUrls) ? activeMedia.galleryUrls : []),
    ]);
    return gallery.length > 0 ? gallery : [activeMedia.img];
  }, [activeMedia]);

  const activePhotoImage =
    activeMedia?.kind === "photo"
      ? activePhotoGalleryUrls[activeGalleryIndex] ||
        activePhotoGalleryUrls[0] ||
        activeMedia.img
      : activeMedia?.img || "";

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen || !!activeMedia || !!editingGallery ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, activeMedia, editingGallery]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMedia(null);
    setEditingGallery(null);
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

    setCanEditTuning(role === "admin" || role === "editor");
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setSpectatorMode(router.query.view === "spectator");
  }, [router.isReady, router.query.view]);

  useEffect(() => {
    setTuningSettings(
      sanitizeTuningSettings(
        initialTuningSettings || DEFAULT_TUNING_SETTINGS,
        initialTuningSettings?.heroImageUrl ||
          DEFAULT_TUNING_SETTINGS.heroImageUrl
      )
    );
  }, [initialTuningSettings]);

  useEffect(() => {
    setActiveGalleryIndex(0);
  }, [activeMedia?.id]);

  const editControlsVisible = canEditTuning && !spectatorMode;

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
      { top: "6%", left: "-38%", v: "cool", dir: "rev", delay: "0.6s", dur: "14s", op: 0.55, h: "1px" },
      { top: "18%", left: "-33%", v: "warm", dir: "fwd", delay: "1.2s", dur: "12.8s", op: 0.55, h: "1px" },
      { top: "22%", left: "-27%", v: "lime", dir: "rev", delay: "1.8s", dur: "10.8s", op: 0.5, h: "1px" },
      { top: "34%", left: "-31%", v: "cool", dir: "fwd", delay: "2.4s", dur: "13.6s", op: 0.58, h: "1px" },
      { top: "42%", left: "-36%", v: "warm", dir: "rev", delay: "3.0s", dur: "12.2s", op: 0.52, h: "1px" },
      { top: "58%", left: "-21%", v: "lime", dir: "fwd", delay: "3.6s", dur: "11.8s", op: 0.5, h: "1px" },
      { top: "66%", left: "-29%", v: "cool", dir: "rev", delay: "4.2s", dur: "14.4s", op: 0.55, h: "1px" },
      { top: "74%", left: "-19%", v: "warm", dir: "fwd", delay: "4.8s", dur: "12.6s", op: 0.5, h: "1px" },
      { top: "90%", left: "-25%", v: "lime", dir: "rev", delay: "5.4s", dur: "13.8s", op: 0.52, h: "1px" },
      { top: "14%", left: "-32%", v: "cool", dir: "fwd", delay: ".2s", dur: "11.4s", op: 0.92, h: "3px" },
      { top: "48%", left: "-35%", v: "warm", dir: "rev", delay: "2.9s", dur: "10.6s", op: 0.88, h: "3px" },
      { top: "82%", left: "-28%", v: "lime", dir: "fwd", delay: "5.3s", dur: "12.4s", op: 0.86, h: "3px" },
    ],
    []
  );

  async function persistTuningSettings(nextSettings: TuningPageSettings) {
    setSavingTuning(true);
    setTuningError(null);

    try {
      const res = await fetch("/api/ai/admin/home/save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageKey: "tuning",
          settings: nextSettings,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo guardar.");
      }

      setTuningSettings(
        sanitizeTuningSettings(
          nextSettings,
          nextSettings.heroImageUrl || DEFAULT_TUNING_SETTINGS.heroImageUrl
        )
      );
    } catch (err: any) {
      setTuningError(err?.message || "No se pudo guardar Tuning Settings.");
    } finally {
      setSavingTuning(false);
    }
  }

  async function handleHeroImagePick(files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImageToSanity(file);
      const next = {
        ...tuningSettings,
        heroImageUrl: uploaded.url,
      };
      await persistTuningSettings(next);
    } catch (err: any) {
      setTuningError(err?.message || "No se pudo subir la portada.");
    }
  }

  async function handleAdImagePick(kind: AdKind, files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImageToSanity(file);
      const next = {
        ...tuningSettings,
        ads: {
          ...tuningSettings.ads,
          [kind]: {
            ...tuningSettings.ads[kind],
            imageUrl: uploaded.url,
          },
        },
      };
      await persistTuningSettings(next);
    } catch (err: any) {
      setTuningError(err?.message || "No se pudo subir el anuncio.");
    }
  }

  async function toggleAd(kind: AdKind) {
    const next = {
      ...tuningSettings,
      ads: {
        ...tuningSettings.ads,
        [kind]: {
          ...tuningSettings.ads[kind],
          enabled: !tuningSettings.ads[kind].enabled,
        },
      },
    };

    await persistTuningSettings(next);
  }

  async function editAdLink(kind: AdKind) {
    if (typeof window === "undefined") return;
    const current = tuningSettings.ads[kind].href || "";
    const href = window.prompt("Pega el link del anuncio:", current);
    if (href === null) return;

    const next = {
      ...tuningSettings,
      ads: {
        ...tuningSettings.ads,
        [kind]: {
          ...tuningSettings.ads[kind],
          href: href.trim(),
        },
      },
    };

    await persistTuningSettings(next);
  }

  async function clearAdImage(kind: AdKind) {
    const next = {
      ...tuningSettings,
      ads: {
        ...tuningSettings.ads,
        [kind]: {
          ...tuningSettings.ads[kind],
          imageUrl: "",
        },
      },
    };
    await persistTuningSettings(next);
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

  function openMediaPreview(item: VisualMediaItem) {
    setActiveMedia(item);
    setActiveGalleryIndex(0);
  }

  function openGalleryEditorFromItem(item?: VisualMediaItem) {
    if (!item) {
      setEditingGallery(
        normalizeGalleryEntry({
          id: `gallery-${Date.now()}`,
          title: "Nueva galería",
          subtitle: "",
          coverImageUrl: "/images/noticia-2.jpg",
          galleryUrls: ["/images/noticia-2.jpg"],
          when: "",
        })
      );
      return;
    }

    setEditingGallery(
      normalizeGalleryEntry({
        id: item.editableGalleryId || item.id || `gallery-${Date.now()}`,
        title: item.title,
        subtitle: item.subtitle,
        coverImageUrl: item.img,
        galleryUrls: item.galleryUrls || [item.img],
        when: item.when,
      })
    );
  }

  async function saveGalleryDraft() {
    if (!editingGallery) return;

    const normalized = normalizeGalleryEntry(editingGallery);
    const currentGalleries = tuningSettings.photoGalleries || [];
    const exists = currentGalleries.some((g) => g.id === normalized.id);

    const nextSettings: TuningPageSettings = {
      ...tuningSettings,
      photoGalleries: exists
        ? currentGalleries.map((gallery) =>
            gallery.id === normalized.id ? normalized : gallery
          )
        : [normalized, ...currentGalleries],
    };

    await persistTuningSettings(nextSettings);
    setEditingGallery(null);
  }

  async function uploadGalleryCover(files?: FileList | null) {
    const file = files?.[0];
    if (!file || !editingGallery) return;

    try {
      const uploaded = await uploadImageToSanity(file);
      setEditingGallery((prev) => {
        if (!prev) return prev;
        const nextGalleryUrls = uniqueStrings([uploaded.url, ...(prev.galleryUrls || [])]);
        return {
          ...prev,
          coverImageUrl: uploaded.url,
          galleryUrls: nextGalleryUrls,
        };
      });
    } catch (err: any) {
      setTuningError(
        err?.message || "No se pudo subir la portada de la galería."
      );
    }
  }

  async function uploadGalleryImages(files?: FileList | null) {
    if (!files || files.length === 0 || !editingGallery) return;

    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const uploaded = await uploadImageToSanity(file);
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
            prev.coverImageUrl || nextGalleryUrls[0] || "/images/noticia-2.jpg",
        };
      });
    } catch (err: any) {
      setTuningError(
        err?.message || "No se pudieron subir las fotos de la galería."
      );
    }
  }

  function removeGalleryImage(url: string) {
    setEditingGallery((prev) => {
      if (!prev) return prev;
      const nextGalleryUrls = prev.galleryUrls.filter((item) => item !== url);
      const safeGalleryUrls =
        nextGalleryUrls.length > 0 ? nextGalleryUrls : ["/images/noticia-2.jpg"];
      const nextCover =
        prev.coverImageUrl === url
          ? safeGalleryUrls[0]
          : prev.coverImageUrl;

      return {
        ...prev,
        galleryUrls: safeGalleryUrls,
        coverImageUrl: nextCover,
      };
    });
  }

  function setGalleryCover(url: string) {
    setEditingGallery((prev) => (prev ? { ...prev, coverImageUrl: url } : prev));
  }

  function renderEditableAd(kind: AdKind, className = "") {
    const ad = tuningSettings.ads[kind];

    if (!ad.enabled && !editControlsVisible) return null;

    const inputRef =
      kind === "leaderboard" ? leaderboardInputRef : billboardInputRef;

    const wrapClass = `
      relative w-full mx-auto overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70
      ${
        kind === "leaderboard"
          ? "max-w-[970px] aspect-[970/120] min-h-[20px] sm:min-h-[72px] md:min-h-0"
          : "max-w-[970px] aspect-[970/250]"
      }
      ${className}
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
          editControlsVisible && (
            <div className="flex h-full w-full items-center justify-center text-center text-gray-500">
              <span className="px-4 text-[11px] sm:text-xs md:text-sm">
                {ad.label} · oculto
              </span>
            </div>
          )
        )}

        {editControlsVisible && (
          <div className="absolute right-2 top-2 z-20 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => toggleAd(kind)}
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
              onClick={() => editAdLink(kind)}
              className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              Link
            </button>
            <button
              type="button"
              onClick={() => clearAdImage(kind)}
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
            void handleAdImagePick(kind, e.target.files);
            e.currentTarget.value = "";
          }}
        />
      </div>
    );
  }

  return (
    <>
      <Seo
        title="Tuning | MotorWelt"
        description="Builds, mods, street culture, aero, stance y el lado más visual y obsesivo del universo automotriz."
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

        {canEditTuning && (
          <div className="fixed bottom-4 left-4 z-[80] rounded-2xl border border-[#0CE0B2]/40 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2] animate-pulse" />
              <span>
                {spectatorMode ? "Vista espectador" : "Modo edición tuning"}
              </span>
              {savingTuning && <span className="text-[#0CE0B2]">Guardando…</span>}
            </div>
            {tuningError && <div className="mt-1 text-red-300">{tuningError}</div>}
            <button
              type="button"
              onClick={toggleSpectatorMode}
              className="mt-2 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
            >
              {spectatorMode ? "Volver a editar" : "Ver como espectador"}
            </button>
          </div>
        )}

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
                    {t("nav.news")}
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
                  {t("nav.community")}
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
                  {t("nav.news")}
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
                  className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("nav.community")}
                </Link>
              </nav>
            </aside>
          </div>
        )}

        {editingGallery && (
          <PhotoGalleryEditorModal
            draft={editingGallery}
            setDraft={setEditingGallery}
            onClose={() => setEditingGallery(null)}
            onSave={saveGalleryDraft}
            onUploadCover={uploadGalleryCover}
            onUploadImages={uploadGalleryImages}
            onRemoveImage={removeGalleryImage}
            onSetCover={setGalleryCover}
            saving={savingTuning}
          />
        )}

        {activeMedia && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5">
            <button
              type="button"
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setActiveMedia(null)}
              aria-label="Cerrar preview"
            />

            <div className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[#071412]/95 shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-6 sm:py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gray-400">
                    <span
                      className={`h-2 w-2 rounded-full ${getKindAccent(activeMedia.kind)}`}
                    />
                    {getKindLabel(activeMedia.kind)} Preview
                    {activeMedia.when ? ` · ${activeMedia.when}` : ""}
                  </div>
                  <h3 className="mt-1 truncate text-lg font-semibold text-white sm:text-2xl">
                    {activeMedia.title}
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  {editControlsVisible &&
                  activeMedia.kind === "photo" &&
                  activeMedia.editableGalleryId ? (
                    <button
                      type="button"
                      onClick={() => openGalleryEditorFromItem(activeMedia)}
                      className="rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur hover:bg-black/90"
                    >
                      Editar
                    </button>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setActiveMedia(null)}
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                    aria-label="Cerrar preview"
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
              </div>

              <div className="grid gap-0 lg:grid-cols-[1.5fr_.7fr]">
                <div className="bg-black">
                  <div className="relative aspect-[16/10]">
                    {activeMedia.kind === "photo" ? (
                      <>
                        <img
                          src={activePhotoImage}
                          alt={activeMedia.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

                        {activePhotoGalleryUrls.length > 1 ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                setActiveGalleryIndex((prev) =>
                                  prev === 0
                                    ? activePhotoGalleryUrls.length - 1
                                    : prev - 1
                                )
                              }
                              className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/60"
                              aria-label="Foto anterior"
                            >
                              ‹
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setActiveGalleryIndex((prev) =>
                                  prev === activePhotoGalleryUrls.length - 1
                                    ? 0
                                    : prev + 1
                                )
                              }
                              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-white/15 bg-black/45 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/60"
                              aria-label="Foto siguiente"
                            >
                              ›
                            </button>
                          </>
                        ) : null}
                      </>
                    ) : activeMedia.embedUrl ? (
                      <iframe
                        src={activeMedia.embedUrl}
                        title={activeMedia.title}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    ) : (
                      <>
                        <img
                          src={activeMedia.img}
                          alt={activeMedia.title}
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
                        {activeMedia.kind !== "photo" && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className={`flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-black/40 backdrop-blur-md ${getPlayGlow(
                                activeMedia.kind
                              )}`}
                            >
                              <svg
                                width="28"
                                height="28"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden
                              >
                                <path d="M8 6.5v11l9-5.5-9-5.5z" fill="white" />
                              </svg>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {activeMedia.kind === "photo" &&
                  activePhotoGalleryUrls.length > 1 ? (
                    <div className="flex gap-3 overflow-x-auto border-t border-white/10 p-3 no-scrollbar">
                      {activePhotoGalleryUrls.map((url, index) => (
                        <button
                          key={`${url}-${index}`}
                          type="button"
                          onClick={() => setActiveGalleryIndex(index)}
                          className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-xl border ${
                            index === activeGalleryIndex
                              ? "border-[#0CE0B2]"
                              : "border-white/10"
                          }`}
                        >
                          <img
                            src={url}
                            alt={`${activeMedia.title} ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col justify-between p-5 sm:p-6">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-300">
                      <span
                        className={`h-2 w-2 rounded-full ${getKindAccent(activeMedia.kind)}`}
                      />
                      {getKindLabel(activeMedia.kind)}
                    </div>

                    <p className="mt-4 text-sm leading-relaxed text-gray-300 sm:text-base">
                      {activeMedia.subtitle}
                    </p>

                    <p className="mt-4 text-sm leading-relaxed text-gray-400">
                      {activeMedia.kind === "photo"
                        ? "Esta galería se muestra dentro del mismo modal para mantener una lectura más editorial y visual dentro de Tuning."
                        : activeMedia.embedUrl
                        ? "Este preview ya está conectado para reproducirse desde el link externo."
                        : "Esta vista está pensada como preview inmersivo para desktop y mobile, con un lenguaje más visual y editorial alineado al tono de MotorWelt."}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    {activeMedia.kind !== "photo" ? (
                      <Link href={activeMedia.href}>
                        <Button
                          variant="pink"
                          className="w-full"
                          onClick={() => setActiveMedia(null)}
                        >
                          Abrir historia completa
                        </Button>
                      </Link>
                    ) : null}

                    {activeMedia.mediaUrl ? (
                      <a
                        href={activeMedia.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
                      >
                        Abrir {activeMedia.kind === "video" ? "video" : "reel"}{" "}
                        original
                      </a>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => setActiveMedia(null)}
                      className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
                    >
                      Cerrar preview
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <main
          aria-hidden={mobileOpen || !!activeMedia || !!editingGallery}
          className="relative z-10"
        >
          <section className="relative isolate overflow-hidden pt-16 lg:pt-[72px]">
            <div className="relative flex min-h-[48svh] flex-col justify-end overflow-hidden sm:min-h-[54svh] lg:min-h-[60vh]">
              <Image
                src={heroImage}
                alt="Tuning | MotorWelt"
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

              <div className="relative z-10 w-full px-4 pb-14 pt-14 sm:px-6 lg:px-8 lg:pb-16">
                <div className="mx-auto w-full max-w-[1280px]">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-gray-200 backdrop-blur md:text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                      Tuning • Builds • Street Culture
                    </div>

                    <h1 className="mt-5 font-display text-[2.8rem] font-black leading-[0.92] tracking-[-0.05em] text-white sm:text-[4rem] md:text-[4.8rem] lg:text-[5.4rem]">
                      <span className="glow-cool block">Tuning</span>
                      <span className="block text-white/95">Builds & Culture</span>
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
                      Proyectos, mods, aero, stance, interiores, cultura de garage y
                      builds que no piden permiso para llamar la atención.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-4 sm:py-6">
            <div className="mx-auto w-full max-w-[1200px] px-2 sm:px-6 lg:px-8">
              {renderEditableAd("leaderboard")}
            </div>
          </section>

          <section className="py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="glow-warm font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  Tuning — Builds & Culture
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]" />
              </div>

              <div className="hidden md:grid gap-6 md:grid-cols-2">
                <div className="grid gap-6">
                  {tuningDesktopColumns.left.map((item) => (
                    <TuningFeatureCard
                      key={item.id}
                      item={item}
                      onPreview={() =>
                        openMediaPreview({
                          id: `left-${item.id}`,
                          title: item.title,
                          subtitle: item.excerpt,
                          img: item.img,
                          href: item.href,
                          when: item.when,
                          kind: "photo",
                          galleryUrls: item.galleryUrls,
                        })
                      }
                    />
                  ))}
                </div>

                <div className="grid gap-6">
                  {tuningDesktopColumns.right.map((item) => (
                    <TuningFeatureCard
                      key={item.id}
                      item={item}
                      onPreview={() =>
                        openMediaPreview({
                          id: `right-${item.id}`,
                          title: item.title,
                          subtitle: item.excerpt,
                          img: item.img,
                          href: item.href,
                          when: item.when,
                          kind: "photo",
                          galleryUrls: item.galleryUrls,
                        })
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar md:hidden">
                <div className="flex gap-4 snap-x snap-mandatory">
                  {mainTuningItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        openMediaPreview({
                          id: `mobile-${item.id}`,
                          title: item.title,
                          subtitle: item.excerpt,
                          img: item.img,
                          href: item.href,
                          when: item.when,
                          kind: "photo",
                          galleryUrls: item.galleryUrls,
                        })
                      }
                      className="group block w-[84%] min-w-[84%] shrink-0 snap-start text-left"
                    >
                      <Card className="overflow-hidden">
                        <div className="relative h-56 w-full">
                          <Image
                            src={item.img}
                            alt={item.title}
                            fill
                            sizes="84vw"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        </div>

                        <CardContent className="p-5">
                          <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-400">
                            <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                            Tuning · {item.typeLabel}
                          </div>

                          <h3 className="text-[2rem] font-semibold leading-[1.05] text-white">
                            {item.title}
                          </h3>

                          <p className="mt-3 text-base leading-relaxed text-gray-300 line-clamp-3">
                            {item.excerpt}
                          </p>

                          <div className="mt-5">
                            <span className="text-[#43A1AD] underline underline-offset-4">
                              Leer más
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="tuning-visuals" className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="Visual Library"
                title="Fotos, videos y formato corto con más presencia"
                description="Separamos el lenguaje visual en tres bloques para que la experiencia respire mejor: frames, piezas de video y formato vertical con preview inmersivo y apertura a pantalla completa."
                accent="cool"
                action={
                  editControlsVisible ? (
                    <button
                      type="button"
                      onClick={() => openGalleryEditorFromItem()}
                      className="rounded-full border border-white/20 bg-black/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white backdrop-blur hover:bg-black/90"
                    >
                      Nueva galería
                    </button>
                  ) : null
                }
              />

              <div className="space-y-12 sm:space-y-14">
                <div>
                  <div className="mb-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                      Photos
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-white">
                      Frames con postura, detalle y atmósfera
                    </h3>
                  </div>

                  <div className="hidden gap-5 sm:grid sm:grid-cols-2 xl:grid-cols-3">
                    {photoItems.slice(0, 6).map((item) => (
                      <div
                        key={item.id}
                        className={`group relative overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                          item.kind
                        )}`}
                      >
                        {editControlsVisible ? (
                          <div className="absolute right-3 top-3 z-20">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openGalleryEditorFromItem(item);
                              }}
                              className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur hover:bg-black/90"
                            >
                              Editar
                            </button>
                          </div>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => openMediaPreview(item)}
                          className="block w-full text-left"
                        >
                          <div className="relative aspect-[4/3] w-full">
                            <Image
                              src={item.img}
                              alt={item.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              style={{ objectFit: "cover" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
                              <span className={`h-2 w-2 rounded-full ${getKindAccent(item.kind)}`} />
                              {getKindLabel(item.kind)}
                            </div>

                            <div className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white opacity-90 backdrop-blur transition group-hover:scale-105">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                  d="M8 8h3M16 8v3M16 16h-3M8 16v-3"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                              <h4 className="text-xl font-semibold text-white">
                                {item.title}
                              </h4>
                              <p className="mt-2 line-clamp-2 text-sm text-gray-200">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:hidden">
                    <div className="flex gap-4 snap-x snap-mandatory">
                      {photoItems.slice(0, 6).map((item) => (
                        <div
                          key={item.id}
                          className={`group relative min-w-[84%] max-w-[84%] shrink-0 snap-start overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                            item.kind
                          )}`}
                        >
                          {editControlsVisible ? (
                            <div className="absolute right-3 top-3 z-20">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openGalleryEditorFromItem(item);
                                }}
                                className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur hover:bg-black/90"
                              >
                                Editar
                              </button>
                            </div>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => openMediaPreview(item)}
                            className="block w-full text-left"
                          >
                            <div className="relative aspect-[4/5] w-full">
                              <Image
                                src={item.img}
                                alt={item.title}
                                fill
                                sizes="84vw"
                                style={{ objectFit: "cover" }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
                                <span className={`h-2 w-2 rounded-full ${getKindAccent(item.kind)}`} />
                                {getKindLabel(item.kind)}
                              </div>

                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <h4 className="text-lg font-semibold text-white">
                                  {item.title}
                                </h4>
                                <p className="mt-2 line-clamp-3 text-sm text-gray-200">
                                  {item.subtitle}
                                </p>
                              </div>
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#FF7A1A]">
                      Videos
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-white">
                      Piezas con movimiento y energía editorial
                    </h3>
                  </div>

                  <div className="hidden gap-5 lg:grid lg:grid-cols-2">
                    {videoItems.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openMediaPreview(item)}
                        className={`group overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                          item.kind
                        )}`}
                      >
                        <div className="relative aspect-[16/9] w-full">
                          <Image
                            src={item.img}
                            alt={item.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                          <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
                            <span className={`h-2 w-2 rounded-full ${getKindAccent(item.kind)}`} />
                            {getKindLabel(item.kind)}
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className={`flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition group-hover:scale-105 ${getPlayGlow(
                                item.kind
                              )}`}
                            >
                              <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden
                              >
                                <path d="M8 6.5v11l9-5.5-9-5.5z" fill="white" />
                              </svg>
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h4 className="text-xl font-semibold text-white">
                              {item.title}
                            </h4>
                            <p className="mt-2 line-clamp-2 text-sm text-gray-200">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar lg:hidden">
                    <div className="flex gap-4 snap-x snap-mandatory">
                      {videoItems.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openMediaPreview(item)}
                          className={`group relative min-w-[84%] max-w-[84%] shrink-0 snap-start overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                            item.kind
                          )} sm:min-w-[62%] sm:max-w-[62%]`}
                        >
                          <div className="relative aspect-[16/10] w-full">
                            <Image
                              src={item.img}
                              alt={item.title}
                              fill
                              sizes="(max-width: 640px) 84vw, 62vw"
                              style={{ objectFit: "cover" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                            <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
                              <span className={`h-2 w-2 rounded-full ${getKindAccent(item.kind)}`} />
                              {getKindLabel(item.kind)}
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center">
                              <div
                                className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md ${getPlayGlow(
                                  item.kind
                                )}`}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  aria-hidden
                                >
                                  <path d="M8 6.5v11l9-5.5-9-5.5z" fill="white" />
                                </svg>
                              </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h4 className="text-lg font-semibold text-white">
                                {item.title}
                              </h4>
                              <p className="mt-2 line-clamp-3 text-sm text-gray-200">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-5">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#A3FF12]">
                      Short Format
                    </p>
                    <h3 className="mt-1 text-2xl font-semibold text-white">
                      Reels verticales para impacto rápido
                    </h3>
                  </div>

                  <div className="hidden gap-4 sm:grid sm:grid-cols-3 lg:grid-cols-4">
                    {reelItems.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => openMediaPreview(item)}
                        className={`group overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                          item.kind
                        )}`}
                      >
                        <div className="relative aspect-[9/16] w-full">
                          <Image
                            src={item.img}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
                            <span className={`h-2 w-2 rounded-full ${getKindAccent(item.kind)}`} />
                            Reel
                          </div>

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div
                              className={`flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md transition group-hover:scale-105 ${getPlayGlow(
                                item.kind
                              )}`}
                            >
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                aria-hidden
                              >
                                <path d="M8 6.5v11l9-5.5-9-5.5z" fill="white" />
                              </svg>
                            </div>
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                            <h4 className="line-clamp-2 text-sm font-semibold text-white sm:text-base">
                              {item.title}
                            </h4>
                            <p className="mt-1 line-clamp-2 text-xs text-gray-200 sm:text-sm">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:hidden">
                    <div className="flex gap-4 snap-x snap-mandatory">
                      {reelItems.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => openMediaPreview(item)}
                          className={`group relative min-w-[58vw] max-w-[58vw] shrink-0 snap-start overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                            item.kind
                          )}`}
                        >
                          <div className="relative aspect-[9/16] w-full">
                            <Image
                              src={item.img}
                              alt={item.title}
                              fill
                              sizes="58vw"
                              style={{ objectFit: "cover" }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                            <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-white backdrop-blur">
                              <span className={`h-2 w-2 rounded-full ${getKindAccent(item.kind)}`} />
                              Reel
                            </div>

                            <div className="absolute inset-0 flex items-center justify-center">
                              <div
                                className={`flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white backdrop-blur-md ${getPlayGlow(
                                  item.kind
                                )}`}
                              >
                                <svg
                                  width="18"
                                  height="18"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  aria-hidden
                                >
                                  <path d="M8 6.5v11l9-5.5-9-5.5z" fill="white" />
                                </svg>
                              </div>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <h4 className="line-clamp-2 text-sm font-semibold text-white">
                                {item.title}
                              </h4>
                              <p className="mt-1 line-clamp-2 text-xs text-gray-200">
                                {item.subtitle}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              {renderEditableAd("billboard")}
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
                  <Link
                    href="/noticias/autos"
                    className="relative w-[82%] min-w-[82%] sm:w-[420px] sm:min-w-[420px] snap-start"
                  >
                    <div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-mw-line/70">
                      <Image
                        src="/images/noticia-1.jpg"
                        alt="Autos"
                        fill
                        style={{ objectFit: "cover" }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 p-5">
                        <p className="text-[11px] uppercase tracking-wide text-[#0CE0B2]">
                          Noticias
                        </p>

                        <h3 className="text-2xl font-bold text-white">
                          Autos
                        </h3>

                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                          Lanzamientos, pruebas, industria y todo lo que mueve al universo automotriz.
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/noticias/motos"
                    className="relative w-[82%] min-w-[82%] sm:w-[420px] sm:min-w-[420px] snap-start"
                  >
                    <div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-mw-line/70">
                      <Image
                        src="/images/noticia-2.jpg"
                        alt="Motos"
                        fill
                        style={{ objectFit: "cover" }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 p-5">
                        <p className="text-[11px] uppercase tracking-wide text-[#FF7A1A]">
                          Noticias
                        </p>

                        <h3 className="text-2xl font-bold text-white">
                          Motos
                        </h3>

                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                          Pruebas, rutas y cultura de motociclismo con enfoque visual.
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/deportes"
                    className="relative w-[82%] min-w-[82%] sm:w-[420px] sm:min-w-[420px] snap-start"
                  >
                    <div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-mw-line/70">
                      <Image
                        src="/images/noticia-3.jpg"
                        alt="Deportes"
                        fill
                        style={{ objectFit: "cover" }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 p-5">
                        <p className="text-[11px] uppercase tracking-wide text-[#A3FF12]">
                          Sección
                        </p>

                        <h3 className="text-2xl font-bold text-white">
                          Deportes
                        </h3>

                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                          Motorsport, competencia y adrenalina con mirada editorial.
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    href="/lifestyle"
                    className="relative w-[82%] min-w-[82%] sm:w-[420px] sm:min-w-[420px] snap-start"
                  >
                    <div className="relative h-[240px] w-full overflow-hidden rounded-2xl border border-mw-line/70">
                      <Image
                        src="/images/noticia-1.jpg"
                        alt="Lifestyle"
                        fill
                        style={{ objectFit: "cover" }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                      <div className="absolute bottom-0 p-5">
                        <p className="text-[11px] uppercase tracking-wide text-[#E2A24C]">
                          Sección
                        </p>

                        <h3 className="text-2xl font-bold text-white">
                          Lifestyle
                        </h3>

                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                          Diseño, viajes, gadgets y cultura alrededor de MotorWelt.
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer
          aria-hidden={mobileOpen || !!activeMedia || !!editingGallery}
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
              <h4 className="text-lg font-semibold text-white">
                {t("footer.links")}
              </h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    {t("footer.about")}
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
                {t("footer.socials")}
              </h4>
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
            © {year} MotorWelt. {t("footer.rights")}
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
            linear-gradient(180deg, rgba(4, 18, 16, 0.85), rgba(4, 18, 16, 0.85));
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
          filter: blur(.5px);
        }
        @keyframes slide-fwd {
          0% {
            transform: translateX(-30%);
            opacity: 0;
          }
          10% {
            opacity: .9;
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
            opacity: .9;
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
          background: linear-gradient(90deg, transparent, rgba(12, 224, 178, .95), transparent);
        }
        .streak-warm {
          background: linear-gradient(90deg, transparent, rgba(255, 122, 26, .95), transparent);
        }
        .streak-lime {
          background: linear-gradient(90deg, transparent, rgba(163, 255, 18, .9), transparent);
        }
        .glow-warm {
          text-shadow: 0 0 14px rgba(255, 122, 26, 0.25);
        }
        .glow-cool {
          text-shadow:
            0 0 12px rgba(12, 224, 178, 0.28),
            0 0 26px rgba(12, 224, 178, 0.22),
            0 0 50px rgba(12, 224, 178, 0.14);
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .streak {
            animation: none !important;
            opacity: .35;
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
  const { sanityReadClient } = await import("../lib/sanityClient");

  const tuningQuery = `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == "tuning" ||
        lower(coalesce(category, "")) == "tuning" ||
        "tuning" in coalesce(categories, []) ||
        "builds" in coalesce(categories, []) ||
        "mods" in coalesce(categories, [])
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...16]{
      "id": _id,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, galleryUrls[0], ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt,
      "typeLabel": coalesce(contentType, "Build"),
      "galleryUrls": coalesce(galleryUrls, []),
      "videoUrl": coalesce(videoUrl, youtubeUrl, ""),
      "reelUrl": coalesce(reelUrl, shortVideoUrl, socialUrl, "")
    }
  `;

  const tuningSettingsQuery = `
    *[
      _type in ["sitePageSettings", "pageSettings", "homeSettings"] &&
      (
        pageKey == "tuning" ||
        page == "tuning" ||
        slug.current == "tuning"
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
      "photoGalleries": coalesce(photoGalleries, [])
    }
  `;

  const [tuningRaw, tuningSettingsRaw] = await Promise.all([
    sanityReadClient.fetch(tuningQuery),
    sanityReadClient.fetch(tuningSettingsQuery).catch(() => null),
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

  const tuningItems: TuningItem[] = (tuningRaw ?? []).map((it: any) => ({
    id: String(it?.id || ""),
    title: String(it?.title || ""),
    excerpt: String(it?.excerpt || ""),
    img: String(it?.img || "/images/noticia-2.jpg"),
    href: detailHref(it?.slug),
    when: formatWhen(it?.publishedAt || it?._createdAt),
    typeLabel: String(it?.typeLabel || "Build"),
    galleryUrls: Array.isArray(it?.galleryUrls)
      ? it.galleryUrls.filter(Boolean).map((url: unknown) => String(url))
      : [],
    videoUrl: String(it?.videoUrl || ""),
    reelUrl: String(it?.reelUrl || ""),
  }));

  const fallbackHero =
    tuningItems[0]?.img || DEFAULT_TUNING_SETTINGS.heroImageUrl;

  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig
      )),
      year: new Date().getFullYear(),
      tuningItems,
      initialTuningSettings: sanitizeTuningSettings(
        tuningSettingsRaw,
        fallbackHero
      ),
    },
  };
}