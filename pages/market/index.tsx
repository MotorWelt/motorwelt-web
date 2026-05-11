// pages/market/index.tsx
import React, { useMemo, useState } from "react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const nextI18NextConfig = require("../../next-i18next.config.js");

type VehicleType = "Todos" | "Autos" | "Motos";
type FuelType = "Todos" | "Gasolina" | "Híbridos" | "Eléctricos";
type BodyType = "Todos" | "SUV" | "Sedán" | "Coupé" | "Hatchback" | "Moto";
type MarketTag = "Todos" | "Premium" | "Performance" | "Collector" | "Importación";

type Vehicle = {
  id: string;
  title: string;
  type: Exclude<VehicleType, "Todos">;
  fuel: Exclude<FuelType, "Todos">;
  body: Exclude<BodyType, "Todos">;
  tag: Exclude<MarketTag, "Todos">;
  price: string;
  location: string;
  year: string;
  mileage: string;
  description: string;
  featured?: boolean;
};

const vehicles: Vehicle[] = [
  {
    id: "porsche-911-carrera",
    title: "Porsche 911 Carrera",
    type: "Autos",
    fuel: "Gasolina",
    body: "Coupé",
    tag: "Premium",
    price: "Precio bajo solicitud",
    location: "CDMX",
    year: "2022",
    mileage: "18,000 km",
    description: "Unidad premium con enfoque performance y configuración aspiracional.",
    featured: true,
  },
  {
    id: "bmw-m2-competition",
    title: "BMW M2 Competition",
    type: "Autos",
    fuel: "Gasolina",
    body: "Coupé",
    tag: "Performance",
    price: "Deal destacado",
    location: "México",
    year: "2021",
    mileage: "24,500 km",
    description: "Auto ideal para entusiastas que buscan manejo, carácter y presencia.",
    featured: true,
  },
  {
    id: "audi-rs3",
    title: "Audi RS3",
    type: "Autos",
    fuel: "Gasolina",
    body: "Sedán",
    tag: "Performance",
    price: "Disponible pronto",
    location: "CDMX",
    year: "2023",
    mileage: "12,000 km",
    description: "Daily performance con tracción quattro y carácter deportivo.",
  },
  {
    id: "range-rover-sport",
    title: "Range Rover Sport",
    type: "Autos",
    fuel: "Híbridos",
    body: "SUV",
    tag: "Premium",
    price: "Oportunidad privada",
    location: "Monterrey",
    year: "2024",
    mileage: "8,000 km",
    description: "SUV premium con presencia, confort y tecnología para uso diario.",
  },
  {
    id: "tesla-model-y",
    title: "Tesla Model Y",
    type: "Autos",
    fuel: "Eléctricos",
    body: "SUV",
    tag: "Premium",
    price: "Disponible",
    location: "CDMX",
    year: "2023",
    mileage: "15,000 km",
    description: "SUV eléctrico con enfoque tecnológico y experiencia moderna.",
  },
  {
    id: "nissan-skyline-gtr",
    title: "Nissan Skyline GT-R",
    type: "Autos",
    fuel: "Gasolina",
    body: "Coupé",
    tag: "Importación",
    price: "Japón / USA",
    location: "Importación potencial",
    year: "Por confirmar",
    mileage: "Por confirmar",
    description: "Unidad JDM pensada para una futura operación de importación curada.",
    featured: true,
  },
  {
    id: "ducati-panigale-v4",
    title: "Ducati Panigale V4",
    type: "Motos",
    fuel: "Gasolina",
    body: "Moto",
    tag: "Performance",
    price: "Precio bajo solicitud",
    location: "México",
    year: "2022",
    mileage: "5,500 km",
    description: "Superbike de alto desempeño para perfiles track y premium.",
  },
  {
    id: "bmw-r-1250-gs",
    title: "BMW R 1250 GS",
    type: "Motos",
    fuel: "Gasolina",
    body: "Moto",
    tag: "Premium",
    price: "Disponible pronto",
    location: "Guadalajara",
    year: "2021",
    mileage: "19,000 km",
    description: "Moto adventure premium para viajes, ruta y experiencias.",
  },
];

const vehicleTypes: VehicleType[] = ["Todos", "Autos", "Motos"];
const fuelTypes: FuelType[] = ["Todos", "Gasolina", "Híbridos", "Eléctricos"];
const bodyTypes: BodyType[] = ["Todos", "SUV", "Sedán", "Coupé", "Hatchback", "Moto"];
const marketTags: MarketTag[] = ["Todos", "Premium", "Performance", "Collector", "Importación"];

export default function MotorWeltMarket() {
  const [vehicleType, setVehicleType] = useState<VehicleType>("Todos");
  const [fuelType, setFuelType] = useState<FuelType>("Todos");
  const [bodyType, setBodyType] = useState<BodyType>("Todos");
  const [marketTag, setMarketTag] = useState<MarketTag>("Todos");

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchType = vehicleType === "Todos" || vehicle.type === vehicleType;
      const matchFuel = fuelType === "Todos" || vehicle.fuel === fuelType;
      const matchBody = bodyType === "Todos" || vehicle.body === bodyType;
      const matchTag = marketTag === "Todos" || vehicle.tag === marketTag;

      return matchType && matchFuel && matchBody && matchTag;
    });
  }, [vehicleType, fuelType, bodyType, marketTag]);

  const featuredVehicles = vehicles.filter((vehicle) => vehicle.featured);

  return (
    <>
      <Seo
        title="MotorWelt Market | Autos, motos y oportunidades premium"
        description="MotorWelt Market: autos, motos, eléctricos, híbridos, SUVs, performance e importaciones curadas para entusiastas."
      />

      <main className="min-h-screen overflow-x-hidden bg-[#050509] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,118,69,0.24),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(30,191,239,0.16),transparent_36%)]" />

          <header className="relative mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-black tracking-[0.32em]">
              MOTORWELT
            </Link>
            <ProfileButton />
          </header>

          <div className="relative mx-auto w-full max-w-[1180px] px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-300">
              MotorWelt Market
            </p>

            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
                  Compra, venta y oportunidades curadas para entusiastas.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                  Un market premium para autos, motos, SUVs, híbridos, eléctricos,
                  performance e importaciones potenciales. Menos clasificados
                  genéricos. Más selección, confianza y comunidad.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="#inventario"
                    className="rounded-full bg-white px-5 py-3 text-sm font-black text-black transition hover:bg-orange-200"
                  >
                    Ver inventario
                  </a>
                  <a
                    href="#vender"
                    className="rounded-full border border-white/15 px-5 py-3 text-sm font-black text-white/85 transition hover:bg-white hover:text-black"
                  >
                    Publicar vehículo
                  </a>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
                  Base funcional
                </p>
                <h2 className="mt-3 text-2xl font-black">
                  Market premium, no marketplace masivo.
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Esta página queda lista como base: filtros, destacados, inventario
                  y estructura para conectar después con perfiles, Sanity, pagos o
                  dealers.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                  <Stat value={`${vehicles.length}`} label="Unidades" />
                  <Stat value="5" label="Filtros" />
                  <Stat value="1" label="Market" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
            <aside className="space-y-6">
              <Card eyebrow="Filtros" title="Buscar por categoría">
                <FilterGroup label="Tipo" items={vehicleTypes} active={vehicleType} onChange={setVehicleType} />
                <FilterGroup label="Energía" items={fuelTypes} active={fuelType} onChange={setFuelType} />
                <FilterGroup label="Formato" items={bodyTypes} active={bodyType} onChange={setBodyType} />
                <FilterGroup label="Selección" items={marketTags} active={marketTag} onChange={setMarketTag} />

                <button
                  onClick={() => {
                    setVehicleType("Todos");
                    setFuelType("Todos");
                    setBodyType("Todos");
                    setMarketTag("Todos");
                  }}
                  className="mt-5 w-full rounded-full border border-white/15 px-4 py-2.5 text-sm font-black text-white/75 transition hover:bg-white hover:text-black"
                >
                  Limpiar filtros
                </button>
              </Card>

              <Card eyebrow="Modelo" title="Cómo funcionará">
                <div className="space-y-3 text-sm leading-6 text-white/65">
                  <p>✓ Autos y motos curados por MotorWelt</p>
                  <p>✓ Filtros por tipo, energía y categoría</p>
                  <p>✓ Oportunidades privadas para miembros</p>
                  <p>✓ Posibles importaciones desde USA/Japón</p>
                  <p>✓ Base futura para dealers y consignación</p>
                </div>
              </Card>

              <Card eyebrow="Para vendedores" title="Publica con MotorWelt">
                <p className="text-sm leading-6 text-white/65">
                  El siguiente paso será crear un flujo para subir unidad, validar
                  información, cargar fotos, revisar estado y conectar con compradores
                  calificados.
                </p>

                <a
                  id="vender"
                  href="#"
                  className="mt-5 inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-black text-black"
                >
                  Solicitar evaluación
                </a>
              </Card>
            </aside>

            <div className="min-w-0 space-y-6">
              <Card eyebrow="Destacados" title="Selección MotorWelt">
                <HorizontalScroller>
                  {featuredVehicles.map((vehicle) => (
                    <VehicleCard key={vehicle.id} vehicle={vehicle} featured />
                  ))}
                </HorizontalScroller>
              </Card>

              <section id="inventario" className="scroll-mt-24">
                <Card
                  eyebrow="Inventario"
                  title={`${filteredVehicles.length} unidades encontradas`}
                >
                  {filteredVehicles.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {filteredVehicles.map((vehicle) => (
                        <VehicleCard key={vehicle.id} vehicle={vehicle} />
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-white/10 bg-black/25 p-6">
                      <h3 className="text-xl font-black">
                        No hay unidades con estos filtros.
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-white/60">
                        Ajusta la búsqueda o limpia los filtros para ver todo el
                        inventario preview.
                      </p>
                    </div>
                  )}
                </Card>
              </section>

              <Card eyebrow="Próxima fase" title="Market conectado al perfil">
                <div className="grid gap-4 md:grid-cols-3">
                  <Feature
                    title="Autos guardados"
                    text="Los usuarios podrán guardar unidades desde su perfil privado."
                  />
                  <Feature
                    title="Recomendaciones"
                    text="El market podrá sugerir autos según intereses y comportamiento."
                  />
                  <Feature
                    title="Deals privados"
                    text="Marcas, dealers o contactos podrán destacar oportunidades premium."
                  />
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function VehicleCard({
  vehicle,
  featured = false,
}: {
  vehicle: Vehicle;
  featured?: boolean;
}) {
  return (
    <article
      className={`min-w-0 rounded-3xl border bg-black/25 p-4 ${
        featured
          ? "w-[280px] shrink-0 border-orange-300/20 sm:w-[310px] lg:w-auto"
          : "border-white/10"
      }`}
    >
      <div className="mb-4 flex aspect-[16/10] items-end rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-black to-orange-500/20 p-4">
        <span className="rounded-full bg-black/60 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-orange-200 backdrop-blur">
          {vehicle.tag}
        </span>
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
        {vehicle.type} · {vehicle.fuel} · {vehicle.body}
      </p>

      <h3 className="mt-2 text-xl font-black">{vehicle.title}</h3>
      <p className="mt-2 text-sm font-bold text-orange-200">{vehicle.price}</p>
      <p className="mt-1 text-sm text-white/50">{vehicle.location}</p>

      <p className="mt-4 text-sm leading-6 text-white/60">
        {vehicle.description}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Pill>{vehicle.year}</Pill>
        <Pill>{vehicle.mileage}</Pill>
      </div>

      <div className="mt-5 flex gap-2">
        <Link
          href={`/market/${vehicle.id}`}
          className="rounded-full bg-white px-4 py-2 text-xs font-black text-black"
        >
          Ver detalle
        </Link>
        <button className="rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/80">
          Guardar
        </button>
      </div>
    </article>
  );
}

function FilterGroup<T extends string>({
  label,
  items,
  active,
  onChange,
}: {
  label: string;
  items: T[];
  active: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-white/40">
        {label}
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-wrap lg:overflow-visible lg:pb-0">
        {items.map((item) => (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
              active === item
                ? "border-orange-300 bg-orange-400/20 text-orange-100"
                : "border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/10"
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

function Card({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-[1.7rem] border border-white/10 bg-white/[0.045] p-4 shadow-xl backdrop-blur sm:rounded-[2rem] sm:p-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-300/80">
        {eyebrow}
      </p>
      <h2 className="mb-5 text-xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function HorizontalScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0 xl:grid-cols-3">
      {children}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-black/35 p-3 sm:p-4">
      <p className="text-xl font-black sm:text-2xl">{value}</p>
      <p className="text-[11px] text-white/50 sm:text-xs">{label}</p>
    </div>
  );
}

function Feature({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/25 p-5">
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
      {children}
    </span>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(
      locale ?? "es",
      ["common"],
      nextI18NextConfig
    )),
  },
});