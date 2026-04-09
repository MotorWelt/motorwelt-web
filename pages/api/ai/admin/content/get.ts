// pages/api/ai/admin/content/get.ts
import type { NextApiRequest, NextApiResponse } from "next";

/**
 * ✅ Usa el mismo sanity client de tu proyecto
 */
import { sanityReadClient } from "@/lib/sanityClient";

type GetBody = { id?: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const isPost = req.method === "POST";
  const isGet = req.method === "GET";

  if (!isPost && !isGet) {
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const id = isPost
      ? String(((req.body || {}) as GetBody).id || "").trim()
      : String(req.query.id || "").trim();

    if (!id) {
      return res.status(400).json({ ok: false, error: "Falta id" });
    }

    const query = /* groq */ `
      *[_id == $id][0]{
        "id": _id,

        title,
        subtitle,
        excerpt,

        section,
        contentType,
        status,

        body,

        tags,

        videoUrl,
        reelUrl,
        useVideoAsHero,

        seoTitle,
        seoDescription,

        authorName,
        authorEmail,

        updatedAt,
        publishedAt,

        mainImageUrl,
        galleryUrls,

        "slug": slug.current,

        coverImageAssetId,

        // ✅ Soporta el caso donde tengas un campo tipo image: coverImage
        "coverImageAssetUrl": coverImage.asset->url
      }
    `;

    const doc = await sanityReadClient.fetch(query, { id });

    if (!doc) {
      return res.status(404).json({ ok: false, error: "No encontrado" });
    }

    return res.status(200).json({ ok: true, doc });
  } catch (err: any) {
    console.error("get error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Error cargando contenido",
    });
  }
}