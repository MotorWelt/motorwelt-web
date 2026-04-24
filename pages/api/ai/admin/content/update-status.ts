import type { NextApiRequest, NextApiResponse } from "next";
import { sanityAdminClient, assertWriteToken } from "@/lib/sanityClient";

type ContentStatus = "borrador" | "revision" | "publicado";

type Data =
  | {
      ok: true;
      id: string;
      status: ContentStatus;
      publishedAt?: string | null;
      updatedAt: string;
      slug?: string;
    }
  | { ok: false; error: string };

function isValidStatus(v: any): v is ContentStatus {
  return v === "borrador" || v === "revision" || v === "publicado";
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

async function makeUniqueSlug(base: string, excludeId: string): Promise<string> {
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
      excludeId,
    });

    if (!found?._id) return candidate;

    n += 1;
    candidate = `${fallback}-${n}`;
  }

  return `${fallback}-${Date.now()}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST" && req.method !== "PATCH") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    assertWriteToken();

    const { id, status } = req.body || {};

    if (!id || typeof id !== "string") {
      return res.status(400).json({ ok: false, error: "Falta 'id' (string)" });
    }

    if (!isValidStatus(status)) {
      return res.status(400).json({
        ok: false,
        error: "Status inválido. Usa: borrador | revision | publicado",
      });
    }

    const now = new Date().toISOString();

    const doc = await sanityAdminClient.fetch(
      `*[_id == $id][0]{
        _id,
        _type,
        title,
        "slug": slug.current,
        publishedAt
      }`,
      { id }
    );

    if (!doc?._id) {
      return res.status(404).json({
        ok: false,
        error: "No se encontró el documento a actualizar.",
      });
    }

    const title: string = doc?.title || "";
    const currentSlug: string = doc?.slug || "";
    const currentPublishedAt: string | null = doc?.publishedAt || null;

    let slugPatch: Record<string, any> = {};
    let finalSlug = currentSlug;

    if (!currentSlug) {
      finalSlug = await makeUniqueSlug(title || `nota-${id}`, id);
      slugPatch = {
        slug: { _type: "slug", current: finalSlug },
      };
    }

    const setObj: Record<string, any> = {
      status,
      updatedAt: now,
      ...slugPatch,
    };

    // 🔥 FIX REAL: solo asignar publishedAt si NO existe
    if (status === "publicado" && !currentPublishedAt) {
      setObj.publishedAt = now;
    }

    const patched = await sanityAdminClient
      .patch(id)
      .set(setObj)
      .commit({ autoGenerateArrayKeys: true });

    return res.status(200).json({
      ok: true,
      id: patched._id,
      status: patched.status as ContentStatus,
      publishedAt: (patched.publishedAt as string | null) ?? null,
      updatedAt: patched.updatedAt as string,
      slug: patched?.slug?.current || finalSlug || undefined,
    });
  } catch (error: any) {
    console.error("SANITY UPDATE STATUS ERROR:", error?.message || error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "Error actualizando status en Sanity",
    });
  }
}