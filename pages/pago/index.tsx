// pages/pago/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

/* ===================== Tipos y datos base ===================== */
type PlanKey = "free" | "pro" | "elite";
type Billing = "monthly" | "yearly";

const PRICES: Record<PlanKey, { monthly: number; yearly: number }> = {
  free: { monthly: 0, yearly: 0 },
  pro: { monthly: 99, yearly: 990 },
  elite: { monthly: 199, yearly: 1990 },
};

const PLAN_COPY: Record<PlanKey, { title: string; desc: string }> = {
  free: { title: "Free", desc: "Ideal para empezar — noticias ilimitadas." },
  pro: { title: "Pro", desc: "Lectura premium sin anuncios + MotorWelt+." },
  elite: { title: "Elite", desc: "Todo Pro + premieres, BTS y prioridad en eventos." },
};

/* ===================== UI locales ===================== */
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

function SiteHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-mw-line/70 bg-mw-surface/70 backdrop-blur-md">
      <div className="mx-auto grid h-16 max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="Ir al inicio MotorWelt">
            <Image src="/brand/motorwelt-logo.png" alt="MotorWelt" width={220} height={56} priority className="h-10 md:h-12 w-auto" />
          </Link>
        </div>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/noticias/autos" className="text-gray-200 hover:text-white">Autos</Link>
          <Link href="/noticias/motos" className="text-gray-200 hover:text-white">Motos</Link>
          <Link href="/deportes" className="text-gray-200 hover:text-white">Deportes</Link>
          <Link href="/lifestyle" className="text-gray-200 hover:text-white">Lifestyle</Link>
          <Link href="/comunidad" className="text-gray-200 hover:text-white">Comunidad</Link>
          <Link href="/suscripcion" className="text-gray-200 hover:text-white">Suscripción</Link>
        </nav>
        <div />
      </div>
    </header>
  );
}

function OrderSummary({
  plan,
  billing,
  email,
}: {
  plan: PlanKey;
  billing: Billing;
  email: string;
}) {
  const price = PRICES[plan][billing];
  const title = PLAN_COPY[plan].title;

  return (
    <aside className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-5">
      <h3 className="text-white text-lg font-semibold">Resumen</h3>
      <div className="mt-3 space-y-2 text-sm text-gray-300">
        <div className="flex items-center justify-between">
          <span>Plan</span>
          <span className="text-white font-semibold">{title}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Periodicidad</span>
          <span className="text-white">{billing === "monthly" ? "Mensual" : "Anual"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Correo</span>
          <span className="text-white truncate max-w-[180px]" title={email || "—"}>
            {email || "—"}
          </span>
        </div>
        <div className="mt-3 h-px bg-mw-line/60" />
        <div className="flex items-center justify-between text-base">
          <span className="text-gray-300">Total</span>
          <span className="text-white font-extrabold">
            {price === 0 ? "Gratis" : `$${price} MXN`}
            {price !== 0 && <span className="text-sm text-gray-400"> / {billing === "monthly" ? "mes" : "año"}</span>}
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-gray-500">Los precios pueden variar por impuestos/tipo de cambio.</p>
    </aside>
  );
}

/* ===================== Página ===================== */
export default function Pago() {
  const router = useRouter();

  // Query: ?plan=pro|elite|free&billing=monthly|yearly
  const planFromQuery = (router.query.plan as string) || "pro";
  const billingFromQuery = (router.query.billing as string) || "monthly";

  // Sanitizar
  const plan = ["free", "pro", "elite"].includes(planFromQuery) ? (planFromQuery as PlanKey) : "pro";
  const billing = ["monthly", "yearly"].includes(billingFromQuery) ? (billingFromQuery as Billing) : "monthly";

  const [email, setEmail] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const price = useMemo(() => PRICES[plan][billing], [plan, billing]);

  useEffect(() => {
    // En demo: si viene guardado previamente, precargar email
    if (typeof window === "undefined") return;
    const prevEmail = localStorage.getItem("mw_user_email");
    if (prevEmail) setEmail(prevEmail);
  }, []);

  const validate = () => {
    if (plan === "free") {
      // No se necesita tarjeta en free (pero dejamos el flujo igual para consistencia)
      return email.includes("@");
    }
    return (
      email.includes("@") &&
      cardName.trim().length > 2 &&
      cardNumber.replace(/\s+/g, "").length >= 12 &&
      /\d{2}\/\d{2}/.test(cardExp) &&
      cardCvc.trim().length >= 3
    );
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      alert("Revisa los datos del formulario.");
      return;
    }

    setLoading(true);
    try {
      // DEMO: simular autorización
      await new Promise((r) => setTimeout(r, 900));

      // Guardar estado "suscripción activa" en localStorage para que /suscripcion y /perfil lo lean.
      if (typeof window !== "undefined") {
        localStorage.setItem("mw_active_plan", plan);
        localStorage.setItem("mw_billing_period", billing);   // <= agregado
        localStorage.setItem("mw_user_email", email);         // <= agregado
        localStorage.setItem("mw_last_payment_at", new Date().toISOString());
      }

      setPaid(true);
      // Redirigir de vuelta a /suscripcion
      setTimeout(() => router.push("/suscripcion"), 900);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo title="Pago | MotorWelt" description="Completa tu suscripción a MotorWelt." />
      <SiteHeader />

      {/* HERO */}
      <section className="relative mt-16 h-[30vh] min-h-[220px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/noticia-2.jpg"
          alt="Pago MotorWelt"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover", filter: "brightness(.5) saturate(1.05)" }}
        />
        <div className="absolute inset-0">
          <div className="absolute -left-10 -top-12 h-72 w-72 rounded-full bg-[#0CE0B2]/20 blur-3xl" />
          <div className="absolute -right-14 -bottom-16 h-80 w-80 rounded-full bg-[#FF7A1A]/20 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white">
            Checkout
          </h1>
          <p className="mt-2 text-gray-200">
            Completa tu suscripción {PLAN_COPY[plan].title} ({billing === "monthly" ? "mensual" : "anual"}).
          </p>
        </div>
      </section>

      {/* CONTENIDO */}
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Formulario de pago */}
          <form onSubmit={handlePay} className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-6">
            <h2 className="text-white text-lg font-semibold">Datos de pago</h2>

            {/* Email */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="email" className="block text-sm text-gray-300">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  placeholder="tucorreo@email.com"
                />
              </div>

              {/* Datos de tarjeta (demo) */}
              <div className="sm:col-span-2">
                <label htmlFor="cardName" className="block text-sm text-gray-300">Nombre en la tarjeta</label>
                <input
                  id="cardName"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  placeholder="Como aparece en la tarjeta"
                />
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm text-gray-300">Número de tarjeta</label>
                <input
                  id="cardNumber"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  placeholder="4242 4242 4242 4242"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="cardExp" className="block text-sm text-gray-300">Expiración</label>
                  <input
                    id="cardExp"
                    placeholder="MM/AA"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
                <div>
                  <label htmlFor="cardCvc" className="block text-sm text-gray-300">CVC</label>
                  <input
                    id="cardCvc"
                    inputMode="numeric"
                    placeholder="CVC"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <NeonButton type="submit" variant={plan === "elite" ? "pink" : "cyan"} disabled={loading}>
                {loading ? "Procesando..." : price === 0 ? "Activar gratis" : "Pagar y activar"}
              </NeonButton>
              <Link href="/suscripcion" className="text-sm text-gray-300 underline underline-offset-4 hover:text-white">
                Volver a planes
              </Link>
              {paid && <span className="text-sm text-[#0CE0B2]">Pago exitoso. Redirigiendo…</span>}
            </div>
          </form>

          {/* Resumen */}
          <OrderSummary plan={plan} billing={billing} email={email} />
        </section>

        {/* Legal */}
        <section className="mt-8">
          <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-5 text-center text-gray-300">
            <p className="text-sm">
              Al completar el pago aceptas nuestros{" "}
              <Link href="/terminos" className="underline underline-offset-4 text-[#43A1AD]">Términos y Condiciones</Link>{" "}
              y la{" "}
              <Link href="/privacidad" className="underline underline-offset-4 text-[#43A1AD]">Política de Privacidad</Link>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

/* ===================== SSR i18n ===================== */
export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
    },
  };
}
