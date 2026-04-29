import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Seo from "../components/Seo";
import Image from "next/image";
import ProfileButton from "../components/ProfileButton";

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
  _isLinkElement = false,
) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition will-change-transform focus:outline-none";

  const styles: Record<ButtonVariant, string> = {
    cyan: "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus:ring-2 focus:ring-[#0CE0B2]/40",
    pink: "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus:ring-2 focus:ring-[#FF7A1A]/40",
    link: "p-0 text-[#43A1AD] hover:opacity-80 underline underline-offset-4 focus:ring-0 rounded-none shadow-none border-0",
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
    className={`flex h-full flex-col rounded-2xl border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md transition hover:border-[#0CE0B2]/50 ${className}`}
  >
    {children}
  </div>
);

const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <div className={`flex flex-1 flex-col p-5 ${className}`}>{children}</div>
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
  authorName: string;
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
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)"),
  );
  return match ? decodeURIComponent(match[2]) : "";
}

function detailHref(
  section: "tuning" | "deportes" | "lifestyle",
  slug?: string | null,
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

function getCardExcerpt(item: HomeNewsItem) {
  const value = String(item.excerpt || "").trim();
  return value || "Bajada pendiente por agregar desde el editor.";
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
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [canEditHome, setCanEditHome] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [homeSettings, setHomeSettings] = useState<HomeSettings>(
    initialHomeSettings ?? DEFAULT_HOME_SETTINGS,
  );
  const [savingHome, setSavingHome] = useState(false);
  const [homeError, setHomeError] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const mpuInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);
  const partnerInputRef = useRef<HTMLInputElement | null>(null);

  const mixedItems = featuredMixed.slice(0, 6);
  const heroMixed = mixedItems[0] ?? null;
  const sidebarMixed = mixedItems.slice(1, 6);

  const safeSports = sportsItems.slice(0, 3);

  const lifestyleDesktopItems = lifestyleItems.slice(0, 5);
  const tuningDesktopItems = tuningItems.slice(0, 5);

  const tuningDesktopColumns = splitFiveItemLayout(tuningDesktopItems);
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
    [],
  );

  useEffect(() => {
    document.body.style.overflow = mobileOpen || contactOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, contactOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setContactOpen(false);
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
    ],
    [],
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
      await persistHomeSettings({
        ...homeSettings,
        heroImageUrl: uploaded.url,
      });
    } catch (err: any) {
      setHomeError(err?.message || "No se pudo subir la portada.");
    }
  }

  async function handleAdImagePick(kind: AdKind, files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadImageToSanity(file);
      await persistHomeSettings({
        ...homeSettings,
        ads: {
          ...homeSettings.ads,
          [kind]: {
            ...homeSettings.ads[kind],
            imageUrl: uploaded.url,
          },
        },
      });
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
          ? window.prompt("Nombre del partner:", "Nuevo partner") ||
            "Nuevo partner"
          : "Nuevo partner";

      const href =
        typeof window !== "undefined"
          ? window.prompt("Link del partner (opcional):", "") || ""
          : "";

      await persistHomeSettings({
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
      });
    } catch (err: any) {
      setHomeError(err?.message || "No se pudo agregar el partner.");
    }
  }

  async function toggleAd(kind: AdKind) {
    await persistHomeSettings({
      ...homeSettings,
      ads: {
        ...homeSettings.ads,
        [kind]: {
          ...homeSettings.ads[kind],
          enabled: !homeSettings.ads[kind].enabled,
        },
      },
    });
  }

  async function editAdLink(kind: AdKind) {
    if (typeof window === "undefined") return;
    const current = homeSettings.ads[kind].href || "";
    const href = window.prompt("Pega el link del anuncio:", current);
    if (href === null) return;

    await persistHomeSettings({
      ...homeSettings,
      ads: {
        ...homeSettings.ads,
        [kind]: {
          ...homeSettings.ads[kind],
          href: href.trim(),
        },
      },
    });
  }

  async function clearAdImage(kind: AdKind) {
    await persistHomeSettings({
      ...homeSettings,
      ads: {
        ...homeSettings.ads,
        [kind]: {
          ...homeSettings.ads[kind],
          imageUrl: "",
        },
      },
    });
  }

  async function editPartnerLink(id: string) {
    if (typeof window === "undefined") return;
    const item = homeSettings.partnerLogos.find((p) => p.id === id);
    if (!item) return;

    const href = window.prompt("Pega el link del partner:", item.href || "");
    if (href === null) return;

    await persistHomeSettings({
      ...homeSettings,
      partnerLogos: homeSettings.partnerLogos.map((p) =>
        p.id === id ? { ...p, href: href.trim() } : p,
      ),
    });
  }

  async function removePartner(id: string) {
    await persistHomeSettings({
      ...homeSettings,
      partnerLogos: homeSettings.partnerLogos.filter((p) => p.id !== id),
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

  function renderMobileCardsRail(
    title: string,
    barClass: string,
    items: HomeNewsItem[],
    ctaHref: string,
    ctaLabel: string,
    ctaVariant: ButtonVariant = "cyan",
  ) {
    if (!items || items.length === 0) return null;

    return (
      <section className="py-10 sm:py-12 md:hidden">
        <div className="mx-auto w-full max-w-[1440px] px-4 xl:px-10 2xl:max-w-[1560px]">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold tracking-wide text-white">
              {title}
            </h2>
            <div className={`mt-2 h-1 w-24 rounded-full ${barClass}`} />
          </div>

          <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
            <div className="flex snap-x snap-mandatory gap-4">
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

                      <p className="mt-3 line-clamp-3 text-base leading-relaxed text-gray-300">
                        {getCardExcerpt(item)}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        {item.authorName ? (
                          <span>Por {item.authorName}</span>
                        ) : null}
                        {item.authorName && item.when ? (
                          <span className="text-gray-600">•</span>
                        ) : null}
                        {item.when ? <span>{item.when}</span> : null}
                      </div>

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
      <section className="relative z-20 -mt-10 pb-4 sm:-mt-12 sm:pb-6 lg:-mt-14">
        <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
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

              <div className="hidden items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-gray-500 md:flex">
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
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${item.accentDot}`}
                      />
                      <span className="text-[10px] uppercase tracking-[0.22em] text-gray-500 transition group-hover:text-gray-300">
                        Go
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white">
                      {item.title}
                    </h3>
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
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${item.accentDot}`}
                        />
                        <span className="text-[10px] uppercase tracking-[0.22em] text-gray-500">
                          Go
                        </span>
                      </div>

                      <h3 className="text-lg font-semibold text-white">
                        {item.title}
                      </h3>
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
          <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-400">
            <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
            {item.sectionLabel} · {item.typeLabel}
          </div>
          <h3 className="mt-1 text-lg font-semibold text-white">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-300">
            {getCardExcerpt(item)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
            {item.authorName ? <span>Por {item.authorName}</span> : null}
            {item.authorName && item.when ? (
              <span className="text-gray-600">•</span>
            ) : null}
            {item.when ? <span>{item.when}</span> : null}
          </div>
          <div className="mt-4 mt-auto">
            <Link href={item.href}>
              <span className={getButtonClasses("link")}>Leer más</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderEmptySectionNotice(title: string, message: string) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-mw-surface/35 p-8 text-center backdrop-blur-md">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-gray-400">
          <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
          Próximamente
        </div>
        <h3 className="mt-4 text-xl font-semibold text-white">{title}</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
          {message}
        </p>
      </div>
    );
  }

  return (
    <>
      <Seo
        title="MotorWelt — Noticias, cultura y comunidad automotriz"
        description="Autos, motos, tuning, motorsport y lifestyle en un solo lugar."
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
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#0CE0B2]" />
              <span>
                {spectatorMode ? "Vista espectador" : "Modo edición home"}
              </span>
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

            <div className="hidden items-center justify-end md:flex">
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
                  className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  Comunidad
                </Link>
              </nav>
            </aside>
          </div>
        )}

        {contactOpen && (
          <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
            <button
              type="button"
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setContactOpen(false)}
              aria-label="Cerrar contacto"
            />

            <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-[28px] border border-white/10 bg-[#041210]/95 shadow-[0_24px_120px_rgba(0,0,0,.55)]">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                    MotorWelt
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-white">
                    Contacto
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-300">
                    Déjanos tus datos y el asunto. El mensaje llegará directo al
                    correo de MotorWelt.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setContactOpen(false)}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white hover:bg-white/10"
                  aria-label="Cerrar contacto"
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

              <form
                action="/api/contact"
                method="POST"
                className="space-y-4 p-5 sm:p-6"
              >
                <input type="hidden" name="to" value="gabriel@motorwelt.mx" />

                <input
                  name="name"
                  required
                  placeholder="Nombre"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#0CE0B2]/50"
                />

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Correo"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#0CE0B2]/50"
                />

                <input
                  name="subject"
                  required
                  placeholder="Asunto"
                  className="w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-gray-500 focus:border-[#0CE0B2]/50"
                />

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-2xl border-2 border-[#0CE0B2] px-5 py-3 text-sm font-semibold text-white shadow-[0_0_18px_rgba(12,224,178,.28)] transition hover:bg-white/5"
                >
                  Enviar
                </button>
              </form>
            </div>
          </div>
        )}

        <main aria-hidden={mobileOpen || contactOpen} className="relative z-10">
          <section className="relative isolate overflow-hidden">
            <div className="relative flex min-h-[76svh] flex-col justify-end overflow-hidden sm:min-h-[82svh] lg:min-h-[90vh]">
              <img
                src={
                  homeSettings?.heroImageUrl ||
                  DEFAULT_HOME_SETTINGS.heroImageUrl
                }
                alt="Hero MotorWelt"
                className="absolute inset-0 h-full w-full object-cover"
                style={{
                  filter: "brightness(.34) saturate(1.12) contrast(1.06)",
                }}
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(12,224,178,.14),transparent_28%),radial-gradient(circle_at_86%_18%,rgba(255,122,26,.16),transparent_30%),linear-gradient(180deg,rgba(0,0,0,.22)_0%,rgba(0,0,0,.38)_24%,rgba(0,0,0,.64)_58%,rgba(2,10,10,.9)_100%)]" />
              <div className="absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-black/78 via-black/46 to-transparent lg:block" />
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#041210] via-[#041210]/72 to-transparent" />

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
                <div className="mx-auto flex w-full max-w-[1440px] justify-center xl:px-10 2xl:max-w-[1560px]">
                  <div className="w-full max-w-5xl text-center">
                    <div className="flex justify-center">
                      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-gray-200 backdrop-blur md:text-[11px]">
                        <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                        MotorWelt
                      </div>
                    </div>

                    <h1 className="mx-auto mt-5 max-w-[980px] font-display text-[2.75rem] font-black leading-[0.9] tracking-[-0.05em] text-white sm:text-[4rem] md:text-[4.85rem] lg:text-[5.45rem] xl:text-[5.85rem]">
                      <span className="glow-cool block">MotorWelt</span>
                      <span className="block text-white/95">
                        Noticias, cultura y
                      </span>
                      <span className="block text-white/95">
                        comunidad automotriz
                      </span>
                    </h1>

                    <p className="mx-auto mt-6 max-w-[760px] text-base leading-relaxed text-gray-200 sm:text-lg md:text-[1.08rem]">
                      Autos, motos, tuning, motorsport y lifestyle en un solo
                      lugar.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {renderHeroSectionsRail()}

          <section className="py-4 sm:py-6">
            <div className="mx-auto w-full max-w-[1440px] px-2 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              {renderEditableAd("leaderboard")}
            </div>
          </section>

          {tuningDesktopItems.length > 0 &&
            renderMobileCardsRail(
              "Tuning",
              "bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]",
              tuningDesktopItems,
              "/tuning",
              "Ver más Tuning",
              "pink",
            )}

          {tuningDesktopItems.length > 0 && (
            <section className="hidden py-10 sm:py-12 md:block">
              <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
                <div className="mb-8">
                  <h2 className="glow-warm font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                    Tuning
                  </h2>
                  <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]" />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-6">
                    {tuningDesktopColumns.left.map((item, index) =>
                      renderStackedFeatureCard(item, index === 0),
                    )}
                  </div>
                  <div className="grid gap-6">
                    {tuningDesktopColumns.right.map((item) =>
                      renderStackedFeatureCard(item),
                    )}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <LinkButton
                    href="/tuning"
                    variant="pink"
                    className="px-6 py-3"
                  >
                    Ver más Tuning
                  </LinkButton>
                </div>
              </div>
            </section>
          )}

          {mixedItems.length > 0 &&
            renderMobileCardsRail(
              "Autos & Motos",
              "bg-gradient-to-r from-[#0CE0B2] via-[#E2A24C] to-[#FF7A1A]",
              mixedItems,
              "/noticias/autos",
              "Ver más de Autos",
              "cyan",
            )}

          {heroMixed && (
            <section className="hidden py-12 sm:py-16 md:block">
              <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                    Autos & Motos
                  </h2>
                  <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#0CE0B2] via-[#E2A24C] to-[#FF7A1A] sm:w-28" />
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                  <Card className="overflow-hidden hover:shadow-[0_0_26px_rgba(12,224,178,.2)]">
                    <div className="relative h-[210px] w-full sm:h-[260px] md:h-[305px]">
                      <Image
                        src={heroMixed.img}
                        alt={heroMixed.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 58vw"
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
                        {getCardExcerpt(heroMixed)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        {heroMixed.authorName ? (
                          <span>Por {heroMixed.authorName}</span>
                        ) : null}
                        {heroMixed.authorName && heroMixed.when ? (
                          <span className="text-gray-600">•</span>
                        ) : null}
                        {heroMixed.when ? <span>{heroMixed.when}</span> : null}
                      </div>
                      <div className="mt-4 mt-auto">
                        <Link href={heroMixed.href}>
                          <span className={getButtonClasses("link")}>
                            Leer la nota
                          </span>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>

                  <aside className="lg:sticky lg:top-24">
                    <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
                      <div className="border-b border-mw-line/60 p-4">
                        <h4 className="font-semibold text-white">
                          Más para leer
                        </h4>
                      </div>
                      <ul className="divide-y divide-mw-line/60">
                        {sidebarMixed.map((item) => (
                          <li
                            key={item.id}
                            className="p-4 transition hover:bg-white/5"
                          >
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
          )}

          <section className="py-10 sm:py-12 md:hidden">
            <div className="mx-auto w-full max-w-[1440px] px-4 xl:px-10 2xl:max-w-[1560px]">
              <div className="mb-8">
                <h2 className="font-display text-2xl font-bold tracking-wide text-white">
                  Deportes
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
              </div>

              <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                <div className="flex snap-x snap-mandatory gap-4">
                  {safeSports.length > 0 ? (
                    safeSports.map((item) => (
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

                            <p className="mt-3 line-clamp-3 text-base leading-relaxed text-gray-300">
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
                    ))
                  ) : (
                    <div className="w-full rounded-2xl border border-dashed border-white/10 bg-mw-surface/35 p-6 text-center text-sm text-gray-300">
                      Todavía no hay notas publicadas en Deportes, pero esta
                      sección ya está lista para arrancar.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <LinkButton href="/deportes" variant="cyan" className="w-full">
                  Ver todo Deportes
                </LinkButton>
              </div>
            </div>
          </section>

          <section className="hidden py-10 sm:py-12 md:block">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <div className="mb-8">
                <h2 className="glow-warm font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  Deportes
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
              </div>

              {safeSports.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
                          sizes="(max-width: 1024px) 100vw, 33vw"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      </div>
                      <CardContent className="p-5">
                        <div className="mb-2 inline-flex items-center gap-2 text-[11px] uppercase tracking-wide text-gray-400">
                          <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                          {item.sectionLabel} · {item.typeLabel}
                        </div>
                        <h3 className="mt-1 text-lg font-semibold text-white">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-3 text-sm text-gray-300">
                          {item.excerpt}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                          {item.authorName ? (
                            <span>Por {item.authorName}</span>
                          ) : null}
                          {item.authorName && item.when ? (
                            <span className="text-gray-600">•</span>
                          ) : null}
                          {item.when ? <span>{item.when}</span> : null}
                        </div>
                        <Link href={item.href} className="mt-auto inline-block">
                          <span className={getButtonClasses("link", "mt-3")}>
                            Leer más
                          </span>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                renderEmptySectionNotice(
                  "Deportes listo para arrancar",
                  "Todavía no hay notas publicadas en Deportes, pero la sección ya está preparada para recibir coberturas, motorsport y adrenalina en cuanto empieces a publicar.",
                )
              )}

              <div className="mt-8 text-center">
                <LinkButton
                  href="/deportes"
                  variant="cyan"
                  className="px-6 py-3"
                >
                  Ver todo Deportes
                </LinkButton>
              </div>
            </div>
          </section>

          {lifestyleDesktopItems.length > 0 ? (
            renderMobileCardsRail(
              "Lifestyle",
              "bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]",
              lifestyleDesktopItems,
              "/lifestyle",
              "Ver más Lifestyle",
              "cyan",
            )
          ) : (
            <section className="py-10 sm:py-12 md:hidden">
              <div className="mx-auto w-full max-w-[1440px] px-4 xl:px-10 2xl:max-w-[1560px]">
                <div className="mb-8">
                  <h2 className="font-display text-2xl font-bold tracking-wide text-white">
                    Lifestyle
                  </h2>
                  <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]" />
                </div>
                {renderEmptySectionNotice(
                  "Lifestyle en preparación",
                  "Todavía no hay notas publicadas en Lifestyle, pero la sección ya está lista para recibir historias de diseño, estilo y cultura visual en los próximos días.",
                )}
              </div>
            </section>
          )}

          <section className="hidden py-10 sm:py-12 md:block">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <div className="mb-8">
                <h2 className="glow-cool font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  Lifestyle
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]" />
              </div>

              {lifestyleDesktopItems.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="grid gap-6">
                    {lifestyleDesktopColumns.left.map((item, index) =>
                      renderStackedFeatureCard(item, index === 0),
                    )}
                  </div>
                  <div className="grid gap-6">
                    {lifestyleDesktopColumns.right.map((item) =>
                      renderStackedFeatureCard(item),
                    )}
                  </div>
                </div>
              ) : (
                renderEmptySectionNotice(
                  "Lifestyle en preparación",
                  "Todavía no hay notas publicadas en Lifestyle, pero la sección ya está lista para recibir historias de diseño, estilo y cultura visual en los próximos días.",
                )
              )}

              <div className="mt-8 text-center">
                <LinkButton
                  href="/lifestyle"
                  variant="cyan"
                  className="px-6 py-3"
                >
                  Ver más Lifestyle
                </LinkButton>
              </div>
            </div>
          </section>

          <section className="py-8">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              {renderEditableAd("billboard")}
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <div className="mb-8 text-center">
                <h2 className="glow-warm font-display text-2xl font-bold tracking-wide text-white sm:text-3xl">
                  Comunidad
                </h2>
                <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
              </div>

              {renderEmptySectionNotice(
                "Próximas publicaciones",
                "Muy pronto aparecerán aquí historias, eventos, meets y contenido de la comunidad MotorWelt. La sección ya está lista para arrancar en cuanto empecemos a publicar.",
              )}

              <div className="mt-8 text-center">
                <LinkButton href="/comunidad" variant="pink">
                  Entrar a Comunidad
                </LinkButton>
              </div>
            </div>
          </section>

          <section className="py-10 sm:py-12">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex w-full items-center justify-between">
                  <h3 className="font-semibold text-white/90">
                    Partners & Patrocinios
                  </h3>
                  <div className="mx-4 h-px flex-1 bg-mw-line/50" />
                </div>

                {editControlsVisible && (
                  <button
                    type="button"
                    onClick={() => partnerInputRef.current?.click()}
                    className="ml-4 whitespace-nowrap rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
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
                        className="relative flex h-20 items-center justify-center overflow-hidden rounded-xl border border-mw-line/70 bg-mw-surface/60 text-xs text-gray-400"
                      >
                        {partner.href ? (
                          <a
                            href={partner.href}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-full w-full items-center justify-center bg-black/20 p-2"
                          >
                            {partner.logoUrl ? (
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
                          <img
                            src={partner.logoUrl}
                            alt={partner.name}
                            className="h-full w-full bg-black/20 object-contain object-center p-2"
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
                  : null}
              </div>
            </div>
          </section>
        </main>

        <footer
          aria-hidden={mobileOpen || contactOpen}
          className="relative z-10 mt-12 border-t border-mw-line/70 bg-mw-surface/70 py-10 text-gray-300 backdrop-blur-md"
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
                La plataforma donde vive la cultura automotriz.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Contacto</h4>
              <p className="mt-2 text-sm leading-relaxed text-gray-300">
                ¿Quieres colaborar, pautar o proponer una historia? Escríbenos
                directo desde aquí.
              </p>
              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl border border-[#0CE0B2]/50 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5 sm:w-auto"
              >
                Abrir formulario
              </button>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Enlaces</h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li>
                  <Link href="/about" className="hover:text-white">
                    Nosotros
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

              <h4 className="mt-6 text-lg font-semibold text-white">Redes</h4>
              <div className="mt-2 flex flex-wrap gap-4">
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
            rgba(163, 255, 18, 0.9),
            transparent
          );
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

export async function getServerSideProps(_ctx: { locale?: string }) {
  const { sanityReadClient } = await import("../lib/sanityClient");

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
"excerpt": coalesce(subtitle, excerpt, seoDescription, ""),
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
      "_createdAt": _createdAt,
      "authorName": coalesce(authorName, author->name, "")
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
"excerpt": coalesce(subtitle, excerpt, seoDescription, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt,
      "authorName": coalesce(authorName, author->name, "")
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
"excerpt": coalesce(subtitle, excerpt, seoDescription, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt,
      "authorName": coalesce(authorName, author->name, "")
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
      "excerpt": coalesce(subtitle, excerpt, seoDescription, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt,
      "authorName": coalesce(authorName, author->name, "")
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
      authorName: String(it?.authorName || "MotorWelt"),
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
    authorName: String(it?.authorName || "MotorWelt"),
  }));

  const lifestyleItems: HomeNewsItem[] = (lifestyleRaw ?? []).map(
    (it: any) => ({
      id: String(it?.id || ""),
      title: String(it?.title || ""),
      excerpt: String(it?.excerpt || ""),
      img: String(it?.img || "/images/noticia-3.jpg"),
      href: detailHref("lifestyle", it?.slug),
      sectionLabel: "Lifestyle",
      typeLabel: "noticia",
      when: formatWhen(it?.publishedAt || it?._createdAt),
      authorName: String(it?.authorName || "MotorWelt"),
    }),
  );

  const tuningItems: HomeNewsItem[] = (tuningRaw ?? []).map((it: any) => ({
    id: String(it?.id || ""),
    title: String(it?.title || ""),
    excerpt: String(it?.excerpt || ""),
    img: String(it?.img || "/images/noticia-2.jpg"),
    href: detailHref("tuning", it?.slug),
    sectionLabel: "Tuning",
    typeLabel: "noticia",
    when: formatWhen(it?.publishedAt || it?._createdAt),
    authorName: String(it?.authorName || "MotorWelt"),
  }));

  const initialHomeSettings: HomeSettings = {
    heroImageUrl:
      String(homeSettingsRaw?.heroImageUrl || "").trim() ||
      DEFAULT_HOME_SETTINGS.heroImageUrl,
    ads: {
      leaderboard: {
        enabled: Boolean(homeSettingsRaw?.ads?.leaderboard?.enabled ?? true),
        label:
          String(homeSettingsRaw?.ads?.leaderboard?.label || "").trim() ||
          DEFAULT_HOME_SETTINGS.ads.leaderboard.label,
        imageUrl: String(
          homeSettingsRaw?.ads?.leaderboard?.imageUrl || "",
        ).trim(),
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
        imageUrl: String(
          homeSettingsRaw?.ads?.billboard?.imageUrl || "",
        ).trim(),
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
      year: new Date().getFullYear(),
      featuredMixed,
      sportsItems,
      lifestyleItems,
      tuningItems,
      initialHomeSettings,
    },
  };
}
