// components/Seo.tsx
import Head from "next/head";

type SeoProps = {
  title?: string;
  description?: string;
  image?: string; // URL absoluta idealmente (o relativa si ya la resuelves)
  url?: string;   // URL absoluta de la página (canonical)
};

export default function Seo({
  title = "MotorWelt",
  description = "MotorWelt",
  image,
  url,
}: SeoProps) {
  const safeTitle = title || "MotorWelt";
  const safeDesc = description || "MotorWelt";

  return (
    <Head>
      <title>{safeTitle}</title>
      <meta name="description" content={safeDesc} />

      {/* Canonical */}
      {url ? <link rel="canonical" href={url} /> : null}

      {/* Open Graph */}
      <meta property="og:site_name" content="MotorWelt" />
      <meta property="og:title" content={safeTitle} />
      <meta property="og:description" content={safeDesc} />
      {url ? <meta property="og:url" content={url} /> : null}
      {image ? <meta property="og:image" content={image} /> : null}
      <meta property="og:type" content="article" />

      {/* Twitter */}
      <meta
        name="twitter:card"
        content={image ? "summary_large_image" : "summary"}
      />
      <meta name="twitter:title" content={safeTitle} />
      <meta name="twitter:description" content={safeDesc} />
      {image ? <meta name="twitter:image" content={image} /> : null}
      <meta name="twitter:site" content="@MotorWelt" />
    </Head>
  );
}
