// pages/suscripcion/index.tsx
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

/* =============== Utilidades locales =============== */
type Billing = "monthly" | "yearly";
type PlanKey = "free" | "pro" | "elite";

function NeonButton({
  children,
  variant = "cyan",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "cyan" | "pink" | "ghost";
}) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition focus:outline-none";
  const map = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus:ring-2 focus:ring-[#0CE0B2]/40",
    pink:
      "text-white border-2 border-[#FF7A1A] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus:ring-2 focus:ring-[#FF7A1A]/40",
    ghost:
      "text-gray-100 border border-white/20 hover:border-white/40 hover:bg-white/5",
  } as const;
  return (
    <button {...props} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </button>
  );
}

function Badge({
  children,
  color = "cool",
}: {
  children: React.ReactNode;
  color?: "cool" | "warm";
}) {
  return (
    <span
      className={`inline-block rounded-full border px-3 py-1 text-xs backdrop-blur-md ${
        color === "cool"
          ? "border-[#0CE0B2]/50 text-white bg-[#0CE0B2]/10"
          : "border-[#FF7A1A]/50 text-white bg-[#FF7A1A]/10"
      }`}
    >
      {children}
    </span>
  );
}

type Feature = { label: string; plans: PlanKey[] };

/* =============== Datos de planes =============== */
const FEATURES: Feature[] = [
  { label: "Noticias sin límites", plans: ["free", "pro", "elite"] },
  { label: "Experiencia sin anuncios", plans: ["pro", "elite"] },
  { label: "Contenido exclusivo MotorWelt+", plans: ["pro", "elite"] },
  { label: "Acceso anticipado a producciones", plans: ["elite"] },
  { label: "Eventos y meets con prioridad", plans: ["elite"] },
  { label: "Newsletter premium semanal", plans: ["pro", "elite"] },
];

const FAQ = [
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí. La suscripción se renueva automáticamente y puedes cancelarla en cualquier momento desde tu perfil. Mantendrás el acceso hasta el fin del periodo pagado.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Tarjetas de crédito y débito principales. Pronto añadiremos PayPal y pagos locales.",
  },
  {
    q: "¿El plan Pro incluye producciones completas?",
    a: "Incluye acceso a MotorWelt+ y parte del catálogo. El plan Elite suma estrenos anticipados, detrás de cámaras extendidos y beneficios en eventos.",
  },
  {
    q: "¿Hay descuentos para equipos o empresas?",
    a: "Sí. Escríbenos a hola@motorwelt.mx para planes corporativos y de medios.",
  },
];

/* =============== Header compacto unificado =============== */
function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
            aria-label="Ir al inicio MotorWelt"
          >
            <Image
              src="/brand/motorwelt-logo.png"
              alt="MotorWelt"
              width={220}
              height={56}
              priority
              className="h-10 md:h-12 w-auto"
            />
          </Link>
        </div>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/noticias/autos" className="text-gray-200 hover:text-white">
            Autos
          </Link>
          <Link href="/noticias/motos" className="text-gray-200 hover:text-white">
            Motos
          </Link>
          <Link href="/deportes" className="text-gray-200 hover:text-white">
            Deportes
          </Link>
          <Link href="/lifestyle" className="text-gray-200 hover:text-white">
            Lifestyle
          </Link>
          <Link href="/comunidad" className="text-gray-200 hover:text-white">
            Comunidad
          </Link>
        </nav>

        {/* Placeholder para mantener la rejilla alineada */}
        <div />
      </div>
    </header>
  );
}

/* =============== Página =============== */
export default function Suscripcion() {
  const [billing, setBilling] = useState<Billing>("monthly");
  const [activePlan, setActivePlan] = useState<PlanKey | null>(null); // "free" | "pro" | "elite"

  useEffect(() => {
    // Placeholder de estado real: leer plan activo del storage (simulación)
    const saved = (typeof window !== "undefined" && localStorage.getItem("mw_active_plan")) as PlanKey | null;
    if (saved === "free" || saved === "pro" || saved === "elite") setActivePlan(saved);
  }, []);

  const prices = useMemo(
    () => ({
      free: { monthly: 0, yearly: 0 },
      pro: { monthly: 99, yearly: 990 }, // 2 meses de ahorro
      elite: { monthly: 199, yearly: 1990 }, // 2 meses de ahorro
    }),
    []
  );

  const planCopy: Record<PlanKey, { title: string; desc: string; cta: string }> = {
    free: {
      title: "Free",
      desc: "Ideal para empezar — noticias ilimitadas.",
      cta: "Comenzar",
    },
    pro: {
      title: "Pro",
      desc: "Lectura premium sin anuncios + MotorWelt+.",
      cta: "Elegir Pro",
    },
    elite: {
      title: "Elite",
      desc: "Todo Pro + premieres, BTS extendido y prioridad en eventos.",
      cta: "Subirme a Elite",
    },
  };

  // JSON-LD de ofertas (SEO)
  const offersLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: (["free", "pro", "elite"] as PlanKey[]).map((key, i) => {
      const price = prices[key][billing];
      return {
        "@type": "Product",
        position: i + 1,
        name: `MotorWelt ${planCopy[key].title}`,
        description: planCopy[key].desc,
        offers: {
          "@type": "Offer",
          price: price,
          priceCurrency: "MXN",
          priceValidUntil: "2030-01-01",
          availability: "https://schema.org/InStock",
          url: `https://motorwelt.mx/suscripcion?plan=${key}&billing=${billing}`,
          eligibleRegion: "MX",
          category: "Digital",
        },
      };
    }),
  };

  return (
    <>
      <Seo
        title="Suscripción | MotorWelt"
        description="Elige tu plan MotorWelt: Free, Pro o Elite."
      />

      {/* Schema.org Offers */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offersLd) }} />

      {/* Header */}
      <SiteHeader />

      {/* Banner estado de cuenta (placeholder) */}
      {activePlan && (
        <div className="mt-16 border-b border-mw-line/70 bg-black/40 backdrop-blur-md">
          <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-3 py-3 text-sm md:flex-row">
              <p className="text-gray-200">
                Tu plan actual: <span className="font-semibold text-white capitalize">{activePlan}</span>
              </p>
              <div className="flex items-center gap-2">
                <Link href="/pago">
                  <NeonButton variant="cyan" className="h-9 px-4 py-1.5">Gestionar suscripción</NeonButton>
                </Link>
                <button
                  type="button"
                  className="h-9 rounded-2xl border border-white/20 px-4 py-1.5 text-gray-100 hover:bg-white/5"
                  onClick={() => {
                    if (confirm("Esto es un placeholder. ¿Quitar plan activo de ejemplo?")) {
                      localStorage.removeItem("mw_active_plan");
                      location.reload();
                    }
                  }}
                >
                  Cancelar (demo)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HERO compacto (compensa header fijo con mt-16 si no hay banner) */}
      <section className={`relative ${activePlan ? "" : "mt-16"} h-[34vh] min-h-[240px] flex items-center justify-center overflow-hidden`}>
        <Image
          src="/images/noticia-3.jpg"
          alt="Suscripción MotorWelt"
          fill
          sizes="100vw"
          style={{ objectFit: "cover", filter: "brightness(.45) saturate(1.05)" }}
          priority
        />
        {/* halos */}
        <div className="absolute inset-0">
          <div className="absolute -left-14 -top-14 h-72 w-72 rounded-full bg-[#0CE0B2]/18 blur-3xl" />
          <div className="absolute -right-16 -bottom-16 h-[22rem] w-[22rem] rounded-full bg-[#FF7A1A]/18 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white glow-cool">
            Únete a MotorWelt
          </h1>
          <p className="mt-3 text-gray-200 max-w-3xl mx-auto">
            Elige tu plan y vive la experiencia completa: contenido premium, producciones y comunidad.
          </p>
        </div>
      </section>

      {/* CONTENIDO */}
      <main className="pb-16 mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Toggle de cobro */}
        <section className="pt-10">
          <div className="flex flex-col items-center text-gray-200">
            <div className="flex items-center gap-3">
              <span className={`${billing === "monthly" ? "text-white" : "text-gray-400"}`}>
                Mensual
              </span>
              <button
                onClick={() => setBilling((b) => (b === "monthly" ? "yearly" : "monthly"))}
                className="relative inline-flex h-8 w-16 items-center rounded-full bg-black/40 border border-white/20 backdrop-blur-md px-1"
                aria-label="Cambiar periodicidad"
              >
                <span
                  className={`absolute h-6 w-6 rounded-full transition-transform bg-white/90 ${
                    billing === "monthly" ? "translate-x-0" : "translate-x-8"
                  }`}
                />
                <span className="sr-only">Cambiar a anual</span>
              </button>
              <span className={`${billing === "yearly" ? "text-white" : "text-gray-400"}`}>
                Anual
              </span>
              <Badge color="warm">Ahorra 2 meses</Badge>
            </div>
            <p className="mt-2 text-sm text-gray-400">
              Cambia cuando quieras. Los precios se muestran en MXN.
            </p>
          </div>
        </section>

        {/* Grid de planes */}
        <section className="pt-8">
          <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
            {(["free", "pro", "elite"] as const).map((key) => {
              const isFeatured = key === "elite";
              const price = prices[key][billing];
              const isActive = activePlan === key;
              const ctaLabel = isActive ? "Gestionar suscripción" : planCopy[key].cta;

              return (
                <article
                  key={key}
                  className={`rounded-3xl border bg-mw-surface/70 backdrop-blur-md overflow-hidden ${
                    isFeatured
                      ? "border-[#FF7A1A]/60 shadow-[0_0_35px_rgba(255,122,26,.25)]"
                      : "border-mw-line/70"
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-extrabold text-white">{planCopy[key].title}</h3>
                      {isFeatured ? <Badge color="warm">Recomendado</Badge> : <Badge>Esencial</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-gray-300">{planCopy[key].desc}</p>

                    <div className="mt-5 flex items-end gap-2">
                      <span className="text-4xl font-extrabold text-white">
                        {price === 0 ? "Gratis" : `$${price}`}
                      </span>
                      {price !== 0 && (
                        <span className="mb-1 text-sm text-gray-400">
                          /{billing === "monthly" ? "mes" : "año"}
                        </span>
                      )}
                    </div>

                    <ul className="mt-5 space-y-2 text-sm text-gray-200">
                      {FEATURES.map((f, i) => {
                        const ok = f.plans.includes(key);
                        return (
                          <li key={i} className="flex items-start gap-2">
                            <span
                              className={`mt-[2px] inline-flex h-4 w-4 items-center justify-center rounded ${
                                ok
                                  ? "bg-[#0CE0B2]/20 border border-[#0CE0B2]/50 text-white"
                                  : "bg-transparent border border-white/20 text-gray-500"
                              } text-[10px]`}
                            >
                              {ok ? "✓" : "—"}
                            </span>
                            <span className={`${ok ? "text-gray-100" : "text-gray-500"}`}>
                              {f.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <div className="mt-6 flex gap-2">
                      {key === "free" ? (
                        <Link href="/registro" className="w-full">
                          <NeonButton variant="ghost" className="w-full">
                            {ctaLabel}
                          </NeonButton>
                        </Link>
                      ) : (
                        <Link href="/pago" className="w-full">
                          <NeonButton
                            variant={isActive ? "cyan" : isFeatured ? "pink" : "cyan"}
                            className="w-full"
                          >
                            {ctaLabel}
                          </NeonButton>
                        </Link>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Comparativa compacta */}
        <section className="pt-12">
          <div className="rounded-3xl border border-mw-line/70 bg-mw-surface/70 p-6 overflow-hidden">
            <div className="mb-4">
              <h4 className="text-white font-semibold text-lg">Comparativa rápida</h4>
              <p className="text-sm text-gray-400">
                Lo esencial de cada plan, de un vistazo.
              </p>
            </div>
            <div className="grid grid-cols-4 text-sm">
              <div className="py-3 font-semibold text-gray-300">Características</div>
              <div className="py-3 text-center font-semibold text-gray-200">Free</div>
              <div className="py-3 text-center font-semibold text-gray-200">Pro</div>
              <div className="py-3 text-center font-semibold text-gray-200">Elite</div>

              {FEATURES.map((f, i) => (
                <FragmentRow key={i} label={f.label} checks={f.plans} />
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-12">
          <div className="mb-6 text-center">
            <h4 className="font-display text-2xl md:text-3xl font-extrabold text-white glow-warm">
              Preguntas frecuentes
            </h4>
            <div className="mx-auto mt-2 h-1 w-20 rounded-full bg-gradient-to-r from-[#FF7A1A] to-[#0CE0B2]" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {FAQ.map((item, idx) => (
              <Accordion key={idx} question={item.q} answer={item.a} />
            ))}
          </div>
        </section>

        {/* Confianza / legal */}
        <section className="pt-12">
          <div className="rounded-3xl border border-mw-line/70 bg-mw-surface/70 p-6 text-center text-gray-300">
            <p className="text-sm">
              Al suscribirte aceptas nuestros{" "}
              <Link href="/terminos" className="underline underline-offset-4 text-[#43A1AD]">
                Términos y Condiciones
              </Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="underline underline-offset-4 text-[#43A1AD]">
                Política de Privacidad
              </Link>
              .
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Los precios pueden variar por impuestos y tipo de cambio. Cancela cuando quieras.
            </p>
          </div>
        </section>
      </main>

      {/* Estética compartida mínima */}
      <style jsx global>{`
        .glow-cool { text-shadow: 0 0 14px rgba(12, 224, 178, 0.25); }
        .glow-warm { text-shadow: 0 0 14px rgba(255, 122, 26, 0.25); }
      `}</style>
    </>
  );
}

/* =============== Subcomponentes en-file =============== */
function FragmentRow({
  label,
  checks,
}: {
  label: string;
  checks: PlanKey[];
}) {
  const has = (p: PlanKey) => checks.includes(p);
  return (
    <>
      <div className="py-3 border-t border-mw-line/60 text-gray-300">{label}</div>
      {(["free", "pro", "elite"] as const).map((p) => (
        <div
          key={p}
          className="py-3 border-t border-mw-line/60 text-center text-gray-200"
        >
          {has(p) ? "✓" : "—"}
        </div>
      ))}
    </>
  );
}

function Accordion({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-5 py-4 text-left flex items-center justify-between hover:bg-white/5"
        aria-expanded={open}
      >
        <span className="text-white font-semibold">{question}</span>
        <span className="text-gray-300">{open ? "—" : "+"}</span>
      </button>
      {open && (
        <div className="px-5 pb-5 text-sm text-gray-300 border-t border-mw-line/60">
          {answer}
        </div>
      )}
    </div>
  );
}

/* =============== SSR i18n =============== */
export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
    },
  };
}
