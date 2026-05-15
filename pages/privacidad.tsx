// pages/privacidad.tsx
import React from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import Seo from "../components/Seo";

const PRIVACY = [
  {
    title: "1. Información que recopilamos",
    body: [
      "MotorWelt puede recopilar información cuando navegas dentro del sitio, creas una cuenta, participas en funciones de comunidad, envías formularios de contacto, te suscribes a newsletters o interactúas con contenido patrocinado.",
      "La información recopilada puede incluir nombre, correo electrónico, nombre de usuario, fotografía de perfil, información pública de redes sociales, dirección IP, datos del navegador, preferencias de contenido y actividad dentro del sitio.",
    ],
  },
  {
    title: "2. Uso de la información",
    body: [
      "La información recopilada puede utilizarse para operar y mejorar MotorWelt, personalizar contenido, administrar cuentas, enviar comunicaciones, analizar tráfico y mejorar la experiencia de usuario.",
      "También podremos utilizarla para seguridad, prevención de fraude, desarrollo de funciones futuras y funcionamiento interno de la plataforma.",
    ],
  },
  {
    title: "3. Cookies y tecnologías similares",
    body: [
      "MotorWelt puede utilizar cookies, almacenamiento local y tecnologías similares para recordar preferencias, mantener sesiones activas, analizar comportamiento y mejorar rendimiento.",
      "El usuario puede modificar o bloquear cookies desde su navegador, aunque ciertas funciones podrían verse afectadas.",
    ],
  },
  {
    title: "4. Comunidad y contenido generado por usuarios",
    body: [
      "En futuras funciones comunitarias, los usuarios podrán publicar contenido, perfiles, comentarios, galerías y participar en interacciones dentro de MotorWelt.",
      "Cualquier contenido público publicado por el usuario podrá ser visible para otros usuarios dentro de la plataforma.",
      "MotorWelt podrá moderar, ocultar o eliminar contenido que considere ilegal, ofensivo, fraudulento, dañino o contrario a la comunidad.",
    ],
  },
  {
    title: "5. Compartición de información",
    body: [
      "MotorWelt no vende información personal de usuarios.",
      "Sin embargo, ciertos datos podrán compartirse con proveedores tecnológicos, servicios analíticos, plataformas de mailing, autenticación, almacenamiento, pagos o autoridades competentes cuando exista obligación legal.",
    ],
  },
  {
    title: "6. Servicios de terceros",
    body: [
      "MotorWelt puede integrar herramientas o servicios externos como Google, Meta, Instagram, TikTok, Firebase, AWS, Sanity, Resend y plataformas publicitarias.",
      "Cada servicio externo opera bajo sus propias políticas y condiciones.",
    ],
  },
  {
    title: "7. Seguridad",
    body: [
      "MotorWelt implementa medidas razonables de seguridad para proteger información y evitar accesos no autorizados.",
      "Sin embargo, ningún sistema en internet puede garantizar seguridad absoluta.",
    ],
  },
  {
    title: "8. Derechos del usuario",
    body: [
      "El usuario puede solicitar acceso, modificación, eliminación o restricción del uso de sus datos personales.",
      "También puede cancelar comunicaciones o solicitar eliminación de cuenta cuando dichas funciones estén disponibles.",
    ],
  },
  {
    title: "9. Menores de edad",
    body: [
      "MotorWelt no está dirigido específicamente a menores de edad.",
      "Si un tutor considera que un menor proporcionó información sin consentimiento, podrá solicitar su eliminación.",
    ],
  },
  {
    title: "10. Cambios a esta política",
    body: [
      "MotorWelt podrá modificar esta Política de Privacidad para reflejar cambios legales, técnicos o funcionales.",
      "Las modificaciones entrarán en vigor una vez publicadas dentro del sitio.",
    ],
  },
  {
    title: "11. Contacto",
    body: [
      "Para cualquier duda relacionada con privacidad o manejo de datos puedes contactarnos en contacto@motorwelt.mx o mediante los canales oficiales de MotorWelt.",
    ],
  },
];

export default function PrivacidadPage() {
  const router = useRouter();

  return (
    <>
      <Seo
        title="Política de Privacidad | MotorWelt"
        description="Política de Privacidad oficial de MotorWelt."
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
                Política de Privacidad
              </h1>
              <p className="mt-3 text-sm text-gray-400">
                Última actualización: Mayo 2026
              </p>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-base leading-relaxed text-gray-300">
                En MotorWelt respetamos y protegemos la privacidad de nuestros
                usuarios, lectores, colaboradores y miembros de la comunidad.
                Esta Política de Privacidad explica qué información recopilamos,
                cómo la utilizamos y qué derechos tienes respecto a tus datos.
              </p>

              <p className="text-base leading-relaxed text-gray-300">
                Al utilizar MotorWelt aceptas las prácticas descritas en esta
                política.
              </p>

              <div className="mt-10 grid gap-8">
                {PRIVACY.map((section) => (
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
                href="/docs/politica-de-privacidad-motorwelt.pdf"
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