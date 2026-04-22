import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Seo from "../../components/Seo";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
const nextI18NextConfig = require("../../next-i18next.config.js");

const LOCALSTORAGE_KEY = "mw_admin_user";

/* ---------- Botón estilo MotorWelt (igual que otros panels) ---------- */
type Variant = "cyan" | "pink" | "ghost";

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }
> = ({ className = "", children, variant = "cyan", ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed";
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

/* ---------- Helpers auth ---------- */
function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const escaped = name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(
    new RegExp("(^| )" + escaped + "=([^;]+)")
  );

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

/* ---------- Tipos ---------- */

type SectionSlug =
  | "noticias_autos"
  | "noticias_motos"
  | "deportes"
  | "lifestyle"
  | "comunidad"
  | "tuning";

type ContentType = "noticia" | "review" | "entrevista";

type ContentStatus = "borrador" | "revision" | "publicado";

type CurrentUser = {
  name?: string;
  email?: string;
  role?: "admin" | "editor" | "autor" | string;
};

type AiSeoInsights = {
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  score?: number;
  suggestions?: string[];
};

/* ---------- Tipos para copys RRSS (IA) ---------- */

type SocialTone = "editorial" | "emocional" | "tecnico" | "cotorro";
type SocialLength = "corto" | "medio" | "largo";
type SocialLanguage = "es" | "en" | "bi";

type SocialPlatformId =
  | "instagram_feed"
  | "instagram_stories"
  | "tiktok_reels"
  | "youtube"
  | "twitter_x";

type SocialCopyPack = {
  platform: SocialPlatformId;
  copyPrincipal: string;
  variaciones?: string[];
  hashtags?: string[];
  cta?: string;
};

/* Helper para etiqueta bonita de la plataforma */
function labelForPlatform(p: SocialPlatformId): string {
  switch (p) {
    case "instagram_feed":
      return "Instagram (feed)";
    case "instagram_stories":
      return "Instagram Stories";
    case "tiktok_reels":
      return "TikTok / Reels";
    case "youtube":
      return "YouTube descripción";
    case "twitter_x":
      return "X (Twitter)";
    default:
      return p;
  }
}

/* Helpers */
function fmtDateShort(iso?: string) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function publicPathFromSection(section?: SectionSlug, slug?: string) {
  if (!section || !slug) return null;

  if (section === "noticias_autos") return `/noticias/autos/${slug}`;
  if (section === "noticias_motos") return `/noticias/motos/${slug}`;
  if (section === "deportes") return `/deportes/${slug}`;
  if (section === "lifestyle") return `/lifestyle/${slug}`;
  if (section === "comunidad") return `/comunidad/${slug}`;
  if (section === "tuning") return `/tuning/${slug}`;
  return null;
}

function normalizeGalleryUrls(input: string): string[] {
  return Array.from(
    new Set(
      (input || "")
        .split(/\n|,/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

function isoToDatetimeLocal(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";

  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function datetimeLocalToIso(value?: string) {
  if (!value?.trim()) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

/* ---------- Tipos para listado y carga ---------- */
type ContentListItem = {
  id: string;
  title?: string;
  section?: SectionSlug;
  contentType?: ContentType;
  status?: ContentStatus;
  updatedAt?: string;
  publishedAt?: string | null;
  authorEmail?: string;
  authorName?: string;
  slug?: string;
};

type ContentDocPayload = {
  id: string;

  title?: string;
  subtitle?: string;
  excerpt?: string;

  section?: SectionSlug;
  contentType?: ContentType;
  status?: ContentStatus;

  body?: string;

  tags?: string[];

  videoUrl?: string;
  reelUrl?: string;
  useVideoAsHero?: boolean;

  seoTitle?: string;
  seoDescription?: string;

  authorName?: string;
  authorEmail?: string;

  updatedAt?: string;
  publishedAt?: string | null;

  mainImageUrl?: string;
  galleryUrls?: string[];

  coverImageAssetId?: string;
  coverImageAssetUrl?: string;

  slug?: string;
};

type SaveDraftResponse = {
  ok: true;
  id: string;
  created?: boolean;
  slug?: string;
};

type UpdateStatusResponse = {
  ok: true;
  id: string;
  status: ContentStatus;
  updatedAt: string;
  publishedAt?: string | null;
  slug?: string;
};

/* ============================================================================= */

const AdminContentEditorPage: React.FC = () => {
  const router = useRouter();

  const [authReady, setAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // ✅ ID real del documento en Sanity
  const [docId, setDocId] = useState<string | null>(null);
  const [docSlug, setDocSlug] = useState<string | null>(null);

  // Campos base
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [section, setSection] = useState<SectionSlug>("noticias_autos");
  const [contentType, setContentType] = useState<ContentType>("noticia");
  const [status, setStatus] = useState<ContentStatus>("borrador");
  const [publishedAtInput, setPublishedAtInput] = useState("");

  // Contenido principal
  const [body, setBody] = useState("");
  const bodyValueRef = useRef("");
  useEffect(() => {
    bodyValueRef.current = body;
  }, [body]);

  // Medios
  const [mainImage, setMainImage] = useState("");
  const [gallery, setGallery] = useState<string>(""); // coma o salto de línea
  const [videoUrl, setVideoUrl] = useState("");
  const [reelUrl, setReelUrl] = useState("");
  const [useVideoAsHero, setUseVideoAsHero] = useState(false);

  // ✅ Upload real (imagen principal)
  const [mainImageAsset, setMainImageAsset] = useState<{
    assetId: string;
    url: string;
  } | null>(null);
  const [uploadingMainImage, setUploadingMainImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // ✅ Upload imágenes para el cuerpo / galería
  const [uploadingInlineImages, setUploadingInlineImages] = useState(false);
  const [inlineUploadError, setInlineUploadError] = useState<string | null>(
    null
  );
  const [uploadingGalleryImages, setUploadingGalleryImages] = useState(false);
  const [galleryUploadError, setGalleryUploadError] = useState<string | null>(
    null
  );

  const bodyRef = useRef<HTMLTextAreaElement | null>(null);
  const inlineImagesInputRef = useRef<HTMLInputElement | null>(null);
  const galleryImagesInputRef = useRef<HTMLInputElement | null>(null);
  const mainImageInputRef = useRef<HTMLInputElement | null>(null);

  async function uploadImageToSanity(file: File) {
    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/ai/admin/content/upload-image", {
      method: "POST",
      body: fd,
    });

    let data: any = null;
    try {
      data = await res.json();
    } catch {
      throw new Error("Respuesta inválida del upload de imagen.");
    }

    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || "Upload failed");
    }

    return data as { ok: true; assetId: string; url: string };
  }

  async function uploadManyToSanity(files: FileList | File[]) {
    const arr = Array.from(files || []);
    const out: { assetId: string; url: string }[] = [];

    for (const f of arr) {
      const up = await uploadImageToSanity(f);
      out.push({ assetId: up.assetId, url: up.url });
    }

    return out;
  }

  const insertAtCursor = (text: string) => {
    const el = bodyRef.current;
    const currentBody = bodyValueRef.current;

    if (!el) {
      setBody((prev) => (prev ? prev + "\n" + text : text));
      return;
    }

    const start = el.selectionStart ?? currentBody.length;
    const end = el.selectionEnd ?? currentBody.length;

    const before = currentBody.slice(0, start);
    const after = currentBody.slice(end);

    const next = `${before}${text}${after}`;
    setBody(next);

    requestAnimationFrame(() => {
      try {
        el.focus();
        const pos = start + text.length;
        el.setSelectionRange(pos, pos);
      } catch {}
    });
  };

  const ensureLineBreakBefore = () => {
    const el = bodyRef.current;
    const currentBody = bodyValueRef.current;

    if (!el) return currentBody ? "\n" : "";
    const start = el.selectionStart ?? 0;
    const before = currentBody.slice(0, start);
    if (!before) return "";
    return before.endsWith("\n") ? "" : "\n";
  };

  const insertHeading = (level: 2 | 3 | 4 | 5) => {
    const hashes = "#".repeat(level);
    const prefix = ensureLineBreakBefore();
    insertAtCursor(`${prefix}${hashes} `);
  };

  const insertMarkdownImages = (urls: string[]) => {
    if (!urls || urls.length === 0) return;
    const prefix = ensureLineBreakBefore();
    const blocks = urls.map((u) => `![imagen](${u})`).join("\n\n");
    insertAtCursor(`${prefix}${blocks}\n`);
  };

  const insertVideoEmbed = (rawUrl: string) => {
    const url = (rawUrl || "").trim();
    if (!url) return;
    const prefix = ensureLineBreakBefore();
    insertAtCursor(`${prefix}@[video](${url})\n`);
  };

  const handleInlineImagesPick = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;

    setInlineUploadError(null);
    setUploadingInlineImages(true);

    try {
      const uploaded = await uploadManyToSanity(files);
      const urls = uploaded.map((u) => u.url);
      insertMarkdownImages(urls);
    } catch (err: any) {
      setInlineUploadError(err?.message || "No se pudieron subir las imágenes.");
    } finally {
      setUploadingInlineImages(false);
      if (inlineImagesInputRef.current) inlineImagesInputRef.current.value = "";
    }
  };

  const handleGalleryImagesPick = async (files?: FileList | null) => {
    if (!files || files.length === 0) return;

    setGalleryUploadError(null);
    setUploadingGalleryImages(true);

    try {
      const uploaded = await uploadManyToSanity(files);
      const urls = uploaded.map((u) => u.url);

      setGallery((prev) => {
        const merged = Array.from(
          new Set([...normalizeGalleryUrls(prev), ...urls])
        );
        return merged.join("\n");
      });
    } catch (err: any) {
      setGalleryUploadError(err?.message || "No se pudieron subir las imágenes.");
    } finally {
      setUploadingGalleryImages(false);
      if (galleryImagesInputRef.current) galleryImagesInputRef.current.value = "";
    }
  };

  // Extras
  const [tags, setTags] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");

  const [savingState, setSavingState] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  // IA (artículo / SEO)
  const [aiLoading, setAiLoading] = useState<
    null | "correct" | "seo" | "title" | "meta"
  >(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSeoInsights, setAiSeoInsights] = useState<AiSeoInsights | null>(null);

  // IA Copys redes
  const [socialTone, setSocialTone] = useState<SocialTone>("editorial");
  const [socialLength, setSocialLength] = useState<SocialLength>("medio");
  const [socialLanguage, setSocialLanguage] = useState<SocialLanguage>("es");
  const [socialIncludeHashtags, setSocialIncludeHashtags] = useState(true);
  const [socialIncludeCta, setSocialIncludeCta] = useState(true);
  const [socialLoading, setSocialLoading] = useState(false);
  const [socialError, setSocialError] = useState<string | null>(null);
  const [socialCopies, setSocialCopies] = useState<SocialCopyPack[] | null>(
    null
  );

  /* ---------- ✅ Listado de notas (para editar) ---------- */
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [myNotes, setMyNotes] = useState<ContentListItem[]>([]);
  const [listQuery, setListQuery] = useState("");
  const [listStatus, setListStatus] = useState<"all" | ContentStatus>(
    "publicado"
  );
  const [loadingDocId, setLoadingDocId] = useState<string | null>(null);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);

  const publicUrl = useMemo(() => {
    return publicPathFromSection(section, docSlug || undefined);
  }, [section, docSlug]);

  const resetEditorForNew = () => {
    setDocId(null);
    setDocSlug(null);
    setTitle("");
    setSubtitle("");
    setSection("noticias_autos");
    setContentType("noticia");
    setStatus("borrador");
    setPublishedAtInput("");
    setBody("");

    setMainImage("");
    setGallery("");
    setVideoUrl("");
    setReelUrl("");
    setUseVideoAsHero(false);

    setMainImageAsset(null);
    setUploadError(null);

    setInlineUploadError(null);
    setGalleryUploadError(null);

    setTags("");
    setSeoTitle("");
    setSeoDescription("");

    setAiSeoInsights(null);
    setAiError(null);
    setSocialCopies(null);
    setSocialError(null);
    setSavingState("idle");

    if (inlineImagesInputRef.current) inlineImagesInputRef.current.value = "";
    if (galleryImagesInputRef.current) galleryImagesInputRef.current.value = "";
    if (mainImageInputRef.current) mainImageInputRef.current.value = "";
  };

  const fetchMyNotes = async () => {
    setListError(null);
    setListLoading(true);

    try {
      const res = await fetch("/api/ai/admin/content/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: listStatus === "all" ? undefined : listStatus,
          q: listQuery || undefined,
          limit: 30,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo cargar el listado.");
      }

      const items = (data.items || []) as ContentListItem[];
      setMyNotes(items);
    } catch (err: any) {
      setMyNotes([]);
      setListError(err?.message || "Error cargando tus notas.");
    } finally {
      setListLoading(false);
    }
  };

  const loadNoteIntoEditor = async (id: string) => {
    setListError(null);
    setAiError(null);
    setLoadingDocId(id);

    try {
      const res = await fetch("/api/ai/admin/content/get", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo cargar la nota.");
      }

      const doc = data.doc as ContentDocPayload;

      setDocId(doc.id);
      setDocSlug(doc.slug || null);
      setTitle(doc.title || "");
      setSubtitle(doc.subtitle || "");
      setSection((doc.section as SectionSlug) || "noticias_autos");
      setContentType((doc.contentType as ContentType) || "noticia");
      setStatus((doc.status as ContentStatus) || "borrador");
      setPublishedAtInput(isoToDatetimeLocal(doc.publishedAt || ""));
      setBody(doc.body || "");

      setTags(Array.isArray(doc.tags) ? doc.tags.join(", ") : "");
      setSeoTitle(doc.seoTitle || "");
      setSeoDescription(doc.seoDescription || "");

      setVideoUrl(doc.videoUrl || "");
      setReelUrl(doc.reelUrl || "");
      setUseVideoAsHero(Boolean(doc.useVideoAsHero));

      const coverUrl = doc.mainImageUrl || doc.coverImageAssetUrl || "";
      setMainImage(coverUrl);

      if (
        doc.coverImageAssetId &&
        (doc.coverImageAssetUrl || doc.mainImageUrl)
      ) {
        setMainImageAsset({
          assetId: doc.coverImageAssetId,
          url: doc.coverImageAssetUrl || doc.mainImageUrl || coverUrl,
        });
      } else {
        setMainImageAsset(null);
      }

      if (Array.isArray(doc.galleryUrls) && doc.galleryUrls.length > 0) {
        setGallery(Array.from(new Set(doc.galleryUrls.filter(Boolean))).join("\n"));
      } else {
        setGallery("");
      }

      setSavingState("idle");
      setSocialCopies(null);
      setSocialError(null);
      setAiSeoInsights(null);
      setUploadError(null);
      setInlineUploadError(null);
      setGalleryUploadError(null);

      if (inlineImagesInputRef.current) inlineImagesInputRef.current.value = "";
      if (galleryImagesInputRef.current) galleryImagesInputRef.current.value = "";
      if (mainImageInputRef.current) mainImageInputRef.current.value = "";
    } catch (err: any) {
      setAiError(err?.message || "No se pudo cargar la nota.");
    } finally {
      setLoadingDocId(null);
    }
  };

  const deleteNote = async (id: string) => {
    const ok =
      typeof window === "undefined"
        ? false
        : window.confirm(
            "¿Seguro que quieres eliminar esta nota? Esta acción no se puede deshacer."
          );

    if (!ok) return;

    setListError(null);
    setDeletingDocId(id);

    try {
      const res = await fetch("/api/ai/admin/content/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "No se pudo eliminar la nota.");
      }

      if (docId === id) {
        resetEditorForNew();
      }

      fetchMyNotes().catch(() => {});
    } catch (err: any) {
      setListError(err?.message || "Error eliminando la nota.");
    } finally {
      setDeletingDocId(null);
    }
  };

  useEffect(() => {
    if (!authReady) return;
    if (!currentUser) return;
    fetchMyNotes().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, currentUser]);

  useEffect(() => {
    if (!authReady) return;
    fetchMyNotes().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listStatus]);

  /* ---------- Protección de ruta ---------- */
  useEffect(() => {
    if (!router.isReady) return;
    if (typeof window === "undefined") return;

    try {
      const cRole = getCookie("mw_role");
      const cEmail = getCookie("mw_email");
      const cName = getCookie("mw_name");

      if (cRole && cEmail && cName) {
        const cookieUser = {
          name: cName,
          email: cEmail,
          role: cRole,
        };

        setCurrentUser(cookieUser);
        setAuthReady(true);

        try {
          localStorage.setItem(
            LOCALSTORAGE_KEY,
            JSON.stringify({
              ...cookieUser,
              loggedAt: new Date().toISOString(),
            })
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
      if (!parsed?.name || !parsed?.email || !parsed?.role) {
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

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LOCALSTORAGE_KEY);
      } catch {}
      clearMwCookies();
      router.push("/admin/login");
    }
  };

  /* ---------- Guardado REAL a Sanity (borrador) ---------- */

  const buildExcerpt = () => {
    const text = (subtitle || body || "").trim().replace(/\s+/g, " ");
    return text.length > 180 ? text.slice(0, 177) + "…" : text;
  };

  const saveDraftReal = async (): Promise<string> => {
    setSavingState("saving");
    setAiError(null);

    try {
      const payload = {
        id: docId || undefined,

        title,
        subtitle: subtitle || undefined,
        excerpt: buildExcerpt() || undefined,

        section,
        contentType,
        status: "borrador" as ContentStatus,

        body,

        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),

        videoUrl: videoUrl || undefined,
        reelUrl: reelUrl || undefined,
        useVideoAsHero,

        seoTitle: (seoTitle || title) || undefined,
        seoDescription: seoDescription || undefined,

        authorName: currentUser?.name || "MotorWelt",
        authorEmail: currentUser?.email || undefined,

        updatedAt: new Date().toISOString(),
        publishedAt: datetimeLocalToIso(publishedAtInput),

        mainImageUrl: mainImage || undefined,
        galleryUrls: normalizeGalleryUrls(gallery),

        mainImageAsset: mainImageAsset || undefined,
      };

      const res = await fetch("/api/ai/admin/content/save-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as SaveDraftResponse & {
        error?: string;
      };

      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || "Error desconocido guardando borrador");
      }

      setDocId(data.id);
      if (data.slug) setDocSlug(data.slug);
      setStatus("borrador");
      setSavingState("saved");
      setTimeout(() => setSavingState("idle"), 2000);

      fetchMyNotes().catch(() => {});

      return data.id as string;
    } catch (err: any) {
      console.error(err);
      setSavingState("idle");
      setAiError(err?.message || "No se pudo guardar el borrador.");
      throw err;
    }
  };

  const handleSaveDraft = () => {
    saveDraftReal().catch(() => {});
  };

  /* ---------- ✅ Status REAL (PATCH) ---------- */

  const updateStatusReal = async (
    nextStatus: ContentStatus
  ): Promise<UpdateStatusResponse> => {
    const id = await saveDraftReal();

    const res = await fetch("/api/ai/admin/content/update-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });

    const data = (await res.json()) as UpdateStatusResponse & {
      error?: string;
    };
    if (!res.ok || !data?.ok) {
      throw new Error(data?.error || "Error actualizando status");
    }

    return data;
  };

  const handleSendToReview = async () => {
    setSavingState("saving");
    setAiError(null);

    try {
      const result = await updateStatusReal("revision");
      setDocId(result.id);
      if (result.slug) setDocSlug(result.slug);
      setStatus(result.status);
      if (result.publishedAt) {
        setPublishedAtInput(isoToDatetimeLocal(result.publishedAt));
      }
      setSavingState("saved");
      setTimeout(() => setSavingState("idle"), 1500);

      fetchMyNotes().catch(() => {});
    } catch (err: any) {
      console.error(err);
      setSavingState("idle");
      setAiError(err?.message || "No se pudo enviar a revisión.");
    }
  };

  const canPublish =
    currentUser?.role === "admin" || currentUser?.role === "editor";

  const handlePublish = async () => {
    setSavingState("saving");
    setAiError(null);

    try {
      const result = await updateStatusReal("publicado");
      void result;

      fetchMyNotes().catch(() => {});
      resetEditorForNew();

      setSavingState("saved");
      setTimeout(() => setSavingState("idle"), 1500);
    } catch (err: any) {
      console.error(err);
      setSavingState("idle");
      setAiError(err?.message || "No se pudo publicar.");
    }
  };

  /* ---------- IA: helpers (artículo / SEO) ---------- */

  const handleAiCorrectArticle = async () => {
    if (!body.trim()) {
      setAiError("Escribe algo en el cuerpo del artículo antes de corregir.");
      return;
    }
    setAiError(null);
    setAiLoading("correct");
    try {
      const res = await fetch("/api/ai/correct-article", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          section,
          contentType,
          body,
        }),
      });

      if (!res.ok) {
        throw new Error("Respuesta no OK del endpoint de IA.");
      }

      const data = (await res.json()) as { correctedBody?: string };
      if (data.correctedBody) {
        setBody(data.correctedBody);
      } else {
        throw new Error("Respuesta de IA sin 'correctedBody'.");
      }
    } catch (err) {
      console.error(err);
      setAiError(
        "No se pudo corregir el texto con IA. Verifica el endpoint /api/ai/correct-article."
      );
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiSeoOptimize = async () => {
    if (!title.trim() && !body.trim()) {
      setAiError(
        "Necesitas al menos título o cuerpo para generar sugerencias SEO."
      );
      return;
    }
    setAiError(null);
    setAiLoading("seo");
    try {
      const res = await fetch("/api/ai/seo-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          body,
          section,
          contentType,
          tags,
        }),
      });

      if (!res.ok) {
        throw new Error("Respuesta no OK del endpoint de IA SEO.");
      }

      const data = (await res.json()) as {
        seoTitle?: string;
        seoDescription?: string;
        primaryKeyword?: string;
        secondaryKeywords?: string[];
        score?: number;
        suggestions?: string[];
      };

      if (data.seoTitle) setSeoTitle(data.seoTitle);
      if (data.seoDescription) setSeoDescription(data.seoDescription);
      setAiSeoInsights({
        primaryKeyword: data.primaryKeyword,
        secondaryKeywords: data.secondaryKeywords,
        score: data.score,
        suggestions: data.suggestions,
      });
    } catch (err) {
      console.error(err);
      setAiError(
        "No se pudo generar el análisis SEO con IA. Verifica el endpoint /api/ai/seo-insights."
      );
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiSuggestSeoTitleOnly = async () => {
    if (!title.trim() && !body.trim()) {
      setAiError(
        "Necesitas al menos título o cuerpo para sugerir un título SEO."
      );
      return;
    }
    setAiError(null);
    setAiLoading("title");
    try {
      const res = await fetch("/api/ai/seo-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          body,
          section,
          contentType,
          tags,
          mode: "title-only",
        }),
      });

      if (!res.ok) {
        throw new Error("Respuesta no OK del endpoint de IA SEO.");
      }

      const data = (await res.json()) as { seoTitle?: string };
      if (data.seoTitle) setSeoTitle(data.seoTitle);
    } catch (err) {
      console.error(err);
      setAiError(
        "No se pudo sugerir título SEO. Verifica el endpoint /api/ai/seo-insights."
      );
    } finally {
      setAiLoading(null);
    }
  };

  const handleAiSuggestSeoMetaOnly = async () => {
    if (!title.trim() && !body.trim()) {
      setAiError(
        "Necesitas al menos título o cuerpo para sugerir una meta descripción."
      );
      return;
    }
    setAiError(null);
    setAiLoading("meta");
    try {
      const res = await fetch("/api/ai/seo-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          body,
          section,
          contentType,
          tags,
          mode: "meta-only",
        }),
      });

      if (!res.ok) {
        throw new Error("Respuesta no OK del endpoint de IA SEO.");
      }

      const data = (await res.json()) as { seoDescription?: string };
      if (data.seoDescription) setSeoDescription(data.seoDescription);
    } catch (err) {
      console.error(err);
      setAiError(
        "No se pudo sugerir meta descripción. Verifica el endpoint /api/ai/seo-insights."
      );
    } finally {
      setAiLoading(null);
    }
  };

  /* ---------- IA: Copys para redes ---------- */

  const handleGenerateSocialCopy = async () => {
    if (!title.trim() && !body.trim()) {
      setSocialError(
        "Escribe al menos un título o parte del cuerpo para generar copys."
      );
      return;
    }
    setSocialError(null);
    setSocialLoading(true);
    setSocialCopies(null);

    try {
      const res = await fetch("/api/ai/social-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          body,
          section,
          contentType,
          tags,
          seoTitle,
          seoDescription,
          options: {
            tone: socialTone,
            length: socialLength,
            language: socialLanguage,
            includeHashtags: socialIncludeHashtags,
            includeCta: socialIncludeCta,
          },
        }),
      });

      if (!res.ok) {
        throw new Error("Respuesta no OK del endpoint /api/ai/social-copy");
      }

      const data = (await res.json()) as {
        platforms?: SocialCopyPack[];
      };

      if (data.platforms && data.platforms.length > 0) {
        setSocialCopies(data.platforms);
      } else {
        setSocialError(
          "La IA no devolvió copys aprovechables. Intenta ajustar el texto o las opciones."
        );
      }
    } catch (err) {
      console.error(err);
      setSocialError(
        "No se pudieron generar copys para redes. Verifica el endpoint /api/ai/social-copy."
      );
    } finally {
      setSocialLoading(false);
    }
  };

  const handleCopyToClipboard = (text: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch((err) => {
        console.error("Error al copiar:", err);
      });
    }
  };

  if (!authReady) {
    return null;
  }

  return (
    <>
      <Seo
        title="Editor de contenido | MotorWelt"
        description="Editor unificado para crear y actualizar contenido de todas las secciones de MotorWelt."
      />

      <main className="min-h-screen bg-mw-surface/95 pt-20 pb-16">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <section className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
                  <li className="text-gray-300">Editor de contenido</li>
                </ol>
              </nav>
              <h1 className="font-display text-3xl md:text-4xl font-extrabold text-white">
                Editor de contenido
              </h1>
              <p className="mt-2 text-sm text-gray-300 max-w-xl">
                Desde aquí puedes crear y editar notas para cualquier sección de
                MotorWelt manteniendo una misma estructura visual.
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

          <section className="mb-6 rounded-2xl border border-white/10 bg-black/30 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">
                  Estado
                </span>
                <span
                  className={[
                    "rounded-full px-2 py-0.5",
                    "text-[11px] font-medium",
                    status === "borrador"
                      ? "bg-slate-500/10 text-slate-200"
                      : status === "revision"
                      ? "bg-amber-500/10 text-amber-300"
                      : "bg-emerald-500/10 text-emerald-300",
                  ].join(" ")}
                >
                  {status === "borrador"
                    ? "Borrador"
                    : status === "revision"
                    ? "En revisión"
                    : "Publicado"}
                </span>
              </span>

              {docId && (
                <span className="text-[11px] text-gray-400">
                  ID Sanity:{" "}
                  <span className="text-gray-200 font-semibold">{docId}</span>
                </span>
              )}

              {savingState === "saving" && (
                <span className="text-[11px] text-[#0CE0B2]">
                  Guardando cambios…
                </span>
              )}
              {savingState === "saved" && (
                <span className="text-[11px] text-emerald-300">
                  Cambios guardados.
                </span>
              )}
              {uploadingMainImage && (
                <span className="text-[11px] text-[#0CE0B2]">
                  Subiendo imagen…
                </span>
              )}
              {uploadingInlineImages && (
                <span className="text-[11px] text-[#0CE0B2]">
                  Subiendo imágenes al cuerpo…
                </span>
              )}
              {uploadingGalleryImages && (
                <span className="text-[11px] text-[#0CE0B2]">
                  Subiendo galería…
                </span>
              )}
              {aiLoading && (
                <span className="text-[11px] text-[#0CE0B2]">
                  IA trabajando en{" "}
                  {aiLoading === "correct"
                    ? "corrección de texto…"
                    : aiLoading === "seo"
                    ? "análisis SEO…"
                    : aiLoading === "title"
                    ? "título SEO…"
                    : "meta descripción…"}
                </span>
              )}
              {aiError && (
                <span className="text-[11px] text-red-300">{aiError}</span>
              )}
              {uploadError && (
                <span className="text-[11px] text-red-300">{uploadError}</span>
              )}
              {inlineUploadError && (
                <span className="text-[11px] text-red-300">
                  {inlineUploadError}
                </span>
              )}
              {galleryUploadError && (
                <span className="text-[11px] text-red-300">
                  {galleryUploadError}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 justify-start md:justify-end">
              {publicUrl && status === "publicado" && (
                <Link href={publicUrl} target="_blank" rel="noreferrer">
                  <Button variant="ghost" type="button" className="text-xs">
                    Ver nota pública
                  </Button>
                </Link>
              )}

              <Button
                variant="ghost"
                type="button"
                className="text-xs"
                onClick={handleSaveDraft}
                disabled={savingState === "saving"}
              >
                Guardar borrador
              </Button>
              <Button
                variant="cyan"
                type="button"
                className="text-xs"
                onClick={handleSendToReview}
                disabled={savingState === "saving"}
              >
                Enviar a revisión
              </Button>
              <Button
                variant="pink"
                type="button"
                className="text-xs"
                onClick={handlePublish}
                disabled={savingState === "saving" || !canPublish}
                title={
                  canPublish ? "Publicar" : "Sólo admin/editor pueden publicar"
                }
              >
                Publicar
              </Button>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2.1fr_1.4fr]">
            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">
                  Metadatos de la nota
                </h2>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="content-title"
                      className="text-xs text-gray-300"
                    >
                      Título
                    </label>
                    <input
                      id="content-title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. BMW M2 x Mexico City nights"
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="content-subtitle"
                      className="text-xs text-gray-300"
                    >
                      Bajada / Subtítulo
                    </label>
                    <textarea
                      id="content-subtitle"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      placeholder="Una línea que resuma el ángulo de la historia."
                      rows={2}
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    />
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="content-section"
                        className="text-xs text-gray-300"
                      >
                        Sección
                      </label>
                      <select
                        id="content-section"
                        value={section}
                        onChange={(e) =>
                          setSection(e.target.value as SectionSlug)
                        }
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      >
                        <option value="noticias_autos">Autos</option>
                        <option value="noticias_motos">Motos</option>
                        <option value="deportes">Deportes</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="comunidad">Comunidad</option>
                        <option value="tuning">Tuning</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="content-type"
                        className="text-xs text-gray-300"
                      >
                        Tipo de nota
                      </label>
                      <select
                        id="content-type"
                        value={contentType}
                        onChange={(e) =>
                          setContentType(e.target.value as ContentType)
                        }
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      >
                        <option value="noticia">Noticia</option>
                        <option value="review">Review / Prueba</option>
                        <option value="entrevista">Entrevista</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="content-tags"
                        className="text-xs text-gray-300"
                      >
                        Tags / Etiquetas
                      </label>
                      <input
                        id="content-tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="BMW, M2, CDMX, Trackday"
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      />
                      <p className="mt-1 text-[10px] text-gray-500">
                        Separa con comas. Ej: BMW, M2, MotoGP, Lifestyle.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="content-published-at"
                      className="text-xs text-gray-300"
                    >
                      Fecha de publicación
                    </label>
                    <input
                      id="content-published-at"
                      type="datetime-local"
                      value={publishedAtInput}
                      onChange={(e) => setPublishedAtInput(e.target.value)}
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    />
                    <p className="mt-1 text-[10px] text-gray-500">
                      Si la dejas vacía, la fecha seguirá automática al publicar.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Cuerpo del artículo
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      Luego esto puede migrar a un editor de bloques (Sanity,
                      MDX, etc.).
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-[11px] px-3 py-1.5"
                      onClick={handleAiCorrectArticle}
                      disabled={aiLoading === "correct"}
                    >
                      {aiLoading === "correct"
                        ? "Corrigiendo…"
                        : "Corregir texto (IA)"}
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[11px] px-3 py-1.5"
                    onClick={() => insertHeading(2)}
                    title="Insertar H2"
                  >
                    H2
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[11px] px-3 py-1.5"
                    onClick={() => insertHeading(3)}
                    title="Insertar H3"
                  >
                    H3
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[11px] px-3 py-1.5"
                    onClick={() => insertHeading(4)}
                    title="Insertar H4"
                  >
                    H4
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[11px] px-3 py-1.5"
                    onClick={() => insertHeading(5)}
                    title="Insertar H5"
                  >
                    H5
                  </Button>

                  <span className="mx-1 h-5 w-px bg-white/10" />

                  <input
                    ref={inlineImagesInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleInlineImagesPick(e.target.files)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[11px] px-3 py-1.5"
                    onClick={() => inlineImagesInputRef.current?.click()}
                    disabled={uploadingInlineImages}
                    title="Subir imágenes e insertarlas en el texto (donde esté el cursor)"
                  >
                    {uploadingInlineImages ? "Subiendo…" : "Imagen"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="text-[11px] px-3 py-1.5"
                    onClick={() => {
                      if (typeof window === "undefined") return;
                      const url = window.prompt(
                        "Pega la URL del video (YouTube/Vimeo). Se insertará en el texto donde está el cursor:"
                      );
                      if (!url) return;
                      insertVideoEmbed(url);
                    }}
                    title="Insertar video en el texto: @[video](url)"
                  >
                    Video
                  </Button>

                  <p className="text-[10px] text-gray-500">
                    (Imágenes:{" "}
                    <code className="mx-1 rounded bg-black/60 px-1">
                      ![imagen](url)
                    </code>
                    · Video:{" "}
                    <code className="mx-1 rounded bg-black/60 px-1">
                      @[video](url)
                    </code>
                    )
                  </p>
                </div>

                <textarea
                  ref={bodyRef}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`Puedes escribir aquí el texto completo: párrafos, subtítulos (H2/H3/H4/H5) y notas.\n\nTambién puedes intercalar imágenes con el botón "Imagen" y videos con el botón "Video".`}
                  rows={16}
                  className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40 font-mono"
                />
                <p className="text-[11px] text-gray-500">
                  Tip: si quieres, puedes ir estructurando con marcas tipo
                  <code className="mx-1 rounded bg-black/60 px-1">
                    ## Subtítulo
                  </code>
                  ,
                  <code className="mx-1 rounded bg-black/60 px-1">
                    &gt; Cita
                  </code>{" "}
                  para que en el futuro podamos parsear esto a bloques.
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Mis notas
                    </h2>
                    <p className="text-[11px] text-gray-400">
                      Selecciona una nota para cargarla en el editor y
                      actualizarla.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-[11px] px-3 py-1.5"
                      onClick={() => resetEditorForNew()}
                      title="Crear una nota nueva (limpia el editor)"
                    >
                      Nuevo
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-[11px] px-3 py-1.5"
                      onClick={() => fetchMyNotes()}
                      disabled={listLoading}
                      title="Refrescar listado"
                    >
                      {listLoading ? "Actualizando…" : "Refrescar"}
                    </Button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">Buscar</label>
                    <input
                      value={listQuery}
                      onChange={(e) => setListQuery(e.target.value)}
                      placeholder="Ej. Exxon, GTI, Checo…"
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">Status</label>
                    <select
                      value={listStatus}
                      onChange={(e) => setListStatus(e.target.value as any)}
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    >
                      <option value="all">Todos</option>
                      <option value="publicado">Publicado</option>
                      <option value="revision">En revisión</option>
                      <option value="borrador">Borrador</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-gray-500">
                    Tip: cambia filtros y dale a{" "}
                    <span className="text-gray-300 font-semibold">
                      Aplicar filtros
                    </span>
                    .
                  </p>
                  <Button
                    type="button"
                    variant="pink"
                    className="text-xs"
                    onClick={() => fetchMyNotes()}
                    disabled={listLoading}
                  >
                    {listLoading ? "Buscando…" : "Aplicar filtros"}
                  </Button>
                </div>

                {listError && (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                    {listError}
                  </div>
                )}

                <div className="rounded-2xl border border-white/10 bg-black/25 p-3 max-h-[420px] overflow-auto">
                  {listLoading && myNotes.length === 0 ? (
                    <p className="text-[11px] text-gray-400">Cargando…</p>
                  ) : myNotes.length === 0 ? (
                    <p className="text-[11px] text-gray-400">
                      No hay notas para mostrar.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {myNotes.map((it) => {
                        const st = it.status || "borrador";
                        const badge =
                          st === "publicado"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                            : st === "revision"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/30"
                            : "bg-slate-500/10 text-slate-200 border-slate-500/30";

                        const date = it.publishedAt || it.updatedAt;

                        return (
                          <div
                            key={it.id}
                            className="rounded-2xl border border-white/10 bg-black/35 p-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate">
                                  {it.title || "(Sin título)"}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-gray-400">
                                  <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5">
                                    {it.section || "—"}
                                  </span>
                                  <span className="rounded-full border border-white/10 bg-black/30 px-2 py-0.5">
                                    {it.contentType || "—"}
                                  </span>
                                  <span
                                    className={`rounded-full border px-2 py-0.5 ${badge}`}
                                  >
                                    {st === "publicado"
                                      ? "Publicado"
                                      : st === "revision"
                                      ? "Revisión"
                                      : "Borrador"}
                                  </span>
                                  {date && (
                                    <span className="text-gray-500">
                                      {fmtDateShort(date)}
                                    </span>
                                  )}
                                </div>
                                <p className="mt-1 text-[10px] text-gray-500 break-all">
                                  ID: {it.id}
                                </p>
                              </div>

                              <div className="shrink-0 flex flex-col gap-2">
                                <Button
                                  type="button"
                                  variant="cyan"
                                  className="text-[11px] px-3 py-1.5"
                                  onClick={() => loadNoteIntoEditor(it.id)}
                                  disabled={
                                    Boolean(loadingDocId) ||
                                    Boolean(deletingDocId)
                                  }
                                  title="Cargar nota en el editor"
                                >
                                  {loadingDocId === it.id
                                    ? "Cargando…"
                                    : "Editar"}
                                </Button>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="text-[11px] px-3 py-1.5 border-red-400/60 text-red-300 hover:text-red-200 hover:border-red-300"
                                  onClick={() => deleteNote(it.id)}
                                  disabled={
                                    Boolean(loadingDocId) ||
                                    Boolean(deletingDocId)
                                  }
                                  title="Eliminar nota"
                                >
                                  {deletingDocId === it.id
                                    ? "Eliminando…"
                                    : "Eliminar"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <p className="text-[10px] text-gray-500">
                  Nota: el botón “Eliminar” llama a{" "}
                  <code className="mx-1 rounded bg-black/60 px-1">
                    /api/ai/admin/content/delete
                  </code>
                  .
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Medios</h2>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs text-gray-300">
                      Imagen principal
                    </label>

                    <input
                      ref={mainImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        setUploadError(null);
                        setUploadingMainImage(true);
                        try {
                          const uploaded = await uploadImageToSanity(file);
                          setMainImageAsset({
                            assetId: uploaded.assetId,
                            url: uploaded.url,
                          });
                          setMainImage(uploaded.url);
                        } catch (err: any) {
                          setUploadError(
                            err?.message || "No se pudo subir la imagen"
                          );
                        } finally {
                          setUploadingMainImage(false);
                          if (mainImageInputRef.current) {
                            mainImageInputRef.current.value = "";
                          }
                        }
                      }}
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100"
                    />

                    <p className="mt-1 text-[10px] text-gray-500">
                      Esto sube la imagen a Sanity (CDN). Ya no necesitas pegar
                      una URL manual.
                    </p>

                    {mainImageAsset?.url && (
                      <div className="mt-2 rounded-2xl border border-white/10 bg-black/40 p-2">
                        <p className="text-[11px] text-gray-400 mb-2">
                          Subida OK:
                        </p>
                        <img
                          src={mainImageAsset.url}
                          alt="Preview"
                          className="w-full rounded-xl border border-white/10"
                        />
                        <p className="mt-2 text-[10px] text-gray-500 break-all">
                          {mainImageAsset.url}
                        </p>
                      </div>
                    )}

                    {uploadError && (
                      <p className="text-[11px] text-red-300">{uploadError}</p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-2">
                    <p className="text-xs font-semibold text-white">
                      Imágenes para el cuerpo (intercaladas)
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Sube fotos y se insertan en el texto donde tengas el
                      cursor (como en Facebook).
                    </p>

                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleInlineImagesPick(e.target.files)}
                      disabled={uploadingInlineImages}
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100"
                    />

                    {inlineUploadError && (
                      <p className="text-[11px] text-red-300">
                        {inlineUploadError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="content-gallery"
                      className="text-xs text-gray-300"
                    >
                      Galería (una URL por línea o separadas por comas)
                    </label>

                    <div className="flex flex-col gap-2">
                      <input
                        ref={galleryImagesInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleGalleryImagesPick(e.target.files)}
                        disabled={uploadingGalleryImages}
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100"
                      />
                      <p className="text-[10px] text-gray-500">
                        Sube varias y se agregan automáticamente aquí abajo.
                      </p>
                    </div>

                    <textarea
                      id="content-gallery"
                      value={gallery}
                      onChange={(e) => setGallery(e.target.value)}
                      placeholder={`/images/noticia-1.jpg\n/images/noticia-2.jpg\nhttps://cdn.motorwelt.com/fotos/xyz.jpg`}
                      rows={4}
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    />

                    {galleryUploadError && (
                      <p className="text-[11px] text-red-300">
                        {galleryUploadError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="content-video"
                      className="text-xs text-gray-300"
                    >
                      Video (YouTube, Vimeo, etc.)
                    </label>
                    <input
                      id="content-video"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=XXXXXX"
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    />
                    <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-400">
                      <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={useVideoAsHero}
                          onChange={(e) => setUseVideoAsHero(e.target.checked)}
                          className="h-3.5 w-3.5 rounded border border-white/30 bg-black/60 text-[#0CE0B2]"
                        />
                        <span>Usar el video como hero en la nota</span>
                      </label>
                    </div>

                    <p className="mt-2 text-[10px] text-gray-500">
                      Para meter un video dentro del texto usa el botón{" "}
                      <span className="text-gray-300 font-semibold">Video</span>{" "}
                      arriba del editor (se inserta como{" "}
                      <code className="mx-1 rounded bg-black/60 px-1">
                        @[video](url)
                      </code>
                      ).
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="content-reel"
                      className="text-xs text-gray-300"
                    >
                      Reel / short format (Instagram, TikTok, Shorts)
                    </label>
                    <input
                      id="content-reel"
                      value={reelUrl}
                      onChange={(e) => setReelUrl(e.target.value)}
                      placeholder="https://www.instagram.com/reel/... o https://www.tiktok.com/..."
                      className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                    />
                    <p className="mt-1 text-[10px] text-gray-500">
                      Este campo alimentará la sección de reels en Tuning. Por
                      ahora será por link externo.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-white">SEO</h2>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      className="text-[11px] px-3 py-1.5"
                      onClick={handleAiSeoOptimize}
                      disabled={aiLoading === "seo"}
                    >
                      {aiLoading === "seo"
                        ? "Analizando SEO…"
                        : "Optimizar con IA"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="seo-title" className="text-xs text-gray-300">
                      Título SEO (opcional)
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="seo-title"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="Si lo dejas vacío, usaremos el título principal."
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-[11px] px-3 py-1.5 shrink-0"
                        onClick={handleAiSuggestSeoTitleOnly}
                        disabled={aiLoading === "title"}
                      >
                        {aiLoading === "title" ? "IA…" : "Sugerir"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="seo-description"
                      className="text-xs text-gray-300"
                    >
                      Meta descripción
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        id="seo-description"
                        value={seoDescription}
                        onChange={(e) => setSeoDescription(e.target.value)}
                        placeholder="Descripción corta (140–160 caracteres) para buscadores y redes."
                        rows={3}
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        className="text-[11px] px-3 py-1.5 h-fit shrink-0"
                        onClick={handleAiSuggestSeoMetaOnly}
                        disabled={aiLoading === "meta"}
                      >
                        {aiLoading === "meta" ? "IA…" : "Sugerir"}
                      </Button>
                    </div>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Tip: incluye palabras clave (marca, modelo, evento) pero
                      sin sonar forzado.
                    </p>
                  </div>
                </div>

                {aiSeoInsights && (
                  <div className="mt-4 rounded-2xl border border-white/15 bg-black/40 p-3 text-[11px] text-gray-200 space-y-2">
                    <p className="font-semibold text-white text-xs">
                      Insights SEO (IA)
                    </p>
                    {aiSeoInsights.primaryKeyword && (
                      <p>
                        <span className="text-gray-400">
                          Palabra clave principal:{" "}
                        </span>
                        <span className="font-semibold text-[#0CE0B2]">
                          {aiSeoInsights.primaryKeyword}
                        </span>
                      </p>
                    )}
                    {aiSeoInsights.secondaryKeywords &&
                      aiSeoInsights.secondaryKeywords.length > 0 && (
                        <p>
                          <span className="text-gray-400">Secundarias: </span>
                          {aiSeoInsights.secondaryKeywords.join(", ")}
                        </p>
                      )}
                    {typeof aiSeoInsights.score === "number" && (
                      <p>
                        <span className="text-gray-400">
                          Puntuación general:{" "}
                        </span>
                        <span className="font-semibold">
                          {aiSeoInsights.score}/100
                        </span>
                      </p>
                    )}
                    {aiSeoInsights.suggestions &&
                      aiSeoInsights.suggestions.length > 0 && (
                        <ul className="list-disc pl-4 space-y-1 mt-1">
                          {aiSeoInsights.suggestions.map((s, i) => (
                            <li key={i} className="text-gray-300">
                              {s}
                            </li>
                          ))}
                        </ul>
                      )}
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/30 p-5 md:p-6 space-y-4">
                <div className="flex flex-col gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">
                      Copys para redes (IA)
                    </h2>
                    <p className="text-sm text-gray-300">
                      Genera sugerencias de texto para Instagram, TikTok, X y
                      YouTube en función de esta nota.
                    </p>
                  </div>

                  <div className="flex flex-col items-start gap-1 text-[11px] text-gray-400">
                    {socialLoading && (
                      <span className="text-[#0CE0B2]">
                        Generando copys con IA…
                      </span>
                    )}
                    {!socialLoading && socialCopies && (
                      <span>
                        Copys generados para {socialCopies.length} plataforma
                        {socialCopies.length > 1 ? "s" : ""}.
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Parámetros rápidos
                  </p>

                  <div className="grid gap-3 md:grid-cols-4">
                    <div className="space-y-1">
                      <label className="text-xs text-gray-300">Tono</label>
                      <select
                        value={socialTone}
                        onChange={(e) =>
                          setSocialTone(e.target.value as SocialTone)
                        }
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      >
                        <option value="editorial">Neutro editorial</option>
                        <option value="emocional">Emocional</option>
                        <option value="tecnico">Técnico / nerd</option>
                        <option value="cotorro">Cotorro / lifestyle</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300">Longitud</label>
                      <select
                        value={socialLength}
                        onChange={(e) =>
                          setSocialLength(e.target.value as SocialLength)
                        }
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      >
                        <option value="corto">Corto (1–2 líneas)</option>
                        <option value="medio">Medio</option>
                        <option value="largo">Largo</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300">Idioma</label>
                      <select
                        value={socialLanguage}
                        onChange={(e) =>
                          setSocialLanguage(e.target.value as SocialLanguage)
                        }
                        className="w-full rounded-2xl border border-white/20 bg-black/40 px-3 py-2 text-xs text-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0CE0B2]/40"
                      >
                        <option value="es">Español</option>
                        <option value="en">Inglés</option>
                        <option value="bi">Bilingüe (ES/EN)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-gray-300">Extras</label>
                      <div className="flex flex-col gap-1 text-xs text-gray-200">
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={socialIncludeHashtags}
                            onChange={(e) =>
                              setSocialIncludeHashtags(e.target.checked)
                            }
                            className="h-3.5 w-3.5 rounded border border-white/30 bg-black/60 text-[#0CE0B2]"
                          />
                          <span>Incluir hashtags sugeridos</span>
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={socialIncludeCta}
                            onChange={(e) =>
                              setSocialIncludeCta(e.target.checked)
                            }
                            className="h-3.5 w-3.5 rounded border border-white/30 bg-black/60 text-[#0CE0B2]"
                          />
                          <span>Incluir CTA (call to action)</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {socialError && (
                    <div className="mt-2 rounded-2xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200">
                      {socialError}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-[11px] text-gray-500 max-w-md">
                      Tip: entre mejor esté trabajado el título, bajada y los
                      primeros párrafos, más precisos serán los copys.
                    </p>
                    <Button
                      type="button"
                      variant="pink"
                      className="text-xs"
                      onClick={handleGenerateSocialCopy}
                      disabled={socialLoading}
                    >
                      {socialLoading
                        ? "Generando copys…"
                        : "Generar copys con IA"}
                    </Button>
                  </div>
                </div>

                {socialCopies && socialCopies.length > 0 && (
                  <div className="mt-4 space-y-4">
                    <p className="text-xs text-gray-400">
                      Copys sugeridos para RRSS — selecciona y copia los que te
                      sirvan.
                    </p>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {socialCopies.map((pack) => {
                        const hashtagsText =
                          pack.hashtags && pack.hashtags.length > 0
                            ? pack.hashtags.join(" ")
                            : "";
                        const blockToCopy = [
                          pack.copyPrincipal,
                          pack.cta ? `\n\n${pack.cta}` : "",
                          hashtagsText ? `\n\n${hashtagsText}` : "",
                        ]
                          .join("")
                          .trim();

                        return (
                          <div
                            key={pack.platform}
                            className="rounded-2xl border border-white/10 bg-black/35 p-4 flex flex-col gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-semibold text-white">
                                {labelForPlatform(pack.platform)}
                              </p>
                              <Button
                                type="button"
                                variant="ghost"
                                className="text-[10px] px-3 py-1"
                                onClick={() => handleCopyToClipboard(blockToCopy)}
                              >
                                Copiar todo
                              </Button>
                            </div>

                            <div className="rounded-2xl border border-white/10 bg-black/50 p-3">
                              <p className="text-[11px] text-gray-400 mb-1">
                                Copy principal:
                              </p>
                              <p className="text-xs text-gray-100 whitespace-pre-line">
                                {pack.copyPrincipal}
                              </p>
                            </div>

                            {pack.variaciones && pack.variaciones.length > 0 && (
                              <div className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-1">
                                <p className="text-[11px] text-gray-400">
                                  Variaciones:
                                </p>
                                {pack.variaciones.map((v, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start justify-between gap-2"
                                  >
                                    <p className="text-[11px] text-gray-200 flex-1 whitespace-pre-line">
                                      {idx + 1}. {v}
                                    </p>
                                    <button
                                      type="button"
                                      className="text-[10px] text-[#0CE0B2] hover:text-[#7CFFE2] shrink-0"
                                      onClick={() => handleCopyToClipboard(v)}
                                    >
                                      Copiar
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {(pack.hashtags && pack.hashtags.length > 0) ||
                            pack.cta ? (
                              <div className="rounded-2xl border border-white/10 bg-black/40 p-3 space-y-1">
                                {pack.cta && (
                                  <p className="text-[11px] text-gray-200">
                                    <span className="text-gray-400">CTA: </span>
                                    {pack.cta}
                                  </p>
                                )}
                                {pack.hashtags && pack.hashtags.length > 0 && (
                                  <p className="text-[11px] text-gray-200 break-words">
                                    <span className="text-gray-400">
                                      Hashtags:
                                    </span>{" "}
                                    {pack.hashtags.join(" ")}
                                  </p>
                                )}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default AdminContentEditorPage;

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