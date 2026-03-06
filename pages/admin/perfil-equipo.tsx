// pages/admin/perfil-equipo.tsx
import React, { useEffect, useMemo, useState } from "react";
import Seo from "../../components/Seo";
import Link from "next/link";
import { useRouter } from "next/router";
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

/* ---------- Tipos demo ---------- */

type TeamNoteStatus = "borrador" | "revision" | "publicada";

type TeamNote = {
  id: number;
  title: string;
  section: string;
  status: TeamNoteStatus;
  createdAt: string;
  lastEdit: string;
  views: number;
};

type TeamActivity = {
  id: number;
  action: string;
  target: string;
  when: string;
};

const demoMyNotes: TeamNote[] = [
  {
    id: 1,
    title: "BMW M2 x Mexico City nights",
    section: "Lifestyle",
    status: "publicada",
    createdAt: "Hace 3 días",
    lastEdit: "Hoy, 10:12",
    views: 4210,
  },
  {
    id: 2,
    title: "Las 5 chamarras clave para track day",
    section: "Noticias Motos",
    status: "revision",
    createdAt: "Ayer",
    lastEdit: "Ayer, 19:34",
    views: 980,
  },
  {
    id: 3,
    title: "Guía rápida para tu primer track day",
    section: "Deportes",
    status: "borrador",
    createdAt: "Hace 5 días",
    lastEdit: "Hace 2 días",
    views: 0,
  },
];

const demoMyActivity: TeamActivity[] = [
  {
    id: 1,
    action: "Actualizaste",
    target: '“BMW M2 x Mexico City nights”',
    when: "Hoy, 10:12",
  },
  {
    id: 2,
    action: "Enviaste a revisión",
    target: "“Las 5 chamarras clave para track day”",
    when: "Ayer, 19:34",
  },
  {
    id: 3,
    action: "Guardaste borrador",
    target: "“Guía rápida para tu primer track day”",
    when: "Hace 2 días",
  },
];

/* ---------- Helpers UI ---------- */

function StatusPill({ status }: { status: TeamNoteStatus }) {
  const map: Record<TeamNoteStatus, string> = {
    publicada: "bg-emerald-500/10 text-emerald-300",
    revision: "bg-amber-500/10 text-amber-300",
    borrador: "bg-slate-500/10 text-slate-200",
  };
  const label: Record<TeamNoteStatus, string> = {
    publicada: "Publicada",
    revision: "En revisión",
    borrador: "Borrador",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${map[status]}`}
    >
      {label[status]}
    </span>
  );
}

/* ============================================================================= */

export default function PerfilEquipo() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [myNotes, setMyNotes] = useState<TeamNote[]>(demoMyNotes);
  const [activity] = useState<TeamActivity[]>(demoMyActivity);

  const [filterStatus, setFilterStatus] = useState<TeamNoteStatus | "todos">(
    "todos"
  );

  const notesPublished = useMemo(
    () => myNotes.filter((n) => n.status === "publicada").length,
    [myNotes]
  );
  const notesRevision = useMemo(
    () => myNotes.filter((n) => n.status === "revision").length,
    [myNotes]
  );
  const notesDrafts = useMemo(
    () => myNotes.filter((n) => n.status === "borrador").length,
    [myNotes]
  );

  const filteredNotes = useMemo(() => {
    if (filterStatus === "todos") return myNotes;
    return myNotes.filter((n) => n.status === filterStatus);
  }, [myNotes, filterStatus]);

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
      // Si es admin, mejor mandarlo a su panel completo
      if (parsed.role === "admin") {
        router.replace("/admin/perfil");
        return;
      }
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

  // Demo: cambiar status localmente
  const sendToReview = (id: number) => {
    setMyNotes((prev) =>
      prev.map((n) =>
        n.id === id && n.status === "borrador"
          ? { ...n, status: "revision" }
          : n
      )
    );
  };

  const markAsDraft = (id: number) => {
    setMyNotes((prev) =>
      prev.map((n) =>
        n.id === id && n.status !== "borrador"
          ? { ...n, status: "borrador" }
          : n
      )
    );
  };

  if (!authReady) {
    return null;
  }

  return (
    <>
      <Seo
        title="Perfil de redacción | MotorWelt"
        description="Panel para redactores y editores de MotorWelt."
      />

      <main className="min-h-screen bg-mw-surface/95 pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Panel de redacción
              </p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl font-extrabold text-white">
                Mi perfil de MotorWelt
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-xl">
                Aquí gestionas tus notas, das seguimiento a su estado editorial
                y ves cómo se desempeña tu contenido dentro del ecosistema
                MotorWelt.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sesión activa como</span>
                  <span className="font-semibold text-white">
                    {currentUser?.name ?? "Colaborador MotorWelt"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Rol:{" "}
                  <span className="font-semibold text-[#0CE0B2]">
                    {currentUser?.role ?? "editor"}
                  </span>
                </p>
              </div>
              <Link href="/">
                <Button variant="ghost">Ver sitio público</Button>
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

          {/* Stats rápidas */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-10">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-gray-400">Publicadas</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {notesPublished}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Notas que ya están visibles en el sitio.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-gray-400">En revisión</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {notesRevision}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Pendientes de aprobación editorial.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-gray-400">Borradores</p>
              <p className="mt-1 text-2xl font-semibold text-white">
                {notesDrafts}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Ideas y textos en construcción sólo visibles para ti.
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1.4fr]">
            {/* Columna izquierda: Mis notas */}
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Mis notas
                    </h2>
                    <p className="text-sm text-gray-300">
                      Gestiona el estado editorial de tus textos y da seguimiento
                      a su desempeño.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setFilterStatus("todos")}
                      className={`rounded-full px-3 py-1 border ${
                        filterStatus === "todos"
                          ? "border-[#FF7A1A] text-white bg-[#FF7A1A]/10"
                          : "border-white/20 text-gray-300 hover:border-white/40"
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("publicada")}
                      className={`rounded-full px-3 py-1 border ${
                        filterStatus === "publicada"
                          ? "border-emerald-400 text-emerald-200 bg-emerald-500/10"
                          : "border-white/20 text-gray-300 hover:border-white/40"
                      }`}
                    >
                      Publicadas
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("revision")}
                      className={`rounded-full px-3 py-1 border ${
                        filterStatus === "revision"
                          ? "border-amber-300 text-amber-200 bg-amber-500/10"
                          : "border-white/20 text-gray-300 hover:border-white/40"
                      }`}
                    >
                      En revisión
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterStatus("borrador")}
                      className={`rounded-full px-3 py-1 border ${
                        filterStatus === "borrador"
                          ? "border-slate-300 text-slate-200 bg-slate-500/10"
                          : "border-white/20 text-gray-300 hover:border-white/40"
                      }`}
                    >
                      Borradores
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {filteredNotes.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-center text-sm text-gray-300">
                      No tienes notas con ese estado. Cambia el filtro o crea
                      una nueva nota desde el panel de contenido.
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {note.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {note.section} · Creada: {note.createdAt} · Última
                            edición: {note.lastEdit}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            Views (demo): {note.views.toLocaleString("es-MX")}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 items-center justify-end">
                          <StatusPill status={note.status} />
                          <Button
                            variant="ghost"
                            type="button"
                            className="px-3 py-1.5 text-xs"
                          >
                            Abrir / editar
                          </Button>
                          {note.status === "borrador" && (
                            <Button
                              variant="cyan"
                              type="button"
                              className="px-3 py-1.5 text-xs"
                              onClick={() => sendToReview(note.id)}
                            >
                              Enviar a revisión
                            </Button>
                          )}
                          {note.status !== "borrador" && (
                            <button
                              type="button"
                              onClick={() => markAsDraft(note.id)}
                              className="text-[11px] text-gray-400 hover:text-gray-200"
                            >
                              Marcar como borrador
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Notas rápidas / guía (opcional) */}
              <div className="rounded-3xl border border-white/10 bg-black/25 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white">
                  Guía rápida editorial
                </h2>
                <ul className="mt-3 text-sm text-gray-300 space-y-1">
                  <li>• “Borrador”: sólo tú lo ves.</li>
                  <li>• “En revisión”: el admin/editor valida el contenido.</li>
                  <li>• “Publicada”: ya está visible en el sitio MotorWelt.</li>
                </ul>
                <p className="mt-3 text-[11px] text-gray-500">
                  Cuando conectemos el backend, estos estados se sincronizarán
                  con la base de datos y workflow editorial real (por ejemplo,
                  Sanity o tu API personalizada).
                </p>
              </div>
            </section>

            {/* Columna derecha: Actividad + métricas personales */}
            <section className="space-y-6">
              {/* Actividad personal */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">
                    Mi actividad reciente
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Últimos movimientos en tus notas.
                  </p>
                </div>
                <div className="mt-4 space-y-3">
                  {activity.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-3 py-2.5"
                    >
                      <div>
                        <p className="text-xs text-gray-300">
                          {item.action}{" "}
                          <span className="text-gray-100">{item.target}</span>
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          {item.when}
                        </p>
                      </div>
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-[#FF7A1A]" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Métricas personales (demo) */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">
                    Métricas de mis notas
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Resumen simple de desempeño (demo).
                  </p>
                </div>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-200">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                    <p className="text-xs text-gray-400">
                      Views totales (demo)
                    </p>
                    <p className="mt-1 text-xl font-semibold text-white">
                      {myNotes
                        .reduce((acc, n) => acc + n.views, 0)
                        .toLocaleString("es-MX")}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Suma de todas tus notas publicadas.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-3">
                    <p className="text-xs text-gray-400">
                      Nota más leída (demo)
                    </p>
                    <p className="mt-1 text-sm font-semibold text-white">
                      {myNotes
                        .slice()
                        .sort((a, b) => b.views - a.views)[0]?.title ??
                        "Sin datos"}
                    </p>
                    <p className="mt-1 text-[11px] text-gray-500">
                      Cuando conectemos Analytics, esto vendrá de datos reales.
                    </p>
                  </div>
                </div>

                <p className="mt-4 text-[11px] text-gray-500">
                  Más adelante, este bloque puede leer directamente de Google
                  Analytics o de tu API interna para mostrar views, CTR y tiempo
                  de lectura por nota.
                </p>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}

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
