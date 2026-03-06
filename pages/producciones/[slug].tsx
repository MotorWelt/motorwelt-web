// pages/producciones/[slug].tsx
import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Seo from "../../components/Seo";
import { GetServerSideProps } from "next";
import { productions, Production } from "../../data/productions";

type Variant = "cyan" | "pink" | "link";
const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }> = ({
  className = "", children, variant = "cyan", ...props
}) => {
  const base = "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition focus:outline-none";
  const map: Record<Variant, string> = {
    cyan: "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus:ring-2 focus:ring-[#0CE0B2]/40",
    pink: "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus:ring-2 focus:ring-[#FF7A1A]/40",
    link: "p-0 text-[#43A1AD] underline underline-offset-4 hover:opacity-80 focus:ring-0",
  };
  return <button {...props} className={`${base} ${map[variant]} ${className}`}>{children}</button>;
};

export default function ProductionPage({ item }: { item: Production }) {
  // JSON-LD VideoObject si hay teaser
  const videoJsonLd = useMemo(() => {
    if (!item.teaserUrl) return null;
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: item.title,
      description: item.summary,
      thumbnailUrl: [item.cover],
      uploadDate: item.publishDate,
      contentUrl: item.teaserUrl,
      embedUrl: item.teaserUrl,
      duration: `PT${item.duration.replace(":", "M")}S`, // aproximación rápida
    };
  }, [item]);

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(url);
      alert("Enlace copiado ✅");
    } catch {
      alert(`Copia este enlace:\n${url}`);
    }
  };

  return (
    <>
      <Seo title={`${item.title} | Producciones`} description={item.summary} />

      {videoJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
      )}

      <header className="fixed top-0 left-0 z-50 w-full border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
        <div className="mx-auto h-16 w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Ir al inicio">
            <Image src="/brand/motorwelt-logo.png" alt="MotorWelt logo" width={200} height={52} priority className="h-10 w-auto" />
          </Link>
          <Link href="/producciones" className="inline-flex">
            <Button variant="link">← Volver al catálogo</Button>
          </Link>
        </div>
      </header>

      <main className="mt-16">
        {/* Hero visual */}
        <section className="relative h-[46vh] min-h-[320px] overflow-hidden">
          <Image src={item.cover} alt={item.title} fill sizes="100vw" style={{ objectFit: "cover", filter: "brightness(.55) saturate(1.1)" }} priority />
          <div className="absolute inset-0">
            <div className="absolute -left-16 -bottom-24 h-96 w-96 rounded-full bg-[#0CE0B2]/20 blur-3xl" />
            <div className="absolute -right-16 -top-24 h-96 w-96 rounded-full bg-[#FF7A1A]/20 blur-3xl" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-10">
            <span className="inline-block rounded-full border border-white/30 bg-black/40 px-3 py-1 text-xs text-white/90 backdrop-blur-md">
              {item.category} • {item.duration}
            </span>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold text-white">{item.title}</h1>
            <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-200">{item.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {item.teaserUrl ? (
                <a href={item.teaserUrl} className="inline-flex" target="_blank" rel="noreferrer">
                  <Button variant="cyan">Reproducir teaser</Button>
                </a>
              ) : (
                <Button variant="cyan" type="button" disabled>Sin teaser</Button>
              )}
              <Button variant="link" type="button" onClick={share}>Compartir</Button>
              {item.presskit && (
                <a href={item.presskit} download className="inline-flex">
                  <Button variant="link">Press kit</Button>
                </a>
              )}
            </div>
          </div>
        </section>

        {/* Cuerpo simple (puedes enriquecerlo luego) */}
        <section className="mx-auto w-full max-w-[1200px] px-4 py-10 sm:px-6 lg:px-8">
          <h2 className="text-white text-xl font-semibold">Notas de producción</h2>
          <p className="mt-2 text-gray-300">
            Fecha de publicación: {new Date(item.publishDate).toLocaleDateString()}
          </p>
          {!!item.tags?.length && (
            <p className="mt-2 text-gray-400 text-sm">
              Tags: {item.tags.join(" · ")}
            </p>
          )}
        </section>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = String(params?.slug || "");
  const item = productions.find((p) => p.slug === slug);
  if (!item) {
    return { notFound: true };
  }
  return { props: { item } };
};
