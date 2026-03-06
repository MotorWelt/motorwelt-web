// pages/admin/registro-usuario.tsx
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

const LOCALSTORAGE_KEY = "mw_admin_user";

/* ---------- Botón estilo MotorWelt ---------- */
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

/* ---------- Toggle para permisos ---------- */
function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 cursor-pointer hover:border-white/30 transition">
      <div className="flex-1">
        <p className="text-sm text-gray-100">{label}</p>
        {description && (
          <p className="mt-0.5 text-[11px] text-gray-500">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        className="mt-1 inline-flex items-center gap-2"
      >
        <span
          className={[
            "relative inline-flex h-6 w-11 items-center rounded-full transition",
            checked ? "bg-[#0CE0B2]" : "bg-white/20",
          ].join(" ")}
        >
          <span
            className={[
              "inline-block h-4 w-4 rounded-full bg-white shadow transform transition",
              checked ? "translate-x-[22px]" : "translate-x-[4px]",
            ].join(" ")}
          />
        </span>
      </button>
    </label>
  );
}

/* ---------- Tipos ---------- */

type Role = "admin" | "editor" | "autor";

type Permissions = {
  canAccessDashboard: boolean;
  canEditNoticiasAutos: boolean;
  canEditNoticiasMotos: boolean;
  canEditDeportes: boolean;
  canEditLifestyle: boolean;
  canEditComunidad: boolean;
  canPublishDirectly: boolean;
  canManageUsers: boolean;
  canToggleAds: boolean;
  canSeeMetrics: boolean;
  canUseAiTools: boolean;
};

const ROLE_PRESETS: Record<Role, Permissions> = {
  admin: {
    canAccessDashboard: true,
    canEditNoticiasAutos: true,
    canEditNoticiasMotos: true,
    canEditDeportes: true,
    canEditLifestyle: true,
    canEditComunidad: true,
    canPublishDirectly: true,
    canManageUsers: true,
    canToggleAds: true,
    canSeeMetrics: true,
    canUseAiTools: true,
  },
  editor: {
    canAccessDashboard: true,
    canEditNoticiasAutos: true,
    canEditNoticiasMotos: true,
    canEditDeportes: true,
    canEditLifestyle: true,
    canEditComunidad: true,
    canPublishDirectly: true,
    canManageUsers: false,
    canToggleAds: false,
    canSeeMetrics: true,
    canUseAiTools: true,
  },
  autor: {
    canAccessDashboard: true,
    canEditNoticiasAutos: true,
    canEditNoticiasMotos: true,
    canEditDeportes: true,
    canEditLifestyle: true,
    canEditComunidad: true,
    canPublishDirectly: false,
    canManageUsers: false,
    canToggleAds: false,
    canSeeMetrics: false,
    canUseAiTools: true,
  },
};

/* ============================================================================= */

const RegistroUsuarioPage: React.FC = () => {
  const router = useRouter();

  // usuario actual (para proteger ruta)
  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [authReady, setAuthReady] = useState(false);

  // datos del nuevo usuario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("editor");
  const [tempPassword, setTempPassword] = useState("");
  const [active, setActive] = useState(true);
  const [notes, setNotes] = useState("");

  const [permissions, setPermissions] = useState<Permissions>(
    ROLE_PRESETS["editor"]
  );

  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  /* ---------- Protección de ruta ---------- */
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!stored) {
        router.replace("/admin/login");
        return;
      }
      const parsed = JSON.parse(stored);
      setCurrentUser(parsed);
      setAuthReady(true);
    } catch {
      router.replace("/admin/login");
    }
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCALSTORAGE_KEY);
      router.push("/admin/login");
    }
  };

  /* ---------- Helpers ---------- */

  const handleChangeRole = (newRole: Role) => {
    setRole(newRole);
    setPermissions(ROLE_PRESETS[newRole]);
  };

  const togglePermission = (key: keyof Permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setSavingState("saving");

    const payload = {
      name: name.trim(),
      email: email.trim(),
      role,
      tempPassword: tempPassword || undefined,
      active,
      permissions,
      notes: notes.trim() || undefined,
      createdBy: currentUser?.email ?? "admin@motorwelt.com",
      createdAt: new Date().toISOString(),
    };

    // Aquí luego harías POST a tu backend / API interna
    console.log("Nuevo usuario (demo):", payload);

    setTimeout(() => {
      setSavingState("saved");
      setTimeout(() => setSavingState("idle"), 2000);
      // limpiar un poco el formulario
      setName("");
      setEmail("");
      setTempPassword("");
      setNotes("");
      setRole("editor");
      setPermissions(ROLE_PRESETS["editor"]);
    }, 700);
  };

  if (!authReady) return null;

  return (
    <>
      <Seo
        title="Registrar nuevo usuario | MotorWelt"
        description="Pantalla para crear nuevos usuarios internos (admin, editor, autor) y definir sus permisos de edición."
      />

      <main className="min-h-screen bg-mw-surface/95 pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          {/* Encabezado + breadcrumb */}
          <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <nav
                aria-label="Breadcrumb"
                className="text-[11px] text-gray-400 mb-1"
              >
                <ol className="flex items-center gap-1">
                  <li>
                    <Link
                      href="/admin/perfil"
                      className="hover:text-gray-200"
                    >
                      Panel admin
                    </Link>
                  </li>
                  <li className="text-gray-500">/</li>
                  <li className="text-gray-300">Registrar usuario</li>
                </ol>
              </nav>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
                Registro de nuevo usuario
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-xl">
                Crea cuentas para redactores, editores o nuevos administradores
                y define exactamente a qué secciones y herramientas pueden
                acceder dentro de MotorWelt.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sesión como</span>
                  <span className="font-semibold text-white">
                    {currentUser?.name ?? "Admin MotorWelt"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Rol:{" "}
                  <span className="font-semibold text-[#0CE0B2]">
                    {currentUser?.role ?? "admin"}
                  </span>
                </p>
              </div>
              <Link href="/admin/perfil">
                <Button variant="ghost" type="button">
                  ← Volver al panel
                </Button>
              </Link>
              <Button
                variant="ghost"
                type="button"
                className="text-xs border-red-400/60 text-red-300 hover:text-red-200 hover:border-red-300"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </section>

          {/* Contenido principal */}
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-6 lg:grid-cols-[1.6fr_1.7fr]"
          >
            {/* Columna izquierda: datos básicos */}
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  Datos del usuario
                </h2>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="user-name-new"
                      className="text-xs text-gray-300"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="user-name-new"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej. Redactor Motos / Ana López"
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="user-email-new"
                      className="text-xs text-gray-300"
                    >
                      Correo corporativo
                    </label>
                    <input
                      id="user-email-new"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@motorwelt.com"
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      required
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <label
                        htmlFor="user-role-new"
                        className="text-xs text-gray-300"
                      >
                        Rol principal
                      </label>
                      <select
                        id="user-role-new"
                        value={role}
                        onChange={(e) =>
                          handleChangeRole(e.target.value as Role)
                        }
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="autor">Autor</option>
                      </select>
                      <p className="mt-1 text-[10px] text-gray-500">
                        Al cambiar el rol, se ajustan automáticamente los
                        permisos base (puedes afinarlos a mano).
                      </p>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="user-temp-pass"
                        className="text-xs text-gray-300"
                      >
                        Contraseña temporal (opcional)
                      </label>
                      <input
                        id="user-temp-pass"
                        type="text"
                        value={tempPassword}
                        onChange={(e) => setTempPassword(e.target.value)}
                        placeholder="Ej. MotorWelt2025!"
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      />
                      <p className="mt-1 text-[10px] text-gray-500">
                        Puedes dejarlo vacío si la contraseña se genera desde tu
                        sistema de autenticación.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={(e) => setActive(e.target.checked)}
                        className="h-3.5 w-3.5 rounded border border-white/30 bg-black/60 text-[#0CE0B2]"
                      />
                      <span>Usuario activo desde el primer día</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-3">
                <h2 className="text-lg font-semibold text-white">
                  Notas internas
                </h2>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Ej. Responsable de coberturas MotoGP y contenido de prueba de motos. Disponible fines de semana."
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                />
                <p className="text-[11px] text-gray-500">
                  Estas notas son sólo para uso interno en el panel de
                  administración.
                </p>
              </div>
            </section>

            {/* Columna derecha: permisos detallados */}
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  Permisos de edición por sección
                </h2>
                <p className="text-[11px] text-gray-400 mb-1">
                  Define qué partes del sitio puede editar este usuario. Por
                  defecto usamos una plantilla según el rol, pero puedes
                  ajustarlo manualmente.
                </p>

                <div className="space-y-2">
                  <Toggle
                    checked={permissions.canAccessDashboard}
                    onChange={() => togglePermission("canAccessDashboard")}
                    label="Acceso al panel interno"
                    description="Puede entrar a /admin y ver sus secciones asignadas."
                  />
                  <Toggle
                    checked={permissions.canEditNoticiasAutos}
                    onChange={() => togglePermission("canEditNoticiasAutos")}
                    label="Editar Noticias de Autos"
                    description="Crear, editar y enviar a revisión notas de la sección de autos."
                  />
                  <Toggle
                    checked={permissions.canEditNoticiasMotos}
                    onChange={() => togglePermission("canEditNoticiasMotos")}
                    label="Editar Noticias de Motos"
                    description="Ideal para redactores enfocados en BMW Motorrad u otras marcas."
                  />
                  <Toggle
                    checked={permissions.canEditDeportes}
                    onChange={() => togglePermission("canEditDeportes")}
                    label="Editar sección Deportes"
                    description="Coberturas de F1, WEC, MotoGP, resistencia, etc."
                  />
                  <Toggle
                    checked={permissions.canEditLifestyle}
                    onChange={() => togglePermission("canEditLifestyle")}
                    label="Editar sección Lifestyle"
                    description="Moda, relojería, arte automotriz, colaboraciones."
                  />
                  <Toggle
                    checked={permissions.canEditComunidad}
                    onChange={() => togglePermission("canEditComunidad")}
                    label="Editar sección Comunidad"
                    description="Rodadas, eventos, meets, clubs y notas de la comunidad."
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  Permisos avanzados
                </h2>
                <p className="text-[11px] text-gray-400 mb-1">
                  Aquí controlas cosas más sensibles: publicación directa,
                  usuarios, publicidad, métricas e IA.
                </p>

                <div className="space-y-2">
                  <Toggle
                    checked={permissions.canPublishDirectly}
                    onChange={() => togglePermission("canPublishDirectly")}
                    label="Puede publicar directamente"
                    description="Si está desactivado, sus notas sólo pueden quedar en borrador o revisión."
                  />
                  <Toggle
                    checked={permissions.canManageUsers}
                    onChange={() => togglePermission("canManageUsers")}
                    label="Puede gestionar usuarios"
                    description="Crear, editar o desactivar cuentas internas. Recomendado sólo para admins."
                  />
                  <Toggle
                    checked={permissions.canToggleAds}
                    onChange={() => togglePermission("canToggleAds")}
                    label="Puede activar / desactivar publicidad"
                    description="Control de los bloques de anuncios (leaderboards, billboards, etc.)."
                  />
                  <Toggle
                    checked={permissions.canSeeMetrics}
                    onChange={() => togglePermission("canSeeMetrics")}
                    label="Puede ver métricas del sitio y redes"
                    description="Acceso al panel de KPIs (Google Analytics, redes, etc.)."
                  />
                  <Toggle
                    checked={permissions.canUseAiTools}
                    onChange={() => togglePermission("canUseAiTools")}
                    label="Puede usar herramientas de IA"
                    description="Acceso a corrección de artículos, insights SEO y sugerencias de tareas con IA."
                  />
                </div>
              </div>

              {/* Barra de acciones */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="text-[11px] text-gray-400">
                  {savingState === "saving" && (
                    <span className="text-[#0CE0B2]">
                      Guardando usuario (demo)… revisa la consola del navegador
                      para ver el payload.
                    </span>
                  )}
                  {savingState === "saved" && (
                    <span className="text-emerald-300">
                      Usuario creado (demo). Ahora podrías persistirlo en tu
                      base de datos.
                    </span>
                  )}
                  {savingState === "idle" && (
                    <span>
                      Revisa bien el rol y los permisos antes de guardar. Todo
                      esto se puede conectar después a tu backend / CMS.
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-end">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setName("");
                      setEmail("");
                      setTempPassword("");
                      setNotes("");
                      setRole("editor");
                      setPermissions(ROLE_PRESETS["editor"]);
                    }}
                  >
                    Limpiar formulario
                  </Button>
                  <Button
                    type="submit"
                    variant="pink"
                    disabled={savingState === "saving"}
                  >
                    Guardar nuevo usuario (demo)
                  </Button>
                </div>
              </div>
            </section>
          </form>
        </div>
      </main>
    </>
  );
};

export default RegistroUsuarioPage;

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
