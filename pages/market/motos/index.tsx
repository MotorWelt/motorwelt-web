import { GetStaticProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Seo from "../../../components/Seo";

const nextI18NextConfig = require("../../../next-i18next.config.js"); // ← CORREGIDO

type Bike = {
  id: string;
  title: string;
  subtitle: string;
  year: number;
  price: string;
  km: string;
  location: string;
  tags: string[];
};

const featuredBikes: Bike[] = [
  {
    id: "1",
    title: "BMW R 1250 GS",
    subtitle: "Adventure • Full equipada • Lista para viajar",
    year: 2022,
    price: "$430,000 MXN",
    km: "18,000 km",
    location: "CDMX",
    tags: ["Adventure", "Boxer", "Touring"],
  },
  {
    id: "2",
    title: "Yamaha MT-09",
    subtitle: "Triple cilindro • Quickshifter • Naked agresiva",
    year: 2020,
    price: "$260,000 MXN",
    km: "22,000 km",
    location: "Guadalajara, Jal.",
    tags: ["Naked", "Street", "Triple"],
  },
  {
    id: "3",
    title: "KTM 390 Duke",
    subtitle: "Ligera • Ideal para ciudad y primeras rutas",
    year: 2019,
    price: "$105,000 MXN",
    km: "14,500 km",
    location: "Monterrey, N.L.",
    tags: ["A2 friendly", "Ligera", "Monocilíndrica"],
  },
];

const tagPresets = [
  "Adventure",
  "Naked",
  "Touring",
  "Deportiva",
  "Custom",
  "Clásica",
  "Ciudad",
];

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(
        locale || "es",
        ["home"],
        nextI18NextConfig
      )),
    },
  };
};

export default function MotosHome() {
  return (
    <>
      <Seo
        title="Motos | MotorWelt Market"
        description="Compra y venta de motos seleccionadas por entusiastas, curadas por MotorWelt."
      />

      <main className="min-h-screen bg-[#050608] text-neutral-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 lg:pt-14">
          {/* Header / Hero */}
          <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-400">
                MotorWelt Market
              </p>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                Compra y venta de motos
              </h1>
              <p className="max-w-xl text-sm text-neutral-400 sm:text-base">
                Motos seleccionadas para quienes viven la rodada: adventure,
                naked, touring, deportivas y más. Filtra por estilo, año o
                presupuesto y encuentra tu próxima compañera de viaje.
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
              <button className="rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-100 hover:border-neutral-500 hover:bg-neutral-900 transition">
                Publicar una moto (próximamente)
              </button>
              <p className="text-xs text-neutral-500">
                En esta fase solo el equipo MotorWelt publica anuncios.
              </p>
            </div>
          </section>

          {/* Buscador y filtros */}
          <section className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-950/40 p-4 backdrop-blur sm:p-5">
            {/* Búsqueda principal */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex-1">
                <label
                  htmlFor="search"
                  className="mb-1 block text-xs font-medium uppercase tracking-[0.18em] text-neutral-500"
                >
                  Buscar modelo
                </label>
                <div className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2.5 text-sm focus-within:border-neutral-500 focus-within:bg-neutral-900 transition">
                  <span className="text-neutral-500">🔍</span>
                  <input
                    id="search"
                    type="text"
                    placeholder="Ej. R 1250 GS, MT-09, 390 Duke..."
                    className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
                  />
                </div>
              </div>

              <button className="mt-1 inline-flex items-center justify-center rounded-xl border border-cyan-500/60 bg-cyan-500/10 px-5 py-2.5 text-sm font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-100 transition lg:mt-6">
                Buscar
              </button>
            </div>

            {/* Filtros rápidos */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-neutral-400">Marca</p>
                <select className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none">
                  <option value="">Todas</option>
                  <option>BMW</option>
                  <option>Yamaha</option>
                  <option>KTM</option>
                  <option>Honda</option>
                  <option>Triumph</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-neutral-400">
                  Año mínimo
                </p>
                <select className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none">
                  <option value="">Cualquiera</option>
                  <option>2024</option>
                  <option>2020</option>
                  <option>2015</option>
                  <option>2010</option>
                  <option>2000</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-neutral-400">
                  Presupuesto máximo
                </p>
                <select className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none">
                  <option value="">Sin límite</option>
                  <option>$120,000 MXN</option>
                  <option>$200,000 MXN</option>
                  <option>$300,000 MXN</option>
                  <option>$500,000 MXN</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-neutral-400">Estilo</p>
                <select className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 focus:border-neutral-500 focus:outline-none">
                  <option value="">Todos</option>
                  <option>Adventure</option>
                  <option>Naked</option>
                  <option>Touring</option>
                  <option>Deportiva</option>
                  <option>Custom</option>
                </select>
              </div>
            </div>

            {/* Etiquetas / intereses */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-neutral-400">
                Buscar por “vibes”
              </p>
              <div className="flex flex-wrap gap-2">
                {tagPresets.map((tag) => (
                  <button
                    key={tag}
                    className="rounded-full border border-neutral-800 px-3 py-1 text-xs text-neutral-300 hover:border-neutral-500 hover:bg-neutral-900 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Listado de motos destacadas */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  Motos destacadas
                </h2>
                <p className="text-xs text-neutral-500">
                  Curadas por el equipo MotorWelt — ejemplo visual, listo para
                  conectar a Sanity.
                </p>
              </div>

              <button className="text-xs text-neutral-400 hover:text-neutral-200 underline-offset-4 hover:underline">
                Ver todas
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredBikes.map((bike) => (
                <article
                  key={bike.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950/40 transition hover:border-neutral-600 hover:bg-neutral-900/60"
                >
                  {/* Placeholder imagen (luego <Image />) */}
                  <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-neutral-800 to-neutral-900">
                    <div className="absolute inset-0 opacity-40 group-hover:opacity-30" />
                    <div className="absolute bottom-2 left-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] text-neutral-300">
                      {bike.year}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col gap-2 px-3.5 py-3.5">
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-50 line-clamp-2">
                        {bike.title}
                      </h3>
                      <p className="mt-1 text-xs text-neutral-400 line-clamp-2">
                        {bike.subtitle}
                      </p>
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-neutral-400">
                      <span>{bike.km}</span>
                      <span className="h-0.5 w-0.5 rounded-full bg-neutral-500" />
                      <span>{bike.location}</span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-neutral-50">
                        {bike.price}
                      </p>
                      <button className="text-xs font-medium text-cyan-300 hover:text-cyan-100">
                        Ver detalles
                      </button>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-1">
                      {bike.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-neutral-900 px-2 py-0.5 text-[10px] text-neutral-300"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}