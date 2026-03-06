// pages/deportes/[slug].tsx
import { GetServerSideProps } from "next";
import ArticleLayout, { ArticleLayoutProps } from "../../components/ArticleLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

type Props = ArticleLayoutProps;

export default function SportGuidePage(props: Props) {
  return <ArticleLayout {...props} />;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { slug = "" } = ctx.params as { slug: string };

  const mockHtml = `
    <p>Checklist previo a un rally de montaña, con foco en fiabilidad y ritmo.</p>
    <h2>Notas y ritmo</h2>
    <p>Construcción de pacenotes y sincronía piloto-copiloto.</p>
    <h3>Marcadores críticos</h3>
    <p>Cuts, crest y braking points.</p>
    <h2>Setup de suspensión</h2>
    <p>Rebote/compresión y altura para grava suelta.</p>
  `;

  const props: Props = {
    section: "deportes",
    title: "Rally: cómo preparar tu auto para montaña",
    excerpt: "Pacenotes, suspensión y frenos: lo esencial para sobrevivir y ser rápido.",
    coverImage: "/images/noticia-3.jpg",
    author: { name: "Equipo MotorWelt" },
    publishedAt: new Date().toISOString(),
    tags: ["rally", "setup", "montaña"],
    contentHtml: mockHtml,
    related: [
      { title: "Onboard de la semana", href: "/deportes/onboard-semana", img: "/images/noticia-2.jpg" },
      { title: "Qué llantas usar en grava", href: "/deportes/llantas-grava", img: "/images/noticia-1.jpg" },
      { title: "Trackdays: frenos sin fading", href: "/deportes/frenos-trackday", img: "/images/noticia-3.jpg" },
    ],
    canonicalUrl: `https://motorwelt.mx/deportes/${slug}`,
  };

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale ?? "es", ["home"], nextI18NextConfig)),
      ...props,
    },
  };
};
