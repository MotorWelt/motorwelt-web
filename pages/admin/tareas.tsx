// pages/admin/tareas.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

const LOCALSTORAGE_KEY = "mw_admin_user";

/* ---------- Botón estilo MotorWelt (mismo lenguaje visual) ---------- */
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

/* ---------- Tipos de tareas ---------- */

type TaskStatus =
  | "idea"
  | "asignada"
  | "redaccion"
  | "revision"
  | "lista"
  | "publicada";

type TaskPriority = "alta" | "media" | "baja";

type TaskOrigin = "manual" | "ia" | "metricas";

type Task = {
  id: number;
  title: string;
  section: "Autos" | "Motos" | "Deportes" | "Lifestyle" | "Comunidad";
  type: "Noticia" | "Crónica" | "Opinión" | "Review" | "Entrevista";
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  due: string; // texto amigable por ahora (Luego → fecha real)
  origin: TaskOrigin;
  linkedNote?: string;
};

type CurrentUser = {
  name?: string;
  email?: string;
  role?: "admin" | "editor" | "autor" | string;
};

/* ---------- Sugerencias IA ---------- */

type AiTaskSuggestion = {
  id: string;
  title: string;
  section: Task["section"];
  type: Task["type"];
  priority: TaskPriority;
  reason: string;
  suggestedDue?: string;
};

/* ---------- Demo data ---------- */

const demoTasks: Task[] = [
  {
    id: 1,
    title: "Crónica GP de Brasil F1 – enfoque en Checo y estrategia",
    section: "Deportes",
    type: "Crónica",
    status: "redaccion",
    priority: "alta",
    assignee: "Redactor Autos",
    due: "Hoy · 23:00",
    origin: "manual",
    linkedNote: 'nota: "Crónica GP Brasil 2025"',
  },
  {
    id: 2,
    title: "Review: BMW R1300 GS vs competencia (visión México)",
    section: "Motos",
    type: "Review",
    status: "idea",
    priority: "media",
    assignee: "Colaborador Lifestyle",
    due: "Próxima semana",
    origin: "ia",
  },
  {
    id: 3,
    title: "Cobertura: próximo trackday Mexico Drive Resort",
    section: "Deportes",
    type: "Crónica",
    status: "asignada",
    priority: "alta",
    assignee: "Gabriel Rodríguez",
    due: "Viernes",
    origin: "manual",
  },
  {
    id: 4,
    title: "Nota rápida: nuevos precios de gasolina y efecto en trackdays",
    section: "Autos",
    type: "Noticia",
    status: "idea",
    priority: "baja",
    assignee: "Redactor Autos",
    due: "Cuando haya espacio",
    origin: "metricas",
  },
  {
    id: 5,
    title: "Entrevista: piloto mexicano de MotoGP Academy",
    section: "Motos",
    type: "Entrevista",
    status: "revision",
    priority: "alta",
    assignee: "Colaborador Lifestyle",
    due: "Mañana",
    origin: "manual",
  },
  {
    id: 6,
    title: "Galería + texto: mejores builds del último meet MotorWelt",
    section: "Comunidad",
    type: "Crónica",
    status: "lista",
    priority: "media",
    assignee: "Gabriel Rodríguez",
    due: "Este fin",
    origin: "manual",
  },
];

/* ---------- Helpers UI ---------- */

const STATUS_META: Record<
  TaskStatus,
  { label: string; color: string; bg: string }
> = {
  idea: {
    label: "Ideas / Propuestas",
    color: "text-sky-300",
    bg: "bg-sky-500/10",
  },
  asignada: {
    label: "Asignadas",
    color: "text-indigo-300",
    bg: "bg-indigo-500/10",
  },
  redaccion: {
    label: "En redacción",
    color: "text-amber-300",
    bg: "bg-amber-500/10",
  },
  revision: {
    label: "En revisión",
    color: "text-purple-300",
    bg: "bg-purple-500/10",
  },
  lista: {
    label: "Listas para publicar",
    color: "text-emerald-300",
    bg: "bg-emerald-500/10",
  },
  publicada: {
    label: "Publicadas / follow-up",
    color: "text-gray-200",
    bg: "bg-white/5",
  },
};

function priorityLabel(p: TaskPriority) {
  if (p === "alta") return "Alta";
  if (p === "media") return "Media";
  return "Baja";
}

function priorityColor(p: TaskPriority) {
  if (p === "alta") return "bg-red-500/15 text-red-300";
  if (p === "media") return "bg-amber-500/15 text-amber-300";
  return "bg-emerald-500/15 text-emerald-300";
}

/* ============================================================================= */

const AdminTareasPage: React.FC = () => {
  const router = useRouter();

  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [tasks, setTasks] = useState<Task[]>(demoTasks);

  // Filtros
  const [filterSection, setFilterSection] = useState<
    Task["section"] | "todas"
  >("todas");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "todas">(
    "todas"
  );
  const [showOnlyMine, setShowOnlyMine] = useState(false);

  // Form para nueva tarea rápida
  const [newTitle, setNewTitle] = useState("");
  const [newSection, setNewSection] = useState<Task["section"]>("Autos");
  const [newType, setNewType] = useState<Task["type"]>("Noticia");
  const [newPriority, setNewPriority] =
    useState<TaskPriority>("media");

  // IA – Editor jefe
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiTaskSuggestion[]>([]);

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

  /* ---------- Lógica de tareas ---------- */

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterSection !== "todas" && t.section !== filterSection) return false;
      if (filterPriority !== "todas" && t.priority !== filterPriority)
        return false;
      if (showOnlyMine && currentUser?.name) {
        return t.assignee === currentUser.name;
      }
      return true;
    });
  }, [tasks, filterSection, filterPriority, showOnlyMine, currentUser?.name]);

  const tasksByStatus = useMemo(() => {
    const base: Record<TaskStatus, Task[]> = {
      idea: [],
      asignada: [],
      redaccion: [],
      revision: [],
      lista: [],
      publicada: [],
    };
    for (const t of filteredTasks) {
      base[t.status].push(t);
    }
    return base;
  }, [filteredTasks]);

  const totalOpen = useMemo(
    () => tasks.filter((t) => t.status !== "publicada").length,
    [tasks]
  );

  const handleCreateTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: Date.now(),
      title: newTitle.trim(),
      section: newSection,
      type: newType,
      status: "idea",
      priority: newPriority,
      assignee: currentUser?.name || "Sin asignar",
      due: "Por definir",
      origin: "manual",
    };
    setTasks((prev) => [task, ...prev]);
    setNewTitle("");
  };

  const moveTask = (id: number, direction: "forward" | "back") => {
    const order: TaskStatus[] = [
      "idea",
      "asignada",
      "redaccion",
      "revision",
      "lista",
      "publicada",
    ];
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const idx = order.indexOf(t.status);
        if (idx === -1) return t;
        const nextIdx =
          direction === "forward"
            ? Math.min(order.length - 1, idx + 1)
            : Math.max(0, idx - 1);
        return { ...t, status: order[nextIdx] };
      })
    );
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  /* ---------- IA: pedir sugerencias ---------- */

  const handleAskAiSuggestions = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/tasks-suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUser,
          // Enviamos un resumen de tareas, no todo el objeto completo,
          // para que luego el endpoint pueda usarlo como contexto.
          tasks: tasks.map((t) => ({
            title: t.title,
            section: t.section,
            type: t.type,
            status: t.status,
            priority: t.priority,
            assignee: t.assignee,
            origin: t.origin,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Respuesta no OK del endpoint de IA");
      }

      const data = await res.json();
      // Esperamos que el backend devuelva { suggestions: AiTaskSuggestion[] }
      const suggestions = (data?.suggestions || []) as AiTaskSuggestion[];
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error(err);
      setAiError(
        "No se pudieron obtener sugerencias de IA. Revisa tu API key y el endpoint /api/ai/tasks-suggest."
      );
    } finally {
      setAiLoading(false);
    }
  };

  const handleAcceptSuggestion = (s: AiTaskSuggestion) => {
    const task: Task = {
      id: Date.now(),
      title: s.title,
      section: s.section,
      type: s.type,
      status: "asignada",
      priority: s.priority,
      assignee: currentUser?.name || "Por asignar",
      due: s.suggestedDue || "Próximos días",
      origin: "ia",
    };
    setTasks((prev) => [task, ...prev]);
    // Opcional: eliminarla de la lista de sugerencias
    setAiSuggestions((prev) => prev.filter((x) => x.id !== s.id));
  };

  if (!authReady) {
    return null;
  }

  return (
    <>
      <Seo
        title="Tareas del equipo | MotorWelt"
        description="Panel de tareas editoriales y sugerencias de IA para el equipo de MotorWelt."
      />

      <main className="min-h-screen bg-mw-surface/95 pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          {/* Encabezado */}
          <section className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <nav
                aria-label="Breadcrumb"
                className="text-[11px] text-gray-400 mb-1"
              >
                <ol className="flex items-center gap-1">
                  <li>
                    <Link
                      href={
                        currentUser?.role === "admin"
                          ? "/admin/perfil"
                          : "/admin/perfil-equipo"
                      }
                      className="hover:text-gray-200"
                    >
                      Panel
                    </Link>
                  </li>
                  <li className="text-gray-500">/</li>
                  <li className="text-gray-300">Tareas del equipo</li>
                </ol>
              </nav>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
                Tareas del equipo
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-xl">
                Organiza las notas, crónicas, reviews y piezas de contenido del
                equipo de MotorWelt. La IA te sugiere ideas y prioridades según
                el contexto.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sesión como</span>
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

          {/* Resumen + filtros + botón IA */}
          <section className="mb-6 rounded-3xl border border-white/10 bg-black/30 p-4 md:p-5">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1 text-sm text-gray-200">
                <p>
                  Tareas abiertas:{" "}
                  <span className="font-semibold text-white">
                    {totalOpen}
                  </span>{" "}
                  · Total registradas:{" "}
                  <span className="font-semibold text-white">
                    {tasks.length}
                  </span>
                </p>
                <p className="text-xs text-gray-400 max-w-md">
                  Usa este panel como tu agenda de redacción. Más adelante lo
                  conectaremos a la base de datos para que persista todo.
                </p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-end">
                {/* Filtros */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={filterSection}
                    onChange={(e) =>
                      setFilterSection(
                        e.target.value === "todas"
                          ? "todas"
                          : (e.target.value as Task["section"])
                      )
                    }
                    className="rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  >
                    <option value="todas">Todas las secciones</option>
                    <option value="Autos">Autos</option>
                    <option value="Motos">Motos</option>
                    <option value="Deportes">Deportes</option>
                    <option value="Lifestyle">Lifestyle</option>
                    <option value="Comunidad">Comunidad</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) =>
                      setFilterPriority(
                        e.target.value === "todas"
                          ? "todas"
                          : (e.target.value as TaskPriority)
                      )
                    }
                    className="rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                  >
                    <option value="todas">Todas las prioridades</option>
                    <option value="alta">Alta</option>
                    <option value="media">Media</option>
                    <option value="baja">Baja</option>
                  </select>
                  <label className="inline-flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyMine}
                      onChange={(e) => setShowOnlyMine(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border border-white/30 bg-black/60 text-[#0CE0B2]"
                    />
                    <span>Mostrar sólo mis tareas</span>
                  </label>
                </div>

                {/* Botón IA */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="cyan"
                    className="text-xs whitespace-nowrap"
                    onClick={handleAskAiSuggestions}
                    disabled={aiLoading}
                  >
                    {aiLoading ? "Consultando IA…" : "Pedir ideas a la IA"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Mensaje de error IA */}
            {aiError && (
              <div className="mt-3 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                {aiError}
              </div>
            )}
          </section>

          {/* Layout principal: tablero + lateral IA/mis tareas */}
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2.1fr_1.3fr]">
            {/* Columna izquierda: tablero + nueva tarea rápida */}
            <section className="space-y-6">
              {/* Nueva tarea rápida */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  Nueva tarea rápida
                </h2>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div className="md:col-span-2 space-y-1">
                    <label
                      htmlFor="new-task-title"
                      className="text-xs text-gray-300"
                    >
                      Título / descripción breve
                    </label>
                    <input
                      id="new-task-title"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej. Crónica lanzamiento BMW X3 M en México"
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="new-task-section"
                      className="text-xs text-gray-300"
                    >
                      Sección
                    </label>
                    <select
                      id="new-task-section"
                      value={newSection}
                      onChange={(e) =>
                        setNewSection(e.target.value as Task["section"])
                      }
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    >
                      <option value="Autos">Autos</option>
                      <option value="Motos">Motos</option>
                      <option value="Deportes">Deportes</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Comunidad">Comunidad</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="new-task-type"
                      className="text-xs text-gray-300"
                    >
                      Tipo
                    </label>
                    <select
                      id="new-task-type"
                      value={newType}
                      onChange={(e) =>
                        setNewType(e.target.value as Task["type"])
                      }
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    >
                      <option value="Noticia">Noticia</option>
                      <option value="Crónica">Crónica</option>
                      <option value="Opinión">Opinión</option>
                      <option value="Review">Review</option>
                      <option value="Entrevista">Entrevista</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      htmlFor="new-task-priority"
                      className="text-xs text-gray-300"
                    >
                      Prioridad
                    </label>
                    <select
                      id="new-task-priority"
                      value={newPriority}
                      onChange={(e) =>
                        setNewPriority(e.target.value as TaskPriority)
                      }
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    >
                      <option value="alta">Alta</option>
                      <option value="media">Media</option>
                      <option value="baja">Baja</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <p className="text-[11px] text-gray-500">
                    Esta tarea se creará como <strong>“Idea”</strong> y podrás
                    moverla de columna conforme avance.
                  </p>
                  <Button
                    variant="cyan"
                    type="button"
                    onClick={handleCreateTask}
                    className="text-xs"
                  >
                    Crear tarea
                  </Button>
                </div>
              </div>

              {/* Tablero por estado (sin drag & drop por ahora) */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 xl:grid-cols-3">
                {(
                  [
                    "idea",
                    "asignada",
                    "redaccion",
                    "revision",
                    "lista",
                    "publicada",
                  ] as TaskStatus[]
                ).map((status) => {
                  const items = tasksByStatus[status];
                  const meta = STATUS_META[status];
                  return (
                    <div
                      key={status}
                      className="flex flex-col rounded-3xl border border-white/10 bg-black/25 p-3"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs ${meta.bg} ${meta.color}`}
                          >
                            {items.length}
                          </span>
                          <span className="text-xs font-semibold text-gray-100">
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 overflow-y-auto max-h-[420px] pr-1">
                        {items.length === 0 && (
                          <p className="text-[11px] text-gray-500 px-1 py-2">
                            Sin tareas en esta columna por ahora.
                          </p>
                        )}
                        {items.map((t) => (
                          <article
                            key={t.id}
                            className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-gray-100 space-y-1"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-semibold text-[13px] text-white">
                                {t.title}
                              </h3>
                              <span
                                className={`ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${priorityColor(
                                  t.priority
                                )}`}
                              >
                                {priorityLabel(t.priority)}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-400">
                              {t.section} · {t.type}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              Asignado a:{" "}
                              <span className="text-gray-100">
                                {t.assignee}
                              </span>
                            </p>
                            <p className="text-[11px] text-gray-500">
                              Fecha objetivo: {t.due}
                            </p>
                            {t.linkedNote && (
                              <p className="text-[11px] text-[#0CE0B2]">
                                {t.linkedNote}
                              </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <Button
                                variant="ghost"
                                type="button"
                                className="text-[11px] px-2 py-1"
                                onClick={() => moveTask(t.id, "back")}
                              >
                                ◀
                              </Button>
                              <Button
                                variant="ghost"
                                type="button"
                                className="text-[11px] px-2 py-1"
                                onClick={() => moveTask(t.id, "forward")}
                              >
                                ▶
                              </Button>
                              <button
                                type="button"
                                onClick={() => deleteTask(t.id)}
                                className="ml-auto text-[11px] text-red-400 hover:text-red-300"
                              >
                                Eliminar
                              </button>
                            </div>
                            <div className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
                              <span>Origen:</span>
                              <span className="uppercase tracking-[0.16em]">
                                {t.origin === "manual"
                                  ? "MANUAL"
                                  : t.origin === "ia"
                                  ? "IA"
                                  : "MÉTRICAS"}
                              </span>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Columna derecha: IA + mis tareas rápidas */}
            <section className="space-y-6">
              {/* IA – Editor jefe */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">
                    Editor jefe · IA
                  </h2>
                  <span className="inline-flex items-center rounded-full border border-[#0CE0B2]/40 bg-[#0CE0B2]/10 px-2.5 py-0.5 text-[11px] text-[#7CFFE2]">
                    IA Activa
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Aquí aparecerán ideas de notas y coberturas sugeridas por la
                  IA en función de tu carga actual de trabajo y el contexto que
                  le mandemos (eventos, métricas, etc.).
                </p>

                <div className="mt-4 space-y-3">
                  {aiSuggestions.length === 0 && !aiLoading && (
                    <p className="text-[11px] text-gray-500">
                      Aún no hay sugerencias cargadas. Da clic en{" "}
                      <span className="font-semibold text-[#0CE0B2]">
                        &quot;Pedir ideas a la IA&quot;
                      </span>{" "}
                      en la barra superior para ver propuestas.
                    </p>
                  )}

                  {aiSuggestions.map((s) => (
                    <div
                      key={s.id}
                      className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-gray-100 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-[13px] text-white">
                          {s.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${priorityColor(
                            s.priority
                          )}`}
                        >
                          {priorityLabel(s.priority)}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400">
                        {s.section} · {s.type}
                      </p>
                      {s.suggestedDue && (
                        <p className="text-[11px] text-gray-500">
                          Sugerencia de timing: {s.suggestedDue}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-gray-300">
                        {s.reason}
                      </p>
                      <div className="mt-2 flex items-center justify-end gap-2">
                        <Button
                          variant="cyan"
                          type="button"
                          className="text-[11px] px-3 py-1.5"
                          onClick={() => handleAcceptSuggestion(s)}
                        >
                          Convertir en tarea
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="mt-4 text-[10px] text-gray-500">
                  Backend pendiente: crea un endpoint en{" "}
                  <code className="rounded bg-black/60 px-1">
                    /pages/api/ai/tasks-suggest.ts
                  </code>{" "}
                  que use tu <code>OPENAI_API_KEY</code> y devuelva un JSON con{" "}
                  <code>suggestions: AiTaskSuggestion[]</code>. El frontend ya
                  está listo para consumirlo.
                </p>
              </div>

              {/* Mis tareas (resumen rápido) */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white">
                  Tus tareas rápidas
                </h2>
                <p className="mt-1 text-[11px] text-gray-400">
                  Vista compacta de lo que tienes asignado, sin importar la
                  columna del tablero.
                </p>

                <div className="mt-3 space-y-2 max-h-[260px] overflow-y-auto pr-1">
                  {tasks.filter(
                    (t) =>
                      !currentUser?.name || t.assignee === currentUser.name
                  ).length === 0 ? (
                    <p className="text-[11px] text-gray-500">
                      Aún no tienes tareas asignadas a tu nombre.
                    </p>
                  ) : (
                    tasks
                      .filter(
                        (t) =>
                          !currentUser?.name ||
                          t.assignee === currentUser.name
                      )
                      .map((t) => (
                        <div
                          key={t.id}
                          className="rounded-2xl border border-white/10 bg-black/40 p-3 text-xs text-gray-100"
                        >
                          <p className="font-semibold text-[13px] text-white">
                            {t.title}
                          </p>
                          <p className="mt-1 text-[11px] text-gray-400">
                            {t.section} · {t.type} ·{" "}
                            <span className="capitalize">
                              {STATUS_META[t.status].label}
                            </span>
                          </p>
                          <p className="mt-1 text-[11px] text-gray-500">
                            Fecha objetivo: {t.due}
                          </p>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminTareasPage;

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
