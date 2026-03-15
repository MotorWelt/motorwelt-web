// pages/index.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import Seo from "../components/Seo";
import Image from "next/image";
import ProfileButton from "../components/ProfileButton"; // ⬅️ NUEVO

const nextI18NextConfig = require("../next-i18next.config.js");

/** ---------- Botón con variantes NEÓN DE CONTORNO ---------- **/
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
    className={`rounded-2xl border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md transition hover:border-[#0CE0B2]/50 ${className}`}
  >
    {children}
  </div>
);

const CardContent: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className = "", children }) => (
  <div className={`p-5 ${className}`}>{children}</div>
);

/** ---------- Bloques de Publicidad (placeholders) ---------- **/
type AdKind = "leaderboard" | "mpu" | "billboard";
const AdSlot: React.FC<{ kind: AdKind; className?: string; label?: string }> = ({
  kind,
  className = "",
  label,
}) => {
  const base =
    "relative flex items-center justify-center rounded-2xl border border-mw-line/70 bg-mw-surface/70 text-gray-400";
  const sizes: Record<AdKind, string> = {
    leaderboard: "h-24 w-full",
    billboard: "h-44 w-full",
    mpu: "w-full h-[300px] md:h-[336px]",
  };
  const txt: Record<AdKind, string> = {
    leaderboard: "Publicidad — Leaderboard (728×90 / 970×250)",
    billboard: "Publicidad — Billboard (970×250 / 970×90)",
    mpu: "Publicidad — MPU (300×250 / 300×600)",
  };
  return (
    <div className={`${base} ${sizes[kind]} ${className}`} aria-label={label || txt[kind]}>
      <span className="text-xs md:text-sm">{label || txt[kind]}</span>
      <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_24px_rgba(12,224,178,.15)]" />
    </div>
  );
};
/** ------------------------------------------- **/

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

/* ---------- Slugs demo para abrir detalle real ---------- */
const DEMO_AUTOS = [
  "/noticias/autos/prueba-sedan-turbo-equilibrio-en-pista",
  "/noticias/autos/aero-activa-20-que-aporta-realmente",
  "/noticias/autos/ceramicos-vs-acero-frenadas-sin-fading",
  "/noticias/autos/compuestos-2025-cambios-y-setup-recomendado",
];
const DEMO_MOTOS = [
  "/noticias/motos/naked-900-agilidad-y-par",
  "/noticias/motos/trail-media-electronica-off-road",
  "/noticias/motos/sport-touring-ergonomia-y-consumo-real",
];

// 🔧 Añadimos year como prop (evita mismatch SSR/cliente)
export default function HomePage({ year }: { year: number }) {
  const { t } = useTranslation("home");
  const { locale, pathname, query } = useRouter();
  const hrefCurrent = { pathname, query };

  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = mobileOpen ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [mobileOpen]);

  // Líneas animadas globales (mixtas L↔R)
  const streaks: Streak[] = [
    { top: "8%", left: "-35%", v: "cool", dir: "fwd", delay: "0s", dur: "12s", op: 0.85 },
    { top: "12%", left: "-28%", v: "warm", dir: "rev", delay: ".4s", dur: "10.5s", op: 0.75 },
    { top: "20%", left: "-36%", v: "lime", dir: "fwd", delay: "1.0s", dur: "13s", op: 0.80 },
    { top: "28%", left: "-22%", v: "cool", dir: "rev", delay: "1.6s", dur: "9.5s", op: 0.90 },
    { top: "36%", left: "-40%", v: "warm", dir: "fwd", delay: "2.1s", dur: "11.5s", op: 0.70 },
    { top: "44%", left: "-30%", v: "cool", dir: "rev", delay: "2.7s", dur: "12.5s", op: 0.85 },
    { top: "52%", left: "-26%", v: "warm", dir: "fwd", delay: "3.2s", dur: "10.2s", op: 0.80 },
    { top: "60%", left: "-18%", v: "lime", dir: "rev", delay: "3.8s", dur: "12.2s", op: 0.75 },
    { top: "68%", left: "-34%", v: "cool", dir: "fwd", delay: "4.4s", dur: "11.2s", op: 0.85 },
    { top: "76%", left: "-24%", v: "warm", dir: "rev", delay: "5.0s", dur: "9.8s", op: 0.72 },
    { top: "84%", left: "-20%", v: "cool", dir: "fwd", delay: "5.6s", dur: "13.2s", op: 0.82 },
    { top: "6%", left: "-38%", v: "cool", dir: "rev", delay: "0.6s", dur: "14s", op: 0.55, h: "1px" },
    { top: "18%", left: "-33%", v: "warm", dir: "fwd", delay: "1.2s", dur: "12.8s", op: 0.55, h: "1px" },
    { top: "22%", left: "-27%", v: "lime", dir: "rev", delay: "1.8s", dur: "10.8s", op: 0.50, h: "1px" },
    { top: "34%", left: "-31%", v: "cool", dir: "fwd", delay: "2.4s", dur: "13.6s", op: 0.58, h: "1px" },
    { top: "42%", left: "-36%", v: "warm", dir: "rev", delay: "3.0s", dur: "12.2s", op: 0.52, h: "1px" },
    { top: "58%", left: "-21%", v: "lime", dir: "fwd", delay: "3.6s", dur: "11.8s", op: 0.50, h: "1px" },
    { top: "66%", left: "-29%", v: "cool", dir: "rev", delay: "4.2s", dur: "14.4s", op: 0.55, h: "1px" },
    { top: "74%", left: "-19%", v: "warm", dir: "fwd", delay: "4.8s", dur: "12.6s", op: 0.50, h: "1px" },
    { top: "90%", left: "-25%", v: "lime", dir: "rev", delay: "5.4s", dur: "13.8s", op: 0.52, h: "1px" },
    { top: "14%", left: "-32%", v: "cool", dir: "fwd", delay: ".2s", dur: "11.4s", op: 0.92, h: "3px" },
    { top: "48%", left: "-35%", v: "warm", dir: "rev", delay: "2.9s", dur: "10.6s", op: 0.88, h: "3px" },
    { top: "82%", left: "-28%", v: "lime", dir: "fwd", delay: "5.3s", dur: "12.4s", op: 0.86, h: "3px" },
  ];

  return (
    <>
      <Seo title={`MotorWelt — ${t("hero.title")}`} description={t("hero.subtitle")} />

      {/* JSON-LD: Organization */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "MotorWelt",
            url: "https://motorwelt.mx",
            logo: "https://motorwelt.mx/brand/motorwelt-logo.png",
            sameAs: [
              "https://instagram.com/motorwelt",
              "https://facebook.com/motorwelt",
              "https://tiktok.com/@motorwelt",
              "https://youtube.com/@motorwelt",
            ],
          }),
        }}
      />

      <div className="min-h-screen text-gray-100 relative overflow-x-hidden">
        {/* Fondo global animado */}
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

        {/* Navbar */}
        <header className="fixed top-0 left-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 grid grid-cols-[1fr_auto_1fr] items-center h-16">
            {/* Izquierda: Logo */}
            <div className="flex items-center">
              <Link href="/" className="inline-flex items-center gap-2" aria-label="Ir al inicio MotorWelt">
                <Image
                  src="/brand/motorwelt-logo.png"
                  alt="MotorWelt logo"
                  width={280}
                  height={64}
                  priority
                  className="h-12 md:h-14 w-auto logo-glow"
                />
              </Link>
            </div>

            {/* Centro: Nav */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <div className="relative group">
                {/* Noticias: solo despliega menú, NO navega */}
                <button
                  type="button"
                  aria-haspopup="menu"
                  className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white focus:outline-none"
                >
                  {t("nav.news")}
                  <svg className="ml-2 mt-[1px] opacity-70 group-hover:opacity-100" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div className="pointer-events-none absolute left-0 top-full mt-2 opacity-0 translate-y-1 transition duration-150 ease-out group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:translate-y-0 group-focus-within:pointer-events-auto z-50">
                  <div className="min-w-[180px] rounded-xl border border-mw-line/70 bg-mw-surface/95 backdrop-blur-md p-2 shadow-xl">
                    <Link href="/noticias/autos" className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5">Autos</Link>
                    <Link href="/noticias/motos" className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5">Motos</Link>
                  </div>
                </div>
              </div>

              <Link href="/deportes" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
                Deportes
              </Link>
              <Link href="/lifestyle" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
                Lifestyle
              </Link>

              <Link href="/comunidad" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
                {t("nav.community")}
              </Link>
              <Link href="/producciones" className="inline-flex items-center h-10 leading-none text-gray-200 hover:text-white">
                {t("nav.productions")}
              </Link>
              <Link href="/suscripcion" className="inline-flex">
                <Button variant="pink" className="h-10 px-4 py-0 leading-none">
                  {t("nav.subscribe")}
                </Button>
              </Link>
            </nav>

            {/* Derecha: Idiomas + Hamburguesa */}
            <div className="flex items-center justify-end gap-3">
              <ProfileButton /> {/* ⬅️ NUEVO */}

              <div className="hidden md:flex items-center gap-3 text-sm">
                <Link href={{ pathname, query }} locale="es" className={`${locale === "es" ? "text-white" : "text-gray-300"} hover:text-white inline-flex items-center h-10 leading-none`}>ES</Link>
                <span className="text-gray-500">|</span>
                <Link href={{ pathname, query }} locale="en" className={`${locale === "en" ? "text-white" : "text-gray-300"} hover:text-white inline-flex items-center h-10 leading-none`}>EN</Link>
              </div>

              <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-mw-line/70 bg-mw-surface/60 backdrop-blur-md hover:bg白/5 focus:outline-none"
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

        {/* Panel móvil */}
        {mobileOpen && (
          <div className="fixed inset-0 z-[60] md:hidden">
            <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} aria-hidden />
            <aside
  id="mobile-menu"
  className="absolute right-0 top-0 h-full w-[86%] max-w-[340px] bg-mw-surface/95 backdrop-blur-xl border-l border-mw-line/70 shadow-2xl"
>
              <div className="flex items-center justify-between px-4 py-4 border-b border-mw-line/60">
                <Image src="/brand/motorwelt-logo.png" alt="MotorWelt logo" width={140} height={32} className="h-8 w-auto" />
                <button onClick={() => setMobileOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5" aria-label="Cerrar menú">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <nav className="px-4 py-3">
                <p className="px-3 pt-2 pb-1 text-xs uppercase tracking-wide text-gray-400">Noticias</p>
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

                {/* Corrigido: /deportes (sin “extremos”) */}
                <Link href="/deportes" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>Deportes</Link>
                <Link href="/lifestyle" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>Lifestyle</Link>
                <Link href="/comunidad" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>{t("nav.community")}</Link>
                <Link href="/producciones" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>{t("nav.productions")}</Link>

                <div className="mt-4">
                  <Link href="/suscripcion" onClick={() => setMobileOpen(false)}>
                    <Button variant="pink" className="w-full py-3 text-base">{t("nav.subscribe")}</Button>
                  </Link>
                </div>

                <div className="mt-6 border-t border-mw-line/60 pt-4">
                  <p className="mb-2 text-xs uppercase tracking-wide text-gray-400">Idioma</p>
                  <div className="flex items-center gap-3">
                    <Link href={{ pathname, query }} locale="es" onClick={() => setMobileOpen(false)} className={`${locale === "es" ? "text-white" : "text-gray-300"} hover:text-white`}>ES</Link>
                    <span className="text-gray-500">|</span>
                    <Link href={{ pathname, query }} locale="en" onClick={() => setMobileOpen(false)} className={`${locale === "en" ? "text-white" : "text-gray-300"} hover:text-white`}>EN</Link>
                  </div>
                </div>
              </nav>
            </aside>
          </div>
        )}

        {/* ======= MAIN ======= */}
        <main aria-hidden={mobileOpen} className="pt-20 relative z-10">
          {/* Hero */}
          <section className="relative flex h-[80vh] flex-col items-center justify-center overflow-hidden">
            <Image
              src="/images/hero-gti.jpg"
              alt="Hero MotorWelt"
              fill
              priority
              sizes="100vw"
              style={{ objectFit: "cover", filter: "brightness(.45) saturate(1.1)" }}
            />
            <div className="pointer-events-none absolute -left-10 -top-10 h-80 w-80 rotate-[-20deg] rounded-full bg-[#0CE0B2]/18 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 -bottom-16 h-96 w-96 rotate-[-20deg] rounded-full bg-[#FF7A1A]/20 blur-3xl" />

            <div className="relative z-10 w-full px-4 sm:px-6 lg:px-8">
              <aside
  id="mobile-menu"
  className="absolute right-0 top-0 h-full w-[86%] max-w-[340px] bg-mw-surface/95 backdrop-blur-xl border-l border-mw-line/70 shadow-2xl"
>
                <h1 className="font-display text-4xl md:text-6xl font-extrabold tracking-wide text-white">
                  <span className="glow-cool">MotorWelt:</span>{" "}
                  <span className="glow-warm">{t("hero.title")}</span>
                </h1>
                <p className="mt-4 text-lg text-gray-200 md:text-xl">
                  {t("hero.subtitle")}
                </p>
                <div className="mt-6 flex justify-center gap-4">
                  <Link href="/noticias/autos">
                    <Button variant="cyan">{t("hero.ctaNews")}</Button>
                  </Link>
                  <Link href="/comunidad">
                    <Button variant="pink">{t("hero.ctaCommunity")}</Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Leaderboard bajo hero */}
          <section className="py-6">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <AdSlot kind="leaderboard" />
            </div>
          </section>

          {/* MIXTAS: Autos + Motos (hero a la izq + lista a la derecha) */}
          <section className="py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold tracking-wide text-white">
                  Autos & Motos — Destacadas
                </h2>
                <div className="mt-2 h-1 w-28 rounded-full bg-gradient-to-r from-[#0CE0B2] via-[#E2A24C] to-[#FF7A1A]" />
              </div>

              <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
                {/* Hero grande a la izquierda */}
                <Card className="overflow-hidden hover:shadow-[0_0_26px_rgba(12,224,178,.2)]">
                  <div className="relative h-[320px] sm:h-[380px] w-full">
                    <Image
                      src="/images/noticia-1.jpg"
                      alt="Mixta destacada"
                      fill
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      style={{ objectFit: "cover" }}
                      priority
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="mb-2 inline-flex items-center gap-2 text-xs uppercase tracking-wide text-gray-400">
                      <span className="h-2 w-2 rounded-full bg-[#0CE0B2]" />
                      Mixta · Autos/Motos
                    </div>
                    <h3 className="text-2xl font-semibold text-white">
                      Supra vs. superbikes: adrenalina y tecnología cara a cara
                    </h3>
                    <p className="mt-3 text-gray-300">
                      Un comparativo diferente: tiempos, sensaciones y el encanto de dos mundos
                      que comparten el mismo lenguaje: velocidad.
                    </p>
                    <div className="mt-4">
                      {/* Abrimos una nota real de autos */}
                      <Link href={DEMO_AUTOS[0]}>
                        <Button variant="link">Leer la nota</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Lista a la derecha (sticky en desktop) */}
                <aside className="lg:sticky lg:top-24">
                  <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
                    <div className="p-4 border-b border-mw-line/60">
                      <h4 className="text-white font-semibold">Más para leer</h4>
                    </div>
                    <ul className="divide-y divide-mw-line/60">
                      {[0, 1, 2, 3, 4].map((i) => {
                        const isMoto = i % 2 === 1;
                        const href = isMoto ? DEMO_MOTOS[i % DEMO_MOTOS.length] : DEMO_AUTOS[i % DEMO_AUTOS.length];
                        return (
                          <li key={`mix-list-${i}`} className="p-4 hover:bg-white/5 transition">
                            <Link href={href} className="flex gap-3">
                              <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-mw-line/70">
                                <Image
                                  src={`/images/noticia-${((i % 3) + 1).toString()}.jpg`}
                                  alt={`Mini ${i + 1}`}
                                  fill
                                  sizes="100px"
                                  style={{ objectFit: "cover" }}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm text-white truncate">
                                  {isMoto
                                    ? "Naked bike con alma sport: setup para calle y trackday"
                                    : "Proyecto JDM: swap y ajuste fino para el 1/4 de milla"}
                                </p>
                                <span className="mt-1 block text-xs text-gray-400">
                                  {isMoto ? "Motos" : "Autos"} • 4–6 min
                                </span>
                              </div>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </aside>
              </div>

              <div className="mt-8 text-center">
                <Link href="/noticias/autos">
                  <Button variant="cyan" className="px-6 py-3">Ver más de Autos</Button>
                </Link>
                <span className="mx-2 text-gray-500">/</span>
                <Link href="/noticias/motos">
                  <Button variant="cyan" className="px-6 py-3">Ver más de Motos</Button>
                </Link>
              </div>
            </div>
          </section>

          {/* DEPORTES — compacto */}
          <section className="py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold tracking-wide text-white glow-warm">
                  Deportes — Destacados
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
              </div>

              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[1, 2, 3].map((i) => (
                  <Card key={`sports-${i}`} className="overflow-hidden hover:shadow-[0_0_24px_rgba(255,122,26,.16)]">
                    <div className="relative h-44 w-full">
                      <Image
                        src={`/images/noticia-${((i % 3) + 1).toString()}.jpg`}
                        alt={`Deportes ${i}`}
                        fill
                        sizes="(max-width: 1280px) 50vw, 25vw"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <CardContent className="p-5">
                      <h3 className="text-lg font-semibold text-white">Rally / Drift #{i}</h3>
                      <p className="mt-2 text-sm text-gray-300">
                        Setup, técnica y estrategia para competir con cabeza y corazón.
                      </p>
                      <Link href="/deportes" className="inline-block">
                        <Button variant="link" className="mt-2">Leer más</Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
                <div className="hidden xl:block">
                  <AdSlot kind="mpu" />
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/deportes">
                  <Button variant="cyan" className="px-6 py-3">Ver todo Deportes</Button>
                </Link>
              </div>
            </div>
          </section>

          {/* LIFESTYLE — banda editorial */}
          <section className="py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="font-display text-3xl font-bold tracking-wide text-white glow-cool">
                  Lifestyle — Cultura & Garaje
                </h2>
                <div className="mt-2 h-1 w-24 rounded-full bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]" />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Editorial ancho */}
                <Card className="overflow-hidden">
                  <div className="relative h-56 w-full">
                    <Image
                      src="/images/noticia-3.jpg"
                      alt="Lifestyle destacado"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-2xl font-semibold text-white">
                      La escena nocturna: meets, estilos y el código no escrito
                    </h3>
                    <p className="mt-3 text-gray-300">
                      ¿Qué hace auténtico a un meet? Afinamos el ojo a detalles: ruedas, fitment,
                      wraps y ese toque personal que marca diferencia.
                    </p>
                    <div className="mt-4">
                      <Link href="/lifestyle">
                        <Button variant="link">Leer artículo</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Columna de piezas rápidas */}
                <div className="grid gap-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={`life-${i}`} className="overflow-hidden">
                      <div className="relative h-36 w-full">
                        <Image
                          src={`/images/noticia-${((i % 3) + 1).toString()}.jpg`}
                          alt={`Lifestyle ${i}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 50vw"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                      <CardContent className="p-4">
                        <h4 className="text-white font-semibold">Lifestyle #{i}</h4>
                        <p className="mt-2 text-sm text-gray-300">
                          Detalles que elevan el carácter: interiores, audio y accesorios.
                        </p>
                        <Link href="/lifestyle" className="inline-block">
                          <Button variant="link" className="mt-1">Leer más</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="mt-8 text-center">
                <Link href="/lifestyle">
                  <Button variant="cyan" className="px-6 py-3">Ver más Lifestyle</Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Billboard intermedio */}
          <section className="py-8">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <AdSlot kind="billboard" />
            </div>
          </section>

          {/* Comunidad & Eventos */}
          <section className="py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="font-display text-3xl font-bold tracking-wide text-white glow-warm">
                {t("sections.community")}
              </h2>
              <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
              <p className="mx-auto mt-4 max-w-2xl text-gray-300">
                {t("community.text")}
              </p>

              <div className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70">
                <div className="relative w-full h-64 md:h-80">
                  <Image
                    src="/images/comunidad.jpg"
                    alt="Comunidad MotorWelt"
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              </div>

              <div className="mt-6">
                <Link href="/comunidad">
                  <Button variant="pink">{t("community.cta")}</Button>
                </Link>
              </div>
            </div>
          </section>

          {/* MotorWelt Productions */}
          <section className="py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="font-display text-3xl font-bold tracking-wide text-white glow-cool">
                {t("sections.productions")}
              </h2>
              <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[#0CE0B2] to-[#E2A24C]" />
              <p className="mx-auto mt-4 max-w-2xl text-gray-300">
                {t("productions.text")}
              </p>
              <div className="mt-8">
                <video
                  src="/videos/teaser.mp4"
                  controls
                  className="mx-auto w-full max-w-4xl rounded-2xl border border-mw-line/70 bg-black/40"
                />
              </div>
              <div className="mt-6">
                <Link href="/producciones">
                  <Button variant="cyan">{t("productions.cta")}</Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Partners / Patrocinios */}
          <section className="py-12">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between">
                <h3 className="text-white/90 font-semibold">Partners & Patrocinios</h3>
                <div className="h-px flex-1 mx-4 bg-mw-line/50" />
              </div>
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl border border-mw-line/70 bg-mw-surface/60 flex items-center justify-center text-xs text-gray-400"
                  >
                    LOGO #{i}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Suscripción */}
          <section className="py-16">
            <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="font-display text-3xl font-bold tracking-wide text-white">
                {t("sections.subscription")}
              </h2>
              <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-white/60" />

              <div className="mt-8 grid gap-6 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-white">
                        {t(`subscription.benefit${i}.title`)}
                      </h3>
                      <p className="mt-2 text-sm text-gray-300">
                        {t(`subscription.benefit${i}.desc`)}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/suscripcion">
                  <Button variant="pink" className="px-6 py-3">
                    {t("subscription.cta")}
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer aria-hidden={mobileOpen} className="mt-12 border-t border-mw-line/70 bg-mw-surface/70 backdrop-blur-md py-10 text-gray-300 relative z-10">
          <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 grid gap-8 md:grid-cols-3">
            <div>
              <Image src="/brand/motorwelt-logo.png" alt="MotorWelt logo" width={160} height={36} className="h-9 w-auto logo-glow" />
              <p className="mt-2 text-sm">{t("footer.description")}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">{t("footer.links")}</h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">{t("footer.about")}</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contacto</Link></li>
                <li><Link href="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
                <li><Link href="/privacidad" className="hover:text-white">Política de privacidad</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white">{t("footer.socials")}</h4>
              <div className="mt-2 flex gap-4">
                <a href="https://instagram.com/motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">IG</a>
                <a href="https://facebook.com/motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">FB</a>
                <a href="https://tiktok.com/@motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">TikTok</a>
                <a href="https://youtube.com/@motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">YouTube</a>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-500">
            © {year} MotorWelt. {t("footer.rights")}
          </p>
        </footer>
      </div>

      {/* Estilos globales del fondo y líneas */}
      <style jsx global>{`
        .mw-global-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .mw-global-base {
          position: absolute; inset: 0;
          background:
            radial-gradient(120% 80% at 20% 10%, rgba(0,0,0,0.15) 0%, transparent 60%),
            radial-gradient(120% 80% at 80% 90%, rgba(0,0,0,0.18) 0%, transparent 60%),
            linear-gradient(180deg, rgba(4,18,16,0.85), rgba(4,18,16,0.85));
        }
        .streak-wrap { position: absolute; width: 220%; height: 2px; transform: rotate(-12deg); }
        .streak { position: absolute; left: 0; top: 0; width: 220%; height: 100%; will-change: transform, opacity; filter: blur(.5px); }
        @keyframes slide-fwd { 0% { transform: translateX(-30%); opacity: 0; } 10% { opacity: .9; } 100% { transform: translateX(130%); opacity: 0; } }
        @keyframes slide-rev { 0% { transform: translateX(130%); opacity: 0; } 10% { opacity: .9; } 100% { transform: translateX(-30%); opacity: 0; } }
        .streak.dir-fwd { animation: slide-fwd 11s linear infinite; }
        .streak.dir-rev { animation: slide-rev 11s linear infinite; }
        .streak-cool { background: linear-gradient(90deg, transparent, rgba(12,224,178,.95), transparent); }
        .streak-warm { background: linear-gradient(90deg, transparent, rgba(255,122,26,.95), transparent); }
        .streak-lime { background: linear-gradient(90deg, transparent, rgba(163,255,18,.9), transparent); }

        @media (prefers-reduced-motion: reduce) {
          .streak { animation: none !important; opacity: .35; }
        }
        @supports (content-visibility: auto) {
          main > section { content-visibility: auto; contain-intrinsic-size: 1px 1000px; }
        }
      `}</style>
    </>
  );
}

// SSR: carga 'home' y pasa i18n + año (para evitar hydration)
export async function getServerSideProps({ locale }: { locale: string }) {
  const { serverSideTranslations } = await import("next-i18next/serverSideTranslations");
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
      year: new Date().getFullYear(),
    },
  };
}
