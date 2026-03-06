import React from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Seo from "../../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { sanityClient, urlFor } from "../../../lib/sanity.client";
import {
  LISTING_BY_SLUG_QUERY,
  LISTING_SLUGS_BY_TYPE_QUERY,
} from "../../../lib/sanity.queries";

const nextI18NextConfig = require("../../../next-i18next.config.js");

type Listing = {
  _id: string;
  type: "auto" | "moto";
  title: string;
  subtitle?: string;
  slug: string;
  year?: number;
  price?: string;
  km?: string;
  location?: string;
  status: "disponible" | "reservado" | "vendido";
  tags?: string[];
  specs?: string;
  gallery?: any[];
};

type Props = { listing: Listing };

export default function AutoSlugPage({ listing }: Props) {
  return (
    <>
      <Seo
        title={`${listing.title} | MotorWelt Market`}
        description={listing.subtitle || "Detalle de auto en MotorWelt Market."}
      />

      <main className="min-h-screen bg-[#050608] text-neutral-100 pt-20 pb-16">
        <div className="mx-auto max-w-5xl px-4 space-y-8">
          <nav className="text-[11px] text-neutral-400">
            <ol className="flex items-center gap-1">
              <li>
                <Link href="/market" className="hover:text-neutral-200">
                  Market
                </Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/market/autos" className="hover:text-neutral-200">
                  Autos
                </Link>
              </li>
              <li>/</li>
              <li className="text-neutral-300">Detalle</li>
            </ol>
          </nav>

          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
              Auto seleccionado
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
              {listing.title}
            </h1>
            {listing.subtitle && (
              <p className="text-sm text-neutral-400 max-w-2xl">
                {listing.subtitle}
              </p>
            )}
          </header>

          <section className="grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-4">
              <div className="aspect-video rounded-2xl border border-neutral-800 overflow-hidden bg-neutral-950/40">
                {listing.gallery?.[0] ? (
                  // primera imagen como hero
                  // (cuando quieras: carrusel)
                  <img
                    src={urlFor(listing.gallery[0]).width(1400).height(788).url()}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-neutral-500">
                    Sin imágenes aún
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 space-y-2 text-sm">
                <p className="font-semibold text-neutral-100">Ficha técnica</p>
                <p className="text-neutral-400">
                  {listing.specs || "Próximamente: ficha técnica completa."}
                </p>
              </div>
            </div>

            <aside className="space-y-4">
              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm space-y-1">
                <p className="font-semibold text-neutral-100">Datos</p>
                <p className="text-neutral-400">
                  {listing.year ? `${listing.year}` : "—"} ·{" "}
                  {listing.km || "—"} · {listing.location || "—"}
                </p>
                <p className="mt-2 text-xl font-semibold text-cyan-300">
                  {listing.price || "Precio por definir"}
                </p>
                <p className="text-[11px] text-neutral-500">
                  Estatus: {listing.status}
                </p>
              </div>

              <div className="rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 text-sm">
                <p className="font-semibold text-neutral-100">Contacto</p>
                <p className="mt-2 text-neutral-400">
                  Aquí conectaremos WhatsApp / correo / formulario interno.
                </p>
              </div>
            </aside>
          </section>

          <div>
            <Link
              href="/market/autos"
              className="text-xs text-neutral-400 hover:text-cyan-300"
            >
              ← Volver a autos
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const slugs: { slug: string }[] = await sanityClient.fetch(
    LISTING_SLUGS_BY_TYPE_QUERY,
    { type: "auto" }
  );

  return {
    paths: slugs.map((s) => ({ params: { slug: s.slug } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug as string;

  const listing: Listing | null = await sanityClient.fetch(
    LISTING_BY_SLUG_QUERY,
    { type: "auto", slug }
  );

  if (!listing) return { notFound: true };

  return {
    props: {
      listing,
      ...(await serverSideTranslations(
        locale || "es",
        ["home"],
        nextI18NextConfig
      )),
    },
    revalidate: 60,
  };
};
