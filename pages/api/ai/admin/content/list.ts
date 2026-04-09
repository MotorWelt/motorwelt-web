// pages/api/ai/admin/content/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sanityReadClient } from "@/lib/sanityClient";

type ContentStatus = "borrador" | "revision" | "publicado";

type ListBody = {
  authorEmail?: string;
  status?: ContentStatus;
  q?: string;
  limit?: number;
};

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
    const payload: ListBody = isPost
      ? req.body || {}
      : {
          authorEmail:
            typeof req.query.authorEmail === "string"
              ? req.query.authorEmail
              : undefined,
          status:
            typeof req.query.status === "string"
              ? (req.query.status as ContentStatus)
              : undefined,
          q: typeof req.query.q === "string" ? req.query.q : undefined,
          limit:
            typeof req.query.limit === "string" ||
            typeof req.query.limit === "number"
              ? Number(req.query.limit)
              : undefined,
        };

    const authorEmail = (payload.authorEmail || "").trim() || undefined;
    const status = payload.status;
    const q = (payload.q || "").trim() || undefined;
    const limit = Math.min(Math.max(Number(payload.limit || 30), 1), 50);

    const filters: string[] = [
      `_type in ["article", "post"]`,
      `defined(title)`,
      `defined(slug.current)`,
    ];

    const params: Record<string, any> = { limit };

    if (authorEmail) {
      filters.push(`authorEmail == $authorEmail`);
      params.authorEmail = authorEmail;
    }

    if (status) {
      filters.push(`coalesce(status, "publicado") == $status`);
      params.status = status;
    }

    if (q) {
      filters.push(`(title match $q || subtitle match $q || excerpt match $q)`);
      params.q = `*${q}*`;
    }

    const filterStr = filters.join(" && ");

    const query = /* groq */ `
      *[${filterStr}]
      | order(coalesce(publishedAt, updatedAt, _createdAt) desc)
      [0...$limit]{
        "id": _id,
        title,
        "slug": slug.current,
        "section": coalesce(
          section,
          select(
            lower(category) == "autos" => "noticias_autos",
            lower(category) == "motos" => "noticias_motos",
            lower(category) == "tuning" => "tuning",
            "autos" in categories[] => "noticias_autos",
            "motos" in categories[] => "noticias_motos",
            "tuning" in categories[] => "tuning",
            "builds" in categories[] => "tuning",
            "mods" in categories[] => "tuning",
            ""
          )
        ),
        "contentType": coalesce(contentType, "noticia"),
        "status": coalesce(status, "publicado"),
        updatedAt,
        publishedAt,
        authorName,
        authorEmail
      }
    `;

    const items = await sanityReadClient.fetch(query, params);

    return res.status(200).json({ ok: true, items });
  } catch (err: any) {
    console.error("list error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Error listando contenido",
    });
  }
}