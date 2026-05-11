// pages/api/subscription/delete.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sanityWriteClient } from "../../../lib/sanityClient";

type ApiResponse =
  | { ok: true; deletedIds: string[] }
  | { ok: false; error: string };

function readCookie(req: NextApiRequest, name: string) {
  const cookie = req.headers.cookie || "";
  const match = cookie.match(
    new RegExp(
      `(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`,
    ),
  );
  return match ? decodeURIComponent(match[1]) : "";
}

function isAdmin(req: NextApiRequest) {
  const cookieRole = readCookie(req, "mw_role").toLowerCase();
  const headerRole = String(req.headers["x-mw-admin-role"] || "").toLowerCase();
  const role = cookieRole || headerRole;
  return role === "admin";
}

function sanitizeIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return Array.from(
    new Set(
      value
        .map((id) => String(id || "").trim())
        .filter((id) => id && /^[a-zA-Z0-9_.-]+$/.test(id)),
    ),
  ).slice(0, 100);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Método no permitido." });
  }

  if (!isAdmin(req)) {
    return res.status(401).json({
      ok: false,
      error: "Acceso restringido. Solo admin puede eliminar registros.",
    });
  }

  const ids = sanitizeIds(req.body?.ids);

  if (ids.length === 0) {
    return res.status(400).json({
      ok: false,
      error: "Selecciona al menos un registro válido para eliminar.",
    });
  }

  try {
    const existing = await sanityWriteClient.fetch(
      `*[_type == "subscriptionUser" && _id in $ids]._id`,
      { ids },
    );

    const validIds = Array.isArray(existing) ? existing.map(String) : [];

    if (validIds.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "No se encontraron registros para eliminar.",
      });
    }

    let transaction = sanityWriteClient.transaction();
    for (const id of validIds) transaction = transaction.delete(id);

    await transaction.commit();

    return res.status(200).json({ ok: true, deletedIds: validIds });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "No se pudieron eliminar los usuarios fantasma.",
    });
  }
}
