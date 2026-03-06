// pages/perfil/index.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Seo from "../../components/Seo";
import ProfileButton from "../../components/ProfileButton";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

type PlanKey = "free" | "pro" | "elite" | null;
type Billing = "monthly" | "yearly" | null;

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

function Badge({ children, color = "cool" }: { children: React.ReactNode; color?: "cool" | "warm" }) {
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

export default function Perfil() {
  const [email, setEmail] = useState("");
  const [savedEmail, setSavedEmail] = useState("");
  const [plan, setPlan] = useState<PlanKey>(null);
  const [billing, setBilling] = useState<Billing>(null);
  const [lastPayment, setLastPayment] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const em = localStorage.getItem("mw_user_email") || "";
    const pl = (localStorage.getItem("mw_active_plan") as PlanKey) || null;
    const bp = (localStorage.getItem("mw_billing_period") as Billing) || null;
    const lp = localStorage.getItem("mw_last_payment_at");
    setEmail(em);
    setSavedEmail(em);
    setPlan(pl);
    setBilling(bp);
    setLastPayment(lp);
  }, []);

  const planTitle = useMemo(() => {
    if (!plan) return "Sin suscripción";
    return plan === "free" ? "Free" : plan === "pro" ? "Pro" : "Elite";
  }, [plan]);

  const billingLabel = useMemo(() => {
    if (!billing) return "—";
    return billing === "monthly" ? "Mensual" : "Anual";
  }, [billing]);

  const handleSaveEmail = () => {
    if (!email.includes("@")) {
      setNotice("Ingresa un correo válido.");
      return;
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("mw_user_email", email);
      setSavedEmail(email);
      setNotice("Correo actualizado.");
      setTimeout(() => setNotice(""), 1500);
    }
  };

  const handleCancel = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("mw_active_plan");
      localStorage.removeItem("mw_billing_period");
      localStorage.removeItem("mw_last_payment_at");
      setPlan(null);
      setBilling(null);
      setLastPayment(null);
      setNotice("Suscripción cancelada (demo).");
      setTimeout(() => setNotice(""), 1500);
    }
  };

  return (
    <>
      <Seo title="Tu Perfil | MotorWelt" description="Gestiona tu cuenta y tu suscripción de MotorWelt." />

      {/* Header simple con botón Perfil (coherente con el resto) */}
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
          </nav>
          <div className="flex items-center justify-end">
            <ProfileButton />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative mt-16 h-[30vh] min-h-[220px] flex items-center justify-center overflow-hidden">
        <Image
          src="/images/comunidad.jpg"
          alt="Perfil MotorWelt"
          fill
          sizes="100vw"
          priority
          style={{ objectFit: "cover", filter: "brightness(.55) saturate(1.05)" }}
        />
        <div className="absolute inset-0">
          <div className="absolute -left-12 -top-12 h-72 w-72 rounded-full bg-[#0CE0B2]/20 blur-3xl" />
          <div className="absolute -right-14 -bottom-16 h-80 w-80 rounded-full bg-[#FF7A1A]/20 blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-wide text-white">Tu Perfil</h1>
          <p className="mt-2 text-gray-200">Gestiona tu cuenta, plan y preferencias.</p>
        </div>
      </section>

      {/* CONTENIDO */}
      <main className="mx-auto w-full max-w-[1200px] px-4 pb-16 sm:px-6 lg:px-8">
        {/* Aviso */}
        {notice && (
          <div className="mt-6 rounded-2xl border border-[#0CE0B2]/40 bg-[#0CE0B2]/10 p-3 text-sm text-white">
            {notice}
          </div>
        )}

        <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          {/* Columna principal */}
          <div className="grid gap-6">
            {/* Cuenta */}
            <article className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-6">
              <h2 className="text-white text-lg font-semibold">Cuenta</h2>
              <p className="mt-1 text-sm text-gray-300">Actualiza tu información de contacto.</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm text-gray-300">Correo electrónico</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@email.com"
                    className="mt-1 w-full rounded-2xl border border-white/20 bg-black/40 px-4 py-2 text-sm text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  />
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <NeonButton variant="cyan" onClick={handleSaveEmail}>Guardar</NeonButton>
                {savedEmail && (
                  <span className="text-sm text-gray-400">Guardado como: <b className="text-white">{savedEmail}</b></span>
                )}
              </div>
            </article>

            {/* Preferencias básicas (placeholder para futuro) */}
            <article className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-6">
              <h2 className="text-white text-lg font-semibold">Preferencias</h2>
              <p className="mt-1 text-sm text-gray-300">Pronto podrás configurar newsletters y notificaciones.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-gray-300">Autos</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-gray-300">Motos</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-gray-300">Deportes</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-gray-300">Lifestyle</span>
                <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-gray-300">Comunidad</span>
              </div>
            </article>
          </div>

          {/* Sidebar: Suscripción */}
          <aside className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-white text-lg font-semibold">Suscripción</h3>
              {plan ? (
                <Badge color={plan === "elite" ? "warm" : "cool"}>{planTitle}</Badge>
              ) : (
                <Badge>Sin plan</Badge>
              )}
            </div>

            <div className="mt-3 space-y-2 text-sm text-gray-300">
              <div className="flex items-center justify-between">
                <span>Estado</span>
                <span className="text-white">{plan ? "Activa" : "No activa"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Periodicidad</span>
                <span className="text-white">{plan ? billingLabel : "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Último pago</span>
                <span className="text-white">{lastPayment ? new Date(lastPayment).toLocaleString() : "—"}</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <Link href="/suscripcion">
                <NeonButton variant={plan === "elite" ? "pink" : "cyan"} className="w-full">
                  Gestionar suscripción
                </NeonButton>
              </Link>
              {plan ? (
                <NeonButton variant="ghost" className="w-full" onClick={handleCancel}>
                  Cancelar suscripción (demo)
                </NeonButton>
              ) : (
                <Link href="/suscripcion">
                  <NeonButton variant="pink" className="w-full">Elegir un plan</NeonButton>
                </Link>
              )}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              *Esta es una demo local. En producción se conectará al proveedor de pagos para gestionar renovaciones y cancelaciones reales.
            </p>
          </aside>
        </section>

        {/* Legal */}
        <section className="mt-8">
          <div className="rounded-2xl border border-mw-line/70 bg-mw-surface/70 p-5 text-center text-gray-300">
            <p className="text-sm">
              Al usar MotorWelt aceptas nuestros{" "}
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

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
    },
  };
}
