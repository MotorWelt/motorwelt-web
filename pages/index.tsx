import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
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

type LinkButtonProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
};

const getButtonClasses = (
  variant: ButtonVariant = "cyan",
  className = "",
  isLinkElement = false
) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition will-change-transform focus:outline-none";

  const styles: Record<ButtonVariant, string> = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus:ring-2 focus:ring-[#0CE0B2]/40",
    pink:
      "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus:ring-2 focus:ring-[#FF7A1A]/40",
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

const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  className = "",
  children,
  variant = "cyan",
}) => {
  return (
    <Link href={href} className={getButtonClasses(variant, className, true)}>
      {children}
    </Link>
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

type HomeNewsItem = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  sectionLabel: string;
  typeLabel: string;
  when: string;
};

type PartnerLogo = {
  id: string;
  name: string;
  logoUrl?: string;
  href?: string;
};

type AdKind = "leaderboard" | "mpu" | "billboard";

type AdConfig = {
  enabled: boolean;
  label: string;
  imageUrl: string;
  href: string;
};

type HomeSettings = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    mpu: AdConfig;
    billboard: AdConfig;
  };
  partnerLogos: PartnerLogo[];
};

type HomeSectionCard = {
  title: string;
  href: string;
  accent: string;
  accentDot: string;
  subtitle: string;
};

const DEFAULT_HOME_SETTINGS: HomeSettings = {
  heroImageUrl: "/images/hero-gti.jpg",
  ads: {
    leaderboard: {
      enabled: true,
      label: "Publicidad — Leaderboard (728×90 / 970×250)",
      imageUrl: "",
      href: "",
    },
    mpu: {
      enabled: true,
      label: "Publicidad — MPU (300×250 / 300×600)",
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

function fallbackItem(
  id: string,
  title: string,
  excerpt: string,
  img: string,
  href: string,
  sectionLabel: string,
  typeLabel = "Destacada"
): HomeNewsItem {
  return {
    id,
    title,
    excerpt,
    img,
    href,
    sectionLabel,
    typeLabel,
    when: "",
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

function sectionLabel(section: string) {
  if (section === "noticias_autos") return "Autos";
  if (section === "noticias_motos") return "Motos";
  if (section === "deportes") return "Deportes";
  if (section === "lifestyle") return "Lifestyle";
  if (section === "tuning") return "Tuning";
  return "MotorWelt";
}

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : "";
}

function detailHref(
  section: "tuning" | "deportes" | "lifestyle",
  slug?: string | null
) {
  const cleanSlug = String(slug || "").trim();
  if (!cleanSlug) return `/${section}`;
  return `/${section}/${cleanSlug}`;
}

function splitFiveItemLayout(items: HomeNewsItem[]) {
  return {
    left: items.slice(0, 2),
    right: items.slice(2, 5),
  };
}

export default function HomePage({
  year,
  featuredMixed = [],
  sportsItems = [],
  lifestyleItems = [],
  tuningItems = [],
  initialHomeSettings,
}: {
  year: number;
  featuredMixed: HomeNewsItem[];
  sportsItems: HomeNewsItem[];
  lifestyleItems: HomeNewsItem[];
  tuningItems: HomeNewsItem[];
  initialHomeSettings?: HomeSettings;
}) {
  const { t } = useTranslation("home");
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [canEditHome, setCanEditHome] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [homeSettings, setHomeSettings] = useState<HomeSettings>(
    initialHomeSettings ?? DEFAULT_HOME_SETTINGS
  );
  const [savingHome, setSavingHome] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const mpuInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);
  const partnerInputRef = useRef<HTMLInputElement | null>(null);

  const heroMixed =
    featuredMixed[0] ??
    fallbackItem(
      "fallback-home-mix",
      "Autos & Motos — Destacadas",
      "Las notas más recientes del mundo sobre cuatro y dos ruedas, reunidas en un mismo espacio.",
      "/images/noticia-1.jpg",
      "/noticias/autos",
      "Autos/Motos"
    );

  const sidebarMixed =
    featuredMixed.slice(1, 6).length > 0 ? featuredMixed.slice(1, 6) : [heroMixed];

  const safeSports =
    sportsItems.length > 0
      ? sportsItems.slice(0, 3)
      : [
          fallbackItem(
            "fallback-sport-1",
            "Deportes MotorWelt",
            "Cobertura de rally, pista y motorsport.",
            "/images/noticia-1.jpg",
            "/deportes",
            "Deportes",
            "noticia"
          ),
          fallbackItem(
            "fallback-sport-2",
            "Más del mundo deportivo",
            "Historias, técnica y adrenalina.",
            "/images/noticia-2.jpg",
            "/deportes",
            "Deportes",
            "noticia"
          ),
          fallbackItem(
            "fallback-sport-3",
            "Competición y cultura",
            "Lo mejor de la acción dentro y fuera de la pista.",
            "/images/noticia-3.jpg",
            "/deportes",
            "Deportes",
            "noticia"
          ),
        ];

  const heroLifestyle =
    lifestyleItems[0] ??
    fallbackItem(
      "fallback-life-hero",
      "Lifestyle — Cultura & Garaje",
      "Historias de estilo, cultura y pasión alrededor del mundo automotriz y motociclista.",
      "/images/noticia-3.jpg",
      "/lifestyle",
      "Lifestyle"
    );

  const sideLifestyle =
    lifestyleItems.slice(1, 5).length > 0
      ? lifestyleItems.slice(1, 5)
      : [
          fallbackItem(
            "fallback-life-1",
            "Cultura MotorWelt",
            "Diseño, accesorios y el lenguaje visual que rodea esta escena.",
            "/images/noticia-1.jpg",
            "/lifestyle",
            "Lifestyle"
          ),
          fallbackItem(
            "fallback-life-2",
            "Estilo y detalle",
            "Pequeños elementos que elevan el carácter de cualquier proyecto.",
            "/images/noticia-2.jpg",
            "/lifestyle",
            "Lifestyle"
          ),
          fallbackItem(
            "fallback-life-3",
            "Garage culture",
            "Donde conviven la estética, la comunidad y la obsesión por el detalle.",
            "/images/noticia-3.jpg",
            "/lifestyle",
            "Lifestyle"
          ),
          fallbackItem(
            "fallback-life-4",
            "Objetos con carácter",
            "Lo visual, lo funcional y lo aspiracional dentro del universo MotorWelt.",
            "/images/noticia-1.jpg",
            "/lifestyle",
            "Lifestyle"
          ),
        ];

  const heroTuning =
    tuningItems[0] ??
    fallbackItem(
      "fallback-tuning-hero",
      "Tuning — Builds, mods y cultura",
      "La parte más visual, aspiracional y obsesiva del mundo automotriz: proyectos, preparación, estética y carácter.",
      "/images/noticia-2.jpg",
      "/tuning",
      "Tuning"
    );

  const sideTuning =
    tuningItems.slice(1, 5).length > 0
      ? tuningItems.slice(1, 5)
      : [
          fallbackItem(
            "fallback-tuning-1",
            "Builds con identidad",
            "Proyectos que mezclan performance, estética y personalidad.",
            "/images/noticia-1.jpg",
            "/tuning",
            "Tuning"
          ),
          fallbackItem(
            "fallback-tuning-2",
            "Mods que sí cambian el juego",
            "Desde ruedas y suspensión hasta aero, interiores y detalle fino.",
            "/images/noticia-2.jpg",
            "/tuning",
            "Tuning"
          ),
          fallbackItem(
            "fallback-tuning-3",
            "Cultura de garage",
            "El lado más calle, más visual y más adictivo del universo MotorWelt.",
            "/images/noticia-3.jpg",
            "/tuning",
            "Tuning"
          ),
          fallbackItem(
            "fallback-tuning-4",
            "Más allá del stance",
            "Preparación, presencia y builds que cuentan una historia.",
            "/images/noticia-1.jpg",
            "/tuning",
            "Tuning"
          ),
        ];

  const tuningDesktopItems = [heroTuning, ...sideTuning].slice(0, 5);
  const tuningDesktopColumns = splitFiveItemLayout(tuningDesktopItems);

  const lifestyleDesktopItems = [heroLifestyle, ...sideLifestyle].slice(0, 5);
  const lifestyleDesktopColumns = splitFiveItemLayout(lifestyleDesktopItems);

  const heroSectionCards: HomeSectionCard[] = useMemo(
    () => [
      {
        title: "Autos",
        href: "/noticias/autos",
        accent: "from-[#0CE0B2]/45 via-[#0CE0B2]/15 to-transparent",
        accentDot: "bg-[#0CE0B2]",
        subtitle: "Pruebas, lanzamientos y cultura automotriz",
      },
      {
        title: "Motos",
        href: "/noticias/motos",
        accent: "from-[#43A1AD]/45 via-[#43A1AD]/15 to-transparent",
        accentDot: "bg-[#43A1AD]",
        subtitle: "Dos ruedas, estilo y carácter",
      },
      {
        title: "Tuning",
        href: "/tuning",
        accent: "from-[#FF7A1A]/45 via-[#FF7A1A]/15 to-transparent",
        accentDot: "bg-[#FF7A1A]",
        subtitle: "Builds, mods y garage culture",
      },
      {
        title: "Deportes",
        href: "/deportes",
        accent: "from-[#A3FF12]/35 via-[#A3FF12]/10 to-transparent",
        accentDot: "bg-[#A3FF12]",
        subtitle: "Pista, rally, racing y adrenalina",
      },
      {
        title: "Lifestyle",
        href: "/lifestyle",
        accent: "from-[#E2A24C]/45 via-[#E2A24C]/15 to-transparent",
        accentDot: "bg-[#E2A24C]",
        subtitle: "Diseño, estilo y cultura visual",
      },
      {
        title: "Comunidad",
        href: "/comunidad",
        accent: "from-[#ffffff]/20 via-[#ffffff]/8 to-transparent",
        accentDot: "bg-white",
        subtitle: "Eventos, meets y la gente detrás de esto",
      },
    ],
    []
  );

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

    setCanEditHome(role === "admin" || role === "editor");
  }, []);

  useEffect(() => {
    if (!router.isReady) return;
    setSpectatorMode(router.query.view === "spectator");
  }, [router.isReady, router.query.view]);

  const editControlsVisible = canEditHome && !spectatorMode;

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

  async function persistHomeSettings(nextSettings: HomeSettings) {
    setSavingHome(true);
    setHomeError(null);

    try {
      const res = await fetch("/api/ai/admin/home/save", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: nextSettings }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo guardar.");
      }

      setHomeSettings(nextSettings);
    } catch (err: any) {
      setHomeError(err?.message || "No se pudo guardar Home Settings.");
    } finally {
      setSavingHome(false);
    }
  }

  async function handleHeroImagePick(files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImageToSanity(file);
      const next = {
        ...homeSettings,
        heroImageUrl: uploaded.url,
      };
      await persistHomeSettings(next);
    } catch (err: any) {
      setHomeError(err?.message || "No se pudo subir la portada.");
    }
  }

  async function handleAdImagePick(kind: AdKind, files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImageToSanity(file);
      const next = {
        ...homeSettings,
        ads: {
          ...homeSettings.ads,
          [kind]: {
            ...homeSettings.ads[kind],
            imageUrl: uploaded.url,
          },
        },
      };
      await persistHomeSettings(next);
    } catch (err: any) {
      setHomeError(err?.message || "No se pudo subir el anuncio.");
    }
  }

  async function handleAddPartner(files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImageToSanity(file);
      const name =
        typeof window !== "undefined"
          ? window.prompt("Nombre del partner:", "Nuevo partner") || "Nuevo partner"
          : "Nuevo partner";

      const href =
        typeof window !== "undefined"
          ? window.prompt("Link del partner (opcional):", "") || ""
          : "";

      const next = {
        ...homeSettings,
        partnerLogos: [
          ...homeSettings.partnerLogos,
          {
            id: `partner-${Date.now()}`,
            name,
            logoUrl: uploaded.url,
            href,
          },
        ],
      };

      await persistHomeSettings(next);
    } catch (err: any) {
      setHomeError(err?.message || "No se pudo agregar el partner.");
    }
  }

  async function toggleAd(kind: AdKind) {
    const next = {
      ...homeSettings,
      ads: {
        ...homeSettings.ads,
        [kind]: {
          ...homeSettings.ads[kind],
          enabled: !homeSettings.ads[kind].enabled,
        },
      },
    };

    await persistHomeSettings(next);
  }

  async function editAdLink(kind: AdKind) {
    if (typeof window === "undefined") return;
    const current = homeSettings.ads[kind].href || "";
    const href = window.prompt("Pega el link del anuncio:", current);
    if (href === null) return;

    const next = {
      ...homeSettings,
      ads: {
        ...homeSettings.ads,
        [kind]: {
          ...homeSettings.ads[kind],
          href: href.trim(),
        },
      },
    };

    await persistHomeSettings(next);
  }

  async function clearAdImage(kind: AdKind) {
    const next = {
      ...homeSettings,
      ads: {
        ...homeSettings.ads,
        [kind]: {
          ...homeSettings.ads[kind],
          imageUrl: "",
        },
      },
    };
    await persistHomeSettings(next);
  }

  async function editPartnerLink(id: string) {
    if (typeof window === "undefined") return;
    const item = homeSettings.partnerLogos.find((p) => p.id === id);
    if (!item) return;

    const href = window.prompt("Pega el link del partner:", item.href || "");
    if (href === null) return;

    const next = {
      ...homeSettings,
      partnerLogos: homeSettings.partnerLogos.map((p) =>
        p.id === id ? { ...p, href: href.trim() } : p
      ),
    };

    await persistHomeSettings(next);
  }

  async function removePartner(id: string) {
    const next = {
      ...homeSettings,
      partnerLogos: homeSettings.partnerLogos.filter((p) => p.id !== id),
    };
    await persistHomeSettings(next);
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

  function renderEditableAd(kind: AdKind, className = "") {
    const ad = homeSettings.ads[kind];

    if (!ad.enabled && !editControlsVisible) return null;

    const inputRef =
      kind === "leaderboard"
        ? leaderboardInputRef
        : kind === "mpu"
        ? mpuInputRef
        : billboardInputRef;

    const wrapClass = `
      relative w-full mx-auto overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70
      ${
        kind === "mpu"
          ? "max-w-[300px] aspect-[300/395]"
          : kind === "leaderboard"
          ? "max-w-[970px] aspect-[970/120] min-h-[20px] sm:min-h-[72px] md:min-h-0"
          : "max-w-[970px] aspect-[970/250]"
      }
      ${className}
    `;

    const imageClass =
      kind === "leaderboard"
        ? "h-full w-full object-cover object-center bg-black/20"
        : kind === "mpu"
        ? "h-full w-full object-contain object-center bg-black/30"
        : "h-full w-full object-cover object-center bg-black/20";

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
                  className={imageClass}
                />
              </a>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
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

  function renderMobileCardsRail(
    title: string,
    barClass: string,
    items: HomeNewsItem[],
    ctaHref: string,
    ctaLabel: string,
    ctaVariant: ButtonVariant = "cyan"
  ) {
    return (
      <section className="py-10 sm:py-12 md:hidden">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold tracking-wide text-white">
              {title}
            </h2>
            <div className={`mt-2 h-1 w-24 rounded-full ${barClass}`} />
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
            <div className="flex gap-4 snap-x snap-mandatory">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block w-[84%] min-w-[84%] shrink-0 snap-start"
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
                        <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                        {item.sectionLabel} · {item.typeLabel}
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
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center">
            <LinkButton href={ctaHref} variant={ctaVariant} className="w-full">
              {ctaLabel}
            </LinkButton>
          </div>
        </div>
      </section>
    );
  }

  function renderHeroSectionsRail() {
    return (
      <section className="relative -mt-10 z-20 pb-4 sm:-mt-12 sm:pb-6 lg:-mt-14">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-white/10 bg-black/35 p-3 shadow-[0_18px_60px_rgba(0,0,0,.35)] backdrop-blur-xl sm:p-4">
            <div className="mb-3 flex items-center justify-between px-1 sm:px-2">
              <div>
                <p className="text-[10px] uppercase tracking-[0.28em] text-gray-400 sm:text-[11px]">
                  Explora el universo
                </p>
                <h2 className="mt-1 text-base font-semibold text-white sm:text-lg">
                  Secciones principales
                </h2>
              </div>

              <div className="hidden md:flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gray-500">
                <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                Feed rápido
              </div>
            </div>

            <div className="hidden gap-3 md:grid md:grid-cols-3 xl:grid-cols-6">
              {heroSectionCards.map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.05]"
                >
                  <div
                    className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-80`}
                  />
                  <div className="relative z-10">
                    <div className="mb-4 flex items-center justify-between">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.accentDot}`} />
                      <span className="text-[10px] uppercase tracking-[0.22em] text-gray-500 transition group-hover:text-gray-300">
                        Go
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-gray-300">
                      {item.subtitle}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="-mx-3 overflow-x-auto px-3 no-scrollbar md:hidden">
              <div className="flex gap-3">
                {heroSectionCards.map((item) => (
                  <Link
                    key={item.title}
                    href={item.href}
                    className="group relative min-w-[220px] max-w-[220px] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-4"
                  >
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-80`}
                    />
                    <div className="relative z-10">
                      <div className="mb-4 flex items-center justify-between">
                        <span className={`h-2.5 w-2.5 rounded-full ${item.accentDot}`} />
                        <span className="text-[10px] uppercase tracking-[0.22em] text-gray-500">
                          Go
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-300">
                        {item.subtitle}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  function renderStackedFeatureCard(item: HomeNewsItem, priority = false) {
    return (
      <Card
        key={item.id}
        className="overflow-hidden hover:shadow-[0_0_24px_rgba(255,255,255,.06)]"
      >
        <div className="relative h-44 w-full">
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
            priority={priority}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </div>
        <CardContent className="p-4 sm:p-5">
          <div className="text-xs text-gray-400">{item.when}</div>
          <h3 className="mt-1 text-lg font-semibold text-white">{item.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-gray-300 line-clamp-2">
            {item.excerpt}
          </p>
          <div className="mt-4 mt-auto">
            <Link href={item.href}>
              <span className={getButtonClasses("link")}>Leer más</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Seo
        title={`MotorWelt — ${t("hero.title")}`}
        description={t("hero.subtitle")}
        image={homeSettings?.heroImageUrl || DEFAULT_HOME_SETTINGS.heroImageUrl}
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

      <input
        ref={partnerInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleAddPartner(e.target.files);
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

        {canEditHome && (
          <div className="fixed bottom-4 left-4 z-[80] rounded-2xl border border-[#0CE0B2]/40 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2] animate-pulse" />
              <span>{spectatorMode ? "Vista espectador" : "Modo edición home"}</span>
              {savingHome && <span className="text-[#0CE0B2]">Guardando…</span>}
            </div>
            {homeError && <div className="mt-1 text-red-300">{homeError}</div>}
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

        <main aria-hidden={mobileOpen} className="relative z-10">
          <section className="relative isolate overflow-hidden">
            <div className="relative flex min-h-[76svh] flex-col justify-end overflow-hidden sm:min-h-[82svh] lg:min-h-[90vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={homeSettings?.heroImageUrl || DEFAULT_HOME_SETTINGS.heroImageUrl}
                alt="Hero MotorWelt"
                className="absolute inset-0 h-full w-full object-cover"
                style={{ filter: "brightness(.34) saturate(1.12) contrast(1.06)" }}
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(12,224,178,.14),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(255,122,26,.16),transparent_30%),linear-gradient(180deg,rgba(0,0,0,.22)_0%,rgba(0,0,0,.38)_24%,rgba(0,0,0,.64)_58%,rgba(2,10,10,.9)_100%)]" />
              <div className="absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-black/78 via-black/46 to-transparent lg:block" />
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#041210] via-[#041210]/72 to-transparent" />

              <div className="pointer-events-none absolute -left-10 top-20 h-64 w-64 rotate-[-20deg] rounded-full bg-[#0CE0B2]/16 blur-3xl sm:h-80 sm:w-80" />
              <div className="pointer-events-none absolute top-[16%] right-[8%] h-44 w-44 rounded-full bg-[#FF7A1A]/16 blur-3xl sm:h-56 sm:w-56" />
              <div className="pointer-events-none absolute -bottom-16 -right-16 h-72 w-72 rotate-[-20deg] rounded-full bg-[#FF7A1A]/18 blur-3xl sm:h-96 sm:w-96" />

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

              <div className="relative z-10 w-full px-4 pb-16 pt-16 sm:px-6 sm:pb-20 lg:px-8 lg:pb-24">
                <div className="mx-auto flex w-full max-w-[1200px] justify-center">
                  <div className="w-full max-w-4xl text-center">
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-gray-200 backdrop-blur md:text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                        MotorWelt
                      </div>
                    </div>

                    <h1 className="mx-auto mt-5 max-w-[920px] font-display text-[2.9rem] font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-[4.2rem] md:text-[5.1rem] lg:text-[5.9rem] xl:text-[6.15rem]">
                      <span className="glow-cool block">MotorWelt</span>
                      <span className="block text-white/95">{t("hero.title")}</span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-[760px] text-base leading-relaxed text-gray-200 sm:text-lg md:text-[1.08rem]">
                      {t("hero.subtitle")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {renderHeroSectionsRail()}

          <section className="py-4 sm:py-6">
            <div className="mx-auto w-full max-w-[1200px] px-2 sm:px-6 lg:px-8">
              {renderEditableAd("leaderboard")}
            </div>
          </section>

          {renderMobileCardsRail(
            "Tuning — Builds & Culture",
            "bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]",
            [heroTuning, ...sideTuning],
            "/tuning",
            "Ver más Tuning",
            "pink"
          )}

          <section className="hidden md:block py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="glow-warm font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  Tuning — Builds & Culture
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-6">
                  {tuningDesktopColumns.left.map((item, index) =>
                    renderStackedFeatureCard(item, index === 0)
                  )}
                </div>

                <div className="grid gap-6">
                  {tuningDesktopColumns.right.map((item) =>
                    renderStackedFeatureCard(item)
                  )}
                </div>
              </div>

              <div className="mt-8 text-center">
                <LinkButton href="/tuning" variant="pink" className="px-6 py-3">
                  Ver más Tuning
                </LinkButton>
              </div>
            </div>
          </section>

          {renderMobileCardsRail(
            "Autos & Motos — Destacadas",
            "bg-gradient-to-r from-[#0CE0B2] via-[#E2A24C] to-[#FF7A1A]",
            [heroMixed, ...sidebarMixed],
            "/noticias/autos",
            "Ver más de Autos",
            "cyan"
          )}

          <section className="hidden md:block py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  Autos & Motos — Destacadas
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#0CE0B2] via-[#E2A24C] to-[#FF7A1A] sm:w-28" />
              </div>

              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                <Card className="overflow-hidden hover:shadow-[0_0_26px_rgba(12,224,178,.2)]">
                  <div className="relative h-[240px] w-full sm:h-[320px] md:h-[380px]">
                    <Image
                      src={heroMixed.img}
                      alt={heroMixed.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/12 to-transparent" />
                  </div>
                  <CardContent className="p-5 sm:p-6">
                    <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-400 sm:text-xs">
                      <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                      {heroMixed.sectionLabel} · {heroMixed.typeLabel}
                    </div>
                    <h3 className="text-xl font-semibold text-white sm:text-2xl">
                      {heroMixed.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-gray-300 sm:text-base">
                      {heroMixed.excerpt}
                    </p>
                    <div className="mt-4 mt-auto">
                      <Link href={heroMixed.href}>
                        <span className={getButtonClasses("link")}>Leer la nota</span>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                <aside className="lg:sticky lg:top-24">
                  <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
                    <div className="border-b border-mw-line/60 p-4">
                      <h4 className="font-semibold text-white">Más para leer</h4>
                    </div>
                    <ul className="divide-y divide-mw-line/60">
                      {sidebarMixed.map((item) => (
                        <li key={item.id} className="p-4 transition hover:bg-white/5">
                          <Link href={item.href} className="flex gap-3">
                            <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-mw-line/70">
                              <Image
                                src={item.img}
                                alt={item.title}
                                fill
                                sizes="100px"
                                style={{ objectFit: "cover" }}
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm text-white">
                                {item.title}
                              </p>
                              <span className="mt-1 block text-xs text-gray-400">
                                {item.sectionLabel}
                                {item.when ? ` • ${item.when}` : ""}
                              </span>
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </aside>
              </div>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
                <LinkButton
                  href="/noticias/autos"
                  variant="cyan"
                  className="w-full px-6 py-3 sm:w-auto"
                >
                  Ver más de Autos
                </LinkButton>
                <span className="hidden text-gray-500 sm:inline">/</span>
                <LinkButton
                  href="/noticias/motos"
                  variant="cyan"
                  className="w-full px-6 py-3 sm:w-auto"
                >
                  Ver más de Motos
                </LinkButton>
              </div>
            </div>
          </section>

          <section className="py-6 md:hidden">
            <div className="mx-auto w-full max-w-[1200px] px-4">
              <div className="flex justify-center">
                {renderEditableAd("mpu", "max-w-[300px]")}
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12 md:hidden">
            <div className="mx-auto w-full max-w-[1200px] px-4">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold tracking-wide text-white">
                  Deportes — Destacados
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
              </div>

              <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                <div className="flex gap-4 snap-x snap-mandatory">
                  {safeSports.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block w-[84%] min-w-[84%] shrink-0 snap-start"
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
                            <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                            {item.sectionLabel} · {item.typeLabel}
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
                    </Link>
                  ))}
                </div>
              </div>

              <div className="mt-6 text-center">
                <LinkButton href="/deportes" variant="cyan" className="w-full">
                  Ver todo Deportes
                </LinkButton>
              </div>
            </div>
          </section>

          <section className="hidden md:block py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="glow-warm font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  Deportes — Destacados
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {safeSports.map((item) => (
                  <Card
                    key={item.id}
                    className="overflow-hidden hover:shadow-[0_0_24px_rgba(255,122,26,.16)]"
                  >
                    <div className="relative h-44 w-full">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="(max-width: 1280px) 50vw, 25vw"
                        style={{ objectFit: "cover" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    </div>
                    <CardContent className="p-5">
                      <div className="text-xs text-gray-400">{item.when}</div>
                      <h3 className="mt-1 text-lg font-semibold text-white">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-300 line-clamp-2">
                        {item.excerpt}
                      </p>
                      <Link href={item.href} className="inline-block mt-auto">
                        <span className={getButtonClasses("link", "mt-3")}>Leer más</span>
                      </Link>
                    </CardContent>
                  </Card>
                ))}

                <div className="sm:col-span-2 xl:col-span-1">
                  {renderEditableAd("mpu")}
                </div>
              </div>

              <div className="mt-8 text-center">
                <LinkButton href="/deportes" variant="cyan" className="px-6 py-3">
                  Ver todo Deportes
                </LinkButton>
              </div>
            </div>
          </section>

          {renderMobileCardsRail(
            "Lifestyle — Cultura & Garaje",
            "bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]",
            [heroLifestyle, ...sideLifestyle],
            "/lifestyle",
            "Ver más Lifestyle",
            "cyan"
          )}

          <section className="hidden md:block py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="glow-cool font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  Lifestyle — Cultura & Garaje
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="grid gap-6">
                  {lifestyleDesktopColumns.left.map((item, index) =>
                    renderStackedFeatureCard(item, index === 0)
                  )}
                </div>

                <div className="grid gap-6">
                  {lifestyleDesktopColumns.right.map((item) =>
                    renderStackedFeatureCard(item)
                  )}
                </div>
              </div>

              <div className="mt-8 text-center">
                <LinkButton href="/lifestyle" variant="cyan" className="px-6 py-3">
                  Ver más Lifestyle
                </LinkButton>
              </div>
            </div>
          </section>

          <section className="py-8">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              {renderEditableAd("billboard")}
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 text-center sm:px-6 lg:px-8">
              <h2 className="glow-warm font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                {t("sections.community")}
              </h2>
              <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
                {t("community.text")}
              </p>

              <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70">
                <div className="relative h-56 w-full sm:h-64 md:h-80">
                  <Image
                    src="/images/comunidad.jpg"
                    alt="Comunidad MotorWelt"
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    style={{ objectFit: "cover" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                </div>
              </div>

              <div className="mt-6">
                <LinkButton href="/comunidad" variant="pink">
                  {t("community.cta")}
                </LinkButton>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center justify-between w-full">
                  <h3 className="font-semibold text-white/90">Partners & Patrocinios</h3>
                  <div className="mx-4 h-px flex-1 bg-mw-line/50" />
                </div>

                {editControlsVisible && (
                  <button
                    type="button"
                    onClick={() => partnerInputRef.current?.click()}
                    className="ml-4 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90 whitespace-nowrap"
                  >
                    Agregar partner
                  </button>
                )}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
                {homeSettings.partnerLogos.length > 0
                  ? homeSettings.partnerLogos.map((partner) => (
                      <div
                        key={partner.id}
                        className="relative flex h-20 items-center justify-center rounded-xl border border-mw-line/70 bg-mw-surface/60 text-xs text-gray-400 overflow-hidden"
                      >
                        {partner.href ? (
                          <a
                            href={partner.href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-full w-full items-center justify-center bg-black/20 p-2"
                          >
                            {partner.logoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={partner.logoUrl}
                                alt={partner.name}
                                className="h-full w-full object-contain object-center"
                              />
                            ) : (
                              <span className="px-3">{partner.name}</span>
                            )}
                          </a>
                        ) : partner.logoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className="h-full w-full object-contain object-center bg-black/20 p-2"
                          />
                        ) : (
                          <span className="px-3">{partner.name}</span>
                        )}

                        {editControlsVisible && (
                          <div className="absolute right-1 top-1 z-10 flex gap-1">
                            <button
                              type="button"
                              onClick={() => editPartnerLink(partner.id)}
                              className="rounded-full border border-white/20 bg-black/70 px-2 py-1 text-[9px] font-semibold text-white"
                            >
                              Link
                            </button>
                            <button
                              type="button"
                              onClick={() => removePartner(partner.id)}
                              className="rounded-full border border-red-400/50 bg-black/70 px-2 py-1 text-[9px] font-semibold text-red-200"
                            >
                              X
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  : [1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="flex h-20 items-center justify-center rounded-xl border border-mw-line/70 bg-mw-surface/60 text-xs text-gray-400"
                      >
                        LOGO #{i}
                      </div>
                    ))}
              </div>
            </div>
          </section>
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
              <p className="mt-2 text-sm">{t("footer.description")}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">{t("footer.links")}</h4>
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
              <h4 className="text-lg font-semibold text-white">{t("footer.socials")}</h4>
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
  const { serverSideTranslations } = await import(
    "next-i18next/serverSideTranslations"
  );

  const mixedQuery = `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == "noticias_autos" ||
        section == "noticias_motos" ||
        lower(category) == "autos" ||
        lower(category) == "motos" ||
        "autos" in categories[] ||
        "motos" in categories[]
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...8]{
      "id": _id,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "contentType": coalesce(contentType, "noticia"),
      "section": coalesce(
        section,
        select(
          lower(category) == "autos" => "noticias_autos",
          lower(category) == "motos" => "noticias_motos",
          "autos" in categories[] => "noticias_autos",
          "motos" in categories[] => "noticias_motos",
          ""
        )
      ),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt
    }
  `;

  const sportsQuery = `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      section == "deportes"
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...3]{
      "id": _id,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt
    }
  `;

  const lifestyleQuery = `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      section == "lifestyle"
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...5]{
      "id": _id,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt
    }
  `;

  const tuningQuery = `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == "tuning" ||
        lower(category) == "tuning" ||
        "tuning" in categories[] ||
        "builds" in categories[] ||
        "mods" in categories[]
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...5]{
      "id": _id,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt
    }
  `;

  const homeSettingsQuery = `
    *[_type == "homeSettings" && _id == "homeSettings_main"][0]{
      "heroImageUrl": coalesce(heroImageUrl, ""),
      "ads": {
        "leaderboard": {
          "enabled": coalesce(ads.leaderboard.enabled, true),
          "label": coalesce(ads.leaderboard.label, "Publicidad — Leaderboard (728×90 / 970×250)"),
          "imageUrl": coalesce(ads.leaderboard.imageUrl, ""),
          "href": coalesce(ads.leaderboard.href, "")
        },
        "mpu": {
          "enabled": coalesce(ads.mpu.enabled, true),
          "label": coalesce(ads.mpu.label, "Publicidad — MPU (300×250 / 300×600)"),
          "imageUrl": coalesce(ads.mpu.imageUrl, ""),
          "href": coalesce(ads.mpu.href, "")
        },
        "billboard": {
          "enabled": coalesce(ads.billboard.enabled, true),
          "label": coalesce(ads.billboard.label, "Publicidad — Billboard (970×250 / 970×90)"),
          "imageUrl": coalesce(ads.billboard.imageUrl, ""),
          "href": coalesce(ads.billboard.href, "")
        }
      },
      "partnerLogos": coalesce(partnerLogos[]{
        "id": coalesce(_key, name, "partner"),
        "name": coalesce(name, "Partner"),
        "logoUrl": coalesce(logoUrl, ""),
        "href": coalesce(href, "")
      }, [])
    }
  `;

  const [mixedRaw, sportsRaw, lifestyleRaw, tuningRaw, homeSettingsRaw] =
    await Promise.all([
      sanityReadClient.fetch(mixedQuery),
      sanityReadClient.fetch(sportsQuery),
      sanityReadClient.fetch(lifestyleQuery),
      sanityReadClient.fetch(tuningQuery),
      sanityReadClient.fetch(homeSettingsQuery),
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

  const routeForSection = (section: string) => {
    if (section === "noticias_motos") return "motos";
    return "autos";
  };

  const featuredMixed: HomeNewsItem[] = (mixedRaw ?? []).map((it: any) => {
    const section = String(it?.section || "");
    const slug = String(it?.slug || "");
    const route = routeForSection(section);

    return {
      id: String(it?.id || ""),
      title: String(it?.title || ""),
      excerpt: String(it?.excerpt || ""),
      img: String(it?.img || "/images/noticia-1.jpg"),
      href: `/noticias/${route}/${slug}`,
      sectionLabel: sectionLabel(section),
      typeLabel: String(it?.contentType || "noticia"),
      when: formatWhen(it?.publishedAt || it?._createdAt),
    };
  });

  const sportsItems: HomeNewsItem[] = (sportsRaw ?? []).map((it: any) => ({
    id: String(it?.id || ""),
    title: String(it?.title || ""),
    excerpt: String(it?.excerpt || ""),
    img: String(it?.img || "/images/noticia-1.jpg"),
    href: detailHref("deportes", it?.slug),
    sectionLabel: "Deportes",
    typeLabel: "noticia",
    when: formatWhen(it?.publishedAt || it?._createdAt),
  }));

  const lifestyleItems: HomeNewsItem[] = (lifestyleRaw ?? []).map((it: any) => ({
    id: String(it?.id || ""),
    title: String(it?.title || ""),
    excerpt: String(it?.excerpt || ""),
    img: String(it?.img || "/images/noticia-3.jpg"),
    href: detailHref("lifestyle", it?.slug),
    sectionLabel: "Lifestyle",
    typeLabel: "noticia",
    when: formatWhen(it?.publishedAt || it?._createdAt),
  }));

  const tuningItems: HomeNewsItem[] = (tuningRaw ?? []).map((it: any) => ({
    id: String(it?.id || ""),
    title: String(it?.title || ""),
    excerpt: String(it?.excerpt || ""),
    img: String(it?.img || "/images/noticia-2.jpg"),
    href: detailHref("tuning", it?.slug),
    sectionLabel: "Tuning",
    typeLabel: "noticia",
    when: formatWhen(it?.publishedAt || it?._createdAt),
  }));

  const initialHomeSettings: HomeSettings = {
    heroImageUrl:
      String(homeSettingsRaw?.heroImageUrl || "").trim() || DEFAULT_HOME_SETTINGS.heroImageUrl,
    ads: {
      leaderboard: {
        enabled: Boolean(homeSettingsRaw?.ads?.leaderboard?.enabled ?? true),
        label:
          String(homeSettingsRaw?.ads?.leaderboard?.label || "").trim() ||
          DEFAULT_HOME_SETTINGS.ads.leaderboard.label,
        imageUrl: String(homeSettingsRaw?.ads?.leaderboard?.imageUrl || "").trim(),
        href: String(homeSettingsRaw?.ads?.leaderboard?.href || "").trim(),
      },
      mpu: {
        enabled: Boolean(homeSettingsRaw?.ads?.mpu?.enabled ?? true),
        label:
          String(homeSettingsRaw?.ads?.mpu?.label || "").trim() ||
          DEFAULT_HOME_SETTINGS.ads.mpu.label,
        imageUrl: String(homeSettingsRaw?.ads?.mpu?.imageUrl || "").trim(),
        href: String(homeSettingsRaw?.ads?.mpu?.href || "").trim(),
      },
      billboard: {
        enabled: Boolean(homeSettingsRaw?.ads?.billboard?.enabled ?? true),
        label:
          String(homeSettingsRaw?.ads?.billboard?.label || "").trim() ||
          DEFAULT_HOME_SETTINGS.ads.billboard.label,
        imageUrl: String(homeSettingsRaw?.ads?.billboard?.imageUrl || "").trim(),
        href: String(homeSettingsRaw?.ads?.billboard?.href || "").trim(),
      },
    },
    partnerLogos: Array.isArray(homeSettingsRaw?.partnerLogos)
      ? homeSettingsRaw.partnerLogos.map((item: any, index: number) => ({
          id: String(item?.id || `partner-${index}`),
          name: String(item?.name || `Partner ${index + 1}`),
          logoUrl: String(item?.logoUrl || ""),
          href: String(item?.href || ""),
        }))
      : [],
  };

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
      year: new Date().getFullYear(),
      featuredMixed,
      sportsItems,
      lifestyleItems,
      tuningItems,
      initialHomeSettings,
    },
  };
}