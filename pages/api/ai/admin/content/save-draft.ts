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
  mainImageAsset?: { assetId: string; url: string } | null;

  galleryUrls?: string[] | string;

  videoUrl?: string;
  reelUrl?: string;
  useVideoAsHero?: boolean;

  slug?: string;
  publishedAt?: string | null;
};

type Data =
  | {
      ok: true;
      id: string;
      created?: boolean;
      slug?: string;
      debug?: {
        buildMarker: string;
        incomingPublishedAt: string | null;
        existingPublishedAt: string | null;
        resolvedPublishedAt: string | null;
        resolvedType: string;
      };
    }
  | { ok: false; error: string };

function normalizeStringArray(input: unknown): string[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input.map(String).map((s) => s.trim()).filter(Boolean);
  }

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
    *[
      _type in ["article", "post"] &&
      slug.current == $slug &&
      _id != $excludeId
    ][0]{ _id }
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

async function getExistingDoc(id: string): Promise<{
  _id: string;
  _type: string;
  slug?: string | null;
  publishedAt?: string | null;
} | null> {
  const q = `
    *[_id == $id][0]{
      _id,
      _type,
      "slug": slug.current,
      publishedAt
    }
  `;
  return await sanityAdminClient.fetch(q, { id });
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

    const payload = (req.body || {}) as Partial<SaveDraftRequest>;

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
      reelUrl,
      useVideoAsHero,
      slug,
      publishedAt,
    } = payload;

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
    const resolvedMainImageUrl = mainImageAsset?.url || mainImageUrl || "";

    const existingDoc = id ? await getExistingDoc(id) : null;
    const resolvedType = existingDoc?._type || "article";

    let finalSlug: string | null = null;

    if (typeof slug === "string" && slug.trim()) {
      finalSlug = await makeUniqueSlug(slug.trim(), id);
    } else if (existingDoc?.slug && existingDoc.slug.trim()) {
      finalSlug = existingDoc.slug.trim();
    } else {
      finalSlug = await makeUniqueSlug(title, id);
    }

    const incomingPublishedAt =
      typeof publishedAt === "string" && publishedAt.trim()
        ? publishedAt.trim()
        : null;

    const existingPublishedAt =
      typeof existingDoc?.publishedAt === "string" && existingDoc.publishedAt.trim()
        ? existingDoc.publishedAt.trim()
        : null;

    const resolvedPublishedAt =
      incomingPublishedAt !== null
        ? incomingPublishedAt
        : existingPublishedAt !== null
        ? existingPublishedAt
        : normalizedStatus === "publicado"
        ? now
        : null;

    const docBase: Record<string, any> = {
      _type: resolvedType,
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
      mainImageUrl: resolvedMainImageUrl,
      galleryUrls: normalizedGallery,
      videoUrl: videoUrl || "",
      reelUrl: reelUrl || "",
      useVideoAsHero: !!useVideoAsHero,
      updatedAt: now,
      ...(resolvedPublishedAt ? { publishedAt: resolvedPublishedAt } : {}),
      ...(mainImageAsset?.assetId
        ? {
            coverImage: {
              _type: "image",
              asset: {
                _type: "reference",
                _ref: mainImageAsset.assetId,
              },
            },
          }
        : {}),
    };

    const buildMarker = "save-draft-debug-v1";

    if (id) {
      const updated = await sanityAdminClient
        .patch(id)
        .set(docBase)
        .commit({ autoGenerateArrayKeys: true });

      return res.status(200).json({
        ok: true,
        id: updated._id,
        created: false,
        slug: finalSlug || undefined,
        debug: {
          buildMarker,
          incomingPublishedAt,
          existingPublishedAt,
          resolvedPublishedAt,
          resolvedType,
        },
      });
    }

    const createdDoc = await sanityAdminClient.create(docBase);

    return res.status(200).json({
      ok: true,
      id: createdDoc._id,
      created: true,
      slug: finalSlug || undefined,
      debug: {
        buildMarker,
        incomingPublishedAt,
        existingPublishedAt,
        resolvedPublishedAt,
        resolvedType,
      },
    });
  } catch (error: any) {
    console.error("SANITY SAVE ERROR:", error?.message || error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Error guardando contenido en Sanity",
    });
  }
}