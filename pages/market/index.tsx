// pages/market/index.tsx
import React from "react";
import Link from "next/link";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

/* ---------- Botón estilo MotorWelt (sobrio) ---------- */
type Variant = "primary" | "secondary" | "ghost";

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
> = ({ className = "", children, variant = "primary", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";
  const map: Record<Variant, string> = {
    primary:
      "text-black bg-[#0CE0B2] border border-[#0CE0B2] hover:bg-[#11f0c0] hover:border-[#11f0c0] focus-visible:ring-[#0CE0B2]/40",
    secondary:
      "text-white border border-white/20 bg-white/5 hover:bg-white/10 focus-visible:ring-white/30",
    ghost:
      "text-gray-200 border border-transparent hover:border-white/20 hover:bg-white/5 focus-visible:ring-white/20",
  };

  return (
    <button {...props} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </button>
  );
};

/* ---------- Tipos y datos demo ---------- */

type VehicleType = "auto" | "moto";

type Vehicle = {
  id: number;
  title: string;
  subtitle?: string;
  type: VehicleType;
  year: number;
  price: string;
  location: string;
  status: "disponible" | "reservado" | "vendido";
  highlight?: "coleccionable" | "track" | "rareza" | "daily";
  imageUrl: string;
};

const featuredVehicles: Vehicle[] = [
  {
    id: 1,
    title: "Porsche 911 GT3 (992)",
    subtitle: "Especificación pista · Bajo kilometraje",
    type: "auto",
    year: 2023,
    price: "MXN 6,950,000",
    location: "CDMX, México",
    status: "disponible",
    highlight: "track",
    imageUrl: "/images/market/demo-gt3.jpg", // luego sustituyes por fotos reales
  },
  {
    id: 2,
    title: "BMW M2 (G87) Individual",
    subtitle: "Paquete carbono · Configuración entusiasta",
    type: "auto",
    year: 2024,
    price: "MXN 1,890,000",
    location: "Guadalajara, Jal.",
    status: "disponible",
    highlight: "daily",
    imageUrl: "/images/market/demo-m2.jpg",
  },
  {
    id: 3,
    title: "Nissan GT-R R35 Track Edition",
    subtitle: "Preparación ligera · Stage 1",
    type: "auto",
    year: 2018,
    price: "USD 145,000",
    location: "Monterrey, N.L.",
    status: "reservado",
    highlight: "rareza",
    imageUrl: "/images/market/demo-gtr.jpg",
  },
  {
    id: 4,
    title: "BMW R nineT Custom",
    subtitle: "Proyecto café racer curado",
    type: "moto",
    year: 2021,
    price: "MXN 420,000",
    location: "CDMX, México",
    status: "disponible",
    highlight: "coleccionable",
    imageUrl: "/images/market/demo-rninet.jpg",
  },
];

function StatusPill({ status }: { status: Vehicle["status"] }) {
  const map: Record<Vehicle["status"], string> = {
    disponible: "bg-emerald-500/10 text-emerald-300",
    reservado: "bg-amber-500/10 text-amber-300",
    vendido: "bg-red-500/10 text-red-300",
  };
  const label: Record<Vehicle["status"], string> = {
    disponible: "Disponible",
    reservado: "Reservado",
    vendido: "Vendido",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}

function HighlightPill({
  highlight,
  type,
}: {
  highlight?: Vehicle["highlight"];
  type: Vehicle["type"];
}) {
  if (!highlight) return null;

  const text =
    highlight === "coleccionable"
      ? "Coleccionable"
      : highlight === "track"
      ? "Track-ready"
      : highlight === "rareza"
      ? "Rareza"
      : "Daily especial";

  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-black/40 px-2.5 py-0.5 text-[11px] font-medium text-gray-200">
      <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-[#0CE0B2]" />
      {type === "moto" ? "Moto" : "Auto"} · {text}
    </span>
  );
}

/* ============================================================================= */

const MarketIndexPage: React.FC = () => {
  return (
    <>
      <Seo
        title="MotorWelt Market | Autos y motos seleccionadas"
        description="Compra-venta curada de autos y motos de alto perfil. MotorWelt Market ofrece selección, asesoría e inspección para entusiastas que buscan algo más que un clasificado."
      />

      <main className="min-h-screen bg-mw-surface/95 pt-20 pb-20">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          {/* Hero premium */}
          <section className="mb-14 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="text-[11px] uppercase tracking-[0.25em] text-gray-400">
                MotorWelt Market
              </p>
              <h1 className="mt-3 font-display text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">
                Compra-venta seleccionada
                <span className="block text-gray-300">
                  de autos y motos con criterio de entusiasta.
                </span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-xl">
                No es una lista infinita de clasificados. Es un{" "}
                <span className="font-semibold text-gray-100">
                  espacio curado
                </span>{" "}
                donde cada vehículo pasó un filtro editorial, de historia y de
                coherencia con la cultura MotorWelt.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href="#inventario">
                  <Button variant="primary">Ver vehículos disponibles</Button>
                </Link>
                <Link href="#servicios">
                  <Button variant="secondary">
                    Quiero publicar mi auto o moto
                  </Button>
                </Link>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-[11px] text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#0CE0B2]" />
                  Vehículos filtrados por MotorWelt
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-white/50" />
                  Opción de inspección física y asesoría
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-white/30" />
                  Esquema transparente de fee + comisión
                </div>
              </div>
            </div>

            {/* Tarjeta lateral sobria */}
            <div className="rounded-3xl border border-white/10 bg-black/40 p-5 sm:p-6 lg:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                ¿Qué hace distinto a MotorWelt Market?
              </p>
              <div className="mt-4 space-y-4 text-sm text-gray-200">
                <p>
                  <span className="font-semibold text-white">
                    Curaduría antes que volumen.
                  </span>{" "}
                  Publicamos solo vehículos que tengan lógica para un entusiasta:
                  historia, preparación, rareza o configuración especial.
                </p>
                <p>
                  <span className="font-semibold text-white">
                    Asesoría y acompañamiento.
                  </span>{" "}
                  Puedes apoyarte en nuestro equipo para definir precio,
                  revisar legitimidad y preparar el vehículo para venta.
                </p>
                <p>
                  <span className="font-semibold text-white">
                    Exposición editorial y en redes.
                  </span>{" "}
                  Algunas unidades se integrarán en{" "}
                  <span className="italic">stories</span>, notas y piezas de
                  contenido MotorWelt para llegar al público correcto.
                </p>
              </div>
              <div className="mt-5 rounded-2xl border border-[#0CE0B2]/25 bg-[#0CE0B2]/5 px-3 py-3 text-[11px] text-gray-200">
                <p className="font-semibold text-[#0CE0B2] mb-1">
                  Próximo paso: IA para valoración inicial
                </p>
                <p>
                  Más adelante, MotorWelt AI podrá sugerir un rango de precio
                  objetivo y detectar si tu anuncio está muy por encima o debajo
                  del mercado, antes de publicarlo.
                </p>
              </div>
            </div>
          </section>

          {/* Qué es / pilares */}
          <section className="mb-14 border-y border-white/10 py-10">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Filosofía
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white">
                  Más que clasificados. Un filtro de criterio.
                </h2>
                <p className="mt-3 text-sm text-gray-300">
                  MotorWelt Market pretende ser{" "}
                  <span className="font-semibold">
                    el lugar donde confiarías tu auto o moto especial
                  </span>{" "}
                  sin perder el control del proceso, ni caer en la informalidad.
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="font-semibold text-gray-100">
                  1. Selección curada
                </p>
                <p>
                  No buscamos tener “todo”. Solo lo que realmente valga la pena:
                  piezas de colección, proyectos bien ejecutados, builds
                  coherentes, unidades con buena historia y documentación.
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="font-semibold text-gray-100">
                  2. Transparencia y acompañamiento
                </p>
                <p>
                  Esquema claro de fee por publicación y comisión sobre venta,
                  más servicios opcionales como revisión física, sesión de fotos
                  y asesoría para cerrar el trato.
                </p>
              </div>
            </div>
          </section>

          {/* Inventario destacado */}
          <section id="inventario" className="mb-14">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                  Inventario
                </p>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  Vehículos destacados
                </h2>
                <p className="mt-2 text-sm text-gray-300 max-w-xl">
                  Esta es una vista preliminar con unidades demo. Más adelante
                  se conectará a la base de datos y filtros reales por{" "}
                  <span className="font-semibold">
                    tipo, rango de precio, ubicación y rareza
                  </span>
                  .
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                <span className="inline-flex items-center rounded-full border border-white/15 bg-black/40 px-2.5 py-1">
                  Autos &amp; motos
                </span>
                <span className="inline-flex items-center rounded-full border border-white/15 bg-black/40 px-2.5 py-1">
                  Curaduría MotorWelt
                </span>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featuredVehicles.map((v) => (
                <article
                  key={v.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/35 transition hover:border-[#0CE0B2]/60 hover:bg-black/60"
                >
                  {/* Placeholder visual simple (sin Image de Next para mantenerlo genérico) */}
                  <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-white/10 via-white/5 to-black/60">
                    <div className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-[0.25em] text-gray-400">
                      Foto del vehículo
                    </div>
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition" />
                  </div>

                  <div className="flex flex-1 flex-col px-4 py-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <StatusPill status={v.status} />
                      <HighlightPill highlight={v.highlight} type={v.type} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">
                        {v.title}
                      </h3>
                      {v.subtitle && (
                        <p className="mt-1 text-[11px] text-gray-400">
                          {v.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="mt-1 text-xs text-gray-300">
                      <p>
                        {v.year} · {v.location}
                      </p>
                      <p className="mt-1 text-base font-semibold text-white">
                        {v.price}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400">
                      <span>
                        Tipo: {v.type === "auto" ? "Auto" : "Moto"}
                      </span>
                      <button
                        type="button"
                        className="text-[#0CE0B2] hover:text-[#7CFFE2]"
                      >
                        Ver ficha (próximamente)
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-gray-500">
              Más adelante, esta sección se conectará a un backend donde podrás
              cargar unidades, gestionar estatus y aplicar filtros avanzados.
            </p>
          </section>

          {/* Cómo funciona / servicios para vendedores */}
          <section
            id="servicios"
            className="mb-14 grid gap-10 lg:grid-cols-[1.1fr_1fr]"
          >
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">
                Para vendedores
              </p>
              <h2 className="mt-1 text-xl font-semibold text-white">
                Publica tu auto o moto con un proceso claro.
              </h2>
              <p className="mt-2 text-sm text-gray-300 max-w-xl">
                La idea es que publicar en MotorWelt Market se sienta tan
                profesional como llevar tu auto a un taller de confianza: sabes
                qué se hará, cuánto cuesta y qué puedes esperar.
              </p>

              <div className="mt-5 space-y-4 text-sm text-gray-200">
                <div>
                  <p className="font-semibold text-white">
                    1. Aplicación de publicación (online)
                  </p>
                  <p className="text-gray-300 text-sm">
                    Rellenas un formulario con datos clave: versión, historial,
                    modificaciones, documentación y precio objetivo. Más
                    adelante, la IA te ayudará a ajustar el rango de precio.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-white">
                    2. Curaduría &amp; preaprobación
                  </p>
                  <p className="text-gray-300 text-sm">
                    Revisamos que la unidad tenga sentido para el Market. Si
                    aplica, sugerimos ajustes en precio, enfoque del anuncio o
                    servicios adicionales (sesión de fotos, inspección, etc.).
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-white">
                    3. Publicación y difusión segmentada
                  </p>
                  <p className="text-gray-300 text-sm">
                    Publicamos el anuncio con fotos, ficha técnica y narrativa
                    clara. Algunas unidades pasarán además por contenido
                    especial en el sitio y redes de MotorWelt.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-white">
                    4. Fee + comisión transparente
                  </p>
                  <p className="text-gray-300 text-sm">
                    El modelo será{" "}
                    <span className="font-semibold">
                      fee por publicación + comisión sobre venta
                    </span>{" "}
                    (por definir contigo). Todo con contrato claro y pasos
                    bien definidos.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-3xl border border-white/10 bg-black/40 p-5">
                <h3 className="text-sm font-semibold text-white">
                  Servicios adicionales (plan a futuro)
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-300">
                  <li>· Inspección física de la unidad (condición + legitimidad).</li>
                  <li>· Reporte visual (fotos, detalles, checklist).</li>
                  <li>· Producción de contenido premium para ciertas unidades.</li>
                  <li>· Asesoría para negociación y cierre seguro.</li>
                </ul>
                <p className="mt-3 text-[11px] text-gray-500">
                  Estos servicios se podrán contratar aparte y se integrarán a
                  la ficha del vehículo para dar confianza al comprador.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5">
                <h3 className="text-sm font-semibold text-white">
                  MotorWelt AI en el Market (idea conceptual)
                </h3>
                <p className="mt-2 text-xs text-gray-300">
                  Más adelante, la IA podrá:
                </p>
                <ul className="mt-2 space-y-1 text-xs text-gray-300">
                  <li>· Sugerir rango de precio objetivo por modelo y año.</li>
                  <li>· Detectar descripciones pobres y proponer una mejor.</li>
                  <li>
                    · Generar copies para redes sociales a partir de la ficha.
                  </li>
                  <li>
                    · Señalar banderas rojas típicas que habría que aclarar en
                    el anuncio.
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Cierre / llamada a la acción suave */}
          <section className="border-t border-white/10 pt-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Construyamos un marketplace a la altura de la comunidad.
                </h2>
                <p className="mt-2 text-sm text-gray-300 max-w-xl">
                  MotorWelt Market todavía es una idea en construcción, pero ya
                  tiene claro su objetivo: ser{" "}
                  <span className="font-semibold">
                    el punto de encuentro más confiable
                  </span>{" "}
                  para comprar y vender autos y motos especiales en México (y
                  más adelante, fuera).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href="/contacto">
                  <Button variant="primary">
                    Quiero hablar sobre publicar mi vehículo
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="ghost">Volver a MotorWelt</Button>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default MarketIndexPage;

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
