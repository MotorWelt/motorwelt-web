// pages/admin/perfil.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import Seo from "../../components/Seo";
import Link from "next/link";
import { useRouter } from "next/router";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

const LOCALSTORAGE_KEY = "mw_admin_user";

/**
 * ✅ IMPORTANTE:
 * Tu archivo está en:
 * pages/api/ai/admin/content/recent-activity.ts
 * Por lo tanto la URL correcta es:
 * /api/ai/admin/content/recent-activity
 */
const RECENT_ACTIVITY_ENDPOINT = "/api/ai/admin/content/recent-activity";

/* ---------- Botón estilo MotorWelt (igual que en otras páginas) ---------- */
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

/* ---------- Toggle simple para switches (publicidad, etc.) ---------- */
function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-2"
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
      {label && (
        <span className="text-sm text-gray-200 select-none">{label}</span>
      )}
    </button>
  );
}

/* ---------- Tipos ---------- */
type AdminNote = {
  id: string; // ✅ Sanity _id
  title: string;
  section: string;
  status: "publicada" | "borrador";
  createdAt: string; // string ya formateado para UI
  slug?: string; // opcional (por si luego lo usas para abrir)
};

type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor" | "autor";
  active: boolean;
};

type ActivityItem = {
  id: number;
  user: string;
  action: string;
  target: string;
  when: string;
};

type MetricSource = "web" | "instagram" | "facebook" | "tiktok" | "youtube";

type Metric = {
  id: string;
  label: string;
  value: string;
  trend?: "up" | "down" | "flat";
  source: MetricSource;
};

/* ---------- Actividad reciente (REAL desde API + polling) ---------- */
type RecentActivityItem = {
  _id: string;
  title?: string;
  section?: string;
  status?: string;
  slug?: string;
  publishedAt?: string;
  updatedAt?: string;
};

/* ---------- Datos demo (excepto notas, que ahora vienen de Sanity) ---------- */
const demoUsers: AdminUser[] = [
  {
    id: 1,
    name: "Gabriel Rodríguez",
    email: "admin@motorwelt.com",
    role: "admin",
    active: true,
  },
  {
    id: 2,
    name: "Redactor Autos",
    email: "autos@motorwelt.com",
    role: "editor",
    active: true,
  },
  {
    id: 3,
    name: "Colaborador Lifestyle",
    email: "lifestyle@motorwelt.com",
    role: "autor",
    active: false,
  },
];

const demoActivity: ActivityItem[] = [
  {
    id: 1,
    user: "Redactor Autos",
    action: "publicó",
    target: 'Nota: "Nuevo GT3 RS en México"',
    when: "Hace 25 min",
  },
  {
    id: 2,
    user: "Colaborador Lifestyle",
    action: "editó",
    target: 'Nota: "Artistas que pintan velocidad"',
    when: "Hace 2 h",
  },
  {
    id: 3,
    user: "Gabriel",
    action: "actualizó",
    target: "Publicidad home: Leaderboard ON",
    when: "Hoy 09:14",
  },
];

const demoMetrics: Metric[] = [
  {
    id: "web_active",
    label: "Usuarios activos ahora",
    value: "128",
    trend: "up",
    source: "web",
  },
  {
    id: "web_pageviews",
    label: "Pageviews últimas 24 h",
    value: "14,230",
    trend: "up",
    source: "web",
  },
  {
    id: "ig_followers",
    label: "Instagram seguidores",
    value: "23,540",
    trend: "up",
    source: "instagram",
  },
  {
    id: "fb_followers",
    label: "Facebook seguidores",
    value: "6,820",
    trend: "up",
    source: "facebook",
  },
  {
    id: "tt_views",
    label: "TikTok views 24 h",
    value: "89,100",
    trend: "flat",
    source: "tiktok",
  },
  {
    id: "yt_watch",
    label: "YouTube watch time 24 h",
    value: "62 h",
    trend: "down",
    source: "youtube",
  },
];

/* ---------- Membresías (demo) ---------- */
type MembershipKpi = {
  currency: "MXN" | "USD";
  totalRevenue: number;
  activeMembers: number;
  churnRate30dPct: number;
  arpu: number;
  mrr: number;
  trialUsers: number;
};

const demoMembership: MembershipKpi = {
  currency: "MXN",
  totalRevenue: 128450,
  activeMembers: 312,
  churnRate30dPct: 4.2,
  arpu: 149,
  mrr: 46500,
  trialUsers: 58,
};

/* ---------- Rendimiento por plataforma (demo) ---------- */
type KpiRow = { label: string; value: string; hint?: string };
type PlatformCard = {
  id: MetricSource;
  title: string;
  subtitle: string;
  headline: { label: string; value: string; trend?: "up" | "down" | "flat" };
  kpis: KpiRow[];
  charts: { label: string; points: number[] }[];
};

const platformCardsDemo: PlatformCard[] = [
  {
    id: "web",
    title: "Web",
    subtitle: "GA4 / Search Console (demo)",
    headline: { label: "Usuarios activos ahora", value: "128", trend: "up" },
    kpis: [
      { label: "Pageviews (24 h)", value: "14,230" },
      { label: "Usuarios (24 h)", value: "6,410" },
      { label: "Tiempo promedio", value: "2:18", hint: "Tiempo en sitio" },
      { label: "Bounce rate", value: "46%", hint: "Tasa de rebote" },
      { label: "Top nota", value: "Nuevo GT3 RS en México" },
      { label: "CTR orgánico", value: "3.8%", hint: "Search Console" },
    ],
    charts: [
      {
        label: "Usuarios activos (últimos 12)",
        points: [62, 71, 68, 80, 92, 88, 97, 103, 110, 121, 116, 128],
      },
      {
        label: "Pageviews (últimos 12)",
        points: [
          8200, 8600, 9000, 9800, 10500, 11200, 12000, 12650, 13200, 13800,
          14120, 14230,
        ],
      },
    ],
  },
  {
    id: "instagram",
    title: "Instagram",
    subtitle: "Insights (demo)",
    headline: { label: "Seguidores", value: "23,540", trend: "up" },
    kpis: [
      { label: "Alcance (7 d)", value: "182,400", hint: "Cuentas alcanzadas" },
      { label: "Impresiones (7 d)", value: "421,900" },
      {
        label: "Engagement rate",
        value: "5.1%",
        hint: "(Me gusta + comentarios + guardados) / alcance",
      },
      { label: "Guardados (7 d)", value: "6,420" },
      { label: "Visitas al perfil (7 d)", value: "14,880" },
      { label: "Clicks link (7 d)", value: "1,140" },
    ],
    charts: [
      {
        label: "Crecimiento seguidores",
        points: [18, 19, 19, 20, 21, 22, 22, 23, 23, 23, 24, 24],
      },
      {
        label: "Alcance",
        points: [92, 98, 104, 110, 118, 124, 129, 132, 137, 145, 150, 156],
      },
    ],
  },
  {
    id: "facebook",
    title: "Facebook",
    subtitle: "Meta Insights (demo)",
    headline: { label: "Seguidores", value: "6,820", trend: "up" },
    kpis: [
      { label: "Alcance (7 d)", value: "74,300", hint: "Personas alcanzadas" },
      { label: "Impresiones (7 d)", value: "190,600" },
      {
        label: "Engagement",
        value: "9,240",
        hint: "Reacciones + comentarios + compartidos",
      },
      { label: "Reacciones (7 d)", value: "6,880" },
      { label: "Compartidos (7 d)", value: "1,140" },
      { label: "Clicks link (7 d)", value: "620" },
    ],
    charts: [
      {
        label: "Alcance",
        points: [42, 44, 46, 50, 54, 56, 58, 61, 63, 66, 70, 74],
      },
      {
        label: "Interacciones",
        points: [18, 19, 20, 22, 23, 24, 25, 26, 27, 28, 29, 31],
      },
    ],
  },
  {
    id: "tiktok",
    title: "TikTok",
    subtitle: "Analytics (demo)",
    headline: { label: "Views (24 h)", value: "89,100", trend: "flat" },
    kpis: [
      { label: "Likes (24 h)", value: "7,840" },
      { label: "Shares (24 h)", value: "1,120" },
      { label: "Comentarios (24 h)", value: "860" },
      { label: "Avg watch time", value: "12.4s" },
      {
        label: "Completion rate",
        value: "31%",
        hint: "Porcentaje que ve hasta el final",
      },
      { label: "Seguidores ganados", value: "+410", hint: "Últimos 7 días" },
    ],
    charts: [
      {
        label: "Views",
        points: [55, 61, 58, 66, 72, 70, 69, 74, 78, 82, 80, 89],
      },
      {
        label: "Retention",
        points: [22, 23, 24, 25, 27, 26, 26, 27, 28, 29, 30, 31],
      },
    ],
  },
  {
    id: "youtube",
    title: "YouTube",
    subtitle: "Studio (demo)",
    headline: { label: "Watch time (24 h)", value: "62 h", trend: "down" },
    kpis: [
      { label: "Views (24 h)", value: "18,900" },
      { label: "Impresiones", value: "210,000", hint: "Últimos 7 días" },
      { label: "CTR", value: "4.6%", hint: "Click-through rate" },
      { label: "Avg view duration", value: "3:12" },
      { label: "Subs ganados", value: "+96", hint: "Últimos 7 días" },
      { label: "Top video", value: "GTI generaciones — sonido ASMR" },
    ],
    charts: [
      {
        label: "Watch time",
        points: [14, 16, 18, 22, 26, 30, 28, 25, 23, 21, 20, 19],
      },
      { label: "Views", points: [9, 10, 11, 13, 15, 17, 16, 15, 14, 13, 12, 12] },
    ],
  },
];

/* ---------- helpers ---------- */
function formatMoney(amount: number, currency: "MXN" | "USD") {
  try {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    const symbol = currency === "MXN" ? "$" : "US$";
    return `${symbol}${Math.round(amount).toLocaleString("es-MX")}`;
  }
}

/* ---------- Tarjetas UI pequeñas ---------- */
function StatBadge({ source }: { source: MetricSource }) {
  const map: Record<MetricSource, { label: string; color: string }> = {
    web: { label: "Web", color: "bg-[#0CE0B2]/10 text-[#0CE0B2]" },
    instagram: { label: "Instagram", color: "bg-pink-500/10 text-pink-300" },
    facebook: { label: "Facebook", color: "bg-blue-500/10 text-blue-300" },
    tiktok: { label: "TikTok", color: "bg-white/10 text-white" },
    youtube: { label: "YouTube", color: "bg-red-500/10 text-red-300" },
  };
  const item = map[source];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${item.color}`}
    >
      {item.label}
    </span>
  );
}

function TrendIcon({ trend }: { trend?: Metric["trend"] }) {
  if (!trend || trend === "flat") {
    return (
      <span className="ml-1 text-xs text-gray-400" aria-hidden>
        •
      </span>
    );
  }
  if (trend === "up") {
    return (
      <span className="ml-1 text-xs text-emerald-400" aria-hidden>
        ↑
      </span>
    );
  }
  return (
    <span className="ml-1 text-xs text-red-400" aria-hidden>
      ↓
    </span>
  );
}

/* ---------- Mini gráfica (SVG) ---------- */
function MiniLineChart({
  points,
  strokeClassName = "stroke-[#0CE0B2]",
}: {
  points: number[];
  strokeClassName?: string;
}) {
  const w = 260;
  const h = 64;
  const pad = 7;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;

  const toX = (i: number) =>
    pad + (i * (w - pad * 2)) / Math.max(1, points.length - 1);
  const toY = (v: number) => pad + (h - pad * 2) * (1 - (v - min) / span);

  const d = points
    .map(
      (v, i) =>
        `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`
    )
    .join(" ");

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="block"
      aria-hidden
    >
      <path
        d={`M ${pad} ${h / 2} L ${w - pad} ${h / 2}`}
        className="stroke-white/10"
        strokeWidth="1"
      />
      <path
        d={`M ${pad} ${pad} L ${pad} ${h - pad}`}
        className="stroke-white/10"
        strokeWidth="1"
      />
      <path
        d={`M ${w - pad} ${pad} L ${w - pad} ${h - pad}`}
        className="stroke-white/10"
        strokeWidth="1"
      />
      <path
        d={d}
        className={`${strokeClassName} fill-none`}
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Export helpers (PNG + Print) ---------- */
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
] as const;

function inlineComputedStylesDeep(root: HTMLElement) {
  const walk = (el: HTMLElement) => {
    const cs = window.getComputedStyle(el);
    const pairs: string[] = [];
    INLINE_STYLE_PROPS.forEach((p) => {
      const v = (cs as any)[p];
      if (v && typeof v === "string") {
        pairs.push(
          `${p.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${v}`
        );
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
  filename = "motorwelt-metrics.png"
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
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject x="0" y="0" width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml" style="width:${width}px;height:${height}px;background:#050812;">
          ${xhtml}
        </div>
      </foreignObject>
    </svg>
  `.trim();

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

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

        const png = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = png;
        a.download = filename;
        a.click();

        resolve();
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(svgUrl);
      }
    };
    img.onerror = reject;
    img.src = svgUrl;
  });

  document.body.removeChild(holder);
}

/* ============================================================================= */

export default function AdminPerfil({
  initialNotes = [],
}: {
  initialNotes: AdminNote[];
}) {
  const router = useRouter();

  const [notes] = useState<AdminNote[]>(initialNotes);
  const [users, setUsers] = useState<AdminUser[]>(demoUsers);
  const [activity] = useState<ActivityItem[]>(demoActivity);
  const [metrics] = useState<Metric[]>(demoMetrics);
  const [membership] = useState<MembershipKpi>(demoMembership);
  const [platformCards] = useState<PlatformCard[]>(platformCardsDemo);

  // ✅ Actividad reciente REAL (API)
  const [recentActivity, setRecentActivity] = useState<RecentActivityItem[]>([]);
  const [recentActivityLoading, setRecentActivityLoading] = useState(false);
  const [recentActivityError, setRecentActivityError] = useState<string | null>(
    null
  );

  // ✅ Ref para evitar closures “stale” en el polling (y evitar flash)
  const recentActivityRef = useRef<RecentActivityItem[]>([]);
  useEffect(() => {
    recentActivityRef.current = recentActivity;
  }, [recentActivity]);

  const [currentUser, setCurrentUser] = useState<{
    name?: string;
    email?: string;
    role?: string;
  } | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [adsGlobal, setAdsGlobal] = useState(true);
  const [adsHomeLeaderboard, setAdsHomeLeaderboard] = useState(true);
  const [adsNoticiasAutosSidebar, setAdsNoticiasAutosSidebar] = useState(true);
  const [adsLifestyleBillboard, setAdsLifestyleBillboard] = useState(true);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<AdminUser["role"]>("editor");

  const notesPublished = useMemo(
    () => notes.filter((n) => n.status === "publicada").length,
    [notes]
  );
  const notesDrafts = useMemo(
    () => notes.filter((n) => n.status === "borrador").length,
    [notes]
  );

  const publishedNotes = useMemo(
    () => notes.filter((n) => n.status === "publicada"),
    [notes]
  );

  const strokeBySource: Record<MetricSource, string> = {
    web: "stroke-[#0CE0B2]",
    instagram: "stroke-[#FF7A1A]",
    facebook: "stroke-blue-300",
    tiktok: "stroke-white",
    youtube: "stroke-red-300",
  };

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

  // --------- Actividad reciente (API) ----------
  const fetchRecentActivity = async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent ?? false;

    try {
      if (!silent && recentActivityRef.current.length === 0) {
        setRecentActivityLoading(true);
      }

      // ✅ RUTA CORRECTA
      const res = await fetch(RECENT_ACTIVITY_ENDPOINT);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const next: RecentActivityItem[] = Array.isArray(data) ? data : [];

      const prevKey = recentActivityRef.current
        .map((x) => `${x._id}:${x.updatedAt ?? ""}`)
        .join("|");

      const nextKey = next
        .map((x) => `${x._id}:${x.updatedAt ?? ""}`)
        .join("|");

      if (prevKey !== nextKey) {
        setRecentActivity(next);
      }

      // ✅ Solo limpia error cuando el fetch fue OK (aunque sea silent)
      setRecentActivityError(null);
    } catch (e: any) {
      // ✅ En silent no queremos “ensuciar” la UI si el poll falló momentáneamente
      if (!silent) {
        setRecentActivityError(
          e?.message ?? "No se pudo cargar actividad reciente."
        );
      }
    } finally {
      if (!silent) {
        setRecentActivityLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!authReady) return;

    fetchRecentActivity({ silent: false });

    const poll = setInterval(() => {
      fetchRecentActivity({ silent: true });
    }, 15000);

    return () => clearInterval(poll);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCALSTORAGE_KEY);
      router.push("/admin/login");
    }
  };

  const handleAddUser = () => {
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const user: AdminUser = {
      id: Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      active: true,
    };
    setUsers((prev) => [...prev, user]);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserRole("editor");
  };

  const toggleUserActive = (id: number) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u))
    );
  };

  // ======= Export / Print section =======
  const metricsSectionRef = useRef<HTMLElement | null>(null);
  const [exporting, setExporting] = useState(false);

  const handlePrintMetrics = () => {
    window.print();
  };

  const handleSaveMetricsImage = async () => {
    if (!metricsSectionRef.current) return;
    setExporting(true);
    try {
      await exportElementAsPng(
        metricsSectionRef.current,
        `motorwelt-rendimiento-${new Date().toISOString().slice(0, 10)}.png`
      );
    } catch (e) {
      console.error(e);
      alert(
        "No se pudo exportar como imagen en este navegador. Usa 'Imprimir' y guarda como PDF."
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
        description="Panel de administración de MotorWelt: notas, usuarios, publicidad y métricas."
      />

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #mw-metrics-print,
          #mw-metrics-print * {
            visibility: visible !important;
          }
          #mw-metrics-print {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            background: #050812 !important;
            padding: 18px !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-mw-surface/95 pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          {/* Encabezado del perfil */}
          <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gray-400">
                Panel de administración
              </p>
              <h1 className="mt-2 font-display text-3xl md:text-4xl font-extrabold text-white">
                Perfil de administrador
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-xl">
                Desde aquí controlas notas, usuarios, publicidad y puedes
                monitorear la actividad de tu equipo y las métricas en tiempo
                (casi) real del ecosistema MotorWelt.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-start md:justify-end gap-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-xs text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Sesión activa como</span>
                  <span className="font-semibold text-white">
                    {currentUser?.name ?? "Usuario MotorWelt"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  Rol:{" "}
                  <span className="font-semibold text-[#0CE0B2]">
                    {currentUser?.role ?? "admin"}
                  </span>{" "}
                  · Último acceso: Hoy, 09:14 (CDMX)
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

          {/* KPIs rápidos */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-3 mb-6">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-gray-400">Notas</p>
              <p className="mt-1 text-sm text-gray-300">
                Publicadas:{" "}
                <span className="font-semibold text-white">
                  {notesPublished}
                </span>{" "}
                · Borradores:{" "}
                <span className="font-semibold text-white">{notesDrafts}</span>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Conteo desde Sanity (publicadas + borradores).
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-gray-400">Usuarios internos</p>
              <p className="mt-1 text-sm text-gray-300">
                Activos:{" "}
                <span className="font-semibold text-white">
                  {users.filter((u) => u.active).length}
                </span>{" "}
                · Totales:{" "}
                <span className="font-semibold text-white">{users.length}</span>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Control de roles y accesos (demo).
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs text-gray-400">Publicidad</p>
              <p className="mt-1 text-sm text-gray-300">
                Estado global:{" "}
                <span
                  className={[
                    "font-semibold",
                    adsGlobal ? "text-emerald-400" : "text-red-400",
                  ].join(" ")}
                >
                  {adsGlobal ? "Activa" : "Pausada"}
                </span>
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Control de visibilidad (demo).
              </p>
            </div>
          </section>

          {/* Accesos rápidos */}
          <section className="mb-10 rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Accesos rápidos
                </h2>
                <p className="text-sm text-gray-300 max-w-xl">
                  Atajos a pantallas clave del panel.
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/contenido">
                <Button
                  variant="cyan"
                  className="w-full justify-between text-xs"
                  type="button"
                >
                  Editor de contenido
                  <span className="text-[10px] text-gray-200 ml-2">↗</span>
                </Button>
              </Link>

              <Link href="/admin/tareas">
                <Button
                  variant="pink"
                  className="w-full justify-between text-xs"
                  type="button"
                >
                  Tareas del equipo (IA)
                  <span className="text-[10px] text-gray-200 ml-2">↗</span>
                </Button>
              </Link>

              <Link href="/admin/registro-usuario">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-xs"
                  type="button"
                >
                  Registrar nuevo usuario
                  <span className="text-[10px] text-gray-200 ml-2">↗</span>
                </Button>
              </Link>
            </div>

            <p className="mt-3 text-[11px] text-gray-500">
              Aquí luego agregamos accesos a reportes o campañas.
            </p>
          </section>

          {/* Layout principal */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1.5fr]">
            {/* Columna izquierda */}
            <section className="space-y-6">
              {/* Actividad reciente (REAL API) */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Actividad reciente
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      Últimos cambios en artículos (Sanity).
                    </p>
                  </div>

                  <button
                    onClick={() => fetchRecentActivity({ silent: false })}
                    className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gray-200 hover:bg-white/10"
                    type="button"
                  >
                    Actualizar
                  </button>
                </div>

                {recentActivityError ? (
                  <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
                    {recentActivityError}
                  </div>
                ) : null}

                {recentActivityLoading && recentActivity.length === 0 ? (
                  <div className="mt-4 text-sm text-white/60">
                    Cargando actividad…
                  </div>
                ) : null}

                <div className="mt-4 space-y-3">
                  {recentActivity.map((a) => (
                    <div
                      key={a._id}
                      className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-[220px]">
                          <p className="text-sm font-semibold text-white">
                            {a.title || (
                              <span className="text-white/50">(Sin título)</span>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {a.section ? `Sección: ${a.section}` : "Sección: —"} ·{" "}
                            {a.status ? `Status: ${a.status}` : "Status: —"}
                          </p>
                        </div>

                        <div className="text-right text-xs text-white/60">
                          <div>
                            Actualizado:{" "}
                            {a.updatedAt
                              ? new Date(a.updatedAt).toLocaleString()
                              : "—"}
                          </div>
                          <div>
                            Publicado:{" "}
                            {a.publishedAt
                              ? new Date(a.publishedAt).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-xl border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white/70">
                          ID: {a._id}
                        </span>
                        <span className="rounded-xl border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-white/70">
                          Slug: {a.slug || "—"}
                        </span>

                        {a.slug && a.section ? (
                          <Link
                            className="ml-auto rounded-2xl bg-white/10 px-3 py-2 text-xs font-semibold text-gray-100 hover:bg-white/15"
                            href={`/noticias/${a.section}/${a.slug}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Ver nota
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}

                  {!recentActivityLoading && recentActivity.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-gray-300">
                      No hay actividad reciente para mostrar.
                    </div>
                  ) : null}
                </div>

                {/* (Se deja el demo “activity” intacto pero ya no se renderiza aquí) */}
                <div className="hidden">
                  {activity.map((item) => (
                    <div key={item.id}>{item.user}</div>
                  ))}
                </div>
              </div>

              {/* Notas publicadas */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Notas publicadas
                    </h2>
                    <p className="text-sm text-gray-300">
                      Publicadas por ti y el equipo (Sanity).
                    </p>
                  </div>
                  <Link href="/admin/contenido">
                    <Button
                      variant="cyan"
                      type="button"
                      className="text-xs mt-1 md:mt-0"
                    >
                      Abrir editor avanzado
                    </Button>
                  </Link>
                </div>

                <div className="mt-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      Últimas publicadas ({publishedNotes.length})
                    </p>
                    <span className="text-[11px] text-gray-500">
                      Click en “Leer / editar” para abrir la nota (cuando exista
                      vista de detalle).
                    </span>
                  </div>

                  <div className="divide-y divide-white/5 border border-white/10 rounded-2xl bg-black/25">
                    {publishedNotes.map((note) => (
                      <div
                        key={note.id}
                        className="flex flex-col gap-2 px-4 py-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {note.title}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {note.section} · {note.createdAt}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-500/10 text-emerald-300">
                            Publicada
                          </span>
                          <Link
                            href={
                              note.slug && note.section
                                ? `/noticias/${note.section}/${note.slug}`
                                : "#"
                            }
                            className="inline-flex"
                          >
                            <Button
                              variant="ghost"
                              type="button"
                              className="px-3 py-1.5 text-xs"
                            >
                              Leer / editar
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                    {publishedNotes.length === 0 && (
                      <div className="px-4 py-4 text-sm text-gray-400">
                        Aún no hay notas publicadas.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Membresías */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Membresías — ingresos
                    </h2>
                    <p className="text-sm text-gray-300">
                      Resumen de performance (demo).
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-gray-300">
                    Actualiza al conectar pagos
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-[11px] text-gray-400">Ingreso total</p>
                    <p className="mt-2 text-2xl font-extrabold text-white">
                      {formatMoney(membership.totalRevenue, membership.currency)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Acumulado histórico (demo).
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-[11px] text-gray-400">Miembros activos</p>
                    <p className="mt-2 text-2xl font-extrabold text-white">
                      {membership.activeMembers.toLocaleString("es-MX")}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Usuarios con plan activo.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-[11px] text-gray-400">MRR estimado</p>
                    <p className="mt-2 text-2xl font-extrabold text-white">
                      {formatMoney(membership.mrr, membership.currency)}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Ingreso recurrente mensual (aprox).
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                    <p className="text-[11px] text-gray-400">Salud del plan</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[11px] text-gray-200">
                        ARPU:{" "}
                        <span className="ml-1 font-semibold text-white">
                          {formatMoney(membership.arpu, membership.currency)}
                        </span>
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[11px] text-gray-200">
                        Churn 30d:{" "}
                        <span className="ml-1 font-semibold text-white">
                          {membership.churnRate30dPct.toFixed(1)}%
                        </span>
                      </span>
                      <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-1 text-[11px] text-gray-200">
                        Trials:{" "}
                        <span className="ml-1 font-semibold text-white">
                          {membership.trialUsers.toLocaleString("es-MX")}
                        </span>
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">
                      ARPU = ingreso promedio por miembro. Churn = cancelaciones.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Columna derecha */}
            <section className="space-y-6">
              {/* Usuarios */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Usuarios internos
                    </h2>
                    <p className="text-sm text-gray-300">
                      Crea y administra cuentas de quienes pueden publicar y
                      editar contenido.
                    </p>
                  </div>
                  <Link href="/admin/registro-usuario">
                    <Button
                      variant="pink"
                      type="button"
                      className="text-xs mt-1 md:mt-0"
                    >
                      Abrir registro avanzado
                    </Button>
                  </Link>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Nuevo usuario
                  </p>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-1">
                      <label
                        htmlFor="user-name"
                        className="text-xs text-gray-400"
                      >
                        Nombre
                      </label>
                      <input
                        id="user-name"
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                        placeholder="Ej. Redactor Autos"
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="user-email"
                        className="text-xs text-gray-400"
                      >
                        Correo
                      </label>
                      <input
                        id="user-email"
                        type="email"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        placeholder="usuario@motorwelt.com"
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="user-role"
                        className="text-xs text-gray-400"
                      >
                        Rol
                      </label>
                      <select
                        id="user-role"
                        value={newUserRole}
                        onChange={(e) =>
                          setNewUserRole(e.target.value as AdminUser["role"])
                        }
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FF7A1A]/40"
                      >
                        <option value="admin">Admin</option>
                        <option value="editor">Editor</option>
                        <option value="autor">Autor</option>
                      </select>
                    </div>
                    <div className="flex items-end justify-end">
                      <Button
                        variant="pink"
                        type="button"
                        onClick={handleAddUser}
                      >
                        Guardar usuario (demo)
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-400 mb-2">
                    Lista de usuarios ({users.length})
                  </p>
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/25">
                    <table className="min-w-full text-left text-xs text-gray-200">
                      <thead className="border-b border-white/10 bg-white/5">
                        <tr>
                          <th className="px-3 py-2 font-semibold">Nombre</th>
                          <th className="px-3 py-2 font-semibold">Correo</th>
                          <th className="px-3 py-2 font-semibold">Rol</th>
                          <th className="px-3 py-2 font-semibold text-center">
                            Estado
                          </th>
                          <th className="px-3 py-2 font-semibold text-right">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr
                            key={u.id}
                            className="border-b border-white/5 last:border-0"
                          >
                            <td className="px-3 py-2">{u.name}</td>
                            <td className="px-3 py-2 text-gray-300">
                              {u.email}
                            </td>
                            <td className="px-3 py-2">
                              {u.role === "admin"
                                ? "Admin"
                                : u.role === "editor"
                                ? "Editor"
                                : "Autor"}
                            </td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => toggleUserActive(u.id)}
                                className={[
                                  "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                                  u.active
                                    ? "bg-emerald-500/10 text-emerald-300"
                                    : "bg-red-500/10 text-red-300",
                                ].join(" ")}
                              >
                                {u.active ? "Activo" : "Inactivo"}
                              </button>
                            </td>
                            <td className="px-3 py-2 text-right">
                              <button className="text-[11px] text-[#0CE0B2] hover:text-[#7CFFE2] mr-2">
                                Ver actividad
                              </button>
                              <button className="text-[11px] text-gray-400 hover:text-gray-200">
                                Editar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Publicidad */}
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">
                    Publicidad del sitio
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Enciende o apaga bloques de anuncios (demo frontend).
                  </p>
                </div>
                <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <Toggle
                    checked={adsGlobal}
                    onChange={setAdsGlobal}
                    label="Publicidad global activa"
                  />
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-200">
                    <Toggle
                      checked={adsHomeLeaderboard}
                      onChange={setAdsHomeLeaderboard}
                      label="Home — Leaderboard superior"
                    />
                    <Toggle
                      checked={adsNoticiasAutosSidebar}
                      onChange={setAdsNoticiasAutosSidebar}
                      label="Noticias Autos — Barra lateral"
                    />
                    <Toggle
                      checked={adsLifestyleBillboard}
                      onChange={setAdsLifestyleBillboard}
                      label="Lifestyle — Billboard intermedio"
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Cuando conectes tu backend, estos switches pueden actualizar
                    flags y esconder/mostrar{" "}
                    <code className="ml-1 rounded bg-black/60 px-1">
                      &lt;AdSlot /&gt;
                    </code>
                    .
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* ===================== MÉTRICAS (FULL WIDTH AL FINAL) ===================== */}
          <section
            id="mw-metrics-print"
            ref={(n) => {
              metricsSectionRef.current = n;
            }}
            className="mt-8 rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Rendimiento — web y redes (media kit)
                </h2>
                <p className="text-sm text-gray-300">
                  Métricas por plataforma + gráficas con KPIs típicos de cada
                  red (demo).
                </p>
                <p className="mt-1 text-[11px] text-gray-500">
                  Tip: para media kits, usa “Imprimir” y guarda como PDF, o
                  “Guardar imagen”.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  type="button"
                  className="text-xs"
                  onClick={handlePrintMetrics}
                >
                  Imprimir pantalla
                </Button>
                <Button
                  variant="cyan"
                  type="button"
                  className="text-xs"
                  onClick={handleSaveMetricsImage}
                  disabled={exporting}
                >
                  {exporting ? "Guardando…" : "Guardar imagen"}
                </Button>
              </div>
            </div>

            {/* Cards numéricas */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {metrics.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/10 bg-black/40 p-3"
                >
                  <div className="flex items-center justify-between">
                    <StatBadge source={m.source} />
                    <TrendIcon trend={m.trend} />
                  </div>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {m.value}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Plataforma: cards detalladas */}
            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {platformCards.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl border border-white/10 bg-black/40 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <StatBadge source={p.id} />
                        <span className="text-xs text-gray-400">
                          {p.subtitle}
                        </span>
                      </div>
                      <h3 className="mt-2 text-lg font-semibold text-white">
                        {p.title}
                      </h3>
                      <p className="mt-1 text-xs text-gray-400">
                        {p.headline.label}:{" "}
                        <span className="font-semibold text-white">
                          {p.headline.value}
                        </span>
                        <TrendIcon trend={p.headline.trend} />
                      </p>
                    </div>

                    <span className="inline-flex items-center rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[11px] text-gray-300">
                      Últimos 12 puntos
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {p.kpis.map((k) => (
                      <div
                        key={k.label}
                        className="rounded-2xl border border-white/10 bg-black/45 px-3 py-2.5"
                      >
                        <p className="text-[11px] text-gray-400">{k.label}</p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          {k.value}
                        </p>
                        {k.hint && (
                          <p className="mt-1 text-[10px] text-gray-500">
                            {k.hint}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {p.charts.map((c) => (
                      <div
                        key={c.label}
                        className="rounded-2xl border border-white/10 bg-black/45 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-white">
                            {c.label}
                          </p>
                          <span className="text-[10px] text-gray-500">
                            tendencia
                          </span>
                        </div>
                        <div className="mt-2">
                          <MiniLineChart
                            points={c.points}
                            strokeClassName={strokeBySource[p.id]}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-3 text-[11px] text-gray-500">
                    Estas métricas son demo. Al integrar APIs, reemplazamos KPIs
                    y series.
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 text-[11px] text-gray-500">
              Nota: “Guardar imagen” intenta exportar esta sección como PNG
              automáticamente. Si falla, usa “Imprimir” y guarda como PDF.
            </p>
          </section>
        </div>
      </main>
    </>
  );
}

/* ===================== Sanity: traer notas de TODAS las secciones ===================== */
export async function getServerSideProps({ locale }: { locale: string }) {
  const { sanityReadClient } = await import("../../lib/sanityClient");

  const query = `
    *[
      _type == "article" &&
      (status == "publicado" || status == "borrador" || status == "revision")
    ]
    | order(publishedAt desc, _createdAt desc){
      "id": _id,
      "title": coalesce(title, ""),
      "section": coalesce(section, ""),
      "status": coalesce(status, "borrador"),
      "publishedAt": publishedAt,
      "_createdAt": _createdAt,
      "slug": slug.current
    }
  `;

  const raw = await sanityReadClient.fetch(query);

  const sectionLabel = (s: string) => {
    const map: Record<string, string> = {
      noticias_autos: "Noticias Autos",
      noticias_motos: "Noticias Motos",
      lifestyle: "Lifestyle",
      deportes: "Deportes",
      comunidad: "Comunidad",
    };
    return map[s] ?? (s ? s.replace(/_/g, " ") : "Sin sección");
  };

  const formatWhen = (iso: string | null | undefined) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(d);
  };

  const initialNotes: AdminNote[] = (raw ?? []).map((it: any) => {
    const isPublished = it?.status === "publicado";
    const dateIso = it?.publishedAt ?? it?._createdAt ?? null;

    return {
      id: String(it?.id ?? ""),
      title: String(it?.title ?? ""),
      section: sectionLabel(String(it?.section ?? "")),
      status: isPublished ? "publicada" : "borrador",
      createdAt: formatWhen(dateIso) || "—",
      slug: it?.slug ? String(it.slug) : undefined,
    };
  });

  return {
    props: {
      initialNotes,
      ...(await serverSideTranslations(
        locale ?? "es",
        ["home"],
        nextI18NextConfig
      )),
    },
  };
}