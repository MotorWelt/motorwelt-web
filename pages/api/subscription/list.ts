// pages/api/subscription/list.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sanityReadClient } from "../../../lib/sanityClient";

type ApiResponse =
  | { ok: true; subscribers: any[] }
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

function isAllowed(req: NextApiRequest) {
  const cookieRole = readCookie(req, "mw_role").toLowerCase();
  const headerRole = String(req.headers["x-mw-admin-role"] || "").toLowerCase();
  const role = cookieRole || headerRole;
  return role === "admin" || role === "editor";
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Método no permitido." });
  }

  if (!isAllowed(req)) {
    return res.status(401).json({ ok: false, error: "Acceso restringido." });
  }

  try {
    const query = /* groq */ `
      *[_type == "subscriptionUser"] | order(_createdAt desc)[0...2000]{
        "id": _id,
        "name": coalesce(name, firstName, ""),
        "lastName": coalesce(lastName, surname, ""),
        "email": coalesce(email, ""),
        "age": coalesce(string(age), ""),
        "gender": coalesce(gender, sex, ""),
        "country": coalesce(country, ""),
        "state": coalesce(state, region, city, ""),
        "city": coalesce(city, state, region, ""),
        "interests": coalesce(interests, []),
        "status": coalesce(status, subscriptionStatus, "active"),
        "unsubscribeComment": coalesce(unsubscribeComment, cancellationComment, exitComment, ""),
        "pageViews": coalesce(pageViews, visits, 0),
        "lastVisitedAt": coalesce(lastVisitedAt, lastSeenAt, null),
        "createdAt": _createdAt,
        "updatedAt": _updatedAt
      }
    `;

    const subscribers = await sanityReadClient.fetch(query);

    return res.status(200).json({
      ok: true,
      subscribers: Array.isArray(subscribers) ? subscribers : [],
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error?.message || "No se pudo leer la base de suscriptores.",
    });
  }
}
