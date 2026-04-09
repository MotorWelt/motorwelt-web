// pages/tuning.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Seo from "../components/Seo";
import ProfileButton from "../components/ProfileButton";

const nextI18NextConfig = require("../next-i18next.config.js");

type ButtonVariant = "cyan" | "pink" | "link";

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
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition will-change-transform focus:outline-none";

  const styles: Record<ButtonVariant, string> = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus:ring-2 focus:ring-[#0CE0B2]/40",
    pink:
      "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus:ring-2 focus:ring-[#FF7A1A]/40",
    link:
      "p-0 text-[#43A1AD] hover:opacity-80 underline underline-offset-4 focus:ring-0",
  };

  return (
    <button {...props} className={`${base} ${styles[variant]} ${className}`}>
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
};

type AdSlot = {
  id: string;
  title: string;
  subtitle: string;
  img: string;
  href: string;
};

type TuningPageSettings = {
  heroImageUrl?: string;
  ads?: Record<string, AdSlot>;
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

const AdminMiniButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
}> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-black/55 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur transition hover:bg-black/70"
  >
    {children}
  </button>
);

const AdBanner: React.FC<{
  slot: AdSlot;
  compact?: boolean;
  editable?: boolean;
  onEdit?: () => void;
}> = ({ slot, compact = false, editable = false, onEdit }) => (
  <div className="relative">
    {editable && onEdit ? (
      <div className="absolute right-3 top-3 z-20">
        <AdminMiniButton onClick={onEdit}>Editar banner</AdminMiniButton>
      </div>
    ) : null}

    <Link href={slot.href} className="group block">
      <div className="overflow-hidden rounded-[28px] border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md transition hover:border-[#0CE0B2]/45">
        <div
          className={`grid ${
            compact ? "md:grid-cols-[1.15fr_.85fr]" : "md:grid-cols-[1fr_.95fr]"
          }`}
        >
          <div className="flex flex-col justify-center p-5 sm:p-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gray-300">
              <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
              Publicidad
            </div>

            <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
              {slot.title}
            </h3>

            <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-300">
              {slot.subtitle}
            </p>

            <span className="mt-5 inline-flex text-sm font-semibold text-[#43A1AD] transition group-hover:text-white">
              Más información
            </span>
          </div>

          <div
            className={`relative w-full ${
              compact
                ? "aspect-[16/9] md:aspect-auto md:min-h-[190px]"
                : "aspect-[16/9] md:aspect-auto md:min-h-[220px]"
            }`}
          >
            <Image
              src={slot.img}
              alt={slot.title}
              fill
              sizes="(max-width: 768px) 100vw, 45vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/25 md:bg-gradient-to-l md:from-transparent md:via-transparent md:to-black/20" />
          </div>
        </div>
      </div>
    </Link>
  </div>
);

export default function TuningPage({
  year,
  tuningItems = [],
}: {
  year: number;
  tuningItems: TuningItem[];
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<VisualMediaItem | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [pageSettings, setPageSettings] = useState<TuningPageSettings>({});

  const featured =
    tuningItems[0] ??
    fallbackItem(
      "fallback-tuning-main",
      "Builds con identidad propia",
      "Proyectos donde el performance, la estética y la cultura visual se mezclan para crear algo que va mucho más allá de un simple coche modificado.",
      "/images/noticia-2.jpg",
      "/tuning/fallback-tuning-main",
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
            "/tuning/fallback-tuning-1",
            "Build"
          ),
          fallbackItem(
            "fallback-tuning-2",
            "Mods que cambian el carácter",
            "Suspensión, ruedas, aero, interiores y detalle fino: cuando cada cambio suma al statement completo.",
            "/images/noticia-2.jpg",
            "/tuning/fallback-tuning-2",
            "Mods"
          ),
          fallbackItem(
            "fallback-tuning-3",
            "Garage culture sin filtro",
            "La parte más obsesiva, adictiva y visual del mundo automotriz vive aquí.",
            "/images/noticia-3.jpg",
            "/tuning/fallback-tuning-3",
            "Cultura"
          ),
          fallbackItem(
            "fallback-tuning-4",
            "El tuning también es diseño",
            "Hay builds que se leen como producto, otros como manifiesto, y otros como una declaración personal.",
            "/images/noticia-1.jpg",
            "/tuning/fallback-tuning-4",
            "Editorial"
          ),
        ];

  const gridItems =
    tuningItems.slice(5, 11).length > 0
      ? tuningItems.slice(5, 11)
      : [
          fallbackItem(
            "fallback-grid-1",
            "Lower, wider, sharper",
            "Cuando la postura del auto lo cambia todo.",
            "/images/noticia-1.jpg",
            "/tuning/fallback-grid-1",
            "Build"
          ),
          fallbackItem(
            "fallback-grid-2",
            "Rines que definen una era",
            "A veces el cambio más fuerte empieza por el set correcto.",
            "/images/noticia-2.jpg",
            "/tuning/fallback-grid-2",
            "Style"
          ),
          fallbackItem(
            "fallback-grid-3",
            "Night runs & neon mood",
            "La ciudad también forma parte del build.",
            "/images/noticia-3.jpg",
            "/tuning/fallback-grid-3",
            "Street"
          ),
          fallbackItem(
            "fallback-grid-4",
            "Aero con intención",
            "No es solo agresividad visual; es lenguaje.",
            "/images/noticia-1.jpg",
            "/tuning/fallback-grid-4",
            "Aero"
          ),
          fallbackItem(
            "fallback-grid-5",
            "Interiores que cuentan historia",
            "Materiales, costuras, contrastes y enfoque.",
            "/images/noticia-2.jpg",
            "/tuning/fallback-grid-5",
            "Interior"
          ),
          fallbackItem(
            "fallback-grid-6",
            "La estética también acelera",
            "Hay builds que se quedan en tu cabeza incluso apagados.",
            "/images/noticia-3.jpg",
            "/tuning/fallback-grid-6",
            "Visual"
          ),
        ];

  const photoSource = useMemo(() => {
    const withPhotos = tuningItems.filter(
      (item) => !!item.img || (Array.isArray(item.galleryUrls) && item.galleryUrls.length > 0)
    );
    return withPhotos.slice(0, 6);
  }, [tuningItems]);

  const videoSource = useMemo(() => {
    const withVideos = tuningItems.filter((item) => !!item.videoUrl);
    return withVideos.slice(0, 4);
  }, [tuningItems]);

  const reelSource = useMemo(() => {
    const withReels = tuningItems.filter((item) => !!item.reelUrl);
    return withReels.slice(0, 4);
  }, [tuningItems]);

  const heroImage = pageSettings.heroImageUrl || featured.img;

  const photoItems = useMemo(
    () =>
      buildVisualItems(photoSource, "photo", [
        { ...featured, img: heroImage },
        ...secondary.slice(0, 2),
        ...gridItems.slice(0, 3),
      ]),
    [featured, gridItems, heroImage, photoSource, secondary]
  );

  const videoItems = useMemo(
    () =>
      buildVisualItems(videoSource, "video", [
        secondary[0] ?? featured,
        secondary[1] ?? featured,
        gridItems[0] ?? featured,
        gridItems[1] ?? featured,
      ]),
    [featured, gridItems, secondary, videoSource]
  );

  const reelItems = useMemo(
    () =>
      buildVisualItems(reelSource, "reel", [
        gridItems[2] ?? featured,
        gridItems[3] ?? featured,
        gridItems[4] ?? featured,
        gridItems[5] ?? featured,
      ]),
    [featured, gridItems, reelSource]
  );

  const defaultAdSlots = useMemo<AdSlot[]>(
    () => [
      {
        id: "ad-tuning-1",
        title: "Tu marca aquí, dentro del mood correcto.",
        subtitle:
          "Espacio premium para llantas, rines, performance parts, detailing, audio o cualquier marca que quiera entrar al universo tuning con presencia editorial.",
        img: featured.img || "/images/noticia-2.jpg",
        href: "/contact",
      },
      {
        id: "ad-tuning-2",
        title: "Publicidad con look editorial, no solo display.",
        subtitle:
          "Ideal para campañas especiales, lanzamientos y colaboraciones que quieran convivir con el lenguaje visual de MotorWelt.",
        img: secondary[0]?.img || "/images/noticia-1.jpg",
        href: "/contact",
      },
    ],
    [featured.img, secondary]
  );

  const adSlots = useMemo<AdSlot[]>(
    () =>
      defaultAdSlots.map((slot) => ({
        ...slot,
        ...(pageSettings.ads?.[slot.id] || {}),
      })),
    [defaultAdSlots, pageSettings.ads]
  );

  useEffect(() => {
    document.body.style.overflow = mobileOpen || !!activeMedia ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, activeMedia]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveMedia(null);
  }, [router.asPath]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setActiveMedia(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const rawUser = localStorage.getItem("mw_admin_user");
      const parsedUser = rawUser ? JSON.parse(rawUser) : null;
      const cookieRole =
        document.cookie
          .split("; ")
          .find((item) => item.startsWith("mw_role="))
          ?.split("=")[1] || "";

      const role = parsedUser?.role || cookieRole || "";
      const spectator = router.query?.spectator === "1";

      setCanEdit((role === "admin" || role === "editor") && !spectator);

      const rawSettings = localStorage.getItem("mw_tuning_page_settings");
      if (rawSettings) {
        setPageSettings(JSON.parse(rawSettings));
      }
    } catch {
      setCanEdit(false);
    }
  }, [router.query]);

  const savePageSettings = (next: TuningPageSettings) => {
    setPageSettings(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("mw_tuning_page_settings", JSON.stringify(next));
    }
  };

  const handleEditHeroImage = () => {
    const currentValue = pageSettings.heroImageUrl || heroImage || "";
    const nextValue = window.prompt("Nueva URL de imagen para el hero:", currentValue);

    if (!nextValue || !nextValue.trim()) return;

    savePageSettings({
      ...pageSettings,
      heroImageUrl: nextValue.trim(),
    });
  };

  const handleEditBanner = (slotId: string) => {
    const current =
      adSlots.find((slot) => slot.id === slotId) ||
      defaultAdSlots.find((slot) => slot.id === slotId);

    if (!current) return;

    const title = window.prompt("Título del banner:", current.title);
    if (title === null) return;

    const subtitle = window.prompt("Subtítulo del banner:", current.subtitle);
    if (subtitle === null) return;

    const img = window.prompt("URL de imagen del banner:", current.img);
    if (img === null) return;

    const href = window.prompt("Link del banner:", current.href);
    if (href === null) return;

    savePageSettings({
      ...pageSettings,
      ads: {
        ...(pageSettings.ads || {}),
        [slotId]: {
          ...current,
          title: title.trim() || current.title,
          subtitle: subtitle.trim() || current.subtitle,
          img: img.trim() || current.img,
          href: href.trim() || current.href,
        },
      },
    });
  };

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
    []
  );

  return (
    <>
      <Seo
        title="Tuning | MotorWelt"
        description="Builds, mods, street culture, aero, stance y el lado más visual y obsesivo del universo automotriz."
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
                  className="inline-flex h-10 items-center leading-none text-white"
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
                  className="block w-full rounded-xl px-3 py-3 text-base text-white hover:bg-white/5"
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
                  className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Comunidad
                </Link>
              </nav>
            </aside>
          </div>
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

              <div className="grid gap-0 lg:grid-cols-[1.5fr_.7fr]">
                <div className="relative aspect-[16/10] bg-black">
                  {activeMedia.embedUrl ? (
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
                      {activeMedia.embedUrl
                        ? "Este preview ya está conectado para reproducirse desde el link externo."
                        : "Esta vista está pensada como preview inmersivo para desktop y mobile, con un lenguaje más visual y editorial alineado al tono de MotorWelt."}
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-3">
                    <Link href={activeMedia.href}>
                      <Button
                        variant="pink"
                        className="w-full"
                        onClick={() => setActiveMedia(null)}
                      >
                        Abrir historia completa
                      </Button>
                    </Link>

                    {activeMedia.mediaUrl ? (
                      <a
                        href={activeMedia.mediaUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
                      >
                        Abrir {activeMedia.kind === "video" ? "video" : "reel"} original
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
          aria-hidden={mobileOpen || !!activeMedia}
          className="relative z-10 pt-16 lg:pt-[72px]"
        >
          <section className="relative overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt={featured.title}
                className="h-full w-full object-cover"
                style={{ filter: "brightness(.32) saturate(1.15)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/35 to-[#041210]" />
            </div>

            {canEdit ? (
              <div className="absolute right-4 top-24 z-20 sm:right-6 lg:right-8">
                <AdminMiniButton onClick={handleEditHeroImage}>
                  Cambiar hero
                </AdminMiniButton>
              </div>
            ) : null}

            <div className="relative mx-auto flex min-h-[74svh] w-full max-w-[1200px] items-end px-4 pb-12 pt-24 sm:px-6 lg:min-h-[86vh] lg:px-8 lg:pb-16">
              <div className="max-w-4xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FF7A1A]/30 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-200 backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                  Tuning · Builds · Street Culture
                </div>

                <h1 className="font-display text-[2.7rem] font-extrabold leading-[0.92] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  El lado más visual,
                  <span className="glow-warm block">obsesivo y aspiracional</span>
                  del universo automotriz.
                </h1>

                <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl">
                  Proyectos, mods, aero, stance, interiores, cultura de garage y
                  builds que no piden permiso para llamar la atención.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href={featured.href}>
                    <Button variant="pink">Ver destacada</Button>
                  </Link>
                  <Link href="#tuning-visuals">
                    <Button variant="cyan">Explorar visuales</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="py-4 sm:py-6">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <AdBanner
                slot={adSlots[0]}
                compact
                editable={canEdit}
                onEdit={() => handleEditBanner(adSlots[0].id)}
              />
            </div>
          </section>

          <section className="py-10 sm:py-14">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="Featured Build"
                title="La build que marca el ritmo visual"
                description="Una destacada con más presencia, mejor jerarquía y un tratamiento más cinematográfico para que la sección no arranque apagada."
                accent="warm"
              />

              <div className="hidden sm:grid gap-6 lg:grid-cols-[1.6fr_.9fr]">
                <Card className="overflow-hidden border-[#FF7A1A]/20 shadow-[0_0_40px_rgba(255,122,26,.06)]">
                  <div className="relative h-[260px] w-full sm:h-[340px] md:h-[420px]">
                    <Image
                      src={heroImage}
                      alt={featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white backdrop-blur sm:left-6 sm:top-6">
                      <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                      Featured
                    </div>
                  </div>

                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-400">
                      <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                      Tuning · {featured.typeLabel}
                      {featured.when ? ` · ${featured.when}` : ""}
                    </div>

                    <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                      {featured.title}
                    </h3>

                    <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-300 sm:text-base">
                      {featured.excerpt}
                    </p>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Link href={featured.href}>
                        <Button variant="pink">Leer la historia completa</Button>
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          setActiveMedia({
                            id: `featured-${featured.id}`,
                            title: featured.title,
                            subtitle: featured.excerpt,
                            img: heroImage,
                            href: featured.href,
                            when: featured.when,
                            kind: "photo",
                          })
                        }
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
                      >
                        Ver preview
                      </button>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid gap-6">
                  {secondary.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative h-40 w-full">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                      </div>

                      <CardContent className="p-4">
                        <div className="text-xs uppercase tracking-[0.14em] text-gray-400">
                          Tuning · {item.typeLabel}
                        </div>
                        <h4 className="mt-1 text-lg font-semibold text-white">
                          {item.title}
                        </h4>
                        <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                          {item.excerpt}
                        </p>

                        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                          <Link href={item.href} className="inline-block">
                            <Button variant="link">Leer más</Button>
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              setActiveMedia({
                                id: `secondary-${item.id}`,
                                title: item.title,
                                subtitle: item.excerpt,
                                img: item.img,
                                href: item.href,
                                when: item.when,
                                kind: "photo",
                              })
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-gray-300 transition hover:bg-white/5"
                          >
                            Preview
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="-mx-4 overflow-x-auto px-4 sm:hidden hide-scrollbar">
                <div className="flex gap-4 snap-x snap-mandatory pb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveMedia({
                        id: `featured-${featured.id}`,
                        title: featured.title,
                        subtitle: featured.excerpt,
                        img: heroImage,
                        href: featured.href,
                        when: featured.when,
                        kind: "photo",
                      })
                    }
                    className="group relative w-[84vw] shrink-0 snap-start overflow-hidden rounded-[26px] border border-[#FF7A1A]/25 bg-mw-surface/80 text-left shadow-[0_0_30px_rgba(255,122,26,.05)] backdrop-blur-md transition hover:border-[#FF7A1A]/50"
                  >
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src={heroImage}
                        alt={featured.title}
                        fill
                        sizes="84vw"
                        style={{ objectFit: "cover" }}
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-white backdrop-blur">
                        <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                        Featured
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-gray-300">
                          <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                          Tuning · {featured.typeLabel}
                        </div>

                        <h3 className="text-2xl font-semibold leading-tight text-white">
                          {featured.title}
                        </h3>

                        <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-gray-200">
                          {featured.excerpt}
                        </p>

                        <div className="mt-4 flex flex-col gap-2">
                          <span className="inline-flex w-full items-center justify-center rounded-2xl border border-[#FF7A1A]/40 bg-black/20 px-4 py-2.5 text-sm font-semibold text-white">
                            Tap para preview
                          </span>
                          <Link
                            href={featured.href}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-white/5"
                          >
                            Abrir historia
                          </Link>
                        </div>
                      </div>
                    </div>
                  </button>

                  {secondary.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setActiveMedia({
                          id: `secondary-${item.id}`,
                          title: item.title,
                          subtitle: item.excerpt,
                          img: item.img,
                          href: item.href,
                          when: item.when,
                          kind: "photo",
                        })
                      }
                      className="group relative w-[74vw] shrink-0 snap-start overflow-hidden rounded-[26px] border border-white/10 bg-mw-surface/80 text-left backdrop-blur-md transition hover:border-[#0CE0B2]/40"
                    >
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          sizes="74vw"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="text-[11px] uppercase tracking-[0.16em] text-gray-300">
                            Tuning · {item.typeLabel}
                          </div>
                          <h4 className="mt-2 text-xl font-semibold leading-tight text-white">
                            {item.title}
                          </h4>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-200">
                            {item.excerpt}
                          </p>
                        </div>
                      </div>
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
                  <Link href="/noticias/autos" className="hidden sm:inline-flex">
                    <Button variant="cyan">Explorar más MotorWelt</Button>
                  </Link>
                }
              />

              <div className="space-y-12 sm:space-y-14">
                <div>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                        Photos
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">
                        Frames con postura, detalle y atmósfera
                      </h3>
                    </div>
                  </div>

                  <div className="hidden sm:grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {photoItems.slice(0, 6).map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveMedia(item)}
                        className={`group overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                          item.kind
                        )} ${index === 0 ? "sm:col-span-2" : ""}`}
                      >
                        <div
                          className={`relative w-full ${
                            index === 0 ? "aspect-[16/9]" : "aspect-[4/3]"
                          }`}
                        >
                          <Image
                            src={item.img}
                            alt={item.title}
                            fill
                            sizes={
                              index === 0
                                ? "(max-width: 640px) 100vw, (max-width: 1280px) 66vw, 66vw"
                                : "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                            }
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
                    ))}
                  </div>

                  <div className="-mx-4 overflow-x-auto px-4 sm:hidden hide-scrollbar">
                    <div className="flex gap-4 snap-x snap-mandatory pb-2">
                      {photoItems.slice(0, 6).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveMedia(item)}
                          className={`group relative shrink-0 snap-start overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                            item.kind
                          )} w-[84vw]`}
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

                            <div className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white opacity-90 backdrop-blur">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                                <path
                                  d="M8 8h3M16 8v3M16 16h-3M8 16v-3"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                />
                              </svg>
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
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#FF7A1A]">
                        Videos
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">
                        Piezas con movimiento y energía editorial
                      </h3>
                    </div>
                  </div>

                  <div className="hidden lg:grid lg:grid-cols-2 gap-5">
                    {videoItems.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveMedia(item)}
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

                  <div className="-mx-4 overflow-x-auto px-4 lg:hidden hide-scrollbar">
                    <div className="flex gap-4 snap-x snap-mandatory pb-2">
                      {videoItems.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveMedia(item)}
                          className={`group relative shrink-0 snap-start overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                            item.kind
                          )} w-[84vw] sm:w-[62vw]`}
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
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#A3FF12]">
                        Short Format
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">
                        Reels verticales para impacto rápido
                      </h3>
                    </div>
                  </div>

                  <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {reelItems.slice(0, 4).map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveMedia(item)}
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

                  <div className="-mx-4 overflow-x-auto px-4 sm:hidden hide-scrollbar">
                    <div className="flex gap-4 snap-x snap-mandatory pb-2">
                      {reelItems.slice(0, 4).map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveMedia(item)}
                          className={`group relative shrink-0 snap-start overflow-hidden rounded-[24px] border bg-mw-surface/75 text-left backdrop-blur-md transition ${getKindBorder(
                            item.kind
                          )} w-[58vw]`}
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

              <div className="mt-8 text-center sm:hidden">
                <Link href="/noticias/autos">
                  <Button variant="cyan" className="w-full">
                    Explorar más MotorWelt
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="py-4 sm:py-6">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <AdBanner
                slot={adSlots[1]}
                editable={canEdit}
                onEdit={() => handleEditBanner(adSlots[1].id)}
              />
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="More Tuning"
                title="Más builds, mods y cultura visual"
                description="La parte editorial de exploración queda al final para conservar mejor el ritmo: primero concepto, luego presencia visual y después profundidad."
                accent="lime"
                action={
                  <Link href="/noticias/autos" className="hidden sm:inline-flex">
                    <Button variant="cyan">Seguir explorando</Button>
                  </Link>
                }
              />

              <div className="hidden sm:grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {gridItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="relative h-52 w-full">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="(max-width: 1280px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>

                    <CardContent className="p-5">
                      <div className="text-xs uppercase tracking-[0.14em] text-gray-400">
                        Tuning · {item.typeLabel}
                      </div>
                      <h3 className="mt-1 text-xl font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-gray-300 line-clamp-3">
                        {item.excerpt}
                      </p>

                      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                        <Link href={item.href} className="inline-block">
                          <Button variant="link">Leer más</Button>
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            setActiveMedia({
                              id: `grid-${item.id}`,
                              title: item.title,
                              subtitle: item.excerpt,
                              img: item.img,
                              href: item.href,
                              when: item.when,
                              kind: "photo",
                            })
                          }
                          className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-gray-300 transition hover:bg-white/5"
                        >
                          Preview
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="-mx-4 overflow-x-auto px-4 sm:hidden hide-scrollbar">
                <div className="flex gap-4 snap-x snap-mandatory pb-2">
                  {gridItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        setActiveMedia({
                          id: `grid-${item.id}`,
                          title: item.title,
                          subtitle: item.excerpt,
                          img: item.img,
                          href: item.href,
                          when: item.when,
                          kind: "photo",
                        })
                      }
                      className="group relative w-[74vw] shrink-0 snap-start overflow-hidden rounded-[24px] border border-white/10 bg-mw-surface/80 text-left backdrop-blur-md transition hover:border-[#0CE0B2]/45"
                    >
                      <div className="relative aspect-[4/5] w-full">
                        <Image
                          src={item.img}
                          alt={item.title}
                          fill
                          sizes="74vw"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
                          <span className="h-2 w-2 rounded-full bg-[#A3FF12]" />
                          {item.typeLabel}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h3 className="text-xl font-semibold leading-tight text-white">
                            {item.title}
                          </h3>
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-200">
                            {item.excerpt}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center sm:hidden">
                <Link href="/noticias/autos">
                  <Button variant="cyan" className="w-full">
                    Seguir explorando
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <section className="pb-12 sm:pb-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <SectionHeader
                eyebrow="Explore MotorWelt"
                title="Seguir explorando MotorWelt"
                description="Sigue navegando entre más historias, cultura visual y cobertura editorial dentro del universo MotorWelt."
                accent="cool"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Link href="/noticias/autos" className="group block">
                  <Card className="overflow-hidden transition group-hover:border-[#0CE0B2]/55">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src="/images/noticia-1.jpg"
                        alt="Autos"
                        fill
                        sizes="(max-width: 1280px) 50vw, 25vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#0CE0B2]">
                          Noticias
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">Autos</h3>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/noticias/motos" className="group block">
                  <Card className="overflow-hidden transition group-hover:border-[#FF7A1A]/55">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src="/images/noticia-2.jpg"
                        alt="Motos"
                        fill
                        sizes="(max-width: 1280px) 50vw, 25vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#FF7A1A]">
                          Noticias
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">Motos</h3>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/deportes" className="group block">
                  <Card className="overflow-hidden transition group-hover:border-[#A3FF12]/55">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src="/images/noticia-3.jpg"
                        alt="Deportes"
                        fill
                        sizes="(max-width: 1280px) 50vw, 25vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#A3FF12]">
                          Sección
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">Deportes</h3>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/lifestyle" className="group block">
                  <Card className="overflow-hidden transition group-hover:border-[#43A1AD]/55">
                    <div className="relative aspect-[16/10] w-full">
                      <Image
                        src="/images/noticia-1.jpg"
                        alt="Lifestyle"
                        fill
                        sizes="(max-width: 1280px) 50vw, 25vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-5">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-[#43A1AD]">
                          Sección
                        </p>
                        <h3 className="mt-1 text-xl font-semibold text-white">Lifestyle</h3>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </section>
        </main>

        <footer
          aria-hidden={mobileOpen || !!activeMedia}
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
                    About us
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
            radial-gradient(120% 80% at 20% 10%, rgba(0, 0, 0, 0.16) 0%, transparent 60%),
            radial-gradient(120% 80% at 80% 90%, rgba(0, 0, 0, 0.2) 0%, transparent 60%),
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
          background: linear-gradient(90deg, transparent, rgba(163, 255, 18, .85), transparent);
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

        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
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
        lower(category) == "tuning" ||
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

  const tuningRaw = await sanityReadClient.fetch(tuningQuery);

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
    href: `/tuning/${String(it?.slug || "")}`,
    when: formatWhen(it?.publishedAt || it?._createdAt),
    typeLabel: String(it?.typeLabel || "Build"),
    galleryUrls: Array.isArray(it?.galleryUrls)
      ? it.galleryUrls.filter(Boolean).map((url: unknown) => String(url))
      : [],
    videoUrl: String(it?.videoUrl || ""),
    reelUrl: String(it?.reelUrl || ""),
  }));

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
      year: new Date().getFullYear(),
      tuningItems,
    },
  };
}