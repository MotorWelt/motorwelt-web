import type { NextApiRequest, NextApiResponse } from "next";
import { sanityReadClient } from "@/lib/sanityClient";

type LoginResponse =
  | {
      ok: true;
      user: {
        name: string;
        email: string;
        role: "admin" | "editor" | "autor";
      };
    }
  | {
      ok: false;
      error: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LoginResponse>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const rawEmail = String(req.body?.email || "").trim().toLowerCase();
    const rawPassword = String(req.body?.password || "").trim();

    if (!rawEmail || !rawPassword) {
      return res
        .status(400)
        .json({ ok: false, error: "Faltan credenciales." });
    }

    const query = /* groq */ `
      *[
        _type == "adminUser" &&
        lower(email) == $email
      ][0]{
        name,
        email,
        password,
        role,
        active
      }
    `;

    const user = await sanityReadClient.fetch(query, { email: rawEmail });

    if (!user) {
      return res
        .status(401)
        .json({ ok: false, error: "Usuario no encontrado." });
    }

    if (!user.active) {
      return res
        .status(403)
        .json({ ok: false, error: "Usuario inactivo." });
    }

    if (String(user.password || "") !== rawPassword) {
      return res
        .status(401)
        .json({ ok: false, error: "Contraseña incorrecta." });
    }

    return res.status(200).json({
      ok: true,
      user: {
        name: String(user.name || ""),
        email: String(user.email || ""),
        role: (user.role || "autor") as "admin" | "editor" | "autor",
      },
    });
  } catch (err: any) {
    console.error("ADMIN LOGIN ERROR:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Error interno del servidor.",
    });
  }
}