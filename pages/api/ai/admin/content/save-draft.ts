// pages/api/ai/admin/content/save-draft.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sanityAdminClient, assertWriteToken } from "@/lib/sanityClient";

type ContentStatus = "borrador" | "revision" | "publicado";

type SaveDraftRequest = {
  id?: string;

  title: string;
  subtitle?: string;
  section: string;
  contentType?: string;
  status?: ContentStatus;

  body?: string;

  tags?: string[] | string;

  seoTitle?: string;
  seoDescription?: string;

  authorName?: string;
  authorEmail?: string;

  mainImageUrl?: string;
  // ⚠️ OJO: esto existe en tu UI pero NO en tu schema.
  // Lo dejamos en request para compatibilidad, pero NO lo guardamos como campo.
  mainImageAsset?: { assetId: string; url: string } | null;

  galleryUrls?: string[] | string;

  videoUrl?: string;
  useVideoAsHero?: boolean;

  slug?: string;
};

type Data =
  | { ok: true; id: string; created?: boolean }
  | { ok: false; error: string };

function normalizeStringArray(input: unknown): string[] {
  if (!input) return [];
  if (Array.isArray(input))
    return input.map(String).map((s) => s.trim()).filter(Boolean);
  if (typeof input === "string") {
    return input
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function slugify(input: string): string {
  return (input || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function makeUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const cleanBase = slugify(base);
  const fallback = cleanBase || `nota-${Date.now()}`;

  const existsQuery = `
    *[_type == "article" && slug.current == $slug && _id != $excludeId][0]{ _id }
  `;

  let candidate = fallback;
  let n = 1;

  while (n <= 50) {
    const found = await sanityAdminClient.fetch(existsQuery, {
      slug: candidate,
      excludeId: excludeId || "",
    });

    if (!found?._id) return candidate;

    n += 1;
    candidate = `${fallback}-${n}`;
  }

  return `${fallback}-${Date.now()}`;
}

async function getExistingSlug(id: string): Promise<string | null> {
  const q = `*[_type=="article" && _id==$id][0]{ "slug": slug.current }`;
  const data = await sanityAdminClient.fetch(q, { id });
  return data?.slug ?? null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    assertWriteToken();

    const body = (req.body || {}) as Partial<SaveDraftRequest>;

    const {
      id,
      title,
      subtitle,
      section,
      contentType,
      status,
      body: articleBody,
      tags,
      seoTitle,
      seoDescription,
      authorName,
      authorEmail,
      mainImageUrl,
      mainImageAsset,
      galleryUrls,
      videoUrl,
      useVideoAsHero,
      slug,
    } = body;

    if (!title || !section) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos obligatorios (title, section)",
      });
    }

    const now = new Date().toISOString();
    const normalizedStatus: ContentStatus =
      (status as ContentStatus) || "borrador";

    const normalizedTags = normalizeStringArray(tags);
    const normalizedGallery = normalizeStringArray(galleryUrls);

    // ✅ En tu schema el campo real es mainImageUrl (string).
    // Si la UI manda mainImageAsset, usamos su url pero NO guardamos el objeto.
    const resolvedMainImageUrl = mainImageAsset?.url || mainImageUrl || "";

    let finalSlug: string | null = null;

    if (typeof slug === "string" && slug.trim()) {
      finalSlug = await makeUniqueSlug(slug.trim(), id);
    } else if (id) {
      const existing = await getExistingSlug(id);
      if (existing && existing.trim()) {
        finalSlug = existing.trim();
      } else {
        finalSlug = await makeUniqueSlug(title, id);
      }
    } else {
      finalSlug = await makeUniqueSlug(title);
    }

    const docBase: any = {
      _type: "article",
      title,
      subtitle: subtitle || "",
      excerpt: "",

      section,
      contentType: contentType || "noticia",
      status: normalizedStatus,

      body: articleBody || "",

      tags: normalizedTags,

      seoTitle: seoTitle || "",
      seoDescription: seoDescription || "",

      authorName: authorName || "",
      authorEmail: authorEmail || "",

      slug: { _type: "slug", current: finalSlug },

      // ✅ Campo existente en schema
      mainImageUrl: resolvedMainImageUrl,

      // ✅ Campo existente en schema
      galleryUrls: normalizedGallery,

      videoUrl: videoUrl || "",
      useVideoAsHero: !!useVideoAsHero,

      updatedAt: now,
    };

    const shouldSetPublishedAt = normalizedStatus === "publicado";

    if (id) {
      const patch = sanityAdminClient.patch(id).set({
        ...docBase,
        ...(shouldSetPublishedAt ? { publishedAt: now } : {}),
      });

      const updated = await patch.commit();
      return res.status(200).json({ ok: true, id: updated._id, created: false });
    }

    const createdDoc = await sanityAdminClient.create({
      ...docBase,
      ...(shouldSetPublishedAt ? { publishedAt: now } : {}),
    });

    return res.status(200).json({ ok: true, id: createdDoc._id, created: true });
  } catch (error: any) {
    console.error("SANITY SAVE ERROR:", error?.message || error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Error guardando contenido en Sanity",
    });
  }
}
