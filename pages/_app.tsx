// pages/_app.tsx
import "../styles/globals.css";              // ① Asegura Tailwind y estilos globales
import type { AppProps } from "next/app";
import { appWithTranslation } from "next-i18next"; // ② Provee contexto i18n a toda la app
const nextI18NextConfig = require("../next-i18next.config.js");

import GlobalBackground from "../components/GlobalBackground";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      {/* Fondo global en TODAS las páginas */}
      <GlobalBackground />

      {/* Contenido del sitio por encima del fondo */}
      <div className="relative z-[1] min-h-screen">
        <Component {...pageProps} />
      </div>
    </>
  );
}

// Exporta envuelto para que funcionen las traducciones en todas las páginas
export default appWithTranslation(MyApp, nextI18NextConfig);
