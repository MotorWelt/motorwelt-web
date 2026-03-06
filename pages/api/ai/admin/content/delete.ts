// pages/api/ai/admin/content/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";

// ✅ Usa el MISMO client de escritura que en save-draft/update-status
import { sanityAdminClient, assertWriteToken } from "@/lib/sanityClient";

type DeleteBody = { id?: string };

type Data =
  | { ok: true; id: string }
  | { ok: false; error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST" && req.method !== "DELETE") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    // ✅ aseguramos token para operaciones de escritura
    assertWriteToken();

    const body = (req.body || {}) as DeleteBody;
    const id = (body.id || "").trim();

    if (!id) {
      return res.status(400).json({ ok: false, error: "Falta id" });
    }

    // ✅ Borra el documento por _id
    await sanityAdminClient.delete(id);

    return res.status(200).json({ ok: true, id });
  } catch (err: any) {
    console.error("delete error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Error eliminando contenido",
    });
  }
}
