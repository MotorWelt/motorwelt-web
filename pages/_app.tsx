// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import Script from "next/script";
import { appWithTranslation } from "next-i18next";
const nextI18NextConfig = require("../next-i18next.config.js");

import GlobalBackground from "../components/GlobalBackground";

const GA_MEASUREMENT_ID = "G-D12X1MB13Z";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>

      <GlobalBackground />

      <div className="relative z-[1] min-h-screen">
        <Component {...pageProps} />
      </div>
    </>
  );
}

export default appWithTranslation(MyApp, nextI18NextConfig);