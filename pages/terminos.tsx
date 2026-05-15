// pages/terminos.tsx
import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Seo from "../components/Seo";

const TERMS = [
  {
    title: "1. Uso del sitio",
    body: [
      "El acceso y uso de MotorWelt tiene fines informativos, editoriales, visuales y comunitarios.",
      "El usuario se compromete a utilizar el sitio de manera legal, respetuosa y conforme a las leyes aplicables en México y cualquier jurisdicción correspondiente.",
      "Queda prohibido utilizar el sitio para actividades ilegales o fraudulentas, intentar vulnerar la seguridad del sitio, copiar contenido sin autorización, publicar contenido ofensivo o utilizar bots, scraping o automatizaciones sin autorización expresa.",
      "MotorWelt podrá restringir, suspender o bloquear accesos que considere abusivos o contrarios al funcionamiento de la plataforma.",
    ],
  },
  {
    title: "2. Propiedad intelectual",
    body: [
      "Todo el contenido presente en MotorWelt, incluyendo logotipos, nombre comercial, diseño visual, fotografías, videos, artículos, gráficos, branding, código, contenido editorial y elementos audiovisuales, pertenece a MotorWelt o a sus respectivos titulares.",
      "Queda prohibida la reproducción total o parcial del contenido sin autorización previa y por escrito.",
      "Las marcas, nombres comerciales y logotipos de terceros utilizados dentro del sitio pertenecen a sus respectivos propietarios y son utilizados únicamente con fines editoriales, informativos o de referencia.",
    ],
  },
  {
    title: "3. Contenido editorial",
    body: [
      "MotorWelt publica contenido relacionado con la industria automotriz, motociclismo, tecnología, entretenimiento, eventos y cultura visual.",
      "Aunque buscamos mantener información precisa y actualizada, MotorWelt no garantiza que todo el contenido sea exacto, completo o libre de errores en todo momento.",
      "Las opiniones expresadas en artículos, entrevistas o colaboraciones pertenecen a sus respectivos autores y no necesariamente representan la postura oficial de MotorWelt.",
    ],
  },
  {
    title: "4. Comunidad y participación de usuarios",
    body: [
      "MotorWelt podrá habilitar en el futuro funciones relacionadas con perfiles de usuario, comunidad, comentarios, publicaciones, marketplace, eventos, interacción entre usuarios y contenido generado por usuarios.",
      "Al utilizar dichas funciones, el usuario acepta mantener una conducta respetuosa y legal.",
      "MotorWelt podrá eliminar contenido, restringir cuentas o limitar funciones cuando considere que existe abuso, spam, fraude, acoso, suplantación de identidad, comportamiento dañino, contenido ilegal o inapropiado.",
      "El usuario conserva los derechos sobre el contenido que publique, pero otorga a MotorWelt una licencia no exclusiva para mostrarlo dentro de la plataforma con fines operativos, promocionales y editoriales.",
    ],
  },
  {
    title: "5. Publicidad, colaboraciones y patrocinios",
    body: [
      "MotorWelt puede incluir contenido patrocinado, colaboraciones comerciales, publicidad, enlaces afiliados, menciones de marcas, cobertura de eventos y préstamos de vehículos o productos.",
      "Cuando corresponda, dichos contenidos podrán identificarse como colaboración, patrocinio o contenido promocional.",
      "La presencia de marcas o productos dentro de MotorWelt no representa necesariamente una recomendación oficial.",
    ],
  },
  {
    title: "6. Enlaces externos",
    body: [
      "El sitio puede contener enlaces hacia plataformas externas como Instagram, YouTube, TikTok, Facebook, marcas automotrices, tiendas y plataformas de terceros.",
      "MotorWelt no controla ni se responsabiliza por el contenido, políticas o funcionamiento de sitios externos.",
      "El acceso a plataformas de terceros es responsabilidad del usuario.",
    ],
  },
  {
    title: "7. Disponibilidad del servicio",
    body: [
      "MotorWelt busca mantener el sitio disponible y funcionando correctamente; sin embargo, no garantiza disponibilidad continua o libre de interrupciones.",
      "Podrán realizarse mantenimientos, actualizaciones, cambios visuales, modificaciones técnicas y ajustes de funcionalidades sin previo aviso.",
    ],
  },
  {
    title: "8. Limitación de responsabilidad",
    body: [
      "El uso del sitio es bajo responsabilidad del usuario.",
      "MotorWelt no será responsable por pérdidas indirectas, interrupciones, daños derivados del uso del sitio, decisiones tomadas con base en contenido publicado, errores técnicos, fallos externos, ataques informáticos o problemas derivados de terceros.",
    ],
  },
  {
    title: "9. Modificaciones a estos términos",
    body: [
      "MotorWelt podrá actualizar o modificar estos Términos y Condiciones en cualquier momento.",
      "Las modificaciones entrarán en vigor una vez publicadas dentro del sitio.",
      "Se recomienda revisar esta sección periódicamente.",
    ],
  },
  {
    title: "10. Jurisdicción",
    body: [
      "Estos Términos y Condiciones se interpretarán conforme a las leyes aplicables en México.",
      "Cualquier controversia relacionada con el uso del sitio será atendida ante las autoridades competentes de la Ciudad de México, salvo disposición legal aplicable distinta.",
    ],
  },
  {
    title: "11. Contacto",
    body: [
      "Para cualquier duda relacionada con estos Términos y Condiciones puedes contactarnos en contacto@motorwelt.mx o mediante los canales oficiales de MotorWelt.",
    ],
  },
];

export default function TerminosPage() {
  const router = useRouter();

  return (
    <>
      <Seo
        title="Términos y Condiciones | MotorWelt"
        description="Términos y Condiciones de uso del sitio MotorWelt."
      />

      <main className="min-h-screen bg-[#041210] px-4 py-10 text-white sm:px-6 lg:px-8">
        <section className="mx-auto max-w-5xl">
          <div className="mb-10 flex justify-center">
            <Image
              src="/brand/motorwelt-logo.png"
              alt="MotorWelt"
              width={260}
              height={80}
              priority
              className="h-auto w-[220px] sm:w-[260px]"
            />
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-black/25 p-6 shadow-[0_20px_80px_rgba(0,0,0,.35)] sm:p-8 lg:p-10">
            <div className="mb-10 text-center">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#0CE0B2]">
                MotorWelt
              </p>
              <h1 className="mt-4 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
                Términos y Condiciones
              </h1>
              <p className="mt-3 text-sm text-gray-400">
                Última actualización: Mayo 2026
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-base leading-relaxed text-gray-300">
                Bienvenido a MotorWelt. Al acceder, navegar o utilizar este
                sitio web, aceptas los presentes Términos y Condiciones. Si no
                estás de acuerdo con cualquiera de estos términos, te
                recomendamos no utilizar el sitio.
              </p>

              <p className="text-base leading-relaxed text-gray-300">
                MotorWelt es una plataforma editorial y visual enfocada en
                cultura automotriz, motociclismo, tuning, motorsport, lifestyle
                y comunidad.
              </p>

              <div className="mt-10 grid gap-8">
                {TERMS.map((section) => (
                  <section key={section.title}>
                    <h2 className="font-display text-xl font-bold tracking-wide text-white">
                      {section.title}
                    </h2>
                    <div className="mt-3 space-y-3">
                      {section.body.map((paragraph, index) => (
                        <p
                          key={index}
                          className="text-sm leading-relaxed text-gray-300 sm:text-[15px]"
                        >
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </div>

            <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-center">
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    router.back();
                  } else {
                    router.push("/");
                  }
                }}
                className="inline-flex items-center justify-center rounded-2xl border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                ← Regresar
              </button>

              <a
                href="/docs/terminos-y-condiciones-motorwelt.pdf"
                download
                className="inline-flex items-center justify-center rounded-2xl border border-white/[0.08] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] transition hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)]"
              >
                Descargar documento
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}