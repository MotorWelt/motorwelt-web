// pages/lifestyle/index.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";

type ButtonVariant = "cyan" | "pink" | "link";
type LifestyleKey =
  | "Moda"
  | "Relojería"
  | "Fuera del volante"
  | "Cine automovilístico";
type AdKind = "leaderboard" | "billboard";

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

type ArticleCardData = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  category: LifestyleKey;
};

type LatestArticleData = {
  id: string;
  title: string;
  excerpt: string;
  img: string;
  href: string;
  when: string;
  sectionLabel: string;
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

type LifestylePageSettings = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    billboard: AdConfig;
  };
  partnerLogos: PartnerLogo[];
};

type SectionHeroImages = {
  tuning: string;
  autos: string;
  motos: string;
  deportes: string;
  lifestyle: string;
  comunidad: string;
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
  section?: string;
  category?: string;
  subcategory?: string;
  categories?: string[];
  tags?: Array<
    string | { title?: string; name?: string; label?: string; value?: string }
  >;
};

const LIFESTYLE_SECTIONS: LifestyleKey[] = [
  "Moda",
  "Relojería",
  "Fuera del volante",
  "Cine automovilístico",
];

const DEFAULT_SETTINGS: LifestylePageSettings = {
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
    new RegExp("(^|;\\s*)" + escaped + "=([^;]+)")
  );
  return match ? decodeURIComponent(match[2]) : "";
}

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

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    className?: string;
    children: React.ReactNode;
    variant?: ButtonVariant;
  }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  return (
    <button {...props} className={getButtonClasses(variant, className)}>
      {children}
    </button>
  );
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

function normalizeText(value: unknown) {
  if (!value) return "";
  if (Array.isArray(value)) return value.map(normalizeText).join(" ").toLowerCase();
  if (typeof value === "object") {
    const item = value as Record<string, unknown>;
    return String(item.title || item.name || item.label || item.value || "")
      .trim()
      .toLowerCase();
  }
  return String(value).trim().toLowerCase();
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

function detectLifestyleCategory(post: RawPost): LifestyleKey | null {
  const controlledFields = [
    post.section,
    post.category,
    post.subcategory,
    post.categories,
    post.tags,
  ]
    .map(normalizeText)
    .join(" ");

  const fullBlob = [
    post.title,
    post.excerpt,
    post.subtitle,
    post.seoDescription,
    post.section,
    post.category,
    post.subcategory,
    post.categories,
    post.tags,
  ]
    .map(normalizeText)
    .join(" ");

  const blockedSections = [
    "autos",
    "noticias_autos",
    "motos",
    "noticias_motos",
    "tuning",
    "deportes",
    "f1",
    "nascar",
    "motogp",
    "wrc",
    "drift",
  ];

  const sectionCategoryText = [
    post.section,
    post.category,
    post.subcategory,
    post.categories,
  ]
    .map(normalizeText)
    .join(" ");

  const isClearlyOtherSection = blockedSections.some((word) =>
    sectionCategoryText.includes(word)
  );

  if (isClearlyOtherSection) return null;

  const blob = controlledFields.includes("lifestyle") ? fullBlob : controlledFields;

  if (
    blob.includes("lifestyle_moda") ||
    blob.includes("moda") ||
    blob.includes("fashion") ||
    blob.includes("sneakers") ||
    blob.includes("apparel")
  ) {
    return "Moda";
  }

  if (
    blob.includes("lifestyle_relojeria") ||
    blob.includes("lifestyle_relojería") ||
    blob.includes("relojeria") ||
    blob.includes("relojería") ||
    blob.includes("relojes") ||
    blob.includes("reloj") ||
    blob.includes("watch") ||
    blob.includes("watches") ||
    blob.includes("cronógrafo") ||
    blob.includes("cronografo")
  ) {
    return "Relojería";
  }

  if (
    blob.includes("lifestyle_fuera_del_volante") ||
    blob.includes("fuera del volante") ||
    blob.includes("off track") ||
    blob.includes("off the track") ||
    blob.includes("vida fuera") ||
    blob.includes("lifestyle piloto")
  ) {
    return "Fuera del volante";
  }

  if (
    blob.includes("lifestyle_cine") ||
    blob.includes("cine automovilístico") ||
    blob.includes("cine automovilistico") ||
    blob.includes("cine") ||
    blob.includes("película") ||
    blob.includes("pelicula") ||
    blob.includes("documental") ||
    blob.includes("serie") ||
    blob.includes("film")
  ) {
    return "Cine automovilístico";
  }

  return null;
}

function getLatestSectionData(post: RawPost): { label: string; hrefBase: string } | null {
  const blob = [
    post.section,
    post.category,
    post.subcategory,
    post.categories,
    post.tags,
  ]
    .map(normalizeText)
    .join(" ");

  if (
    blob.includes("noticias_autos") ||
    blob.includes("autos") ||
    blob.includes("auto")
  ) {
    return { label: "Autos", hrefBase: "/noticias/autos" };
  }

  if (
    blob.includes("noticias_motos") ||
    blob.includes("motos") ||
    blob.includes("moto")
  ) {
    return { label: "Motos", hrefBase: "/noticias/motos" };
  }

  if (
    blob.includes("tuning") ||
    blob.includes("builds") ||
    blob.includes("mods")
  ) {
    return { label: "Tuning", hrefBase: "/tuning" };
  }

  if (
    blob.includes("deportes") ||
    blob.includes("f1") ||
    blob.includes("nascar") ||
    blob.includes("motogp") ||
    blob.includes("wrc") ||
    blob.includes("drift") ||
    blob.includes("rally")
  ) {
    return { label: "Deportes", hrefBase: "/deportes" };
  }

  if (
    blob.includes("lifestyle") ||
    detectLifestyleCategory(post)
  ) {
    return { label: "Lifestyle", hrefBase: "/lifestyle" };
  }

  if (
    blob.includes("comunidad") ||
    blob.includes("eventos") ||
    blob.includes("meets") ||
    blob.includes("rutas")
  ) {
    return { label: "Comunidad", hrefBase: "/comunidad" };
  }

  return null;
}

function sanitizePageSettings(
  raw?: any,
  fallbackHero = "/images/comunidad.jpg"
): LifestylePageSettings {
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
          imageUrl: String(item?.imageUrl || ""),
          href: String(item?.href || ""),
        }))
      : [],
  };
}

function sanitizeSectionHeroImages(
  raw?: Partial<SectionHeroImages>
): SectionHeroImages {
  return {
    tuning: String(raw?.tuning || "").trim() || DEFAULT_SECTION_HERO_IMAGES.tuning,
    autos: String(raw?.autos || "").trim() || DEFAULT_SECTION_HERO_IMAGES.autos,
    motos: String(raw?.motos || "").trim() || DEFAULT_SECTION_HERO_IMAGES.motos,
    deportes:
      String(raw?.deportes || "").trim() || DEFAULT_SECTION_HERO_IMAGES.deportes,
    lifestyle:
      String(raw?.lifestyle || "").trim() || DEFAULT_SECTION_HERO_IMAGES.lifestyle,
    comunidad:
      String(raw?.comunidad || "").trim() || DEFAULT_SECTION_HERO_IMAGES.comunidad,
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

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
  accent?: "warm" | "cool" | "lime";
}> = ({ eyebrow, title, description, accent = "warm" }) => {
  const lineClass =
    accent === "cool"
      ? "from-[#0CE0B2] via-[#43A1AD] to-[#E2A24C]"
      : accent === "lime"
      ? "from-[#A3FF12] via-[#0CE0B2] to-[#FF7A1A]"
      : "from-[#FF7A1A] via-[#E2A24C] to-[#0CE0B2]";

  return (
    <div className="mb-8 sm:mb-10">
      <p className="text-[11px] uppercase tracking-[0.24em] text-gray-400">
        {eyebrow}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
        {title}
      </h2>
      <div className={`mt-3 h-1 w-28 rounded-full bg-gradient-to-r ${lineClass}`} />
      {description ? (
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
};

function ArticleCard({
  item,
  compact = false,
}: {
  item: ArticleCardData;
  compact?: boolean;
}) {
  return (
    <article className="group overflow-hidden rounded-[24px] border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md transition hover:border-[#FF7A1A]/45">
      <Link href={item.href} className="block">
        <div className={`relative w-full ${compact ? "h-48" : "h-64"} overflow-hidden`}>
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes={compact ? "(max-width: 1024px) 80vw, 320px" : "(max-width: 1024px) 100vw, 33vw"}
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
            {item.category}
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-gray-400">{item.when}</div>
          <h3 className="mt-2 text-xl font-semibold leading-tight text-white transition group-hover:text-[#FFB36B]">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-gray-300 line-clamp-3">
            {item.excerpt}
          </p>

          <div className="mt-4">
            <span className={getButtonClasses("link")}>Leer más</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

function LatestArticleCard({ item }: { item: LatestArticleData }) {
  return (
    <article className="group h-full overflow-hidden rounded-[22px] border border-mw-line/70 bg-mw-surface/80 backdrop-blur-md transition hover:border-[#0CE0B2]/40">
      <Link href={item.href} className="block h-full">
        <div className="relative h-36 w-full overflow-hidden">
          <Image
            src={item.img}
            alt={item.title}
            fill
            sizes="(max-width: 1024px) 78vw, 260px"
            style={{ objectFit: "cover" }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/18 to-transparent" />

          <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-[#0CE0B2]" />
            {item.sectionLabel}
          </div>
        </div>

        <div className="p-4">
          <div className="text-[11px] text-gray-400">{item.when}</div>
          <h3 className="mt-2 line-clamp-2 text-base font-semibold leading-tight text-white transition group-hover:text-[#0CE0B2]">
            {item.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-300">
            {item.excerpt}
          </p>
        </div>
      </Link>
    </article>
  );
}

function CompactSideItem({ item }: { item: ArticleCardData }) {
  return (
    <Link
      href={item.href}
      className="group grid grid-cols-[112px_1fr] gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-3 transition hover:border-[#FF7A1A]/35 hover:bg-white/[0.055]"
    >
      <div className="relative h-24 overflow-hidden rounded-xl">
        <Image src={item.img} alt={item.title} fill sizes="140px" style={{ objectFit: "cover" }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.16em] text-[#FFB36B]">
          {item.category}
        </p>
        <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-snug text-white transition group-hover:text-[#FFB36B]">
          {item.title}
        </h4>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">
          {item.excerpt}
        </p>
        <p className="mt-2 text-[11px] text-gray-500">{item.when}</p>
      </div>
    </Link>
  );
}

function EmptyCategoryCard({ title }: { title: LifestyleKey }) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/12 bg-mw-surface/60 p-8 text-center backdrop-blur-md">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF7A1A]" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-300">
        Próximamente habrá contenido disponible en esta subsección.
      </p>
    </div>
  );
}

function LifestyleCategoryLayout({
  category,
  items,
}: {
  category: LifestyleKey;
  items: ArticleCardData[];
}) {
  if (!items.length) return <EmptyCategoryCard title={category} />;

  if (category === "Fuera del volante") {
    return (
      <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:px-6">
        <div className="flex snap-x snap-mandatory gap-4">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="w-[78%] min-w-[78%] shrink-0 snap-start sm:w-[320px] sm:min-w-[320px]"
            >
              <ArticleCard item={item} compact />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (category === "Relojería") {
    const mainItem = items[0];
    const sideItems = items.slice(1, 7);

    return (
      <>
        <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,.72fr)]">
          <ArticleCard item={mainItem} />

          <div className="max-h-[560px] overflow-y-auto rounded-[24px] border border-white/10 bg-mw-surface/45 p-3 no-scrollbar">
            <div className="space-y-3">
              {sideItems.length > 0 ? (
                sideItems.map((item) => <CompactSideItem key={item.id} item={item} />)
              ) : (
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-400">
                  Por ahora solo hay una nota en esta categoría.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar lg:hidden">
          <div className="flex snap-x snap-mandatory gap-4">
            {items.slice(0, 8).map((item) => (
              <div
                key={item.id}
                className="w-[84%] min-w-[84%] shrink-0 snap-start sm:w-[360px] sm:min-w-[360px]"
              >
                <ArticleCard item={item} compact />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  const mainItems = items.slice(0, 2);
  const sideItems = items.slice(2, 8);

  return (
    <>
      <div className="hidden gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(360px,.78fr)]">
        <div className="grid gap-6 md:grid-cols-2">
          {mainItems.map((item) => (
            <ArticleCard key={item.id} item={item} compact />
          ))}
        </div>

        <div className="max-h-[560px] overflow-y-auto rounded-[24px] border border-white/10 bg-mw-surface/45 p-3 no-scrollbar">
          <div className="space-y-3">
            {sideItems.length > 0 ? (
              sideItems.map((item) => <CompactSideItem key={item.id} item={item} />)
            ) : (
              <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-gray-400">
                Por ahora solo hay pocas notas en esta categoría.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar lg:hidden">
        <div className="flex snap-x snap-mandatory gap-4">
          {items.slice(0, 8).map((item) => (
            <div
              key={item.id}
              className="w-[84%] min-w-[84%] shrink-0 snap-start sm:w-[360px] sm:min-w-[360px]"
            >
              <ArticleCard item={item} compact />
            </div>
          ))}
        </div>
      </div>
    </>
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
      className="group relative block h-[270px] w-[290px] shrink-0 overflow-hidden rounded-[28px] border border-white/10 bg-black/25 transition hover:border-white/20 sm:w-[340px] lg:h-[290px] lg:w-[390px]"
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
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/28 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.24em] text-white/85 backdrop-blur">
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
          eyebrow="Partners"
          title="Aliados de MotorWelt"
          description="Marcas y colaboradores que conectan con el estilo de vida alrededor del motor."
          accent="lime"
        />

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {partners.map((partner) => {
            const content = (
              <div className="relative h-24 overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70">
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
      <header className="fixed left-0 top-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
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
              <Link href="/tuning" className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white">
                Tuning
              </Link>

              <div className="group relative">
                <button
                  type="button"
                  aria-haspopup="menu"
                  className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white focus:outline-none"
                >
                  Noticias
                  <svg className="ml-2 mt-[1px] opacity-70 group-hover:opacity-100" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>

                <div className="pointer-events-none absolute left-0 top-full z-50 mt-2 translate-y-1 opacity-0 transition duration-150 ease-out group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className="min-w-[180px] rounded-xl border border-mw-line/70 bg-mw-surface/95 p-2 shadow-xl backdrop-blur-md">
                    <Link href="/noticias/autos" className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5">
                      Autos
                    </Link>
                    <Link href="/noticias/motos" className="block rounded-lg px-3 py-2 text-gray-100 hover:bg-white/5">
                      Motos
                    </Link>
                  </div>
                </div>
              </div>

              <Link href="/deportes" className="inline-flex h-10 items-center leading-none text-gray-200 hover:text-white">
                Deportes
              </Link>

              <Link href="/lifestyle" className="inline-flex h-10 items-center leading-none border-b-2 border-[#FF7A1A] text-white">
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
              <Image src="/brand/motorwelt-logo.png" alt="MotorWelt logo" width={140} height={32} className="h-8 w-auto" />
              <button onClick={() => setMobileOpen(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-white/5" aria-label="Cerrar menú">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6l-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <nav className="px-4 py-3">
              <Link href="/tuning" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                Tuning
              </Link>

              <p className="px-3 pb-1 pt-2 text-xs uppercase tracking-wide text-gray-400">
                Noticias
              </p>

              <div className="mt-1 space-y-1 pl-2">
                <Link href="/noticias/autos" className="block rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  Autos
                </Link>
                <Link href="/noticias/motos" className="block rounded-lg px-3 py-2 text-sm text-gray-200 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                  Motos
                </Link>
              </div>

              <Link href="/deportes" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
                Deportes
              </Link>

              <Link href="/lifestyle" className="block w-full rounded-xl px-3 py-3 text-base text-white" onClick={() => setMobileOpen(false)}>
                Lifestyle
              </Link>

              <Link href="/comunidad" className="block w-full rounded-xl px-3 py-3 text-base text-gray-100 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
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
      className={`relative mx-auto w-full overflow-hidden rounded-2xl border border-mw-line/70 bg-mw-surface/70 ${
        isLeaderboard
          ? "w-full min-h-[84px] aspect-[970/120] md:max-w-[1100px] md:min-h-0"
          : "max-w-[1100px] aspect-[970/250]"
      }`}
    >
      {ad.enabled ? (
        ad.imageUrl ? (
          ad.href ? (
            <a href={ad.href} target="_blank" rel="noreferrer" className="block h-full w-full">
              <img src={ad.imageUrl} alt={ad.label} className="h-full w-full object-cover object-center bg-black/20" />
            </a>
          ) : (
            <img src={ad.imageUrl} alt={ad.label} className="h-full w-full object-cover object-center bg-black/20" />
          )
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-gray-400">
            <span className="px-4 text-[11px] sm:text-xs md:text-sm">{ad.label}</span>
          </div>
        )
      ) : (
        editable && (
          <div className="flex h-full w-full items-center justify-center text-center text-gray-500">
            <span className="px-4 text-[11px] sm:text-xs md:text-sm">
              {ad.label} · oculto
            </span>
          </div>
        )
      )}

      {editable && (
        <div className="absolute right-2 top-2 z-20 hidden flex-wrap items-center justify-end gap-2 md:flex">
          <button type="button" onClick={onToggle} className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90">
            {ad.enabled ? "Ocultar" : "Mostrar"}
          </button>
          <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90">
            Imagen
          </button>
          <button type="button" onClick={onEditLink} className="rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90">
            Link
          </button>
          <button type="button" onClick={onClear} className="rounded-full border border-red-400/50 bg-black/70 px-3 py-1 text-[10px] font-semibold text-red-200 backdrop-blur hover:bg-black/90">
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

export default function LifestylePage({
  year,
  lifestyleItems = [],
  latestItems = [],
  initialSettings = DEFAULT_SETTINGS,
  sectionHeroImages = DEFAULT_SECTION_HERO_IMAGES,
}: {
  year: number;
  lifestyleItems?: ArticleCardData[];
  latestItems?: LatestArticleData[];
  initialSettings?: LifestylePageSettings;
  sectionHeroImages?: SectionHeroImages;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<LifestylePageSettings>(
    sanitizePageSettings(initialSettings, initialSettings?.heroImageUrl)
  );

  const heroInputRef = useRef<HTMLInputElement | null>(null);
  const leaderboardInputRef = useRef<HTMLInputElement | null>(null);
  const billboardInputRef = useRef<HTMLInputElement | null>(null);

  const grouped = useMemo(() => {
    return LIFESTYLE_SECTIONS.reduce((acc, category) => {
      acc[category] = lifestyleItems.filter((item) => item.category === category);
      return acc;
    }, {} as Record<LifestyleKey, ArticleCardData[]>);
  }, [lifestyleItems]);

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
      { top: "34%", left: "-31%", v: "cool", dir: "fwd", delay: "2.4s", dur: "13.6s", op: 0.58, h: "1px" },
      { top: "42%", left: "-36%", v: "warm", dir: "rev", delay: "3.0s", dur: "12.2s", op: 0.52, h: "1px" },
      { top: "66%", left: "-29%", v: "cool", dir: "rev", delay: "4.2s", dur: "14.4s", op: 0.55, h: "1px" },
      { top: "82%", left: "-28%", v: "lime", dir: "fwd", delay: "5.3s", dur: "12.4s", op: 0.86, h: "3px" },
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
    let role = readCookie("mw_role");

    if (!role && typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("mw_admin_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          role = parsed?.role || "";
        }
      } catch {}
    }

    setCanEdit(role === "admin" || role === "editor");
  }, []);

  const editControlsVisible = canEdit && !spectatorMode;

  async function persistSettings(nextSettings: LifestylePageSettings) {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/admin/home/save", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageKey: "lifestyle",
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
      await persistSettings({ ...settings, heroImageUrl: uploaded.url });
    } catch (err: any) {
      setError(err?.message || "No se pudo subir la portada.");
    }
  }

  async function handleAdImagePick(kind: AdKind, files?: FileList | null) {
    const file = files?.[0];
    if (!file) return;

    try {
      const uploaded = await uploadAssetToSanity(file);
      await persistSettings({
        ...settings,
        ads: {
          ...settings.ads,
          [kind]: {
            ...settings.ads[kind],
            imageUrl: uploaded.url,
          },
        },
      });
    } catch (err: any) {
      setError(err?.message || "No se pudo subir el anuncio.");
    }
  }

  async function toggleAd(kind: AdKind) {
    await persistSettings({
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          enabled: !settings.ads[kind].enabled,
        },
      },
    });
  }

  async function editAdLink(kind: AdKind) {
    if (typeof window === "undefined") return;
    const current = settings.ads[kind].href || "";
    const href = window.prompt("Pega el link del anuncio:", current);
    if (href === null) return;

    await persistSettings({
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          href: href.trim(),
        },
      },
    });
  }

  async function clearAdImage(kind: AdKind) {
    await persistSettings({
      ...settings,
      ads: {
        ...settings.ads,
        [kind]: {
          ...settings.ads[kind],
          imageUrl: "",
        },
      },
    });
  }

  const heroImage =
    settings.heroImageUrl || lifestyleItems[0]?.img || DEFAULT_SETTINGS.heroImageUrl;

  return (
    <>
      <Seo
        title="Lifestyle | MotorWelt"
        description="Moda, relojería, vida fuera de pista y cine automovilístico en MotorWelt."
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

        {canEdit && (
          <div className="fixed bottom-4 left-4 z-[80] rounded-2xl border border-[#FF7A1A]/40 bg-black/80 px-4 py-3 text-xs text-white backdrop-blur">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#FF7A1A] animate-pulse" />
              <span>{spectatorMode ? "Vista espectador" : "Modo edición lifestyle"}</span>
              {saving && <span className="text-[#FFB36B]">Guardando…</span>}
            </div>
            {error && <div className="mt-1 text-red-300">{error}</div>}
            <button
              type="button"
              onClick={() => setSpectatorMode((v) => !v)}
              className="mt-2 rounded-full border border-white/20 bg-black/70 px-3 py-1 text-[10px] font-semibold text-white backdrop-blur hover:bg-black/90"
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
                src={heroImage}
                alt="Lifestyle | MotorWelt"
                fill
                sizes="100vw"
                style={{ objectFit: "cover", filter: "brightness(.38) saturate(1.14)" }}
                priority
              />

              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(12,224,178,.10),transparent_26%),radial-gradient(circle_at_84%_18%,rgba(255,122,26,.12),transparent_30%),linear-gradient(180deg,rgba(0,0,0,.24)_0%,rgba(0,0,0,.45)_38%,rgba(2,10,10,.88)_100%)]" />
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

              <div className="relative z-10 w-full px-4 pb-14 pt-14 sm:px-6 lg:pb-16 xl:px-10">
                <div className="mx-auto w-full max-w-[1440px] 2xl:max-w-[1560px]">
                  <div className="max-w-4xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 text-[10px] uppercase tracking-[0.28em] text-gray-200 backdrop-blur md:text-[11px]">
                      <span className="h-2 w-2 rounded-full bg-[#FF7A1A]" />
                      Lifestyle • Style • Motor Culture
                    </div>

                    <h1 className="mt-5 font-display text-[2.8rem] font-black leading-[0.92] tracking-[-0.05em] text-white sm:text-[4rem] md:text-[4.8rem] lg:text-[5.4rem]">
                      <span className="glow-warm block">Lifestyle</span>
                      <span className="block text-white/95">Beyond the Drive</span>
                    </h1>

                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-200 sm:text-lg">
                      Moda, relojería, vida fuera de pista y cine automovilístico.
                      La capa más aspiracional, estética y humana del universo MotorWelt.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="py-4 sm:py-6">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <AdSlot
                kind="leaderboard"
                ad={settings.ads.leaderboard}
                editable={editControlsVisible}
                inputRef={leaderboardInputRef}
                onToggle={() => void toggleAd("leaderboard")}
                onPick={(files) => void handleAdImagePick("leaderboard", files)}
                onEditLink={() => void editAdLink("leaderboard")}
                onClear={() => void clearAdImage("leaderboard")}
              />
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <SectionHeader
                eyebrow="Todo Lifestyle"
                title="Moda, Relojería, Fuera del volante y Cine automovilístico"
                description="Una curaduría pensada para hablar de estilo, objetos y cultura sin perder el hilo del mundo motor."
                accent="lime"
              />

              <div className="space-y-14">
                {LIFESTYLE_SECTIONS.map((category) => {
                  const items = grouped[category] || [];
                  const id =
                    category === "Moda"
                      ? "moda"
                      : category === "Relojería"
                      ? "relojeria"
                      : category === "Fuera del volante"
                      ? "fuera-del-volante"
                      : "cine-automovilistico";

                  return (
                    <section key={category} id={id} className="scroll-mt-28">
                      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                            Categoría
                          </p>
                          <h3 className="mt-1 text-3xl font-bold text-white">{category}</h3>
                        </div>

                        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-300">
                          {items.length > 0
                            ? `${items.length} publicación${items.length === 1 ? "" : "es"}`
                            : "Próximamente"}
                        </div>
                      </div>

                      <LifestyleCategoryLayout category={category} items={items} />
                    </section>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-8">
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

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <SectionHeader
                eyebrow="Vistazo general"
                title="Últimas publicaciones"
                description="Lo más reciente publicado en MotorWelt, mezclando todas las secciones conforme se actualiza el sitio."
                accent="cool"
              />

              {latestItems.length > 0 ? (
                <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar sm:-mx-6 sm:px-6 xl:-mx-10 xl:px-10">
                  <div className="flex snap-x snap-mandatory gap-4">
                    {latestItems.map((item) => (
                      <div
                        key={item.id}
                        className="w-[78%] min-w-[78%] snap-start sm:w-[300px] sm:min-w-[300px] lg:w-[280px] lg:min-w-[280px]"
                      >
                        <LatestArticleCard item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-[24px] border border-dashed border-white/12 bg-mw-surface/60 p-8 text-center text-gray-300">
                  Próximamente habrá contenido disponible en MotorWelt.
                </div>
              )}
            </div>
          </section>

          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
              <div className="mb-8 text-center">
                <p className="text-[11px] uppercase tracking-[0.24em] text-[#0CE0B2]">
                  Explora
                </p>

                <h2 className="mt-2 font-display text-3xl font-bold text-white">
                  Seguir explorando MotorWelt
                </h2>
              </div>

              <div className="no-scrollbar overflow-x-auto pb-6">
                <div className="flex items-start gap-5 pr-12">
                  <ExploreCard title="Tuning" subtitle="Builds, mods, aero, stance y cultura visual." href="/tuning" image={sectionHeroImages.tuning} />
                  <ExploreCard title="Autos" subtitle="Nuevos lanzamientos, pruebas y contexto editorial." href="/noticias/autos" image={sectionHeroImages.autos} />
                  <ExploreCard title="Motos" subtitle="Pruebas, rutas y piezas con ADN de dos ruedas." href="/noticias/motos" image={sectionHeroImages.motos} />
                  <ExploreCard title="Deportes" subtitle="Competencia, paddock y piezas con peso visual real." href="/deportes" image={sectionHeroImages.deportes} />
                  <ExploreCard title="Lifestyle" subtitle="La capa aspiracional y estética del universo MotorWelt." href="/lifestyle" image={sectionHeroImages.lifestyle} />
                  <ExploreCard title="Comunidad" subtitle="Eventos, meets, rutas y cultura desde la calle." href="/comunidad" image={sectionHeroImages.comunidad} />
                </div>
              </div>
            </div>
          </section>

          <PartnersRow partners={settings.partnerLogos} />
        </main>

        <footer
          aria-hidden={mobileOpen}
          className="relative z-10 mt-12 border-t border-mw-line/70 bg-mw-surface/70 py-10 text-gray-300 backdrop-blur-md"
        >
          <div className="mx-auto grid w-full max-w-[1440px] gap-8 px-4 sm:px-6 md:grid-cols-3 xl:px-10 2xl:max-w-[1560px]">
            <div>
              <Image src="/brand/motorwelt-logo.png" alt="MotorWelt logo" width={160} height={36} className="logo-glow h-9 w-auto" />
              <p className="mt-2 text-sm">
                Cultura automotriz, motociclismo, tuning y comunidad con enfoque
                visual, editorial y aspiracional.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Links</h4>
              <ul className="mt-2 space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-white">About</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contacto</Link></li>
                <li><Link href="/terminos" className="hover:text-white">Términos y condiciones</Link></li>
                <li><Link href="/privacidad" className="hover:text-white">Política de privacidad</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold text-white">Socials</h4>
              <div className="mt-2 flex gap-4">
                <a href="https://instagram.com/motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">IG</a>
                <a href="https://facebook.com/motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">FB</a>
                <a href="https://tiktok.com/@motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">TikTok</a>
                <a href="https://youtube.com/@motorwelt" target="_blank" rel="noreferrer" className="text-[#43A1AD] hover:text-white">YouTube</a>
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
          0% { transform: translateX(-30%); opacity: 0; }
          10% { opacity: .9; }
          100% { transform: translateX(130%); opacity: 0; }
        }
        @keyframes slide-rev {
          0% { transform: translateX(130%); opacity: 0; }
          10% { opacity: .9; }
          100% { transform: translateX(-30%); opacity: 0; }
        }
        .streak.dir-fwd { animation: slide-fwd 11s linear infinite; }
        .streak.dir-rev { animation: slide-rev 11s linear infinite; }
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
        .logo-glow {
          filter: drop-shadow(0 0 18px rgba(12,224,178,.12));
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

export async function getServerSideProps() {
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const allPostsQuery = `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado"
    ]
    | order(coalesce(publishedAt, _createdAt) desc)[0...160]{
      _id,
      title,
      excerpt,
      subtitle,
      seoDescription,
      slug,
      publishedAt,
      _createdAt,
      section,
      category,
      subcategory,
      categories,
      tags,
      "mainImageUrl": coalesce(
        mainImageUrl,
        coverImage.asset->url,
        mainImage.asset->url,
        heroImage.asset->url,
        image.asset->url,
        galleryUrls[0]
      ),
      "galleryUrls": coalesce(galleryUrls, [])
    }
  `;

  const lifestyleSettingsQuery = `
    *[
      _type in ["sitePageSettings", "pageSettings", "homeSettings"] &&
      (
        pageKey == "lifestyle" ||
        page == "lifestyle" ||
        slug.current == "lifestyle"
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
      "partnerLogos": coalesce(partnerLogos, [])
    }
  `;

  const sectionSettingsQuery = `
    *[
      _type in ["homeSettings", "sitePageSettings", "pageSettings"] &&
      pageKey in ["tuning", "deportes", "lifestyle", "comunidad", "autos", "motos"]
    ]{
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
    lifestyleSettingsRaw,
    sectionSettingsRaw,
    autosFallback,
    motosFallback,
  ] = await Promise.all([
    sanityReadClient.fetch(allPostsQuery).catch(() => []),
    sanityReadClient.fetch(lifestyleSettingsQuery).catch(() => null),
    sanityReadClient.fetch(sectionSettingsQuery).catch(() => []),
    sanityReadClient.fetch(autosFallbackQuery).catch(() => null),
    sanityReadClient.fetch(motosFallbackQuery).catch(() => null),
  ]);

  const rawPosts = Array.isArray(allPostsRaw) ? allPostsRaw : [];

  const lifestyleItems: ArticleCardData[] = rawPosts
    .map((it: RawPost) => {
      const category = detectLifestyleCategory(it);
      if (!category) return null;

      const slug = getSlugValue(it.slug);
      if (!slug) return null;

      return {
        id: String(it._id || slug),
        title: String(it.title || ""),
        excerpt: String(
          it.excerpt ||
            it.subtitle ||
            it.seoDescription ||
            "Lee el artículo completo en MotorWelt."
        ),
        img: getMainImage(it, "/images/comunidad.jpg"),
        href: `/lifestyle/${slug}`,
        when: formatWhen(it.publishedAt || it._createdAt),
        category,
      };
    })
    .filter(Boolean) as ArticleCardData[];

  const latestItems: LatestArticleData[] = rawPosts
    .map((it: RawPost) => {
      const slug = getSlugValue(it.slug);
      if (!slug) return null;

      const sectionData = getLatestSectionData(it);
      if (!sectionData) return null;

      return {
        id: String(it._id || slug),
        title: String(it.title || ""),
        excerpt: String(
          it.excerpt ||
            it.subtitle ||
            it.seoDescription ||
            "Lee la publicación completa en MotorWelt."
        ),
        img: getMainImage(it, "/images/noticia-3.jpg"),
        href: `${sectionData.hrefBase}/${slug}`,
        when: formatWhen(it.publishedAt || it._createdAt),
        sectionLabel: sectionData.label,
      };
    })
    .filter(Boolean)
    .slice(0, 18) as LatestArticleData[];

  const fallbackHero = lifestyleItems[0]?.img || DEFAULT_SETTINGS.heroImageUrl;

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
      lifestyleItems,
      latestItems,
      initialSettings: sanitizePageSettings(lifestyleSettingsRaw, fallbackHero),
      sectionHeroImages,
    },
  };
}