// pages/admin/perfil.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Seo from "../../components/Seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

const nextI18NextConfig = require("../../next-i18next.config.js");

const LOCALSTORAGE_KEY = "mw_admin_user";

type ButtonVariant = "cyan" | "pink" | "ghost" | "link";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  className?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
};

type LinkButtonProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  target?: string;
  rel?: string;
};

const getButtonClasses = (variant: ButtonVariant = "cyan", className = "") => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-5 py-2.5 font-semibold transition focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50";

  const sharedButtonStyle =
    "text-white border border-white/[0.08] shadow-[0_0_18px_rgba(255,122,26,.32),inset_0_0_0_1px_rgba(255,122,26,.12)] hover:bg-white/5 hover:shadow-[0_0_26px_rgba(255,122,26,.55),inset_0_0_0_1px_rgba(255,122,26,.18)] focus-visible:ring-[#FF7A1A]/40";

  const styles: Record<ButtonVariant, string> = {
    cyan: sharedButtonStyle,
    pink: sharedButtonStyle,
    ghost: sharedButtonStyle,
    link:
      "p-0 text-[#43A1AD] hover:opacity-80 underline underline-offset-4 focus:ring-0 rounded-none shadow-none border-0",
  };

  return `${base} ${styles[variant]} ${className}`.trim();
};

const Button: React.FC<ButtonProps> = ({
  className = "",
  children,
  variant = "cyan",
  ...props
}) => {
  return (
    <button {...props} className={getButtonClasses(variant as ButtonVariant, className)}>
      {children}
    </button>
  );
};

const LinkButton: React.FC<LinkButtonProps> = ({
  href,
  className = "",
  children,
  variant = "cyan",
  target,
  rel,
}) => {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={getButtonClasses(variant as ButtonVariant, className)}
    >
      {children}
    </Link>
  );
};

type AdminNote = {
  id: string;
  title: string;
  sectionKey: string;
  sectionLabel: string;
  status: "publicada" | "borrador";
  publishedAt: string;
  updatedAt: string;
  slug?: string;
  authorName: string;
  authorEmail?: string;
  href: string;
};

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "autor";
  active: boolean;
};

type Subscriber = {
  id: string;
  name: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type MetricSource = "web" | "instagram" | "facebook" | "tiktok" | "youtube";

type Metric = {
  id: string;
  label: string;
  value: string;
  source: MetricSource;
  status: "connected" | "pending";
  hint?: string;
};

type PlatformCard = {
  id: MetricSource;
  title: string;
  subtitle: string;
  status: "connected" | "pending";
  headline: { label: string; value: string };
  kpis: { label: string; value: string; hint?: string }[];
};

type Ga4Summary = {
  connected: boolean;
  activeUsers: number | null;
  pageViews: number | null;
  sessions: number | null;
  totalUsers: number | null;
  error?: string;
};

const EMPTY_GA4: Ga4Summary = {
  connected: false,
  activeUsers: null,
  pageViews: null,
  sessions: null,
  totalUsers: null,
};

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

function clearMwCookies() {
  deleteCookie("mw_role");
  deleteCookie("mw_name");
  deleteCookie("mw_email");
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) return "Pendiente";
  return new Intl.NumberFormat("es-MX").format(value);
}

function formatWhen(iso: string | null | undefined, withTime = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(d);
}

function normalizeGa4Payload(payload: any): Ga4Summary {
  if (!payload?.ok || !payload?.data) {
    return {
      ...EMPTY_GA4,
      error: payload?.error || payload?.message || "GA4 no respondió correctamente.",
    };
  }

  const headers = Array.isArray(payload.data.metricHeaders)
    ? payload.data.metricHeaders
    : [];
  const values = Array.isArray(payload.data.rows?.[0]?.metricValues)
    ? payload.data.rows[0].metricValues
    : [];

  const getMetric = (name: string) => {
    const index = headers.findIndex((h: any) => h?.name === name);
    if (index < 0) return null;
    const raw = values[index]?.value;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  };

  return {
    connected: true,
    activeUsers: getMetric("activeUsers"),
    pageViews: getMetric("screenPageViews"),
    sessions: getMetric("sessions"),
    totalUsers: getMetric("totalUsers"),
  };
}

function StatBadge({ source }: { source: MetricSource }) {
  const map: Record<MetricSource, { label: string; color: string }> = {
    web: { label: "Web", color: "bg-[#0CE0B2]/10 text-[#0CE0B2]" },
    instagram: { label: "Instagram", color: "bg-pink-500/10 text-pink-300" },
    facebook: { label: "Facebook", color: "bg-blue-500/10 text-blue-300" },
    tiktok: { label: "TikTok", color: "bg-white/10 text-white" },
    youtube: { label: "YouTube", color: "bg-red-500/10 text-red-300" },
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium ${map[source].color}`}
    >
      {map[source].label}
    </span>
  );
}

function StatusDot({ status }: { status: "connected" | "pending" }) {
  if (status === "connected") {
    return <span className="ml-1 text-[10px] text-emerald-400">●</span>;
  }
  return <span className="ml-1 text-[10px] text-gray-500">•</span>;
}

function buildMetrics(ga4: Ga4Summary): Metric[] {
  return [
    {
      id: "web_active",
      label: "Usuarios activos",
      value: ga4.connected ? formatNumber(ga4.activeUsers) : "Pendiente",
      source: "web",
      status: ga4.connected ? "connected" : "pending",
      hint: "GA4 Data API",
    },
    {
      id: "web_pageviews",
      label: "Pageviews",
      value: ga4.connected ? formatNumber(ga4.pageViews) : "Pendiente",
      source: "web",
      status: ga4.connected ? "connected" : "pending",
      hint: "GA4 Data API",
    },
    {
      id: "instagram_pending",
      label: "Instagram Insights",
      value: "Pendiente",
      source: "instagram",
      status: "pending",
      hint: "Meta Graph API",
    },
    {
      id: "facebook_pending",
      label: "Facebook Insights",
      value: "Pendiente",
      source: "facebook",
      status: "pending",
      hint: "Meta Graph API",
    },
    {
      id: "tiktok_pending",
      label: "TikTok Analytics",
      value: "Pendiente",
      source: "tiktok",
      status: "pending",
      hint: "TikTok for Developers",
    },
    {
      id: "youtube_pending",
      label: "YouTube Studio",
      value: "Pendiente",
      source: "youtube",
      status: "pending",
      hint: "YouTube Data API",
    },
  ];
}

function buildPlatformCards(ga4: Ga4Summary): PlatformCard[] {
  return [
    {
      id: "web",
      title: "Web",
      subtitle: ga4.connected
        ? "Conectado con Google Analytics 4."
        : ga4.error || "Pendiente de conectar GA4 / Search Console.",
      status: ga4.connected ? "connected" : "pending",
      headline: {
        label: "Usuarios activos",
        value: ga4.connected ? formatNumber(ga4.activeUsers) : "Pendiente",
      },
      kpis: [
        {
          label: "Usuarios activos",
          value: ga4.connected ? formatNumber(ga4.activeUsers) : "Pendiente",
          hint: "Métrica activeUsers",
        },
        {
          label: "Pageviews",
          value: ga4.connected ? formatNumber(ga4.pageViews) : "Pendiente",
          hint: "Métrica screenPageViews",
        },
        {
          label: "Sesiones",
          value: ga4.connected && ga4.sessions !== null ? formatNumber(ga4.sessions) : "Pendiente",
          hint: "Agregar sessions en /api/analytics/ga4",
        },
        {
          label: "Usuarios totales",
          value: ga4.connected && ga4.totalUsers !== null ? formatNumber(ga4.totalUsers) : "Pendiente",
          hint: "Agregar totalUsers en /api/analytics/ga4",
        },
      ],
    },
    {
      id: "instagram",
      title: "Instagram",
      subtitle: "Pendiente de conectar Meta Insights.",
      status: "pending",
      headline: { label: "Seguidores", value: "Pendiente" },
      kpis: [
        { label: "Seguidores", value: "Pendiente" },
        { label: "Alcance", value: "Pendiente" },
        { label: "Impresiones", value: "Pendiente" },
        { label: "Engagement", value: "Pendiente" },
      ],
    },
    {
      id: "facebook",
      title: "Facebook",
      subtitle: "Pendiente de conectar Meta Insights.",
      status: "pending",
      headline: { label: "Seguidores", value: "Pendiente" },
      kpis: [
        { label: "Seguidores", value: "Pendiente" },
        { label: "Alcance", value: "Pendiente" },
        { label: "Impresiones", value: "Pendiente" },
        { label: "Interacciones", value: "Pendiente" },
      ],
    },
    {
      id: "tiktok",
      title: "TikTok",
      subtitle: "Pendiente de conectar TikTok Analytics.",
      status: "pending",
      headline: { label: "Views", value: "Pendiente" },
      kpis: [
        { label: "Views", value: "Pendiente" },
        { label: "Likes", value: "Pendiente" },
        { label: "Shares", value: "Pendiente" },
        { label: "Comentarios", value: "Pendiente" },
      ],
    },
    {
      id: "youtube",
      title: "YouTube",
      subtitle: "Pendiente de conectar YouTube Data API / Studio.",
      status: "pending",
      headline: { label: "Views", value: "Pendiente" },
      kpis: [
        { label: "Views", value: "Pendiente" },
        { label: "Watch time", value: "Pendiente" },
        { label: "CTR", value: "Pendiente" },
        { label: "Suscriptores", value: "Pendiente" },
      ],
    },
  ];
}

const INLINE_STYLE_PROPS = [
  "display",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "flex",
  "flexDirection",
  "flexWrap",
  "justifyContent",
  "alignItems",
  "gap",
  "width",
  "height",
  "minWidth",
  "minHeight",
  "maxWidth",
  "maxHeight",
  "padding",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "margin",
  "marginTop",
  "marginRight",
  "marginBottom",
  "marginLeft",
  "border",
  "borderTop",
  "borderRight",
  "borderBottom",
  "borderLeft",
  "borderRadius",
  "boxShadow",
  "background",
  "backgroundColor",
  "color",
  "font",
  "fontFamily",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "letterSpacing",
  "textAlign",
  "textTransform",
  "textDecoration",
  "whiteSpace",
  "opacity",
  "overflow",
] as const;

function inlineComputedStylesDeep(root: HTMLElement) {
  const walk = (el: HTMLElement) => {
    const cs = window.getComputedStyle(el);
    const pairs: string[] = [];

    INLINE_STYLE_PROPS.forEach((p) => {
      const v = (cs as any)[p];
      if (v && typeof v === "string") {
        pairs.push(`${p.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`);
      }
    });

    el.setAttribute("style", pairs.join(";"));

    Array.from(el.children).forEach((child) => {
      if (child instanceof HTMLElement) walk(child);
    });
  };

  walk(root);
}

async function exportElementAsPng(
  el: HTMLElement,
  filename = "motorwelt-metrics.png",
) {
  const rect = el.getBoundingClientRect();
  const width = Math.ceil(rect.width);
  const height = Math.ceil(rect.height);
  const clone = el.cloneNode(true) as HTMLElement;

  const holder = document.createElement("div");
  holder.style.position = "fixed";
  holder.style.left = "-99999px";
  holder.style.top = "0";
  holder.style.width = `${width}px`;
  holder.style.height = `${height}px`;
  holder.style.background = "#050812";
  holder.appendChild(clone);
  document.body.appendChild(holder);

  inlineComputedStylesDeep(clone);

  const xhtml = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject x="0" y="0" width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;background:#050812;">${xhtml}</div></foreignObject></svg>`;
  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    await new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
          const canvas = document.createElement("canvas");
          canvas.width = Math.floor(width * dpr);
          canvas.height = Math.floor(height * dpr);
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("No canvas ctx");
          ctx.scale(dpr, dpr);
          ctx.drawImage(img, 0, 0, width, height);
          const a = document.createElement("a");
          a.href = canvas.toDataURL("image/png");
          a.download = filename;
          a.click();
          resolve();
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = reject;
      img.src = svgUrl;
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
    document.body.removeChild(holder);
  }
}

export default function AdminPerfil({
  initialNotes = [],
  initialUsers = [],
  initialSubscribers = [],
}: {
  initialNotes: AdminNote[];
  initialUsers: AdminUser[];
  initialSubscribers: Subscriber[];
}) {
  const router = useRouter();
  const metricsSectionRef = useRef<HTMLElement | null>(null);

  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authorFilter, setAuthorFilter] = useState("todos");
  const [exporting, setExporting] = useState(false);
  const [ga4, setGa4] = useState<Ga4Summary>(EMPTY_GA4);
  const [ga4Loading, setGa4Loading] = useState(true);

  const notesPublished = useMemo(
    () => initialNotes.filter((n) => n.status === "publicada").length,
    [initialNotes],
  );
  const notesDrafts = useMemo(
    () => initialNotes.filter((n) => n.status === "borrador").length,
    [initialNotes],
  );
  const activeUsers = useMemo(
    () => initialUsers.filter((u) => u.active).length,
    [initialUsers],
  );

  const activeSubscribers = useMemo(
    () =>
      initialSubscribers.filter((s) => {
        const status = String(s.status || "").toLowerCase();
        return status === "active" || status === "activo";
      }).length,
    [initialSubscribers],
  );

  const inactiveSubscribers = useMemo(
    () => Math.max(0, initialSubscribers.length - activeSubscribers),
    [initialSubscribers.length, activeSubscribers],
  );

  const newSubscribers30d = useMemo(() => {
    const limit = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return initialSubscribers.filter((s) => {
      const t = new Date(s.createdAt).getTime();
      return Number.isFinite(t) && t >= limit;
    }).length;
  }, [initialSubscribers]);

  const latestSubscribers = useMemo(
    () => initialSubscribers.slice(0, 5),
    [initialSubscribers],
  );

  const publishedNotes = useMemo(() => {
    const list = initialNotes.filter((n) => n.status === "publicada");
    if (authorFilter === "todos") return list;
    return list.filter(
      (n) => n.authorName === authorFilter || n.authorEmail === authorFilter,
    );
  }, [initialNotes, authorFilter]);

  const authorOptions = useMemo(() => {
    const map = new Map<string, string>();
    initialNotes.forEach((n) => {
      const key = n.authorName || n.authorEmail || "Sin autor";
      map.set(key, key);
    });
    return Array.from(map.values()).sort((a, b) => a.localeCompare(b, "es"));
  }, [initialNotes]);

  const metrics = useMemo(() => buildMetrics(ga4), [ga4]);
  const platformCards = useMemo(() => buildPlatformCards(ga4), [ga4]);

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof window === "undefined") return;

    try {
      const cRole = getCookie("mw_role");
      const cEmail = getCookie("mw_email");
      const cName = getCookie("mw_name");
      const allowed = cRole === "admin" || cRole === "editor";

      if (cRole && cEmail && cName && allowed) {
        const cookieUser = { name: cName, email: cEmail, role: cRole };
        setCurrentUser(cookieUser);
        setAuthReady(true);

        try {
          localStorage.setItem(
            LOCALSTORAGE_KEY,
            JSON.stringify({ ...cookieUser, loggedAt: new Date().toISOString() }),
          );
        } catch {}

        return;
      }

      const stored = localStorage.getItem(LOCALSTORAGE_KEY);

      if (!stored) {
        router.replace("/admin/login");
        return;
      }

      const parsed = JSON.parse(stored);

      if (
        !parsed?.name ||
        !parsed?.email ||
        !(parsed?.role === "admin" || parsed?.role === "editor")
      ) {
        localStorage.removeItem(LOCALSTORAGE_KEY);
        router.replace("/admin/login");
        return;
      }

      setCurrentUser(parsed);
      setAuthReady(true);
    } catch {
      try {
        localStorage.removeItem(LOCALSTORAGE_KEY);
      } catch {}

      router.replace("/admin/login");
    }
  }, [router.isReady, router]);

  useEffect(() => {
    let alive = true;

    async function loadGa4() {
      setGa4Loading(true);

      try {
        const res = await fetch("/api/analytics/ga4", {
          method: "GET",
          credentials: "same-origin",
        });
        const payload = await res.json();

        if (!alive) return;
        setGa4(normalizeGa4Payload(payload));
      } catch (error: any) {
        if (!alive) return;
        setGa4({
          ...EMPTY_GA4,
          error: error?.message || "No se pudo leer GA4.",
        });
      } finally {
        if (alive) setGa4Loading(false);
      }
    }

    if (authReady) void loadGa4();

    return () => {
      alive = false;
    };
  }, [authReady]);

  const handleLogout = () => {
    try {
      localStorage.removeItem(LOCALSTORAGE_KEY);
    } catch {}

    clearMwCookies();
    router.push("/admin/login");
  };

  const handleSaveMetricsImage = async () => {
    if (!metricsSectionRef.current) return;
    setExporting(true);

    try {
      await exportElementAsPng(
        metricsSectionRef.current,
        `motorwelt-rendimiento-${new Date().toISOString().slice(0, 10)}.png`,
      );
    } catch (e) {
      console.error(e);
      alert(
        "No se pudo exportar la imagen en este navegador. Intenta de nuevo en Chrome/Edge o revisa si hay imágenes externas bloqueadas.",
      );
    } finally {
      setExporting(false);
    }
  };

  if (!authReady) return null;

  return (
    <>
      <Seo
        title="Perfil administrador | MotorWelt"
        description="Panel de administración de MotorWelt: notas, usuarios internos, suscriptores y métricas."
      />

      <main className="min-h-screen bg-[#041210] pb-16 pt-20 text-gray-100">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Panel de administración
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold text-white md:text-4xl">
                Perfil de administrador
              </h1>
              <p className="mt-2 max-w-xl text-sm text-gray-300">
                Desde aquí monitoreas contenido, usuarios internos, suscriptores y métricas del ecosistema MotorWelt.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-start gap-3 md:justify-end">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  <span>Sesión activa como</span>
                  <span className="font-semibold text-white">
                    {currentUser?.name ?? "Usuario MotorWelt"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Rol: <span className="font-semibold text-[#0CE0B2]">{currentUser?.role ?? "admin"}</span>
                </p>
              </div>

              <LinkButton href="/" variant="ghost" className="text-xs">
                Ver sitio público
              </LinkButton>

              <Button
                variant="ghost"
                type="button"
                className="border-red-400/40 text-xs text-red-300 hover:border-red-300 hover:text-red-200"
                onClick={handleLogout}
              >
                Cerrar sesión
              </Button>
            </div>
          </section>

          <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] text-gray-400">Notas publicadas</p>
              <p className="mt-1 text-xl font-bold text-white">{notesPublished}</p>
              <p className="mt-1 text-[10px] text-[#0CE0B2]">Sanity</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] text-gray-400">Borradores</p>
              <p className="mt-1 text-xl font-bold text-white">{notesDrafts}</p>
              <p className="mt-1 text-[10px] text-[#0CE0B2]">Sanity</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] text-gray-400">Usuarios internos</p>
              <p className="mt-1 text-xl font-bold text-white">{activeUsers}</p>
              <p className="mt-1 text-[10px] text-[#0CE0B2]">Activos</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] text-gray-400">Suscriptores</p>
              <p className="mt-1 text-xl font-bold text-white">{initialSubscribers.length}</p>
              <p className="mt-1 text-[10px] text-[#0CE0B2]">Base real</p>
            </div>
          </section>

          <section className="mb-10 rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Accesos rápidos</h2>
              <p className="max-w-xl text-sm text-gray-300">
                Atajos a pantallas clave del panel.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <LinkButton href="/admin/contenido" variant="cyan" className="w-full justify-between text-xs">
                Editor de contenido <span className="ml-2 text-[10px]">↗</span>
              </LinkButton>

              <LinkButton href="/admin/tareas" variant="pink" className="w-full justify-between text-xs">
                Tareas del equipo (IA) <span className="ml-2 text-[10px]">↗</span>
              </LinkButton>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1.5fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Membresías — ingresos</h2>
                    <p className="text-sm text-gray-300">
                      Suscriptores reales desde Sanity. Ingresos pendientes hasta conectar pagos.
                    </p>
                  </div>
                  <span className="rounded-full border border-[#0CE0B2]/20 bg-[#0CE0B2]/10 px-3 py-1 text-[11px] font-semibold text-[#0CE0B2]">
                    Base real
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs text-gray-400">Suscriptores totales</p>
                    <p className="mt-1 text-xl font-bold text-white">{initialSubscribers.length}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs text-gray-400">Activos</p>
                    <p className="mt-1 text-xl font-bold text-white">{activeSubscribers}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-xs text-gray-400">Nuevos 30 días</p>
                    <p className="mt-1 text-xl font-bold text-white">{newSubscribers30d}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-gray-300">
                    Ingreso total: <span className="font-semibold text-white">Pendiente</span>
                    <p className="mt-1 text-[11px] text-gray-500">Se activará cuando guardemos pagos reales.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs text-gray-300">
                    MRR: <span className="font-semibold text-white">Pendiente</span>
                    <p className="mt-1 text-[11px] text-gray-500">Pendiente de plan, precio y estado de pago.</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs text-gray-400">Últimos registros</p>
                  <div className="space-y-2">
                    {latestSubscribers.map((subscriber) => (
                      <div key={subscriber.id} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/35 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {`${subscriber.name || ""} ${subscriber.lastName || ""}`.trim() || "Sin nombre"}
                          </p>
                          <p className="truncate text-xs text-gray-400">{subscriber.email}</p>
                        </div>
                        <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-gray-300">
                          {subscriber.status || "active"}
                        </span>
                      </div>
                    ))}

                    {latestSubscribers.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-4 text-sm text-gray-400">
                        Todavía no hay suscriptores registrados.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Usuarios internos</h2>
                  <p className="text-sm text-gray-300">Cuentas autorizadas para publicar y editar contenido.</p>
                </div>

                <div className="mt-4">
                  <p className="mb-2 text-xs text-gray-400">Lista de usuarios ({initialUsers.length})</p>
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/25">
                    <table className="min-w-full text-left text-xs text-gray-200">
                      <thead className="border-b border-white/10 bg-white/5">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Nombre</th>
                          <th className="px-3 py-2 font-semibold">Correo</th>
                          <th className="px-3 py-2 font-semibold">Rol</th>
                          <th className="px-3 py-2 text-center font-semibold">Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {initialUsers.map((user) => (
                          <tr key={user.id} className="border-b border-white/5 last:border-0">
                            <td className="px-3 py-2">{user.name}</td>
                            <td className="px-3 py-2 text-gray-300">{user.email}</td>
                            <td className="px-3 py-2">
                              {user.role === "admin" ? "Admin" : user.role === "editor" ? "Editor" : "Autor"}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                                  user.active
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "bg-red-500/10 text-red-300"
                                }`}
                              >
                                {user.active ? "Activo" : "Inactivo"}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {initialUsers.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-3 py-4 text-center text-gray-400">
                              No hay usuarios internos en Sanity.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section
            ref={(node) => {
              metricsSectionRef.current = node;
            }}
            className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-4 md:p-5"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-base font-semibold text-white">Rendimiento — web y redes</h2>
                <p className="text-xs text-gray-300">
                  Web conectado a GA4. Redes quedan sin datos falsos hasta conectar sus APIs reales.
                </p>
                {ga4Loading ? (
                  <p className="mt-1 text-[11px] text-[#0CE0B2]">Cargando GA4…</p>
                ) : ga4.error ? (
                  <p className="mt-1 text-[11px] text-red-300">{ga4.error}</p>
                ) : null}
              </div>
              <Button variant="cyan" type="button" className="px-3 py-2 text-xs" onClick={handleSaveMetricsImage} disabled={exporting}>
                {exporting ? "Guardando…" : "Guardar imagen"}
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {metrics.map((metric) => (
                <div key={metric.id} className="rounded-2xl border border-white/10 bg-black/40 p-2">
                  <div className="flex items-center justify-between">
                    <StatBadge source={metric.source} />
                    <StatusDot status={metric.status} />
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-white">{metric.value}</p>
                  <p className="mt-0.5 text-[10px] leading-snug text-gray-400">{metric.label}</p>
                  {metric.hint ? <p className="mt-0.5 text-[9px] text-gray-500">{metric.hint}</p> : null}
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {platformCards.map((platform) => (
                <div key={platform.id} className="rounded-3xl border border-white/10 bg-black/40 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatBadge source={platform.id} />
                        <span className="text-[10px] text-gray-400">
                          {platform.status === "connected" ? "Conectado" : "Pendiente"}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-white">{platform.title}</h3>
                      <p className="mt-0.5 text-[10px] text-gray-400">{platform.subtitle}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] ${
                        platform.status === "connected"
                          ? "border-[#0CE0B2]/20 bg-[#0CE0B2]/10 text-[#0CE0B2]"
                          : "border-white/10 bg-black/40 text-gray-300"
                      }`}
                    >
                      {platform.headline.label}: <span className="font-semibold">{platform.headline.value}</span>
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {platform.kpis.map((kpi) => (
                      <div key={`${platform.id}-${kpi.label}`} className="rounded-2xl border border-white/10 bg-black/45 px-2 py-2">
                        <p className="text-[10px] text-gray-400">{kpi.label}</p>
                        <p className="mt-0.5 text-xs font-semibold text-white">{kpi.value}</p>
                        {kpi.hint ? <p className="mt-0.5 text-[9px] text-gray-500">{kpi.hint}</p> : null}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export async function getServerSideProps(ctx: { locale?: string; req: any }) {
  const locale = ctx.locale ?? "es";
  const role = ctx.req?.cookies?.mw_role;

  if (role && role !== "admin" && role !== "editor") {
    return { redirect: { destination: "/admin/login", permanent: false } };
  }

  const { sanityReadClient } = await import("../../lib/sanityClient");

  const notesQuery = `
    *[_type in ["article", "post"] && defined(slug.current)] | order(coalesce(publishedAt, _createdAt) desc){
      "id": _id,
      "title": coalesce(title, "Sin título"),
      "sectionKey": coalesce(
        section,
        select(
          lower(category) == "autos" => "noticias_autos",
          lower(category) == "motos" => "noticias_motos",
          "autos" in categories[] => "noticias_autos",
          "motos" in categories[] => "noticias_motos",
          ""
        )
      ),
      "status": coalesce(status, "publicado"),
      "publishedAt": publishedAt,
      "updatedAt": _updatedAt,
      "createdAt": _createdAt,
      "slug": slug.current,
      "authorName": coalesce(author->name, authorName, createdByName, _createdBy, "Sin autor"),
      "authorEmail": coalesce(author->email, authorEmail, "")
    }
  `;

  const usersQuery = `
    *[_type in ["adminUser", "internalUser", "mwUser"]] | order(name asc){
      "id": _id,
      "name": coalesce(name, fullName, displayName, "Sin nombre"),
      "email": coalesce(email, ""),
      "role": coalesce(role, "autor"),
      "active": coalesce(active, isActive, true)
    }
  `;

  const subscribersQuery = `
    *[_type == "subscriptionUser"] | order(_createdAt desc)[0...2000]{
      "id": _id,
      "name": coalesce(name, firstName, ""),
      "lastName": coalesce(lastName, surname, ""),
      "email": coalesce(email, ""),
      "status": coalesce(status, subscriptionStatus, "active"),
      "createdAt": _createdAt,
      "updatedAt": _updatedAt
    }
  `;

  const [rawNotes, rawUsers, rawSubscribers] = await Promise.all([
    sanityReadClient.fetch(notesQuery),
    sanityReadClient.fetch(usersQuery).catch(() => []),
    sanityReadClient.fetch(subscribersQuery).catch(() => []),
  ]);

  const sectionLabel = (section: string) => {
    const map: Record<string, string> = {
      noticias_autos: "Noticias Autos",
      noticias_motos: "Noticias Motos",
      lifestyle: "Lifestyle",
      deportes: "Deportes",
      comunidad: "Comunidad",
      tuning: "Tuning",
    };
    return map[section] ?? (section ? section.replace(/_/g, " ") : "Sin sección");
  };

  const normalizeStatus = (status: string): "publicada" | "borrador" => {
    const s = String(status || "").toLowerCase();
    return s === "publicado" || s === "publicada" || s === "published"
      ? "publicada"
      : "borrador";
  };

  const hrefForNote = (sectionKey: string, slug?: string) => {
    const cleanSlug = String(slug || "").trim();
    if (!cleanSlug) return "/";

    if (sectionKey === "noticias_autos") return `/noticias/autos/${cleanSlug}`;
    if (sectionKey === "noticias_motos") return `/noticias/motos/${cleanSlug}`;
    if (sectionKey === "deportes") return `/deportes/${cleanSlug}`;
    if (sectionKey === "lifestyle") return `/lifestyle/${cleanSlug}`;
    if (sectionKey === "tuning") return `/tuning/${cleanSlug}`;
    if (sectionKey === "comunidad") return `/comunidad/${cleanSlug}`;

    return `/noticias/${sectionKey}/${cleanSlug}`;
  };

  const initialNotes: AdminNote[] = (rawNotes ?? []).map((it: any) => {
    const sectionKey = String(it?.sectionKey ?? "");
    const slug = it?.slug ? String(it.slug) : undefined;

    return {
      id: String(it?.id ?? ""),
      title: String(it?.title ?? "Sin título"),
      sectionKey,
      sectionLabel: sectionLabel(sectionKey),
      status: normalizeStatus(it?.status),
      publishedAt: formatWhen(it?.publishedAt ?? it?.createdAt),
      updatedAt: formatWhen(it?.updatedAt, true),
      slug,
      authorName: String(it?.authorName ?? "Sin autor"),
      authorEmail: String(it?.authorEmail ?? ""),
      href: hrefForNote(sectionKey, slug),
    };
  });

  const initialUsers: AdminUser[] = (rawUsers ?? []).map((user: any) => {
    const role = String(user?.role ?? "autor").toLowerCase();

    return {
      id: String(user?.id ?? user?.email ?? Math.random()),
      name: String(user?.name ?? "Sin nombre"),
      email: String(user?.email ?? ""),
      role:
        role === "admin" || role === "editor" || role === "autor"
          ? role
          : "autor",
      active: Boolean(user?.active ?? true),
    };
  });

  const initialSubscribers: Subscriber[] = (rawSubscribers ?? []).map((subscriber: any) => ({
    id: String(subscriber?.id ?? ""),
    name: String(subscriber?.name ?? ""),
    lastName: String(subscriber?.lastName ?? ""),
    email: String(subscriber?.email ?? ""),
    status: String(subscriber?.status ?? "active"),
    createdAt: String(subscriber?.createdAt ?? ""),
    updatedAt: String(subscriber?.updatedAt ?? ""),
  }));

  return {
    props: {
      initialNotes,
      initialUsers,
      initialSubscribers,
      ...(await serverSideTranslations(locale, ["home"], nextI18NextConfig)),
    },
  };
}
