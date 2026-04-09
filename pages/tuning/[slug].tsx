// pages/tuning/[slug].tsx
import React, { useEffect, useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const nextI18NextConfig = require("../../next-i18next.config.js");

type ButtonVariant = "cyan" | "pink" | "ghost" | "link";

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
    ghost:
      "text-gray-100 border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/30",
    link:
      "p-0 text-[#43A1AD] hover:opacity-80 underline underline-offset-4 focus:ring-0 rounded-none",
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

type TuningArticle = {
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

type BodyBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "h4"; text: string }
  | { type: "h5"; text: string }
  | { type: "quote"; text: string }
  | { type: "image"; url: string; alt: string }
  | { type: "video"; url: string };

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

function getInstagramEmbedUrl(url: string) {
  const clean = normalizeUrl(url);
  if (!clean) return "";
  try {
    const u = new URL(clean);
    if (!u.hostname.includes("instagram.com")) return "";
    const path = u.pathname.replace(/\/+$/, "");
    if (path.includes("/reel/") || path.includes("/p/")) {
      return `${u.origin}${path}/embed`;
    }
  } catch {}
  return "";
}

function getTikTokEmbedUrl(url: string) {
  const clean = normalizeUrl(url);
  if (!clean) return "";
  try {
    const u = new URL(clean);
    if (!u.hostname.includes("tiktok.com")) return "";
    return clean;
  } catch {}
  return "";
}

function detectPlatform(url: string): "youtube" | "instagram" | "tiktok" | "unknown" {
  const clean = normalizeUrl(url);
  if (!clean) return "unknown";
  const lower = clean.toLowerCase();
  if (lower.includes("youtube.com") || lower.includes("youtu.be")) return "youtube";
  if (lower.includes("instagram.com")) return "instagram";
  if (lower.includes("tiktok.com")) return "tiktok";
  return "unknown";
}

function getEmbedUrl(url: string) {
  const platform = detectPlatform(url);
  if (platform === "youtube") return getYoutubeEmbedUrl(url);
  if (platform === "instagram") return getInstagramEmbedUrl(url);
  if (platform === "tiktok") return getTikTokEmbedUrl(url);
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

function AdBanner({
  label,
  title,
  href = "/contact",
}: {
  label: string;
  title: string;
  href?: string;
}) {
  return (
    <Link href={href} className="block">
      <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,122,26,.14),rgba(12,224,178,.12),rgba(7,20,18,.95))] p-5 shadow-[0_0_40px_rgba(255,122,26,.06)] transition hover:border-white/20">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#FF7A1A]">
              {label}
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{title}</h3>
            <p className="mt-2 max-w-2xl text-sm text-gray-300">
              Espacio publicitario MotorWelt listo para marcas, lanzamientos,
              productos, accesorios y experiencias.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white">
              Ver opciones
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function InlineEmbed({
  url,
  title,
  vertical = false,
}: {
  url: string;
  title?: string;
  vertical?: boolean;
}) {
  const embedUrl = getEmbedUrl(url);
  const platform = detectPlatform(url);

  if (platform === "youtube" && embedUrl) {
    return (
      <div className={`relative w-full overflow-hidden rounded-[24px] border border-white/10 bg-black ${vertical ? "max-w-[420px]" : ""}`}>
        <div className={`relative w-full ${vertical ? "aspect-[9/16]" : "aspect-[16/9]"}`}>
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

  if (platform === "instagram" && embedUrl) {
    return (
      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black">
        <div className="relative mx-auto aspect-[9/16] w-full max-w-[420px]">
          <iframe
            src={embedUrl}
            title={title || "Instagram Reel"}
            className="absolute inset-0 h-full w-full"
            allow="encrypted-media; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (platform === "tiktok") {
    return (
      <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 text-center">
        <p className="text-sm text-gray-300">
          Este reel se abre desde su plataforma original.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
        >
          Abrir TikTok
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 text-center">
      <p className="text-sm text-gray-300">Contenido externo disponible.</p>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
      >
        Abrir enlace
      </a>
    </div>
  );
}

export default function TuningDetailPage({
  article,
  year,
}: {
  article: TuningArticle;
  year: number;
}) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const heroImage = article.mainImageUrl || article.galleryUrls?.[0] || "/images/noticia-2.jpg";
  const gallery = Array.from(
    new Set(
      [article.mainImageUrl, ...(article.galleryUrls || [])]
        .map((u) => normalizeUrl(u))
        .filter(Boolean)
    )
  );

  const bodyBlocks = useMemo(() => parseBody(article.body || ""), [article.body]);

  const streaks: Streak[] = useMemo(
    () => [
      { top: "7%", left: "-35%", v: "warm", dir: "fwd", delay: "0s", dur: "12s", op: 0.82 },
      { top: "14%", left: "-28%", v: "cool", dir: "rev", delay: ".7s", dur: "10.6s", op: 0.72 },
      { top: "23%", left: "-34%", v: "lime", dir: "fwd", delay: "1.2s", dur: "13.5s", op: 0.72 },
      { top: "31%", left: "-25%", v: "warm", dir: "rev", delay: "1.8s", dur: "11.4s", op: 0.8 },
      { top: "43%", left: "-38%", v: "cool", dir: "fwd", delay: "2.6s", dur: "12.8s", op: 0.78 },
      { top: "57%", left: "-27%", v: "warm", dir: "rev", delay: "3.2s", dur: "10.3s", op: 0.8 },
      { top: "69%", left: "-32%", v: "cool", dir: "fwd", delay: "4.1s", dur: "12.2s", op: 0.84 },
      { top: "81%", left: "-24%", v: "lime", dir: "rev", delay: "5.1s", dur: "13.4s", op: 0.7 },
      { top: "10%", left: "-37%", v: "warm", dir: "fwd", delay: ".2s", dur: "11.8s", op: 0.55, h: "1px" },
      { top: "36%", left: "-31%", v: "cool", dir: "rev", delay: "2.1s", dur: "13.2s", op: 0.5, h: "1px" },
      { top: "76%", left: "-20%", v: "lime", dir: "fwd", delay: "4.9s", dur: "12.6s", op: 0.48, h: "1px" },
    ],
    []
  );

  useEffect(() => {
    document.body.style.overflow = mobileOpen || !!activeImage ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, activeImage]);

  useEffect(() => {
    setMobileOpen(false);
    setActiveImage(null);
  }, [router.asPath]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
        setActiveImage(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <Seo
        title={`${article.seoTitle || article.title} | MotorWelt`}
        description={
          article.seoDescription ||
          article.excerpt ||
          article.subtitle ||
          "Tuning en MotorWelt"
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

        <header className="fixed left-0 top-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
          <div className="mx-auto grid h-16 w-full max-w-[1200px] grid-cols-[auto_1fr_auto] items-center px-4 sm:px-6 lg:h-[72px] lg:px-8">
            <div className="flex items-center">
              <Link href="/" className="inline-flex items-center gap-2" aria-label="Ir al inicio MotorWelt">
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
                <Link href="/tuning" className="inline-flex h-10 items-center leading-none text-white">
                  Tuning
                </Link>
                <Link href="/noticias/autos" className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white">
                  Autos
                </Link>
                <Link href="/noticias/motos" className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white">
                  Motos
                </Link>
                <Link href="/deportes" className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white">
                  Deportes
                </Link>
                <Link href="/lifestyle" className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white">
                  Lifestyle
                </Link>
                <Link href="/comunidad" className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white">
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
                  <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden />
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
                    <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="px-4 py-3">
                <Link href="/tuning" className="block w-full rounded-xl px-3 py-3 text-base text-white hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  Tuning
                </Link>
                <Link href="/noticias/autos" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  Autos
                </Link>
                <Link href="/noticias/motos" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  Motos
                </Link>
                <Link href="/deportes" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  Deportes
                </Link>
                <Link href="/lifestyle" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  Lifestyle
                </Link>
                <Link href="/comunidad" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  Comunidad
                </Link>
              </nav>
            </aside>
          </div>
        )}

        {activeImage && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5">
            <button
              type="button"
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => setActiveImage(null)}
              aria-label="Cerrar imagen"
            />
            <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-black">
              <img src={activeImage} alt="Preview" className="max-h-[92vh] w-full object-contain" />
              <button
                type="button"
                onClick={() => setActiveImage(null)}
                className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white backdrop-blur-md hover:bg-black/60"
                aria-label="Cerrar imagen"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <main aria-hidden={mobileOpen || !!activeImage} className="relative z-10 pt-16 lg:pt-[72px]">
          <section className="relative overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={heroImage}
                alt={article.title}
                className="h-full w-full object-cover"
                style={{ filter: "brightness(.28) saturate(1.12)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/45 to-[#041210]" />
            </div>

            <div className="relative mx-auto flex min-h-[72svh] w-full max-w-[1200px] items-end px-4 pb-12 pt-24 sm:px-6 lg:min-h-[82vh] lg:px-8 lg:pb-16">
              <div className="max-w-4xl">
                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <Link href="/tuning" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-gray-200 backdrop-blur">
                    <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                    Tuning
                  </Link>

                  {article.contentType ? (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-300">
                      {article.contentType}
                    </span>
                  ) : null}

                  {article.publishedAt ? (
                    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-300">
                      {formatDate(article.publishedAt)}
                    </span>
                  ) : null}
                </div>

                <h1 className="font-display text-[2.5rem] font-extrabold leading-[0.92] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                  {article.title}
                </h1>

                {article.subtitle ? (
                  <p className="mt-5 max-w-3xl text-base leading-relaxed text-gray-200 sm:text-lg md:text-xl">
                    {article.subtitle}
                  </p>
                ) : null}

                <div className="mt-7 flex flex-wrap items-center gap-3 text-sm text-gray-300">
                  {article.authorName ? (
                    <span>Por <span className="font-semibold text-white">{article.authorName}</span></span>
                  ) : null}
                  {article.authorName && article.updatedAt ? <span className="text-gray-500">•</span> : null}
                  {article.updatedAt ? <span>Actualizado {formatDate(article.updatedAt)}</span> : null}
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link href="/tuning">
                    <Button variant="ghost">Volver a Tuning</Button>
                  </Link>
                  {article.videoUrl ? (
                    <a href="#video-principal">
                      <Button variant="pink">Ver video</Button>
                    </a>
                  ) : article.reelUrl ? (
                    <a href="#reel-principal">
                      <Button variant="pink">Ver reel</Button>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          <section className="py-8 sm:py-10">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="grid gap-8 lg:grid-cols-[1.5fr_.7fr]">
                <article className="min-w-0">
                  {(article.videoUrl && article.useVideoAsHero) ? (
                    <div id="video-principal" className="mb-8">
                      <InlineEmbed url={article.videoUrl} title={article.title} />
                    </div>
                  ) : null}

                  <div className="rounded-[30px] border border-white/10 bg-black/25 p-5 backdrop-blur-md sm:p-8">
                    <div className="prose-reset">
                      {bodyBlocks.length > 0 ? (
                        bodyBlocks.map((block, index) => {
                          if (block.type === "p") {
                            return (
                              <p
                                key={index}
                                className="mb-5 text-base leading-8 text-gray-200 sm:text-[1.05rem]"
                              >
                                {block.text}
                              </p>
                            );
                          }

                          if (block.type === "h2") {
                            return (
                              <h2
                                key={index}
                                className="mt-10 mb-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl"
                              >
                                {block.text}
                              </h2>
                            );
                          }

                          if (block.type === "h3") {
                            return (
                              <h3
                                key={index}
                                className="mt-8 mb-3 text-2xl font-semibold text-white sm:text-3xl"
                              >
                                {block.text}
                              </h3>
                            );
                          }

                          if (block.type === "h4") {
                            return (
                              <h4
                                key={index}
                                className="mt-7 mb-3 text-xl font-semibold text-white sm:text-2xl"
                              >
                                {block.text}
                              </h4>
                            );
                          }

                          if (block.type === "h5") {
                            return (
                              <h5
                                key={index}
                                className="mt-6 mb-2 text-lg font-semibold uppercase tracking-[0.16em] text-[#0CE0B2]"
                              >
                                {block.text}
                              </h5>
                            );
                          }

                          if (block.type === "quote") {
                            return (
                              <blockquote
                                key={index}
                                className="my-8 rounded-[24px] border border-white/10 bg-white/5 px-5 py-4 text-lg italic leading-8 text-white"
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
                                onClick={() => setActiveImage(block.url)}
                                className="group my-8 block w-full overflow-hidden rounded-[24px] border border-white/10 bg-black text-left"
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
                            return (
                              <div key={index} className="my-8">
                                <InlineEmbed url={block.url} title={article.title} />
                              </div>
                            );
                          }

                          return null;
                        })
                      ) : (
                        <p className="text-base leading-8 text-gray-200">
                          {article.excerpt || article.subtitle || "Contenido próximamente."}
                        </p>
                      )}
                    </div>
                  </div>

                  {article.videoUrl && !article.useVideoAsHero ? (
                    <div id="video-principal" className="mt-10">
                      <div className="mb-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#FF7A1A]">
                          Video
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-white">
                          Pieza principal en movimiento
                        </h2>
                      </div>
                      <InlineEmbed url={article.videoUrl} title={article.title} />
                    </div>
                  ) : null}

                  {article.reelUrl ? (
                    <div id="reel-principal" className="mt-10">
                      <div className="mb-4">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#A3FF12]">
                          Short Format
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-white">
                          Reel / formato corto
                        </h2>
                      </div>
                      <InlineEmbed url={article.reelUrl} title={article.title} vertical />
                    </div>
                  ) : null}

                  {gallery.length > 1 ? (
                    <div className="mt-12">
                      <div className="mb-5">
                        <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                          Gallery
                        </p>
                        <h2 className="mt-2 font-display text-3xl font-bold text-white">
                          Más frames del proyecto
                        </h2>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        {gallery.map((url, index) => (
                          <button
                            key={`${url}-${index}`}
                            type="button"
                            onClick={() => setActiveImage(url)}
                            className={`group overflow-hidden rounded-[24px] border border-white/10 bg-black text-left ${
                              index === 0 ? "sm:col-span-2" : ""
                            }`}
                          >
                            <div className={`relative w-full ${index === 0 ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
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
                  ) : null}

                  <div className="mt-12">
                    <AdBanner
                      label="Advertising"
                      title="Tu marca aquí, dentro del universo Tuning de MotorWelt"
                    />
                  </div>
                </article>

                <aside className="space-y-6">
                  <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur-md">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#FF7A1A]">
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
                        <p className="mt-1 text-white">Tuning</p>
                      </div>

                      {article.contentType ? (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                            Tipo
                          </p>
                          <p className="mt-1 text-white">{article.contentType}</p>
                        </div>
                      ) : null}

                      {article.authorName ? (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                            Autor
                          </p>
                          <p className="mt-1 text-white">{article.authorName}</p>
                        </div>
                      ) : null}

                      {article.publishedAt ? (
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
                            Publicación
                          </p>
                          <p className="mt-1 text-white">{formatDate(article.publishedAt)}</p>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {article.tags?.length ? (
                    <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur-md">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                        Tags
                      </p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.14em] text-gray-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {gallery.length > 0 ? (
                    <div className="rounded-[28px] border border-white/10 bg-black/25 p-5 backdrop-blur-md">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#A3FF12]">
                        Preview
                      </p>
                      <div className="mt-4 space-y-3">
                        {gallery.slice(0, 3).map((url, index) => (
                          <button
                            key={`${url}-side-${index}`}
                            type="button"
                            onClick={() => setActiveImage(url)}
                            className="block w-full overflow-hidden rounded-[20px] border border-white/10 bg-black"
                          >
                            <div className="relative aspect-[16/10] w-full">
                              <img
                                src={url}
                                alt={`${article.title} preview ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <AdBanner
                    label="Partner Slot"
                    title="Lanzamientos, accesorios, detailing, performance y más"
                  />
                </aside>
              </div>
            </div>
          </section>
        </main>

        <footer
          aria-hidden={mobileOpen || !!activeImage}
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
                <a href="https://instagram.com/motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">
                  IG
                </a>
                <a href="https://facebook.com/motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">
                  FB
                </a>
                <a href="https://tiktok.com/@motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">
                  TikTok
                </a>
                <a href="https://youtube.com/@motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">
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
        .prose-reset p:last-child {
          margin-bottom: 0;
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
            contain-intrinsic-size: 1px 1200px;
          }
        }
      `}</style>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale, params }) => {
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const slug = String(params?.slug || "").trim();

  if (!slug) {
    return { notFound: true };
  }

  const query = /* groq */ `
    *[
      _type in ["article", "post"] &&
      slug.current == $slug &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == "tuning" ||
        lower(category) == "tuning" ||
        "tuning" in categories[] ||
        "builds" in categories[] ||
        "mods" in categories[]
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
      "publishedAt": publishedAt,
      "mainImageUrl": coalesce(mainImageUrl, coverImage.asset->url, ""),
      "galleryUrls": coalesce(galleryUrls, []),
      "videoUrl": coalesce(videoUrl, ""),
      "reelUrl": coalesce(reelUrl, ""),
      "useVideoAsHero": coalesce(useVideoAsHero, false)
    }
  `;

  const article = await sanityReadClient.fetch(query, { slug });

  if (!article?.id) {
    return { notFound: true };
  }

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
      year: new Date().getFullYear(),
      article,
    },
  };
};