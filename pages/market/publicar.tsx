// pages/market/publicar.tsx
import React, { useState } from "react";
import Link from "next/link";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

type Variant = "cyan" | "pink" | "ghost";

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";
  const map: Record<Variant, string> = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus-visible:ring-[#0CE0B2]/40",
    pink:
      "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus-visible:ring-[#FF7A1A]/40",
    ghost:
      "text-gray-200 border border-white/15 hover:border-white/35 hover:bg-white/5 focus-visible:ring-[#FF7A1A]/40",
  };
  return (
    <button {...props} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </button>
  );
};

const PublishVehiclePage: React.FC = () => {
  const [type, setType] = useState<"auto" | "moto">("auto");

  return (
    <>
      <Seo
        title="Publicar vehículo | MotorWelt Market"
        description="Publica tu auto o moto en MotorWelt Market. Próximamente con revisión curada, estimación de precio con IA y planes premium."
      />

      <main className="min-h-screen bg-mw-surface/95 pt-20 pb-16">
        <div className="mx-auto w-full max-w-[900px] px-4 sm:px-6 lg:px-8">
          <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <nav
                aria-label="Breadcrumb"
                className="text-[11px] text-gray-400 mb-1"
              >
                <ol className="flex items-center gap-1">
                  <li>
                    <Link href="/market" className="hover:text-gray-200">
                      MotorWelt Market
                    </Link>
                  </li>
                  <li className="text-gray-500">/</li>
                  <li className="text-gray-300">Publicar vehículo</li>
                </ol>
              </nav>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
                Publicar mi {type === "auto" ? "auto" : "moto"}
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-xl">
                Este formulario aún es un demo visual. Más adelante se conectará
                a la base de datos, sistema de pagos y revisión editorial antes
                de publicar.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Button
                type="button"
                variant={type === "auto" ? "cyan" : "ghost"}
                className="text-xs"
                onClick={() => setType("auto")}
              >
                Auto
              </Button>
              <Button
                type="button"
                variant={type === "moto" ? "pink" : "ghost"}
                className="text-xs"
                onClick={() => setType("moto")}
              >
                Moto
              </Button>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-6">
            {/* Datos principales */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Datos principales del vehículo
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Marca</label>
                  <input
                    placeholder="Ej. BMW, Porsche, Ducati"
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Modelo</label>
                  <input
                    placeholder="Ej. M2, 911 GT3 RS, R nineT..."
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Año</label>
                  <input
                    type="number"
                    placeholder="Ej. 2020"
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Kilometraje</label>
                  <input
                    placeholder="Ej. 24,000 km"
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">Precio deseado</label>
                  <input
                    placeholder="Ej. $1,380,000 MXN"
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
              </div>
            </div>

            {/* Descripción / mods */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">
                Descripción y modificaciones
              </h2>
              <textarea
                rows={6}
                placeholder={`Cuenta la historia de tu ${
                  type === "auto" ? "auto" : "moto"
                }: uso, mantenimiento, modificaciones, por qué lo vendes.\n\nMás adelante este texto podrá ser optimizado con IA para hacerlo más claro y atractivo sin prometer cosas que no son.`}
                className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
              />
              <p className="text-[11px] text-gray-500">
                Tu tono puede ser honesto y directo. La idea es que MotorWelt
                Market se perciba como un espacio serio y transparente.
              </p>
            </div>

            {/* Contacto y ubicación */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Contacto y ubicación
              </h2>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">
                    Nombre del vendedor
                  </label>
                  <input
                    placeholder="Ej. Gabriel Rodríguez"
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-300">
                    Correo de contacto
                  </label>
                  <input
                    type="email"
                    placeholder="Ej. hola@motorwelt.com"
                    className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-300">
                  Ciudad / Estado
                </label>
                <input
                  placeholder="Ej. CDMX, Monterrey, Guadalajara..."
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                />
              </div>
            </div>

            {/* Planes (demo) */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-white">
                Plan de publicación (demo)
              </h2>
              <div className="grid gap-3 md:grid-cols-3 text-xs text-gray-200">
                <div className="rounded-2xl border border-white/15 bg-black/40 p-3">
                  <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.18em]">
                    Básico
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Gratis (demo)
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-gray-400">
                    <li>• Publicación estándar</li>
                    <li>• Sin revisión curada</li>
                    <li>• Sin impulso destacado</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-[#0CE0B2]/50 bg-black/50 p-3 shadow-[0_0_26px_rgba(12,224,178,.35)]">
                  <p className="text-[11px] font-semibold text-[#0CE0B2] uppercase tracking-[0.18em]">
                    MotorWelt Approved
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Próximamente
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-gray-300">
                    <li>• Revisión editorial previa</li>
                    <li>• Sello MotorWelt Approved</li>
                    <li>• Mayor exposición en portada</li>
                  </ul>
                </div>
                <div className="rounded-2xl border border-white/15 bg-black/40 p-3">
                  <p className="text-[11px] font-semibold text-gray-300 uppercase tracking-[0.18em]">
                    Pro
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    Próximamente
                  </p>
                  <ul className="mt-2 space-y-1 text-[11px] text-gray-400">
                    <li>• Integración con contenido editorial</li>
                    <li>• Cobertura foto/video opcional</li>
                    <li>• Estrategia de venta personalizada</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA final */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/10 mt-4">
              <p className="text-[11px] text-gray-500 max-w-sm">
                Por ahora este formulario es una maqueta funcional. Cuando
                tengamos Sanity y el backend listos, podremos guardar estos datos,
                cobrar el fee de publicación y enviarlos a revisión interna.
              </p>
              <Button
                variant="cyan"
                type="button"
                className="text-xs"
                onClick={() => {
                  alert(
                    "Demo visual: más adelante aquí validaremos los datos y enviaremos el anuncio a revisión."
                  );
                }}
              >
                Enviar anuncio (demo)
              </Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default PublishVehiclePage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig
      )),
    },
  };
}
