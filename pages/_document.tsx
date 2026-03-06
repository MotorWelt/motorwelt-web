// pages/_document.tsx
import Document, { Html, Head, Main, NextScript, DocumentContext } from "next/document";

type Props = { locale?: string };

export default class MyDocument extends Document<Props> {
  static async getInitialProps(ctx: DocumentContext) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps, locale: ctx.locale || "es" };
  }

  render() {
    const locale = this.props.locale || "es";
    return (
      <Html lang={locale}>
        <Head>
          {/* Favicons (usa /public/favicon.ico; agrega los otros cuando los tengas) */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="manifest" href="/manifest.webmanifest" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800&family=Oswald:wght@400;600;700&display=swap" rel="stylesheet" />


          {/* PWA / color de la UI del navegador */}
          <meta name="theme-color" content="#FF7645" />
          <meta name="color-scheme" content="light" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
        </Head>
       <body className="bg-mw-bg">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
