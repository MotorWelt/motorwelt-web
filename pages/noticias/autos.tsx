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
      "text-gray-100 border border-white/15 bg-black/20 hover:bg-white/5 hover:border-white/25 focus-visible:ring-white/20",
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
      "text-gray-100 border border-white/15 bg-black/20 hover:bg-white/5 hover:border-white/25 focus-visible:ring-white/20",
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

/* ---------- Header ---------- */
const SiteHeader: React.FC<{ query: string; onQuery: (v: string) => void }> = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
                  className="inline-flex h-10 items-center leading-none text-white hover:text-white focus:outline-none"
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
  when: string;
  img: string;
  slug: string;
  publishedAt?: string | null;
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

function splitFive(items: NewsItem[]) {
  return {
    left: items.slice(0, 2),
    right: items.slice(2, 5),
  };
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
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/80 transition will-change-transform hover:-translate-y-[2px] hover:border-[#0CE0B2]/45">
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
          <span className="absolute left-3 top-3 rounded-full border border-white/20 bg-black/55 px-2 py-0.5 text-xs text-white/90 backdrop-blur">
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

        <div className="mt-auto pt-4">
          <Link href={item.slug} className="inline-flex">
            <Button
              variant={compact ? "link" : "pink"}
              className={
                compact
                  ? "text-sm"
                  : "rounded-xl h-10 px-4 py-0 text-sm leading-none"
              }
            >
              {compact ? "Leer más" : "Leer completa →"}
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

function ExploreCard({ item }: { item: ExploreItem }) {
  const meta = sectionMeta(item.section);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/80 transition hover:-translate-y-[2px] hover:border-white/20">
      <Link href={item.href} className="block">
        <div className="relative h-52">
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes="(max-width: 1280px) 50vw, 25vw"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
          <div
            className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${meta.glow} opacity-80`}
          />
          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white/90 backdrop-blur">
            <span className={`h-2 w-2 rounded-full ${meta.accentDot}`} />
            {item.sectionLabel}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="text-xs text-gray-300">{item.when}</div>
        <h3 className="mt-1 line-clamp-2 text-lg font-semibold leading-tight text-white">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-gray-300">{item.excerpt}</p>

        <div className="mt-auto pt-4">
          <Link href={item.href} className="inline-flex">
            <Button variant="link">Explorar sección</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function NoticiasAutos({
  items = [],
  exploreItems = [],
}: {
  items?: NewsItem[];
  exploreItems?: ExploreItem[];
}) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [canEditPage, setCanEditPage] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [pageSettings, setPageSettings] = useState<AutosPageSettings>(
    DEFAULT_AUTOS_PAGE_SETTINGS
  );
  const [pageError, setPageError] = useState<string | null>(null);

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);

  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);
  const safeExploreItems = useMemo(
    () => (Array.isArray(exploreItems) ? exploreItems : []),
    [exploreItems]
  );

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
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(AUTOS_PAGE_SETTINGS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setPageSettings({
        heroImageUrl: String(parsed?.heroImageUrl || ""),
        ads: {
          leaderboard: {
            ...DEFAULT_AUTOS_PAGE_SETTINGS.ads.leaderboard,
            ...(parsed?.ads?.leaderboard || {}),
          },
          billboard: {
            ...DEFAULT_AUTOS_PAGE_SETTINGS.ads.billboard,
            ...(parsed?.ads?.billboard || {}),
          },
        },
      });
    } catch {
      // ignore
    }
  }, []);

  function persistPageSettings(next: AutosPageSettings) {
    setPageSettings(next);
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTOS_PAGE_SETTINGS_KEY, JSON.stringify(next));
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
      persistPageSettings(next);
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
      persistPageSettings(next);
    } catch (err: any) {
      setPageError(err?.message || "No se pudo subir el anuncio.");
    }
  }

  function toggleAd(kind: EditableAdKind) {
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
    persistPageSettings(next);
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
    persistPageSettings(next);
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
    persistPageSettings(next);
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
      relative w-full mx-auto overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70
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

  const editControlsVisible = canEditPage && !spectatorMode;
  const displayItems = filtered.length > 0 ? filtered : safeItems;
  const latestFive = displayItems.slice(0, 5);
  const latestColumns = splitFive(latestFive);
  const moreNews = displayItems.slice(5, 17);
  const heroImageSrc =
    pageSettings.heroImageUrl ||
    displayItems[0]?.img ||
    "/images/noticia-2.jpg";

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
          <div className="pointer-events-none absolute -left-20 top-20 h-80 w-80 rounded-full bg-[#0CE0B2]/10 blur-3xl" />
          <div className="pointer-events-none absolute right-[-6rem] top-[20%] h-96 w-96 rounded-full bg-[#FF7A1A]/10 blur-3xl" />
        </div>

        {canEditPage && (
          <div className="fixed bottom-4 left-4 z-[80] rounded-2xl border border-[#0CE0B2]/40 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2] animate-pulse" />
              <span>{spectatorMode ? "Vista espectador" : "Modo edición home"}</span>
            </div>
            {pageError && <div className="mt-1 text-red-300">{pageError}</div>}
            <button
              type="button"
              onClick={toggleSpectatorMode}
              className="mt-2 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
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
          <div className="relative z-20 mx-auto mt-4 w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {pageError}
            </div>
          </div>
        )}

        <section className="py-4 sm:py-6 relative z-10">
          <div className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
            {renderEditableAd("leaderboard")}
          </div>
        </section>

        <main className="relative z-10 pb-16 mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
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
              <section className="md:hidden pt-10">
                <SectionHeading
                  title={`Últimas publicaciones (${filtered.length})`}
                  subtle="La conversación más reciente del universo automotriz."
                  glow="cool"
                  align="left"
                />
                <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                  <div className="flex gap-4 snap-x snap-mandatory">
                    {latestFive.map((item) => (
                      <div
                        key={item.id}
                        className="w-[86%] min-w-[86%] shrink-0 snap-start"
                      >
                        <NewsCard item={item} imageHeight="h-56" />
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section
                className="hidden md:block pt-12"
                aria-labelledby="feed-title"
              >
                <SectionHeading
                  title={`Últimas publicaciones (${filtered.length})`}
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
                  <section className="md:hidden pt-14">
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
                            className="w-[86%] min-w-[86%] shrink-0 snap-start"
                          >
                            <NewsCard item={item} imageHeight="h-56" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>

                  <section
                    className="hidden md:block pt-14"
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

          <section className="py-12">{renderEditableAd("billboard")}</section>

          {safeExploreItems.length > 0 && (
            <section className="pb-4">
              <SectionHeading
                title="Explorar más de MotorWelt"
                subtle="Sigue navegando por otras secciones con una selección rápida del resto del universo editorial."
                glow="warm"
                align="left"
              />

              <div className="md:hidden -mx-4 overflow-x-auto px-4 pb-2 no-scrollbar">
                <div className="flex gap-4 snap-x snap-mandatory">
                  {safeExploreItems.map((item) => (
                    <div
                      key={item.id}
                      className="w-[86%] min-w-[86%] shrink-0 snap-start"
                    >
                      <ExploreCard item={item} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:grid gap-6 grid-cols-2 xl:grid-cols-4 items-stretch">
                {safeExploreItems.map((item) => (
                  <ExploreCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </main>

        <footer className="relative z-10 mt-12 border-t border-mw-line/70 bg-mw-surface/70 py-10 text-gray-300 backdrop-blur-md">
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
              rgba(0, 0, 0, 0.12) 0%,
              transparent 60%
            ),
            radial-gradient(
              120% 80% at 80% 90%,
              rgba(0, 0, 0, 0.16) 0%,
              transparent 60%
            ),
            linear-gradient(
              180deg,
              rgba(4, 18, 16, 0.88),
              rgba(4, 18, 16, 0.92)
            );
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
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "tag": coalesce(contentType, "noticia"),
      "tags": coalesce(tags, []),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "publishedAt": publishedAt,
      "_createdAt": _createdAt
    }
  `;

  const exploreQuery = /* groq */ `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section in ["noticias_motos", "deportes", "lifestyle", "tuning"] ||
        lower(category) in ["motos", "deportes", "lifestyle", "tuning"] ||
        "motos" in categories[] ||
        "deportes" in categories[] ||
        "lifestyle" in categories[] ||
        "tuning" in categories[]
      )
    ]
    | order(coalesce(publishedAt, _createdAt) desc){
      "id": _id,
      "title": coalesce(title, ""),
      "excerpt": coalesce(excerpt, subtitle, seoDescription, ""),
      "img": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "slug": slug.current,
      "section": coalesce(
        section,
        select(
          lower(category) == "motos" => "noticias_motos",
          lower(category) == "deportes" => "deportes",
          lower(category) == "lifestyle" => "lifestyle",
          lower(category) == "tuning" => "tuning",
          "motos" in categories[] => "noticias_motos",
          "deportes" in categories[] => "deportes",
          "lifestyle" in categories[] => "lifestyle",
          "tuning" in categories[] => "tuning",
          ""
        )
      ),
      "publishedAt": publishedAt,
      "_createdAt": _createdAt
    }
  `;

  const [raw, exploreRaw] = await Promise.all([
    sanityReadClient.fetch(autosQuery),
    sanityReadClient.fetch(exploreQuery),
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

  const items: NewsItem[] = (raw ?? []).map((it: any) => {
    const d = it?.publishedAt
      ? new Date(it.publishedAt)
      : it?._createdAt
      ? new Date(it._createdAt)
      : null;

    const when = d
      ? new Intl.DateTimeFormat("es-MX", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        }).format(d)
      : "";

    return {
      id: it?.id || "",
      title: it?.title || "",
      excerpt: it?.excerpt || "",
      tag: it?.tag || "noticia",
      tags: Array.isArray(it?.tags) ? it.tags : [],
      when,
      img: it?.img || "/images/noticia-2.jpg",
      slug: `/noticias/autos/${it?.slug || ""}`,
      publishedAt: it?.publishedAt || null,
    };
  });

  const orderedSections = [
    "tuning",
    "noticias_motos",
    "deportes",
    "lifestyle",
  ] as const;

  const firstBySection = new Map<string, any>();
  for (const item of exploreRaw ?? []) {
    const section = String(item?.section || "");
    if (!section || firstBySection.has(section)) continue;
    firstBySection.set(section, item);
  }

  const exploreItems: ExploreItem[] = orderedSections
    .map((section) => {
      const item = firstBySection.get(section);
      if (!item) return null;
      const meta = sectionMeta(section);
      return {
        id: String(item?.id || section),
        title: String(item?.title || meta.label),
        excerpt: String(item?.excerpt || ""),
        img: String(item?.img || "/images/noticia-1.jpg"),
        when: formatWhen(item?.publishedAt || item?._createdAt),
        section,
        sectionLabel: meta.label,
        href: meta.href,
      };
    })
    .filter(Boolean) as ExploreItem[];

  return {
    props: {
      items,
      exploreItems,
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig
      )),
    },
  };
}