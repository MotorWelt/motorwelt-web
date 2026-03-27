// pages/admin/login.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

/* ---------- Botón estilo MotorWelt ---------- */
type Variant = "cyan" | "ghost";

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0";
  const map: Record<Variant, string> = {
    cyan:
      "text-white border-2 border-[#0CE0B2] shadow-[0_0_18px_rgba(12,224,178,.35),inset_0_0_0_1px_rgba(12,224,178,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(12,224,178,.55),inset_0_0_0_1px_rgba(12,224,178,.18)] focus-visible:ring-[#0CE0B2]/40",
    ghost:
      "text-gray-200 border border-white/15 hover:border-white/35 hover:bg-white/5 focus-visible:ring-[#0CE0B2]/40",
  };
  return (
    <button {...props} className={`${base} ${map[variant]} ${className}`}>
      {children}
    </button>
  );
};

/* ---------- Página de login admin/redactores ---------- */

type DemoUser = {
  email: string;
  password: string;
  name: string;
  role: "admin" | "editor" | "autor";
};

const DEMO_USERS: DemoUser[] = [
  {
    email: "admin@motorwelt.com",
    password: "motorwelt_admin",
    name: "Gabriel Rodríguez",
    role: "admin",
  },
  {
    email: "editor@motorwelt.com",
    password: "motorwelt_editor",
    name: "Redactor Autos",
    role: "editor",
  },
];

const LOCALSTORAGE_KEY = "mw_admin_user";

type StoredSession = {
  name: string;
  email: string;
  role: "admin" | "editor" | "autor";
  loggedAt: string;
};

function isValidSession(input: any): input is StoredSession {
  if (!input || typeof input !== "object") return false;
  const has =
    typeof input.name === "string" &&
    typeof input.email === "string" &&
    typeof input.role === "string" &&
    typeof input.loggedAt === "string";
  if (!has) return false;
  if (!["admin", "editor", "autor"].includes(input.role)) return false;
  return true;
}

/* ---------------- Cookies helpers (cliente) ---------------- */

function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60; // seconds
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? " Secure;"
      : "";

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Path=/; Max-Age=${maxAge}; SameSite=Lax;${secure}`;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(new RegExp("(^| )" + escaped + "=([^;]+)"));

  return match ? decodeURIComponent(match[2]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;

  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? " Secure;"
      : "";

  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax;${secure}`;
}

function writeMwCookies(payload: { role: string; name: string; email: string }) {
  setCookie("mw_role", payload.role);
  setCookie("mw_name", payload.name);
  setCookie("mw_email", payload.email);
}

function clearMwCookies() {
  deleteCookie("mw_role");
  deleteCookie("mw_name");
  deleteCookie("mw_email");
}

/* ---------------- Página ---------------- */

const AdminLoginPage: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = useState("gabriel@motorwelt.mx");
  const [password, setPassword] = useState("Mw160295$");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya está logueado → redirigir según rol
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof window === "undefined") return;

    // ✅ Primero intentamos por cookies (guard real vía middleware)
    const cRole = getCookie("mw_role");
    const cEmail = getCookie("mw_email");
    const cName = getCookie("mw_name");

    if (cRole && cEmail && cName && ["admin", "editor", "autor"].includes(cRole)) {
      if (cRole === "admin") router.replace("/admin/perfil");
      else router.replace("/admin/perfil-equipo");
      return;
    }

    // Si no hay cookies, mantenemos fallback con localStorage (demo)
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!stored) return;

      const parsed = JSON.parse(stored);

      // Si está corrupto o incompleto, lo limpiamos y nos quedamos en login
      if (!isValidSession(parsed)) {
        localStorage.removeItem(LOCALSTORAGE_KEY);
        return;
      }

      // ✅ Sesión válida → redirigir
      if (parsed.role === "admin") {
        router.replace("/admin/perfil");
      } else {
        router.replace("/admin/perfil-equipo");
      }
    } catch {
      // Si algo falla, limpiamos para evitar loops raros
      try {
        localStorage.removeItem(LOCALSTORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, [router.isReady, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
const res = await fetch("/api/ai/admin/auth/login", {        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
 body: JSON.stringify({
  email: email.trim().toLowerCase(),
  password,
}),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok || !data?.user) {
        throw new Error(data?.error || "No se pudo iniciar sesión.");
      }

      const user = data.user as {
        name: string;
        email: string;
        role: "admin" | "editor" | "autor";
      };

      const payload: StoredSession = {
        name: user.name,
        email: user.email,
        role: user.role,
        loggedAt: new Date().toISOString(),
      };

      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(payload));

      writeMwCookies({
        role: user.role,
        name: user.name,
        email: user.email,
      });

      if (user.role === "admin") {
        router.push("/admin/perfil");
      } else {
        router.push("/admin/perfil-equipo");
      }
    } catch (err: any) {
      setError(err?.message || "Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Seo
        title="Acceso administradores | MotorWelt"
        description="Panel de acceso para administradores y redactores de MotorWelt."
      />

      <main className="min-h-screen bg-gradient-to-b from-black via-[#050812] to-black text-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl rounded-[30px] border border-white/10 bg-black/50 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,.8)] overflow-hidden grid grid-cols-1 md:grid-cols-[1.2fr_1fr]">
          {/* Lado izquierdo */}
          <section className="relative p-8 md:p-10 border-b md:border-b-0 md:border-r border-white/10 overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-16 -top-20 h-56 w-56 rounded-full bg-[#0CE0B2]/20 blur-3xl" />
              <div className="absolute -right-24 bottom-[-60px] h-80 w-80 rounded-full bg-[#FF7A1A]/18 blur-3xl" />
            </div>

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs text-gray-300 hover:text-white"
                >
                  ⟵ Volver al sitio
                </Link>
                <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-gray-300">
                  MotorWelt Admin
                </span>
              </div>

              <div className="mt-8">
                <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
                  Centro de control MotorWelt
                </h1>
                <p className="mt-3 text-sm text-gray-300 max-w-lg">
                  Acceso para administradores, editores y autores. Desde aquí puedes
                  gestionar notas, usuarios, publicidad y revisar la actividad del
                  equipo.
                </p>
              </div>

              <div className="mt-8 grid gap-3 text-xs text-gray-200">
                <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
                  <p className="font-semibold text-white">Roles soportados (demo)</p>
                  <ul className="mt-1 list-disc pl-4 space-y-0.5 text-[11px] text-gray-300">
                    <li>
                      <span className="font-semibold text-[#0CE0B2]">Admin:</span>{" "}
                      acceso total a notas, usuarios, publicidad y métricas.
                    </li>
                    <li>
                      <span className="font-semibold text-[#FF7A1A]">Editor:</span>{" "}
                      puede crear/editar notas y gestionar contenido.
                    </li>
                    <li>
                      <span className="font-semibold text-gray-100">Autor:</span>{" "}
                      enfocado en crear contenido propio.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 px-3 py-2">
                  <p className="font-semibold text-white text-xs mb-1">
                    Credenciales demo
                  </p>
                  <p className="text-[11px] text-gray-300">
                    <span className="font-semibold">Admin:</span> admin@motorwelt.com /
                    motorwelt_admin
                  </p>
                  <p className="text-[11px] text-gray-300">
                    <span className="font-semibold">Editor:</span> editor@motorwelt.com /
                    motorwelt_editor
                  </p>
                  <p className="mt-1 text-[10px] text-gray-500">
                    Cuando conectes tu backend, aquí validaremos contra tu base de
                    datos o proveedor de auth.
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-8 text-[11px] text-gray-500">
                MotorWelt · Uso interno · {new Date().getFullYear()}
              </div>
            </div>
          </section>

          {/* Lado derecho */}
          <section className="relative p-8 md:p-10 bg-gradient-to-b from-[#050812] via-black to-black">
            <div className="relative z-10 max-w-sm mx-auto w-full">
              <h2 className="text-xl font-semibold text-white">Acceso al panel</h2>
              <p className="mt-1 text-xs text-gray-400">
                Ingresa con tu correo corporativo y contraseña asignada.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1">
                  <label htmlFor="admin-email" className="text-xs text-gray-300">
                    Correo electrónico
                  </label>
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tucorreo@motorwelt.com"
                    className="w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/50"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="admin-password" className="text-xs text-gray-300">
                    Contraseña
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="w-full rounded-2xl border border-white/20 bg-black/50 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/50"
                    required
                  />
                </div>

                {error && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Conexión segura</span>
                  </div>
                  <button
                    type="button"
                    className="text-[11px] text-gray-400 hover:text-gray-200"
                  >
                    ¿Olvidaste tu acceso?
                  </button>
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    variant="cyan"
                    className="w-full justify-center"
                    disabled={loading}
                  >
                    {loading ? "Verificando…" : "Entrar al panel"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-[11px] text-gray-400">
                <p>
                  Este acceso es exclusivo para el equipo interno de MotorWelt. Si
                  necesitas una cuenta, solicítala al administrador.
                </p>
              </div>

              {/* 
                NOTA: Logout se implementa donde esté tu botón "Cerrar sesión" (header/sidebar).
                Ejemplo:
                const handleLogout = () => {
                  try { localStorage.removeItem("mw_admin_user"); } catch {}
                  clearMwCookies();
                  router.push("/admin/login");
                };
              */}
            </div>

            <div className="pointer-events-none absolute -bottom-24 -right-10 h-52 w-52 rounded-full bg-[#0CE0B2]/20 blur-3xl" />
          </section>
        </div>
      </main>
    </>
  );
};

export default AdminLoginPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "es", ["home"], nextI18NextConfig)),
    },
  };
}