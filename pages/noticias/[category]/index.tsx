// pages/noticias/[category]/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../../components/Seo";

type Category = "autos" | "motos";

type SanityNewsItem = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  cover: string;
  tags: string[];
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function normalize(s: string) {
  return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getQuickChips(category: Category, items: SanityNewsItem[]) {
  const bag: Record<string, number> = {};

  const seedAutos = [
    "gti",
    "bmw",
    "m",
    "mercedes",
    "amg",
    "porsche",
    "audi",
    "rs",
    "jdm",
    "track",
    "trackday",
    "tuning",
    "tecnologia",
    "ev",
    "hibrido",
    "lanzamiento",
    "prueba",
    "review",
  ];

  const seedMotos = [
    "bmw",
    "gs",
    "adventure",
    "enduro",
    "naked",
    "sport",
    "superbike",
    "motogp",
    "track",
    "equipo",
    "cascos",
    "tech",
    "tecnologia",
    "electric",
    "ev",
    "lanzamiento",
    "prueba",
    "review",
  ];

  const seed = category === "motos" ? seedMotos : seedAutos;

  items.forEach((it) => {
    const t = normalize(it.title);
    const e = normalize(it.excerpt);
    const tags = (it.tags || []).map((x) => normalize(x)).join(" ");
    const blob = `${t} ${e} ${tags}`;

    seed.forEach((k) => {
      if (blob.includes(k)) bag[k] = (bag[k] || 0) + 1;
    });
  });

  const sorted = Object.entries(bag)
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k);

  const fallbackAutos = ["lanzamiento", "prueba", "tecnologia", "tuning", "trackday", "ev"];
  const fallbackMotos = ["lanzamiento", "prueba", "adventure", "enduro", "motogp", "equipo"];

  const out = Array.from(
    new Set([...(sorted || []), ...(category === "motos" ? fallbackMotos : fallbackAutos)])
  ).slice(0, 10);

  const label: Record<string, string> = {
    gti: "GTI",
    bmw: "BMW",
    m: "M Power",
    mercedes: "Mercedes",
    amg: "AMG",
    porsche: "Porsche",
    audi: "Audi",
    rs: "RS",
    jdm: "JDM",
    track: "Track",
    trackday: "Track day",
    tuning: "Tuning",
    tecnologia: "Tecnología",
    tech: "Tech",
    ev: "EV",
    hibrido: "Híbrido",
    lanzamiento: "Lanzamientos",
    prueba: "Pruebas",
    review: "Reviews",
    gs: "GS",
    adventure: "Adventure",
    enduro: "Enduro",
    naked: "Naked",
    sport: "Sport",
    superbike: "Superbike",
    motogp: "MotoGP",
    equipo: "Equipo",
    cascos: "Cascos",
    electric: "Electric",
  };

  return out.map((k) => ({ key: k, label: label[k] || k }));
}

const QuickPeekModal = ({
  open,
  onClose,
  item,
  category,
}: {
  open: boolean;
  onClose: () => void;
  item: SanityNewsItem | null;
  category: Category;
}) => {
  if (!open || !item) return null;

  const accentBorder = category === "motos" ? "border-[#7CFF4A]/30" : "border-[#FF7A1A]/35";
  const accentBg = category === "motos" ? "bg-[#7CFF4A]/10" : "bg-[#FF7A1A]/10";
  const accentText = category === "motos" ? "text-[#B9FF9A]" : "text-[#FFB27A]";
  const emoji = category === "motos" ? "🏍️" : "🏁";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 backdrop-blur sm:items-center"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-black/85 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64">
          <Image
            src={
              item.cover ||
              (category === "autos" ? "/images/noticia-2.jpg" : "/images/noticia-3.jpg")
            }
            alt={item.title}
            fill
            sizes="(max-width:768px) 100vw, 768px"
            style={{ objectFit: "cover", filter: "brightness(.85) saturate(1.05)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
          <button
            type="button"
            className="absolute right-3 top-3 rounded-xl border border-white/12 bg-black/40 px-3 py-1.5 text-xs font-semibold text-white/90 hover:bg-black/60 transition"
            onClick={onClose}
          >
            Cerrar ✕
          </button>

          <div className="absolute bottom-4 left-4 right-4">
            <span
              className={cx(
                "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold",
                accentBorder,
                accentBg,
                accentText
              )}
            >
              {emoji} {category === "autos" ? "Autos" : "Motos"}
            </span>
            <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
            <p className="mt-1 text-sm text-gray-200/85 line-clamp-3">{item.excerpt}</p>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-[11px] text-gray-400">
              Quick peek: consume más rápido sin romper el flow.
            </p>
            <Link
              href={`/noticias/${category}/${item.slug}`}
              className={cx(
                "inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold hover:brightness-110 transition",
                accentBorder,
                accentBg,
                accentText
              )}
            >
              Leer completa →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function NewsCategoryPage({
  category,
  initialItems,
}: {
  category: Category;
  initialItems: SanityNewsItem[];
}) {
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"grid" | "feed">("grid");
  const [visible, setVisible] = useState(9);

  const [activeChip, setActiveChip] = useState("");
  const items = useMemo(() => initialItems || [], [initialItems]);

  const quickChips = useMemo(() => getQuickChips(category, items), [category, items]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    const chip = normalize(activeChip.trim());

    if (!q && !chip) return items;

    return items.filter((it) => {
      const t = normalize(it.title || "");
      const e = normalize(it.excerpt || "");
      const tags = (it.tags || []).map((x) => normalize(x)).join(" ");

      const matchQuery = !q || t.includes(q) || e.includes(q) || tags.includes(q);
      const matchChip = !chip || t.includes(chip) || e.includes(chip) || tags.includes(chip);
      return matchQuery && matchChip;
    });
  }, [items, query, activeChip]);

  // “inmediatez”: con filtros muestra más sin fricción
  useEffect(() => {
    if (query.trim() || activeChip.trim()) {
      setVisible((v) => clamp(v, 9, 48));
    } else {
      setVisible(9);
    }
  }, [query, activeChip]);

  const visibleItems = filtered.slice(0, visible);
  const featured = filtered[0] || null;
  const hasFilters = Boolean(query.trim() || activeChip.trim());

  const accent = category === "motos" ? "#7CFF4A" : "#FF7A1A";
  const accent2 = category === "motos" ? "#0CE0B2" : "#0CE0B2";
  const heroImg = category === "autos" ? "/images/noticia-2.jpg" : "/images/noticia-3.jpg";
  const badgeText = category === "autos" ? "🏁 Autos" : "🏍️ Motos";
  const badgeBorder = category === "motos" ? "border-[#7CFF4A]/30" : "border-[#FF7A1A]/35";
  const badgeBg = category === "motos" ? "bg-[#7CFF4A]/10" : "bg-[#FF7A1A]/10";
  const badgeColor = category === "motos" ? "text-[#B9FF9A]" : "text-[#FFB27A]";

  const resetFilters = () => {
    setQuery("");
    setActiveChip("");
  };

  // Quick peek
  const [peekOpen, setPeekOpen] = useState(false);
  const [peekItem, setPeekItem] = useState<SanityNewsItem | null>(null);
  const openPeek = (it: SanityNewsItem) => {
    setPeekItem(it);
    setPeekOpen(true);
  };
  const closePeek = () => {
    setPeekOpen(false);
    setPeekItem(null);
  };

  // scroll progress (micro “dopamina” visual)
  const [progress, setProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      requestAnimationFrame(() => {
        const doc = document.documentElement;
        const max = doc.scrollHeight - doc.clientHeight;
        const p = max > 0 ? (window.scrollY / max) * 100 : 0;
        setProgress(clamp(p, 0, 100));
        ticking.current = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Seo
        title={`Noticias ${category === "autos" ? "Autos" : "Motos"} | MotorWelt`}
        description={`Últimas noticias de ${category}.`}
      />

      {/* Ambient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="absolute -top-44 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full blur-[110px]"
          style={{ background: `${accent}1A` }}
        />
        <div
          className="absolute -bottom-64 left-10 h-[560px] w-[560px] rounded-full blur-[120px]"
          style={{ background: `${accent2}1A` }}
        />
        <div className="absolute right-0 top-24 h-[520px] w-[520px] rounded-full bg-white/5 blur-[140px]" />
      </div>

      {/* Progress bar */}
      <div className="fixed left-0 top-0 z-50 h-[3px] w-full bg-black/20">
        <div
          className="h-full"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${accent}, #FFC168, ${accent2})`,
          }}
        />
      </div>

      {/* HERO */}
      <section className="relative mt-16 overflow-hidden">
        <div className="relative min-h-[46vh]">
          <Image
            src={heroImg}
            alt={`Noticias ${category}`}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", filter: "brightness(.45) saturate(1.12)" }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                category === "autos"
                  ? "linear-gradient(to bottom, rgba(255,122,26,.14), rgba(0,0,0,.55), rgba(12,224,178,.10))"
                  : "linear-gradient(to bottom, rgba(124,255,74,.12), rgba(0,0,0,.55), rgba(12,224,178,.10))",
            }}
          />

          <div className="relative z-10 mx-auto w-full max-w-[1200px] px-4 pb-10 pt-10 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-black/35 px-3 py-1 text-[11px] text-gray-200">
                  MotorWelt • Noticias
                </span>
                <span
                  className={cx(
                    "rounded-full border px-3 py-1 text-[11px] font-semibold",
                    badgeBorder,
                    badgeBg,
                    badgeColor
                  )}
                >
                  {badgeText}
                </span>
                <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] text-gray-300">
                  Inmediatez • Feed rápido • Quick peek
                </span>
              </div>

              <div className="max-w-3xl">
                <h1 className="font-display text-5xl font-extrabold text-white tracking-tight">
                  Noticias — {category === "autos" ? "Autos" : "Motos"}
                </h1>
                <p className="mt-3 text-gray-200 max-w-2xl">
                  Lanzamientos, pruebas y tecnología. Entras por curiosidad… te quedas por “una más”.
                </p>
              </div>

              {/* Quick shots */}
              <div className="mt-1">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-gray-300/80">
                    Descubre rápido
                  </p>
                  <p className="text-[11px] text-gray-300/70">Toca un shot para filtrar al instante</p>
                </div>

                <div className="mt-3 flex gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {quickChips.slice(0, 6).map((c) => {
                    const active = activeChip === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setActiveChip((p) => (p === c.key ? "" : c.key))}
                        className={cx(
                          "group shrink-0 rounded-2xl border bg-black/35 px-4 py-3 text-left transition",
                          active
                            ? cx(badgeBorder, badgeBg)
                            : "border-white/10 hover:bg-black/55 hover:border-white/20"
                        )}
                        title={`Filtrar por: ${c.label}`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ring-white/10"
                            style={{
                              background:
                                category === "autos"
                                  ? "linear-gradient(135deg, rgba(255,122,26,.18), rgba(12,224,178,.08))"
                                  : "linear-gradient(135deg, rgba(124,255,74,.14), rgba(12,224,178,.10))",
                            }}
                          >
                            ⚡
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white">{c.label}</p>
                            <p className="text-[11px] text-gray-300/75">
                              {active ? "Activo • toca para quitar" : `Tag: ${c.key}`}
                            </p>
                            <p
                              className="mt-1 text-[10px] opacity-0 transition group-hover:opacity-100"
                              style={{ color: category === "autos" ? "#FFC168" : "#A8FFDD" }}
                            >
                              Filtrar ahora →
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Featured */}
              {featured ? (
                <div className="mt-2 rounded-3xl border border-white/12 bg-black/35 p-4 backdrop-blur-md">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.22em] text-gray-300/75">
                        Ahora mismo
                      </p>
                      <p className="mt-1 text-lg font-semibold text-white line-clamp-1">
                        {featured.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-200/80 line-clamp-2">
                        {featured.excerpt}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/noticias/${category}/${featured.slug}`}
                        className="inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition border border-white/15 bg-black/40 hover:bg-black/60"
                      >
                        Leer ahora →
                      </Link>
                      <button
                        type="button"
                        onClick={() => openPeek(featured)}
                        className={cx(
                          "inline-flex items-center justify-center rounded-2xl border px-4 py-2 text-sm font-semibold hover:brightness-110 transition",
                          badgeBorder,
                          badgeBg,
                          badgeColor
                        )}
                      >
                        Quick peek ⚡
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Sticky control bar */}
      <div className="sticky top-[76px] z-20 border-y border-white/10 bg-black/35 backdrop-blur-md">
        <div className="mx-auto w-full max-w-[1200px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <div className="relative w-full sm:max-w-[420px]">
                <label htmlFor="search-news" className="sr-only">
                  Buscar
                </label>
                <input
                  id="search-news"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar título, texto o tag…"
                  className="w-full rounded-2xl border border-white/15 bg-black/35 px-4 py-2.5 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2"
                  style={{
                    boxShadow: "0 0 0 0 rgba(0,0,0,0)",
                    outline: "none",
                  }}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 opacity-80">
                  🔎
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeChip ? (
                  <button
                    type="button"
                    onClick={() => setActiveChip("")}
                    className={cx(
                      "rounded-full border px-3 py-1 text-xs font-semibold hover:brightness-110 transition",
                      badgeBorder,
                      badgeBg,
                      badgeColor
                    )}
                    title="Quitar tag"
                  >
                    {`#${activeChip}`} ✕
                  </button>
                ) : (
                  <span className="text-[11px] text-gray-300/70">
                    Tip: usa shots para filtrar al instante 👇
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-start lg:justify-end">
              <button
                type="button"
                onClick={() => setView((v) => (v === "grid" ? "feed" : "grid"))}
                className="rounded-2xl border border-white/12 bg-black/30 px-4 py-2 text-xs font-semibold text-gray-200 hover:bg-black/50 hover:border-white/20 transition"
                title="Cambiar vista"
              >
                {view === "grid" ? "Vista: Grid" : "Vista: Feed"}
              </button>

              <button
                type="button"
                onClick={resetFilters}
                disabled={!hasFilters}
                className={cx(
                  "rounded-2xl px-4 py-2 text-xs font-semibold transition",
                  !hasFilters
                    ? "border border-white/10 bg-black/20 text-gray-500 cursor-not-allowed"
                    : cx("border", badgeBorder, badgeBg, badgeColor, "hover:brightness-110")
                )}
                title="Limpiar filtros"
              >
                Limpiar
              </button>

              <span className="rounded-2xl border border-white/10 bg-black/25 px-4 py-2 text-xs text-gray-200">
                Resultados: <span className="font-semibold text-white">{filtered.length}</span>
              </span>
            </div>
          </div>

          {/* micro-chips */}
          {quickChips.length > 0 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {quickChips.map((c) => {
                const active = activeChip === c.key;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setActiveChip((p) => (p === c.key ? "" : c.key))}
                    className={cx(
                      "shrink-0 rounded-full border px-3 py-1 text-xs transition",
                      active
                        ? cx(badgeBorder, badgeBg, badgeColor, "hover:brightness-110")
                        : "border-white/12 bg-black/20 text-gray-200 hover:bg-black/40 hover:border-white/20"
                    )}
                    title={active ? "Quitar filtro" : "Filtrar por chip"}
                  >
                    {c.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {/* CONTENT */}
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-6 mt-10 text-center">
          <h2 className="font-display text-3xl font-bold tracking-wide text-white">
            Últimas publicaciones
          </h2>
          <div
            className="mx-auto mt-2 h-1 w-28 rounded-full"
            style={{
              background:
                category === "autos"
                  ? "linear-gradient(to right, #FF7A1A, #E2A24C, #0CE0B2)"
                  : "linear-gradient(to right, #7CFF4A, #0CE0B2, #A8FFDD)",
            }}
          />
          <p className="mx-auto mt-3 max-w-2xl text-sm text-gray-300">
            Diseñado para escanear rápido: hot strip, quick peek, grid/feed y chips.
          </p>
        </div>

        {visibleItems.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-black/25 p-10 text-center text-gray-300">
            No hay publicaciones todavía.
          </div>
        ) : (
          <>
            {/* Hot strip */}
            <section className="mb-8">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                  Hot right now
                </p>
                <p className="text-[11px] text-gray-400">
                  Quick peek para consumir sin salir del feed
                </p>
              </div>

              <div className="mt-3 flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                {filtered.slice(0, 6).map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    onClick={() => openPeek(it)}
                    className={cx(
                      "snap-start shrink-0 w-[320px] rounded-3xl border bg-black/25 text-left transition hover:bg-black/45 hover:border-white/20",
                      category === "autos"
                        ? "border-white/12 shadow-[0_0_26px_rgba(255,122,26,.12)]"
                        : "border-white/12 shadow-[0_0_26px_rgba(124,255,74,.10)]"
                    )}
                    title="Quick peek"
                  >
                    <div className="relative h-40 overflow-hidden rounded-t-3xl">
                      <Image
                        src={
                          it.cover ||
                          (category === "autos" ? "/images/noticia-2.jpg" : "/images/noticia-3.jpg")
                        }
                        alt={it.title}
                        fill
                        sizes="320px"
                        style={{ objectFit: "cover", filter: "brightness(.82) saturate(1.05)" }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/70" />
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-sm font-semibold text-white line-clamp-2">
                          {it.title}
                        </p>
                      </div>
                    </div>

                    <div className="p-4">
                      <p className="text-xs text-gray-300/80 line-clamp-2">{it.excerpt}</p>
                      <p
                        className="mt-3 text-xs font-semibold"
                        style={{ color: category === "autos" ? "#FFC168" : "#A8FFDD" }}
                      >
                        Ver rápido →
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Main list */}
            {view === "grid" ? (
              <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {visibleItems.map((it) => (
                  <article
                    key={it.id}
                    className={cx(
                      "group overflow-hidden rounded-3xl border bg-black/25 transition hover:bg-black/45 hover:border-white/20",
                      category === "autos"
                        ? "border-white/10 shadow-[0_0_26px_rgba(255,122,26,.12)]"
                        : "border-white/10 shadow-[0_0_26px_rgba(124,255,74,.10)]"
                    )}
                  >
                    <Link href={`/noticias/${category}/${it.slug}`} className="block">
                      <div className="relative h-48">
                        <Image
                          src={
                            it.cover ||
                            (category === "autos"
                              ? "/images/noticia-2.jpg"
                              : "/images/noticia-3.jpg")
                          }
                          alt={it.title}
                          fill
                          sizes="(max-width:1024px) 50vw, 33vw"
                          style={{ objectFit: "cover", filter: "brightness(.9) saturate(1.05)" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/75 transition group-hover:via-black/5" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                          <span
                            className={cx(
                              "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              badgeBorder,
                              badgeBg,
                              badgeColor
                            )}
                          >
                            {badgeText}
                          </span>
                          <span className="rounded-full border border-white/10 bg-black/40 px-2 py-0.5 text-[10px] text-white/80">
                            Leer →
                          </span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-white font-semibold line-clamp-2">{it.title}</h3>
                        <p className="mt-2 text-sm text-gray-300 line-clamp-3">{it.excerpt}</p>
                      </div>
                    </Link>

                    <div className="px-5 pb-5">
                      {it.tags?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {it.tags.slice(0, 6).map((t) => (
                            <button
                              key={`${it.id}-${t}`}
                              type="button"
                              onClick={() => setActiveChip((p) => (p === t ? "" : t))}
                              className={cx(
                                "rounded-full border px-2 py-0.5 text-xs transition",
                                normalize(activeChip) === normalize(t)
                                  ? cx(badgeBorder, badgeBg, badgeColor, "hover:brightness-110")
                                  : "border-white/15 bg-black/30 text-white/80 hover:bg-black/45 hover:border-white/25"
                              )}
                              title="Filtrar por tag"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[11px] text-gray-400">MotorWelt</span>
                          <button
                            type="button"
                            onClick={() => openPeek(it)}
                            className="rounded-2xl border border-white/12 bg-black/25 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-black/45 hover:border-white/20 transition"
                          >
                            Quick peek ⚡
                          </button>
                        </div>
                      )}

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => openPeek(it)}
                          className="rounded-2xl border border-white/12 bg-black/25 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-black/45 hover:border-white/20 transition"
                        >
                          Quick peek ⚡
                        </button>
                        <Link
                          href={`/noticias/${category}/${it.slug}`}
                          className={cx(
                            "inline-flex items-center justify-center rounded-2xl border px-3 py-2 text-xs font-semibold hover:brightness-110 transition",
                            badgeBorder,
                            badgeBg,
                            badgeColor
                          )}
                        >
                          Leer completa →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            ) : (
              <section className="flex flex-col gap-4">
                {visibleItems.map((it) => (
                  <article
                    key={it.id}
                    className={cx(
                      "rounded-3xl border bg-black/25 overflow-hidden transition hover:bg-black/45 hover:border-white/20",
                      category === "autos"
                        ? "border-white/10 shadow-[0_0_26px_rgba(255,122,26,.12)]"
                        : "border-white/10 shadow-[0_0_26px_rgba(124,255,74,.10)]"
                    )}
                  >
                    <div className="grid gap-0 md:grid-cols-[320px_1fr]">
                      <Link href={`/noticias/${category}/${it.slug}`} className="relative block h-56 md:h-full">
                        <Image
                          src={it.cover || (category === "autos" ? "/images/noticia-2.jpg" : "/images/noticia-3.jpg")}
                          alt={it.title}
                          fill
                          sizes="320px"
                          style={{ objectFit: "cover", filter: "brightness(.9) saturate(1.05)" }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/75" />
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                          <span
                            className={cx(
                              "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                              badgeBorder,
                              badgeBg,
                              badgeColor
                            )}
                          >
                            {badgeText}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              openPeek(it);
                            }}
                            className="rounded-full border border-white/12 bg-black/40 px-3 py-1 text-[10px] font-semibold text-white/90 hover:bg-black/60 transition"
                          >
                            Quick peek ⚡
                          </button>
                        </div>
                      </Link>

                      <div className="p-5">
                        <Link href={`/noticias/${category}/${it.slug}`} className="block">
                          <h3 className="text-xl font-semibold text-white leading-snug">
                            {it.title}
                          </h3>
                          <p className="mt-2 text-sm text-gray-300/90 line-clamp-3">
                            {it.excerpt}
                          </p>
                        </Link>

                        {it.tags?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {it.tags.slice(0, 8).map((t) => (
                              <button
                                key={`${it.id}-feed-${t}`}
                                type="button"
                                onClick={() => setActiveChip((p) => (p === t ? "" : t))}
                                className={cx(
                                  "rounded-full border px-2 py-0.5 text-xs transition",
                                  normalize(activeChip) === normalize(t)
                                    ? cx(badgeBorder, badgeBg, badgeColor, "hover:brightness-110")
                                    : "border-white/15 bg-black/30 text-white/80 hover:bg-black/45 hover:border-white/25"
                                )}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => openPeek(it)}
                              className="rounded-2xl border border-white/12 bg-black/25 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-black/45 hover:border-white/20 transition"
                            >
                              Quick peek ⚡
                            </button>
                            <Link
                              href={`/noticias/${category}/${it.slug}`}
                              className={cx(
                                "rounded-2xl border px-3 py-2 text-xs font-semibold hover:brightness-110 transition",
                                badgeBorder,
                                badgeBg,
                                badgeColor
                              )}
                            >
                              Leer completa →
                            </Link>
                          </div>

                          <span className="text-[11px] text-gray-400">MotorWelt</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </section>
            )}

            {visible < filtered.length && (
              <div className="mt-8 text-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + 9)}
                  className={cx(
                    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold border-2 bg-black/25 hover:bg-white/5 shadow-[0_0_22px_rgba(12,224,178,.18)] transition text-white",
                    category === "autos" ? "border-[#0CE0B2]" : "border-[#0CE0B2]"
                  )}
                >
                  Cargar más
                </button>
              </div>
            )}

            {/* Bottom CTA */}
            <section className="mt-12 rounded-3xl border border-white/10 bg-black/25 p-7 text-center">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-400">
                MotorWelt • {category === "autos" ? "Autos" : "Motos"}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-white">
                El objetivo: que te quedes aquí.
              </h3>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-gray-300/90">
                Soft launch: quick peek + hot strip + grid/feed. Luego metemos “tendencias” y módulos de video.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="rounded-2xl border border-white/12 bg-black/25 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-black/45 hover:border-white/20"
                >
                  Volver arriba ↑
                </button>
                <button
                  type="button"
                  onClick={resetFilters}
                  className={cx(
                    "rounded-2xl border px-4 py-2 text-sm font-semibold hover:brightness-110 transition",
                    badgeBorder,
                    badgeBg,
                    badgeColor
                  )}
                >
                  Limpiar filtros
                </button>
              </div>
            </section>
          </>
        )}
      </main>

      <QuickPeekModal open={peekOpen} onClose={closePeek} item={peekItem} category={category} />
    </>
  );
}

/* ===================== SSR ===================== */
export async function getServerSideProps({
  params,
}: {
  params: { category: string };
}) {
  const categoryParam = (params?.category || "autos").toLowerCase();
  const category: Category = categoryParam === "motos" ? "motos" : "autos";

  const { sanityReadClient } = await import("../../../lib/sanityClient");

  // ✅ Filtra por sección flexible (porque tu sección puede ser "Noticias Motos", "noticias motos", etc.)
  const sectionNeedle = category === "motos" ? "moto" : "auto";

  const query = `
    *[
      _type == "article" &&
      status == "publicado" &&
      defined(slug.current) &&
      defined(section) &&
      lower(section) match "*${sectionNeedle}*"
    ]
    | order(publishedAt desc){
      "id": _id,
      "slug": slug.current,
      "title": coalesce(title, ""),
      "excerpt": coalesce(subtitle, ""),
      "cover": coalesce(mainImageUrl, ""),
      "tags": coalesce(tags, [])
    }
  `;

  const initialItems = await sanityReadClient.fetch(query);

  return {
    props: {
      category,
      initialItems: initialItems ?? [],
    },
  };
}
