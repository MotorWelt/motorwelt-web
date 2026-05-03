import type { NextApiRequest, NextApiResponse } from "next";
import { sanityWriteClient } from "../../../lib/sanityClient";

type RegisterBody = {
  name?: string;
  lastName?: string;
  email?: string;
  age?: number | string;
  sex?: string;
  country?: string;
  city?: string;
  interests?: string[];
};

const VALID_INTERESTS = new Set([
  "autos",
  "motos",
  "tuning",
  "deportes",
  "lifestyle",
  "comunidad",
]);

const VALID_SEX = new Set([
  "mujer",
  "hombre",
  "otro",
]);

function cleanString(value: unknown) {
  return String(value || "").trim();
}

function cleanArray(value: unknown, allowed: Set<string>) {
  if (!Array.isArray(value)) return [];
  return Array.from(
    new Set(
      value
        .map((item) => cleanString(item).toLowerCase())
        .filter((item) => allowed.has(item)),
    ),
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function cleanAge(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  const age = Math.round(n);
  if (age < 13 || age > 100) return null;
  return age;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = req.body as RegisterBody;
    const name = cleanString(body.name);
    const lastName = cleanString(body.lastName);
    const email = cleanString(body.email).toLowerCase();
    const age = cleanAge(body.age);
    const sex = cleanString(body.sex).toLowerCase() || "otro";
    const country = cleanString(body.country);
    const city = cleanString(body.city);
    const interests = cleanArray(body.interests, VALID_INTERESTS);

    if (!name) {
      return res.status(400).json({ ok: false, error: "Nombre requerido." });
    }

    if (!lastName) {
      return res.status(400).json({ ok: false, error: "Apellido requerido." });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ ok: false, error: "Correo inválido." });
    }

    if (!age) {
      return res.status(400).json({ ok: false, error: "Edad inválida." });
    }

    if (!VALID_SEX.has(sex)) {
      return res.status(400).json({ ok: false, error: "Sexo inválido." });
    }

    if (!country) {
      return res.status(400).json({ ok: false, error: "País requerido." });
    }

    if (!city) {
      return res.status(400).json({ ok: false, error: "Ciudad requerida." });
    }

    const existing = await sanityWriteClient.fetch(
      `*[_type == "subscriptionUser" && email == $email][0]{_id}`,
      { email },
    );

    const now = new Date().toISOString();
    const doc = {
      _type: "subscriptionUser",
      name,
      lastName,
      email,
      age,
      sex,
      country,
      city,
      interests,
      source: "perfil",
      updatedAt: now,
    };

    const saved = existing?._id
      ? await sanityWriteClient
          .patch(existing._id)
          .set(doc)
          .setIfMissing({ createdAt: now })
          .unset(["emailTypes"])
          .commit()
      : await sanityWriteClient.create({ ...doc, createdAt: now });

    return res.status(200).json({ ok: true, id: saved._id });
  } catch (error: any) {
    console.error("subscription register error", error);
    return res.status(500).json({
      ok: false,
      error: error?.message || "No se pudo guardar el registro.",
    });
  }
}
