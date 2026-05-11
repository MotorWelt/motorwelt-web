// pages/admin/suscriptores.tsx
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Seo from "../../components/Seo";

type SubscriberStatus = "active" | "unsubscribed" | "pending" | "unknown";

type Subscriber = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  age: string;
  gender: string;
  country: string;
  state: string;
  city?: string;
  interests: string[];
  status: SubscriberStatus;
  unsubscribeComment: string;
  pageViews: number;
  lastVisitedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
};

type TabKey = "new" | "active" | "unsubscribed";

const INTERESTS = ["Autos", "Motos", "Tuning", "Deportes", "Lifestyle", "Comunidad"];

function readCookie(name: string) {
  if (typeof document === "undefined") return "";
  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(new RegExp("(^|;\\s*)" + escaped + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

function normalizeRole() {
  let role = readCookie("mw_role");

  if (!role && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("mw_admin_user");
      if (raw) role = JSON.parse(raw)?.role || "";
    } catch {
      // ignore
    }
  }

  return String(role || "").toLowerCase();
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isCurrentMonth(value?: string | null) {
  if (!value) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function normalizeStatus(status?: string): SubscriberStatus {
  const raw = String(status || "").toLowerCase().trim();
  if (["active", "activo", "suscrito", "subscribed"].includes(raw)) return "active";
  if (["unsubscribed", "baja", "cancelled", "canceled", "eliminado"].includes(raw)) return "unsubscribed";
  if (["pending", "pendiente"].includes(raw)) return "pending";
  return "active";
}

function toCsv(rows: Subscriber[]) {
  const headers = [
    "Nombre",
    "Apellido",
    "Email",
    "Edad",
    "Sexo",
    "Pais",
    "Estado",
    "Intereses",
    "Status",
    "Registro",
    "Visitas",
    "Ultima visita",
    "Comentario baja",
  ];

  const clean = (value: unknown) => {
    const text = String(value ?? "").replace(/"/g, '""');
    return `"${text}"`;
  };

  return [
    headers.map(clean).join(","),
    ...rows.map((row) =>
      [
        row.name,
        row.lastName,
        row.email,
        row.age,
        row.gender,
        row.country,
        row.state || row.city || "",
        row.interests.join(" | "),
        row.status,
        row.createdAt,
        row.pageViews,
        row.lastVisitedAt || "",
        row.unsubscribeComment,
      ]
        .map(clean)
        .join(","),
    ),
  ].join("\n");
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Pill({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "cyan" | "orange" | "red" | "lime" }) {
  const toneClass = {
    default: "border-white/[0.08] bg-white/[0.04] text-gray-200",
    cyan: "border-[#0CE0B2]/20 bg-[#0CE0B2]/10 text-[#A8FFF0]",
    orange: "border-[#FF7A1A]/20 bg-[#FF7A1A]/10 text-[#FFD1B4]",
    red: "border-red-400/20 bg-red-500/10 text-red-200",
    lime: "border-[#A3FF12]/20 bg-[#A3FF12]/10 text-[#E5FFC2]",
  }[tone];

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] ${toneClass}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string | number; detail?: string }) {
  return (
    <div className="rounded-[24px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md">
      <p className="text-[11px] uppercase tracking-[0.22em] text-gray-400">{label}</p>
      <div className="mt-2 text-3xl font-black text-white">{value}</div>
      {detail ? <p className="mt-1 text-sm text-gray-400">{detail}</p> : null}
    </div>
  );
}

function SectionTitle({ eyebrow, title, subtle }: { eyebrow: string; title: string; subtle?: string }) {
  return (
    <div className="mb-5">
      <p className="text-[11px] uppercase tracking-[0.28em] text-[#0CE0B2]">{eyebrow}</p>
      <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{title}</h2>
      {subtle ? <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-300">{subtle}</p> : null}
    </div>
  );
}

function AccessRestricted() {
  return (
    <>
      <Seo title="Acceso restringido | MotorWelt" description="Panel privado MotorWelt" />
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#041210] px-4 py-12 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[#041210]" />
        <div className="relative z-10 w-full max-w-lg rounded-[30px] border border-white/[0.08] bg-black/35 p-8 text-center backdrop-blur-md">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#0CE0B2]">Panel privado</p>
          <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-white">
            Acceso restringido
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-gray-300">
            Esta base de datos es confidencial. Inicia sesión como administrador o editor para ver los suscriptores.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/perfil"
              className="inline-flex items-center justify-center rounded-2xl border border-[#0CE0B2]/20 bg-[#0CE0B2]/10 px-5 py-3 text-sm font-semibold text-[#CFFFF7] transition hover:bg-[#0CE0B2]/15"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-white/[0.08] bg-black/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
            >
              Volver al sitio
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

function SubscriberTable({
  rows,
  selectedIds,
  onToggleOne,
  onToggleAll,
  emptyText,
  showComment = false,
}: {
  rows: Subscriber[];
  selectedIds: Set<string>;
  onToggleOne: (id: string) => void;
  onToggleAll: (rows: Subscriber[]) => void;
  emptyText: string;
  showComment?: boolean;
}) {
  const allVisibleSelected = rows.length > 0 && rows.every((row) => selectedIds.has(row.id));

  if (rows.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-white/[0.08] bg-black/20 p-8 text-center text-sm text-gray-300">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[26px] border border-white/[0.06] bg-black/20 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="min-w-[1180px] w-full text-left text-sm">
          <thead className="border-b border-white/[0.06] bg-white/[0.03] text-[11px] uppercase tracking-[0.18em] text-gray-400">
            <tr>
              <th className="w-12 px-4 py-4">
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={() => onToggleAll(rows)}
                  className="h-4 w-4 accent-[#0CE0B2]"
                  aria-label="Seleccionar visibles"
                />
              </th>
              <th className="px-4 py-4">Nombre</th>
              <th className="px-4 py-4">Email</th>
              <th className="px-4 py-4">Perfil</th>
              <th className="px-4 py-4">Ubicación</th>
              <th className="px-4 py-4">Intereses</th>
              <th className="px-4 py-4">Registro</th>
              <th className="px-4 py-4">Visitas</th>
              {showComment ? <th className="px-4 py-4">Comentario de baja</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {rows.map((row) => (
              <tr key={row.id} className="transition hover:bg-white/[0.03]">
                <td className="px-4 py-4 align-top">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(row.id)}
                    onChange={() => onToggleOne(row.id)}
                    className="h-4 w-4 accent-[#0CE0B2]"
                    aria-label={`Seleccionar ${row.email}`}
                  />
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="font-semibold text-white">
                    {[row.name, row.lastName].filter(Boolean).join(" ") || "Sin nombre"}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">ID: {row.id.slice(0, 10)}…</div>
                </td>
                <td className="px-4 py-4 align-top">
                  <button
                    type="button"
                    onClick={() => void navigator.clipboard.writeText(row.email)}
                    className="font-medium text-[#8BE7DB] hover:text-white"
                    title="Copiar correo"
                  >
                    {row.email}
                  </button>
                </td>
                <td className="px-4 py-4 align-top text-gray-300">
                  <div>{row.age ? `${row.age} años` : "Edad —"}</div>
                  <div className="mt-1 capitalize">{row.gender || "Sexo —"}</div>
                </td>
                <td className="px-4 py-4 align-top text-gray-300">
                  <div>{row.country || "País —"}</div>
                  <div className="mt-1 text-gray-400">{row.state || row.city || "Estado —"}</div>
                </td>
                <td className="px-4 py-4 align-top">
                  <div className="flex max-w-[250px] flex-wrap gap-1.5">
                    {row.interests.length > 0 ? (
                      row.interests.map((interest) => (
                        <span key={interest} className="rounded-full border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-gray-200">
                          {interest}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Sin intereses</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4 align-top text-gray-300">
                  <div>{formatDate(row.createdAt)}</div>
                  <div className="mt-1 text-xs text-gray-500">{formatDateTime(row.createdAt)}</div>
                </td>
                <td className="px-4 py-4 align-top text-gray-300">
                  <div className="font-semibold text-white">{row.pageViews || 0}</div>
                  <div className="mt-1 text-xs text-gray-500">Última: {formatDate(row.lastVisitedAt)}</div>
                </td>
                {showComment ? (
                  <td className="max-w-[340px] px-4 py-4 align-top text-gray-300">
                    {row.unsubscribeComment ? (
                      <div className="rounded-2xl border border-red-400/15 bg-red-500/10 p-3 text-sm leading-relaxed text-red-100">
                        {row.unsubscribeComment}
                      </div>
                    ) : (
                      <span className="text-gray-500">Sin comentario</span>
                    )}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminSuscriptoresPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("new");
  const [query, setQuery] = useState("");
  const [interestFilter, setInterestFilter] = useState("todos");
  const [countryFilter, setCountryFilter] = useState("todos");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copyStatus, setCopyStatus] = useState("");
  const [deletingGhosts, setDeletingGhosts] = useState(false);

  const canAccess = role === "admin" || role === "editor";

  useEffect(() => {
    const detectedRole = normalizeRole();
    setRole(detectedRole);
    setAuthChecked(true);

    if (detectedRole !== "admin" && detectedRole !== "editor") {
      setLoading(false);
    }
  }, []);

  async function loadSubscribers() {
    setLoading(true);
    setError("");

    try {
      const currentRole = normalizeRole();
      const res = await fetch("/api/subscription/list", {
        credentials: "same-origin",
        headers: {
          "x-mw-admin-role": currentRole,
        },
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo cargar la base de suscriptores.");
      }

      const rows = Array.isArray(data.subscribers) ? data.subscribers : [];
      setSubscribers(
        rows.map((item: any) => ({
          id: String(item.id || ""),
          name: String(item.name || ""),
          lastName: String(item.lastName || ""),
          email: String(item.email || ""),
          age: String(item.age || ""),
          gender: String(item.gender || ""),
          country: String(item.country || ""),
          state: String(item.state || item.city || ""),
          city: String(item.city || ""),
          interests: Array.isArray(item.interests) ? item.interests.filter(Boolean).map(String) : [],
          status: normalizeStatus(item.status),
          unsubscribeComment: String(item.unsubscribeComment || ""),
          pageViews: Number(item.pageViews || 0),
          lastVisitedAt: item.lastVisitedAt || null,
          createdAt: String(item.createdAt || ""),
          updatedAt: item.updatedAt || null,
        })),
      );
    } catch (err: any) {
      setError(err?.message || "No se pudo cargar la base de suscriptores.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authChecked || !canAccess) return;
    void loadSubscribers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authChecked, canAccess]);

  const buckets = useMemo(() => {
    const activeRows = subscribers.filter((s) => s.status !== "unsubscribed");
    return {
      new: activeRows.filter((s) => isCurrentMonth(s.createdAt)),
      active: activeRows.filter((s) => !isCurrentMonth(s.createdAt)),
      unsubscribed: subscribers.filter((s) => s.status === "unsubscribed"),
    };
  }, [subscribers]);

  const countries = useMemo(() => {
    const set = new Set(subscribers.map((s) => s.country).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [subscribers]);

  const filteredRows = useMemo(() => {
    const base = buckets[activeTab] || [];
    const q = query.trim().toLowerCase();

    return base.filter((row) => {
      const matchesQuery =
        !q ||
        [
          row.name,
          row.lastName,
          row.email,
          row.age,
          row.gender,
          row.country,
          row.state,
          row.city,
          row.interests.join(" "),
          row.unsubscribeComment,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q);

      const matchesInterest =
        interestFilter === "todos" ||
        row.interests.some((interest) => interest.toLowerCase() === interestFilter.toLowerCase());

      const matchesCountry = countryFilter === "todos" || row.country === countryFilter;

      return matchesQuery && matchesInterest && matchesCountry;
    });
  }, [activeTab, buckets, countryFilter, interestFilter, query]);

  const selectedRows = useMemo(
    () => subscribers.filter((row) => selectedIds.has(row.id)),
    [selectedIds, subscribers],
  );

  const interestStats = useMemo(() => {
    const activeRows = subscribers.filter((s) => s.status !== "unsubscribed");
    const total = activeRows.length || 1;
    return INTERESTS.map((interest) => {
      const count = activeRows.filter((row) =>
        row.interests.some((item) => item.toLowerCase() === interest.toLowerCase()),
      ).length;
      return {
        interest,
        count,
        percentage: Math.round((count / total) * 100),
      };
    }).sort((a, b) => b.count - a.count);
  }, [subscribers]);

  const topVisitors = useMemo(() => {
    return [...subscribers]
      .sort((a, b) => (b.pageViews || 0) - (a.pageViews || 0))
      .slice(0, 8);
  }, [subscribers]);

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllVisible(rows: Subscriber[]) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allVisibleSelected = rows.length > 0 && rows.every((row) => next.has(row.id));
      if (allVisibleSelected) rows.forEach((row) => next.delete(row.id));
      else rows.forEach((row) => next.add(row.id));
      return next;
    });
  }

  async function copyEmails(rows: Subscriber[]) {
    const emails = Array.from(new Set(rows.map((row) => row.email).filter(Boolean)));
    if (emails.length === 0) {
      setCopyStatus("No hay correos para copiar.");
      return;
    }

    await navigator.clipboard.writeText(emails.join(", "));
    setCopyStatus(`${emails.length} correos copiados.`);
    window.setTimeout(() => setCopyStatus(""), 2400);
  }

  async function deleteSelectedGhosts() {
    const ids = Array.from(selectedIds).filter(Boolean);
    if (ids.length === 0) {
      setCopyStatus("Selecciona al menos un usuario fantasma para eliminar.");
      window.setTimeout(() => setCopyStatus(""), 2600);
      return;
    }

    const confirmed = window.confirm(
      `Vas a eliminar permanentemente ${ids.length} registro${ids.length === 1 ? "" : "s"} de Sanity. Esta acción es para usuarios fantasma y no se puede deshacer. ¿Continuar?`,
    );

    if (!confirmed) return;

    setDeletingGhosts(true);
    setError("");

    try {
      const currentRole = normalizeRole();
      const res = await fetch("/api/subscription/delete", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-mw-admin-role": currentRole,
        },
        body: JSON.stringify({ ids }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudieron eliminar los usuarios fantasma.");
      }

      const deletedIds = new Set<string>(Array.isArray(data.deletedIds) ? data.deletedIds.map(String) : ids);
      setSubscribers((prev) => prev.filter((row) => !deletedIds.has(row.id)));
      setSelectedIds(new Set());
      setCopyStatus(`${deletedIds.size} usuario${deletedIds.size === 1 ? "" : "s"} fantasma eliminado${deletedIds.size === 1 ? "" : "s"}.`);
      window.setTimeout(() => setCopyStatus(""), 3000);
    } catch (err: any) {
      setError(err?.message || "No se pudieron eliminar los usuarios fantasma.");
    } finally {
      setDeletingGhosts(false);
    }
  }

  if (!authChecked) {
    return (
      <>
        <Seo title="Suscriptores | MotorWelt Admin" description="Base privada de suscriptores MotorWelt" />
        <main className="flex min-h-screen items-center justify-center bg-[#041210] px-4 text-white">
          <div className="rounded-[28px] border border-white/[0.08] bg-black/35 p-8 text-center backdrop-blur-md">
            Validando acceso…
          </div>
        </main>
      </>
    );
  }

  if (!canAccess) {
    return <AccessRestricted />;
  }

  return (
    <>
      <Seo title="Suscriptores | MotorWelt Admin" description="Base privada de suscriptores MotorWelt" />

      <main className="relative min-h-screen overflow-x-hidden bg-[#041210] text-gray-100">
        <div className="pointer-events-none fixed inset-0 z-0 bg-[#041210]" aria-hidden />

        <section className="relative z-10 mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 xl:px-10 2xl:max-w-[1560px]">
          <div className="mb-8 flex flex-col gap-4 border-b border-white/[0.06] pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#0CE0B2]">Panel privado</p>
              <h1 className="mt-2 font-display text-4xl font-black tracking-tight text-white sm:text-5xl">
                Base de suscriptores
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-300 sm:text-base">
                Lista central para consultar registros, filtrar por intereses, copiar correos y preparar mailings de MotorWelt.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link href="/admin/perfil" className="inline-flex items-center justify-center rounded-2xl border border-white/[0.08] bg-black/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5">
                Volver al panel
              </Link>
              <Link href="/" className="inline-flex items-center justify-center rounded-2xl border border-[#0CE0B2]/20 bg-[#0CE0B2]/10 px-5 py-3 text-sm font-semibold text-[#CFFFF7] transition hover:bg-[#0CE0B2]/15">
                Ver sitio público
              </Link>
            </div>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Nuevos este mes" value={buckets.new.length} detail="Se mueven a activos por fecha al cambiar el mes." />
            <StatCard label="Activos históricos" value={buckets.active.length} detail="Registros activos de meses anteriores." />
            <StatCard label="Bajas" value={buckets.unsubscribed.length} detail="Usuarios que cancelaron o pidieron salir." />
            <StatCard label="Correos seleccionados" value={selectedRows.length} detail="Listos para copiar o exportar." />
          </div>

          <section className="mb-8 rounded-[30px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md sm:p-6">
            <SectionTitle
              eyebrow="Control"
              title="Filtros y acciones rápidas"
              subtle="Filtra por texto, interés o país. Selecciona usuarios individuales o todos los visibles para copiar correos o purgar usuarios fantasma."
            />

            <div className="grid gap-4 lg:grid-cols-[1.4fr_.8fr_.8fr]">
              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Buscar</label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Nombre, email, país, estado, interés…"
                  className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition placeholder:text-gray-600 focus:border-[#0CE0B2]/35"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Interés</label>
                <select
                  value={interestFilter}
                  onChange={(e) => setInterestFilter(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/35"
                >
                  <option value="todos">Todos</option>
                  {INTERESTS.map((interest) => (
                    <option key={interest} value={interest}>{interest}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-[0.2em] text-gray-400">País</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#0CE0B2]/35"
                >
                  <option value="todos">Todos</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void copyEmails(selectedRows)}
                className="rounded-2xl border border-[#0CE0B2]/20 bg-[#0CE0B2]/10 px-5 py-3 text-sm font-semibold text-[#CFFFF7] transition hover:bg-[#0CE0B2]/15 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={selectedRows.length === 0}
              >
                Copiar correos seleccionados
              </button>

              <button
                type="button"
                onClick={() => void deleteSelectedGhosts()}
                className="rounded-2xl border border-red-400/25 bg-red-500/10 px-5 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={selectedRows.length === 0 || deletingGhosts}
                title="Eliminar permanentemente de Sanity los registros seleccionados que sean correos fantasma o pruebas falsas."
              >
                {deletingGhosts ? "Eliminando…" : "Eliminar fantasmas seleccionados"}
              </button>

              <button
                type="button"
                onClick={() => void copyEmails(filteredRows)}
                className="rounded-2xl border border-white/[0.08] bg-black/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={filteredRows.length === 0}
              >
                Copiar correos filtrados
              </button>

              <button
                type="button"
                onClick={() => downloadCsv(`motorwelt-suscriptores-${activeTab}.csv`, toCsv(filteredRows))}
                className="rounded-2xl border border-white/[0.08] bg-black/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={filteredRows.length === 0}
              >
                Exportar CSV filtrado
              </button>

              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setInterestFilter("todos");
                  setCountryFilter("todos");
                  setSelectedIds(new Set());
                }}
                className="rounded-2xl border border-white/[0.08] bg-black/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/5"
              >
                Limpiar filtros
              </button>

              <button
                type="button"
                onClick={() => void loadSubscribers()}
                className="rounded-2xl border border-[#FF7A1A]/20 bg-[#FF7A1A]/10 px-5 py-3 text-sm font-semibold text-[#FFD9C0] transition hover:bg-[#FF7A1A]/15"
              >
                Actualizar
              </button>

              {copyStatus ? <span className="text-sm text-[#0CE0B2]">{copyStatus}</span> : null}
            </div>
          </section>

          <section className="mb-8">
            <div className="mb-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setActiveTab("new")}
                className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${activeTab === "new" ? "border-[#0CE0B2]/25 bg-[#0CE0B2]/12 text-[#DFFFF9]" : "border-white/[0.08] bg-black/25 text-gray-200 hover:bg-white/5"}`}
              >
                Nuevos suscriptores <span className="ml-2 text-xs text-gray-400">{buckets.new.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("active")}
                className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${activeTab === "active" ? "border-[#0CE0B2]/25 bg-[#0CE0B2]/12 text-[#DFFFF9]" : "border-white/[0.08] bg-black/25 text-gray-200 hover:bg-white/5"}`}
              >
                Suscriptores activos <span className="ml-2 text-xs text-gray-400">{buckets.active.length}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("unsubscribed")}
                className={`rounded-2xl border px-5 py-3 text-sm font-semibold transition ${activeTab === "unsubscribed" ? "border-red-400/25 bg-red-500/12 text-red-100" : "border-white/[0.08] bg-black/25 text-gray-200 hover:bg-white/5"}`}
              >
                Bajas / eliminados <span className="ml-2 text-xs text-gray-400">{buckets.unsubscribed.length}</span>
              </button>
            </div>

            {loading ? (
              <div className="rounded-[28px] border border-white/[0.06] bg-black/25 p-8 text-center text-gray-300 backdrop-blur-md">
                Cargando base de suscriptores…
              </div>
            ) : error ? (
              <div className="rounded-[28px] border border-red-400/20 bg-red-500/10 p-8 text-center text-red-100 backdrop-blur-md">
                {error}
              </div>
            ) : (
              <SubscriberTable
                rows={filteredRows}
                selectedIds={selectedIds}
                onToggleOne={toggleOne}
                onToggleAll={toggleAllVisible}
                emptyText={
                  activeTab === "new"
                    ? "No hay nuevos suscriptores este mes con los filtros actuales."
                    : activeTab === "active"
                      ? "No hay suscriptores activos con los filtros actuales."
                      : "No hay bajas registradas con los filtros actuales."
                }
                showComment={activeTab === "unsubscribed"}
              />
            )}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_.85fr]">
            <div className="rounded-[30px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md sm:p-6">
              <SectionTitle
                eyebrow="Intereses"
                title="Porcentaje de intereses"
                subtle="Útil para segmentar futuras campañas y entender qué contenidos pesan más en la comunidad."
              />

              <div className="space-y-4">
                {interestStats.map((stat) => (
                  <div key={stat.interest}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-semibold text-white">{stat.interest}</span>
                      <span className="text-gray-300">{stat.count} · {stat.percentage}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0CE0B2] via-[#A3FF12] to-[#FF7A1A]"
                        style={{ width: `${Math.max(stat.percentage, stat.count > 0 ? 4 : 0)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/[0.06] bg-black/25 p-5 backdrop-blur-md sm:p-6">
              <SectionTitle
                eyebrow="Actividad"
                title="Usuarios con más visitas"
                subtle="Listo para cuando midamos actividad real por usuario. Por ahora usa el campo pageViews si existe en Sanity."
              />

              <div className="space-y-3">
                {topVisitors.length > 0 ? (
                  topVisitors.map((user, index) => (
                    <div key={user.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <Pill tone={index < 3 ? "lime" : "default"}>#{index + 1}</Pill>
                          <p className="truncate font-semibold text-white">{[user.name, user.lastName].filter(Boolean).join(" ") || user.email}</p>
                        </div>
                        <p className="mt-1 truncate text-xs text-gray-400">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-white">{user.pageViews || 0}</p>
                        <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">visitas</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.03] p-5 text-center text-sm text-gray-300">
                    Todavía no hay actividad para mostrar.
                  </div>
                )}
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
