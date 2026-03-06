// pages/lifestyle/[slug].tsx
import { GetServerSideProps } from "next";
import ArticleLayout, { ArticleLayoutProps } from "../../components/ArticleLayout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

type Props = ArticleLayoutProps;

export default function LifestyleFeaturePage(props: Props) {
  return <ArticleLayout {...props} />;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { slug = "" } = ctx.params as { slug: string };

  const mockHtml = `
    <p>Una cápsula que trae textiles técnicos del pit lane a la calle.</p>
    <h2>Materiales y acabados</h2>
    <p>Ripstop, softshell y cierres termosellados.</p>
    <h3>Detalles de pista</h3>
    <p>Tiradores inspirados en tow hooks y costuras contrastadas.</p>
    <h2>Relojería que acompaña</h2>
    <p>Taquímetros, correas de caucho y lumen para noches en paddock.</p>
  `;

  const props: Props = {
    section: "lifestyle",
    title: "Cápsula street & pista: edición limitada",
    excerpt: "Textiles técnicos, detalles de paddock y un cronógrafo a juego.",
    coverImage: "/images/comunidad.jpg",
    author: { name: "Equipo MotorWelt" },
    publishedAt: new Date().toISOString(),
    tags: ["cápsula", "textiles", "cronógrafo"],
    contentHtml: mockHtml,
    related: [
      { title: "Cronógrafos inspirados en Le Mans", href: "/lifestyle/cronografos-le-mans", img: "/images/noticia-2.jpg" },
      { title: "Accesorios con ADN de paddock", href: "/lifestyle/accesorios-paddock", img: "/images/noticia-3.jpg" },
      { title: "Artistas que pintan velocidad", href: "/lifestyle/arte-velocidad", img: "/images/noticia-1.jpg" },
    ],
    canonicalUrl: `https://motorwelt.mx/lifestyle/${slug}`,
  };

  return {
    props: {
      ...(await serverSideTranslations(ctx.locale ?? "es", ["home"], nextI18NextConfig)),
      ...props,
    },
  };
};
