// pages/perfil/index2.tsx
import React from "react";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const nextI18NextConfig = require("../../next-i18next.config.js");

const interests = [
  "Performance",
  "Tuning",
  "F1",
  "Autos de lujo",
  "Track Days",
  "EVs",
];

const savedItems = [
  "El futuro del tuning premium en México",
  "Porsche y la nueva era eléctrica",
  "Guía MotorWelt para eventos privados",
];

const activity = [
  "Guardaste una nota de Tuning",
  "Diste like a una nota de Motorsport",
  "Te interesó un evento MotorWelt Experiences",
  "Actualizaste tus intereses",
];

const events = [
  {
    title: "MotorWelt Night Drive",
    status: "Acceso anticipado",
    date: "Próximamente",
  },
  {
    title: "Cars & Coffee privado",
    status: "Lista de espera",
    date: "Próximamente",
  },
];

const connections = [
  "Usuarios con interés en Track Days",
  "Miembros que siguen contenido de Tuning",
  "Asistentes potenciales a eventos premium",
];

const marketCars = [
  {
    name: "Porsche 911 Carrera",
    tag: "Performance / Luxury",
    price: "Precio bajo solicitud",
  },
  {
    name: "BMW M2 Competition",
    tag: "Track Ready",
    price: "Deal destacado",
  },
  {
    name: "Nissan Skyline GT-R",
    tag: "Importación potencial",
    price: "Japón / USA",
  },
  {
    name: "Audi RS3",
    tag: "Daily performance",
    price: "Disponible pronto",
  },
];

const curatedHighlights = [
  {
    label: "Curado para tu perfil",
    title: "Nuevo lanzamiento performance",
    text: "Una nota destacada para usuarios con interés en autos de alto desempeño.",
    cta: "Leer ahora",
  },
  {
    label: "Evento destacado",
    title: "Track Experience privado",
    text: "Una experiencia sugerida para perfiles con afinidad por Track Days.",
    cta: "Ver evento",
  },
  {
    label: "MotorWelt Market",
    title: "Deal seleccionado",
    text: "Una oportunidad destacada para miembros interesados en autos collector.",
    cta: "Explorar",
  },
];

export default function PerfilMotorWeltPreview() {
  return (
    <>
      <Seo
        title="Perfil Preview | MotorWelt"
        description="Preview temporal del perfil privado MotorWelt con comunidad, membresía, eventos, marketplace e identidad automotriz."
      />

      <main className="min-h-screen overflow-x-hidden bg-[#050509] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,118,69,0.32),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(30,191,239,0.22),transparent_36%)]" />

          <div className="relative mx-auto flex w-full max-w-[1180px] items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-black tracking-[0.32em]">
              MOTORWELT
            </Link>
            <ProfileButton />
          </div>

          <div className="relative mx-auto w-full max-w-[1180px] px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-orange-300 sm:tracking-[0.35em]">
              Preview temporal · perfil privado
            </p>

            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <h1 className="max-w-4xl text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
                  Tu identidad automotriz dentro de MotorWelt.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
                  Un perfil privado, premium e interactivo para guardar contenido,
                  medir tus intereses, acceder a eventos, activar beneficios y generar
                  una versión compartible de tu ADN MotorWelt.
                </p>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
                <div className="flex items-center gap-4">
                  <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-orange-400 to-cyan-300 text-2xl font-black text-black">
                    MW
                  </div>
                  <div>
                    <p className="text-2xl font-black">Gabriel</p>
                    <p className="text-sm text-white/60">Founder Preview</p>
                    <span className="mt-2 inline-flex rounded-full border border-orange-300/30 bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-200">
                      MotorWelt Insider
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2 text-center sm:gap-3">
                  <Stat value="24" label="Guardados" />
                  <Stat value="18" label="Likes" />
                  <Stat value="3" label="Eventos" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-[1180px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-10">
          <div className="min-w-0 space-y-6">
            <Card eyebrow="Fase 1" title="Perfil base">
              <div className="space-y-3 text-sm text-white/70">
                <Row label="Nombre" value="Gabriel Rodríguez" />
                <Row label="Tipo de cuenta" value="Privada" />
                <Row label="Estado" value="Preview / sin conexión real" />
                <Row label="Ubicación" value="CDMX" />
              </div>
            </Card>

            <Card eyebrow="Fase 1" title="Intereses">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
                {interests.map((item) => (
                  <span
                    key={item}
                    className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/75"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Card>

            <Card eyebrow="Fase 5" title="Tu ADN MotorWelt">
              <div className="space-y-4">
                <Bar label="Performance" value="82%" />
                <Bar label="Luxury" value="64%" />
                <Bar label="Tuning" value="71%" />
                <Bar label="Motorsport" value="58%" />
              </div>

              <div className="mt-5 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-4">
                <p className="text-sm font-bold text-orange-200">
                  Perfil detectado
                </p>
                <h3 className="mt-1 text-2xl font-black">
                  Performance Collector
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Un perfil con alta afinidad por autos de desempeño, cultura tuning,
                  eventos privados y contenido aspiracional.
                </p>
              </div>
            </Card>

            <Card eyebrow="MotorWelt Market" title="Autos en venta recomendados">
              <p className="mb-4 text-sm leading-6 text-white/60">
                Una vista previa del futuro marketplace de MotorWelt: autos
                seleccionados, oportunidades especiales, importaciones potenciales y
                posibles deals exclusivos para miembros.
              </p>

              <HorizontalScroller>
                {marketCars.map((car) => (
                  <MarketCard key={car.name} car={car} />
                ))}
              </HorizontalScroller>

              <div className="mt-5 rounded-3xl border border-cyan-300/15 bg-cyan-400/10 p-5">
                <p className="text-sm font-bold text-cyan-200">Próxima fase</p>
                <p className="mt-2 text-sm leading-6 text-white/65">
                  Este módulo podrá conectarse al futuro sitio de compra/venta para
                  mostrar autos guardados, recomendaciones, favoritos y oportunidades
                  privadas para miembros MotorWelt.
                </p>
              </div>
            </Card>

            <Card eyebrow="Fase 5" title="Perfil compartible">
              <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-orange-500/20 via-black to-cyan-500/20 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                  My MotorWelt DNA
                </p>
                <h3 className="mt-3 text-2xl font-black">
                  Performance Collector
                </h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Tarjeta descargable para compartir en stories sin hacer público el
                  perfil completo.
                </p>

                <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
                  <MiniStat value="82%" label="Performance" />
                  <MiniStat value="71%" label="Tuning" />
                  <MiniStat value="58%" label="Motorsport" />
                </div>

                <button className="mt-5 rounded-full bg-white px-5 py-2 text-sm font-black text-black">
                  Generar preview
                </button>
              </div>
            </Card>
          </div>

          <div className="min-w-0 space-y-6">
            <Card eyebrow="MotorWelt Picks" title="Destacado para ti">
              <p className="mb-4 text-sm leading-6 text-white/60">
                Contenido colocado de forma prioritaria dentro del perfil, curado por
                MotorWelt según intereses, actividad y oportunidades de marca.
              </p>

              <HorizontalScroller>
                {curatedHighlights.map((item) => (
                  <CuratedCard key={item.title} item={item} />
                ))}
              </HorizontalScroller>
            </Card>

            <Card eyebrow="Fase 2" title="Actividad reciente">
              <div className="space-y-3">
                {activity.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-white/70"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <Card eyebrow="Fase 2" title="Guardados">
              <div className="space-y-3">
                {savedItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                  >
                    <p className="text-sm font-semibold text-white/80">{item}</p>
                    <span className="shrink-0 text-xs font-bold text-orange-200">
                      Ver
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card eyebrow="Fase 2" title="Recomendaciones">
              <HorizontalScroller>
                <Recommendation
                  title="Más contenido de Tuning"
                  text="Basado en tus guardados y likes recientes."
                />
                <Recommendation
                  title="Eventos de performance"
                  text="Experiencias privadas que podrían hacer match con tu perfil."
                />
              </HorizontalScroller>
            </Card>

            <Card eyebrow="Fase 3" title="Eventos y comunidad">
              <HorizontalScroller>
                {events.map((event) => (
                  <div
                    key={event.title}
                    className="min-h-[165px] w-[260px] shrink-0 rounded-3xl border border-orange-300/20 bg-orange-400/10 p-5 sm:w-[280px]"
                  >
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">
                      {event.status}
                    </p>
                    <h3 className="mt-2 text-xl font-black">{event.title}</h3>
                    <p className="mt-2 text-sm text-white/60">{event.date}</p>
                  </div>
                ))}
              </HorizontalScroller>
            </Card>

            <Card eyebrow="Fase 3" title="Conexiones sugeridas">
              <p className="mb-4 text-sm leading-6 text-white/60">
                No es una red social abierta. Sería una capa privada y opcional para
                detectar intereses compartidos.
              </p>

              <HorizontalScroller>
                {connections.map((item) => (
                  <div
                    key={item}
                    className="min-h-[120px] w-[245px] shrink-0 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-white/70 sm:w-[260px]"
                  >
                    {item}
                  </div>
                ))}
              </HorizontalScroller>
            </Card>

            <Card eyebrow="Fase 4" title="Membresía MotorWelt">
              <div className="rounded-3xl border border-cyan-300/20 bg-cyan-400/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-200">
                  Premium Preview
                </p>
                <h3 className="mt-2 text-2xl font-black">MotorWelt Insider</h3>
                <p className="mt-3 text-sm leading-6 text-white/65">
                  Acceso a likes, guardados, perfil avanzado, eventos privados,
                  beneficios de partners y futuras experiencias exclusivas.
                </p>

                <div className="mt-5 grid gap-2 text-sm text-white/70">
                  <p>✓ Likes y guardados</p>
                  <p>✓ Perfil privado avanzado</p>
                  <p>✓ Acceso anticipado a eventos</p>
                  <p>✓ Tarjeta compartible MotorWelt DNA</p>
                  <p>✓ Recomendaciones personalizadas</p>
                  <p>✓ Autos guardados y oportunidades privadas</p>
                  <p>✓ Contenido curado y oportunidades destacadas</p>
                </div>

                <button className="mt-5 rounded-full bg-cyan-300 px-5 py-2 text-sm font-black text-black">
                  Activar membresía
                </button>
              </div>
            </Card>

            <Card eyebrow="Fase 5" title="Insights con IA">
              <div className="space-y-3 text-sm text-white/70">
                <Insight text="Tu interés principal este mes fue Performance." />
                <Insight text="Tus contenidos guardados se inclinan hacia autos premium y tuning." />
                <Insight text="Podrías tener alta afinidad con eventos tipo track day o meet privado." />
                <Insight text="MotorWelt Market podría recomendarte autos de desempeño, importaciones especiales y unidades con enfoque collector." />
              </div>
            </Card>
          </div>
        </section>
      </main>
    </>
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
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-300/80 sm:tracking-[0.25em]">
        {eyebrow}
      </p>
      <h2 className="mb-5 text-xl font-black">{title}</h2>
      {children}
    </div>
  );
}

function HorizontalScroller({ children }: { children: React.ReactNode }) {
  return (
    <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:-mx-5 sm:px-5 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0 lg:pb-0">
      {children}
    </div>
  );
}

function MarketCard({
  car,
}: {
  car: {
    name: string;
    tag: string;
    price: string;
  };
}) {
  return (
    <div className="w-[260px] shrink-0 rounded-3xl border border-white/10 bg-black/25 p-4 sm:w-[280px] lg:w-auto">
      <div className="mb-4 aspect-[16/10] rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-black to-orange-500/20" />

      <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-200">
        {car.tag}
      </p>

      <h3 className="mt-2 text-lg font-black">{car.name}</h3>

      <p className="mt-2 text-sm text-white/55">{car.price}</p>

      <button className="mt-4 rounded-full border border-white/15 px-4 py-2 text-xs font-black text-white/80 transition hover:bg-white hover:text-black">
        Guardar auto
      </button>
    </div>
  );
}

function CuratedCard({
  item,
}: {
  item: {
    label: string;
    title: string;
    text: string;
    cta: string;
  };
}) {
  return (
    <div className="w-[260px] shrink-0 rounded-3xl border border-orange-300/20 bg-gradient-to-br from-orange-400/15 via-white/[0.04] to-cyan-400/10 p-5 sm:w-[280px] lg:w-auto">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-200">
        {item.label}
      </p>
      <h3 className="mt-3 text-xl font-black">{item.title}</h3>
      <p className="mt-3 text-sm leading-6 text-white/65">{item.text}</p>
      <button className="mt-5 rounded-full bg-white px-4 py-2 text-xs font-black text-black">
        {item.cta}
      </button>
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

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl bg-black/35 p-3">
      <p className="font-black">{value}</p>
      <p className="mt-1 text-white/50">{label}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-black/25 px-4 py-3">
      <span className="text-white/50">{label}</span>
      <span className="text-right font-bold text-white/80">{value}</span>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="text-white/70">{label}</span>
        <span className="font-bold text-orange-200">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-cyan-300"
          style={{ width: value }}
        />
      </div>
    </div>
  );
}

function Recommendation({ title, text }: { title: string; text: string }) {
  return (
    <div className="w-[245px] shrink-0 rounded-3xl border border-white/10 bg-black/25 p-5 sm:w-[260px] lg:w-auto">
      <h3 className="font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/60">{text}</p>
    </div>
  );
}

function Insight({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-cyan-300/15 bg-cyan-400/10 p-4">
      {text}
    </div>
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