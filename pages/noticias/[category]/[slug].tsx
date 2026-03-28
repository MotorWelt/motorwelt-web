// pages/noticias/[category]/[slug].tsx
import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../../components/Seo";
import { sanityReadClient } from "../../../lib/sanityClient";
import GalleryGrid from "../../../components/GalleryGrid";

type Category = "autos" | "motos";

type PortableTextSpan = {
  _type?: "span";
  text?: string;
};

type PortableTextBlock = {
  _type?: "block";
  style?: string;
  children?: PortableTextSpan[];
};

type Article = {
  _id: string;
  _type?: string;
  title: string;
  subtitle?: string;
  section?: string;
  category?: string | null;
  categories?: string[] | null;
  slug?: { current?: string } | string | null;

  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  authorName?: string | null;
  authorEmail?: string | null;

  tags?: string[] | null;

  mainImageUrl?: string | null;
  legacyImageUrl?: string | null;
  galleryUrls?: string[] | null;

  body?: string | PortableTextBlock[] | null;
  excerpt?: string | null;
};

type Suggested = {
  _id: string;
  title: string;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  slug?: { current?: string } | string | null;
  mainImageUrl?: string | null;
  legacyImageUrl?: string | null;
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function prettyCategory(cat: Category) {
  return cat === "autos" ? "Autos" : "Motos";
}

function portableTextToPlainText(body?: string | PortableTextBlock[] | null) {
  if (!body) return "";

  if (typeof body === "string") {
    return body.trim();
  }

  if (!Array.isArray(body)) return "";

  return body
    .map((block) => {
      if (block?._type !== "block" || !Array.isArray(block.children)) return "";
      return block.children.map((child) => child?.text || "").join("");
    })
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

function readingTimeLabel(body?: string | PortableTextBlock[] | null) {
  const raw = portableTextToPlainText(body);
  if (!raw) return "";
  const words = raw.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} min lectura`;
}

function getEmbedUrl(url?: string | null) {
  const raw = (url || "").trim();
  if (!raw) return "";

  const yt =
    raw.match(/youtube\.com\/watch\?v=([^&]+)/)?.[1] ||
    raw.match(/youtu\.be\/([^?&/]+)/)?.[1] ||
    raw.match(/youtube\.com\/shorts\/([^?&/]+)/)?.[1];

  if (yt) {
    return `https://www.youtube-nocookie.com/embed/${yt}?rel=0&modestbranding=1`;
  }

  const vimeo = raw.match(/vimeo\.com\/(\d+)/)?.[1];
  if (vimeo) return `https://player.vimeo.com/video/${vimeo}`;

  if (raw.includes("/embed/")) return raw;

  return "";
}

type BodyBlock =
  | { type: "h2" | "h3" | "h4" | "h5"; text: string }
  | { type: "p"; text: string }
  | { type: "img"; alt: string; src: string }
  | { type: "video"; src: string };

function parseBodyToBlocks(body?: string | PortableTextBlock[] | null): BodyBlock[] {
  const textBody = portableTextToPlainText(body);
  const raw = textBody.replace(/\r\n/g, "\n");
  const lines = raw.split("\n");

  const blocks: BodyBlock[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    const text = paragraph.join(" ").trim().replace(/\s+/g, " ");
    if (text) blocks.push({ type: "p", text });
    paragraph = [];
  };

  for (const ln of lines) {
    const line = ln.trim();

    if (!line) {
      flushParagraph();
      continue;
    }

    const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imgMatch) {
      flushParagraph();
      const alt = (imgMatch[1] || "imagen").trim();
      const src = (imgMatch[2] || "").trim();
      if (src) blocks.push({ type: "img", alt, src });
      continue;
    }

    const vidMatch = line.match(/^@\[(video)\]\((.*?)\)$/i);
    if (vidMatch) {
      flushParagraph();
      const rawUrl = (vidMatch[2] || "").trim();
      const embed = getEmbedUrl(rawUrl);
      if (embed) blocks.push({ type: "video", src: embed });
      continue;
    }

    const hMatch = line.match(/^(#{2,5})\s+(.+)$/);
    if (hMatch) {
      flushParagraph();
      const level = hMatch[1].length;
      const text = (hMatch[2] || "").trim();
      if (level === 2) blocks.push({ type: "h2", text });
      else if (level === 3) blocks.push({ type: "h3", text });
      else if (level === 4) blocks.push({ type: "h4", text });
      else blocks.push({ type: "h5", text });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}

function getSlugCurrent(slug?: Article["slug"] | Suggested["slug"]) {
  if (!slug) return "";
  if (typeof slug === "string") return slug;
  return slug?.current || "";
}

export default function NewsDetailPage({
  category,
  article,
  suggested,
}: {
  category: Category;
  article: Article;
  suggested: Suggested[];
}) {
  const catLabel = prettyCategory(category);

  const title = article?.title || "Noticia";
  const subtitle = article?.subtitle || article?.excerpt || "";
  const author = (article?.authorName || "").trim() || "MotorWelt";

  const dateISO =
    article?.publishedAt || article?.createdAt || article?.updatedAt;
  const dateLabel = formatDate(dateISO);

  const heroImg =
    article?.mainImageUrl ||
    article?.legacyImageUrl ||
    (category === "autos" ? "/images/noticia-2.jpg" : "/images/noticia-3.jpg");

  const readLabel = useMemo(() => readingTimeLabel(article?.body), [article?.body]);
  const blocks = useMemo(() => parseBodyToBlocks(article?.body), [article?.body]);

  return (
    <>
      <Seo
        title={`${title} | MotorWelt`}
        description={subtitle || `Noticias ${catLabel} en MotorWelt.`}
        image={heroImg}
      />

      <section className="relative overflow-hidden">
        <div className="relative h-[58vh] min-h-[420px] w-full">
          <Image
            src={heroImg}
            alt={title}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", filter: "brightness(.55) saturate(1.08)" }}
            unoptimized
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(0,0,0,0.55),transparent_55%)]" />

          <div className="absolute inset-0 flex items-end">
            <div className="mx-auto w-full max-w-[1200px] px-4 pb-10 sm:px-6 lg:px-8">
              <nav className="text-sm text-gray-200/90" aria-label="breadcrumb">
                <ol className="flex flex-wrap items-center gap-2">
                  <li className="flex items-center gap-2">
                    <Link href="/" className="hover:text-white">
                      Inicio
                    </Link>
                    <span className="opacity-60">›</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Link href={`/noticias/${category}`} className="hover:text-white">
                      Noticias {catLabel}
                    </Link>
                    <span className="opacity-60">›</span>
                  </li>
                  <li className="text-white/95">{title}</li>
                </ol>
              </nav>

              <h1 className="mt-3 font-display text-5xl font-extrabold tracking-wide text-white md:text-6xl">
                {title}
              </h1>

              {subtitle ? (
                <p className="mt-2 max-w-3xl text-lg text-gray-100/90">{subtitle}</p>
              ) : null}

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-200/85">
                <span>
                  Por <span className="text-white">{author}</span>
                </span>
                {dateLabel ? <span className="opacity-70">•</span> : null}
                {dateLabel ? <span>Actualizado: {dateLabel}</span> : null}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                  {catLabel}
                </span>
                <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
                  noticia
                </span>
                {dateLabel ? (
                  <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
                    {dateLabel}
                  </span>
                ) : null}
                {readLabel ? (
                  <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs text-white/80 backdrop-blur-md">
                    {readLabel}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <article className="rounded-3xl border border-mw-line/70 bg-mw-surface/70 p-6 backdrop-blur-md md:p-8">
            {blocks.length > 0 ? (
              <div className="prose prose-invert max-w-none prose-p:text-gray-200 prose-headings:text-white">
                {blocks.map((b, idx) => {
                  if (b.type === "h2") {
                    return (
                      <h2
                        key={`h2-${idx}`}
                        className="mt-10 text-2xl font-extrabold tracking-wide md:text-3xl"
                      >
                        {b.text}
                      </h2>
                    );
                  }

                  if (b.type === "h3") {
                    return (
                      <h3 key={`h3-${idx}`} className="mt-8 text-xl font-bold md:text-2xl">
                        {b.text}
                      </h3>
                    );
                  }

                  if (b.type === "h4") {
                    return (
                      <h4
                        key={`h4-${idx}`}
                        className="mt-6 text-lg font-semibold text-white/95 md:text-xl"
                      >
                        {b.text}
                      </h4>
                    );
                  }

                  if (b.type === "h5") {
                    return (
                      <h5
                        key={`h5-${idx}`}
                        className="mt-5 text-base font-semibold text-white/90 md:text-lg"
                      >
                        {b.text}
                      </h5>
                    );
                  }

                  if (b.type === "img") {
                    return (
                      <figure key={`img-${idx}`} className="my-6">
                        <img
                          src={b.src}
                          alt={b.alt}
                          loading="lazy"
                          className="w-full rounded-2xl border border-white/10 bg-black/20"
                        />
                        {b.alt ? (
                          <figcaption className="mt-2 text-xs text-gray-400">
                            {b.alt}
                          </figcaption>
                        ) : null}
                      </figure>
                    );
                  }

                  if (b.type === "video") {
                    return (
                      <div key={`video-${idx}`} className="my-6 not-prose">
                        <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black/30">
                          <iframe
                            src={b.src}
                            title={`Video ${idx + 1}`}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <p key={`p-${idx}`} className="text-gray-200">
                      {b.text}
                    </p>
                  );
                })}

                {Array.isArray(article?.tags) && article.tags.length > 0 ? (
                  <div className="mt-10 not-prose">
                    <div className="mb-3 text-xs uppercase tracking-widest text-gray-300/80">
                      Tags
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/80"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {Array.isArray(article?.galleryUrls) && article.galleryUrls.length > 0 ? (
                  <div className="mt-10 not-prose">
                    <div className="mb-3 text-xs uppercase tracking-widest text-gray-300/80">
                      Galería
                    </div>
                    <GalleryGrid urls={article.galleryUrls} maxPerRow={6} />
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-gray-300">Contenido pendiente.</p>
            )}
          </article>

          <aside className="space-y-6">
            {Array.isArray(suggested) && suggested.length > 0 ? (
              <div className="rounded-3xl border border-mw-line/70 bg-mw-surface/70 p-6 backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-white">Sugeridas</h3>
                  <span className="text-xs text-gray-300/80">Sigue explorando</span>
                </div>

                <div className="mt-4 space-y-3">
                  {suggested.map((s) => {
                    const sSlug = getSlugCurrent(s.slug);
                    const href = `/noticias/${category}/${sSlug || ""}`;
                    const sDateISO = s.publishedAt || s.createdAt || s.updatedAt;
                    const sDate = formatDate(sDateISO);
                    const img =
                      s.mainImageUrl ||
                      s.legacyImageUrl ||
                      (category === "autos"
                        ? "/images/noticia-2.jpg"
                        : "/images/noticia-3.jpg");

                    return (
                      <Link
                        key={s._id}
                        href={href}
                        className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 transition hover:bg-white/5"
                      >
                        <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-white/10">
                          <Image
                            src={img}
                            alt={s.title}
                            fill
                            sizes="64px"
                            style={{ objectFit: "cover" }}
                            unoptimized
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white group-hover:text-white/95">
                            {s.title}
                          </p>
                          {sDate ? (
                            <p className="mt-1 text-xs text-gray-300/80">{sDate}</p>
                          ) : (
                            <p className="mt-1 text-xs text-gray-300/60">—</p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="rounded-3xl border border-mw-line/70 bg-mw-surface/70 p-6 backdrop-blur-md">
              <h3 className="text-lg font-semibold text-white">Explora</h3>
              <div className="mt-4 space-y-2 text-gray-200">
                <Link className="block hover:text-white" href="/noticias/autos">
                  Noticias Autos
                </Link>
                <Link className="block hover:text-white" href="/noticias/motos">
                  Noticias Motos
                </Link>
                <Link className="block hover:text-white" href="/deportes">
                  Deportes
                </Link>
                <Link className="block hover:text-white" href="/lifestyle">
                  Lifestyle
                </Link>
                <Link className="block hover:text-white" href="/comunidad">
                  Comunidad
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-mw-line/70 bg-mw-surface/70 p-6 text-gray-300 backdrop-blur-md">
              <div className="text-xs opacity-80">Publicidad</div>
              <div className="mt-3 flex h-28 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                Slot 300×250
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const categoryParam = (params?.category || "autos").toLowerCase();
  const category: Category = categoryParam === "motos" ? "motos" : "autos";
  const slug = (params?.slug || "").toLowerCase();

  const section = category === "autos" ? "noticias_autos" : "noticias_motos";

  const query = `
    *[
      _type in ["article", "post"] &&
      defined(slug.current) &&
      slug.current == $slug &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == $section ||
        lower(category) == $category ||
        $category in categories[]
      )
    ][0]{
      _id,
      _type,
      title,
      subtitle,
      excerpt,
      section,
      category,
      categories,
      slug,
      publishedAt,
      "createdAt": _createdAt,
      updatedAt,
      authorName,
      authorEmail,
      tags,
      "mainImageUrl": coalesce(mainImageUrl, coverImage.asset->url),
      legacyImageUrl,
      galleryUrls,
      body
    }
  `;

  const article = await sanityReadClient.fetch(query, {
    section,
    category,
    slug,
  });

  if (!article?._id) {
    return { notFound: true };
  }

  const suggestedQuery = `
    *[
      _type in ["article", "post"] &&
      _id != $currentId &&
      defined(slug.current) &&
      coalesce(status, "publicado") == "publicado" &&
      (
        section == $section ||
        lower(category) == $category ||
        $category in categories[]
      )
    ]
    | order(coalesce(publishedAt, updatedAt, _createdAt) desc)[0...6]{
      _id,
      _type,
      title,
      slug,
      publishedAt,
      "createdAt": _createdAt,
      updatedAt,
      "mainImageUrl": coalesce(mainImageUrl, coverImage.asset->url),
      legacyImageUrl
    }
  `;

  const suggested = await sanityReadClient.fetch(suggestedQuery, {
    section,
    category,
    currentId: article._id,
  });

  return {
    props: {
      category,
      article,
      suggested: suggested || [],
    },
  };
}