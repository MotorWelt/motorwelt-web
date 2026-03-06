// pages/api/ai/social-copy.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ---------- Tipos internos ---------- */

type SocialTone = "editorial" | "emocional" | "tecnico" | "cotorro";
type SocialLength = "corto" | "medio" | "largo";
type SocialLanguage = "es" | "en" | "bi";

type SocialPlatformId =
  | "instagram_feed"
  | "instagram_stories"
  | "tiktok_reels"
  | "youtube"
  | "twitter_x";

type SocialCopyPack = {
  platform: SocialPlatformId;
  copyPrincipal: string;
  variaciones?: string[];
  hashtags?: string[];
  cta?: string;
};

type AiSocialCopyOptions = {
  tone?: SocialTone;
  length?: SocialLength;
  language?: SocialLanguage;
  includeHashtags?: boolean;
  includeCta?: boolean;
};

type Body = {
  title?: string;
  subtitle?: string;
  body?: string;
  section?: string;
  contentType?: string;
  tags?: string;
  seoTitle?: string;
  seoDescription?: string;
  options?: AiSocialCopyOptions;
};

type AiSocialCopyResponse = {
  platforms: SocialCopyPack[];
};

/* ====================================================================== */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Sólo permitimos POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Validar API key
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "OPENAI_API_KEY no está configurada en .env.local",
    });
  }

  let body: Body;

  try {
    body = req.body as Body;
  } catch (err) {
    return res.status(400).json({ error: "JSON inválido en el body" });
  }

  const {
    title = "",
    subtitle = "",
    body: articleBody = "",
    section = "",
    contentType = "",
    tags = "",
    seoTitle = "",
    seoDescription = "",
    options,
  } = body;

  const tone: SocialTone = options?.tone ?? "editorial";
  const length: SocialLength = options?.length ?? "medio";
  const language: SocialLanguage = options?.language ?? "es";
  const includeHashtags = options?.includeHashtags ?? true;
  const includeCta = options?.includeCta ?? true;

  // Si de plano viene todo vacío, regresamos error amable
  if (!title.trim() && !articleBody.trim() && !subtitle.trim()) {
    return res.status(400).json({
      error:
        "Se requiere al menos título, bajada o cuerpo para generar copys.",
    });
  }

  try {
    const systemPrompt = `
Eres "MotorWelt Social AI", un asistente especializado en redactar copys para redes sociales
(Instagram, TikTok, X y YouTube) para un medio automotriz llamado MotorWelt.

TU ÚNICA SALIDA debe ser SIEMPRE un JSON 100% VÁLIDO con este formato EXACTO:

{
  "platforms": [
    {
      "platform": "instagram_feed" | "instagram_stories" | "tiktok_reels" | "youtube" | "twitter_x",
      "copyPrincipal": "string",
      "variaciones": ["string", "string"],
      "hashtags": ["string", "string"],
      "cta": "string"
    }
  ]
}

Reglas IMPORTANTES:
- NO incluyas texto fuera del JSON (nada de explicaciones, comentarios ni backticks).
- Genera de 3 a 5 plataformas máximo.
- "copyPrincipal" debe estar listo para pegar tal cual en la red social.
- "variaciones" son textos alternativos para la misma plataforma (máximo 3 por plataforma).
- "hashtags" es una lista de hashtags SIN el símbolo "#" repetido; cada elemento ya debe incluir "#" al inicio (ej: "#BMW", "#MotorWelt").
- "cta" es una frase corta de llamado a la acción (ej: "Lee la nota completa en motorwelt.com.mx").
- Respeta el TIPO de contenido (noticia, crónica, review, entrevista, etc.) y la SECCIÓN (noticias_autos, noticias_motos, deportes, lifestyle, comunidad).

Tono (tone):
- "editorial": profesional, neutro, estilo medio automotriz.
- "emocional": más sensorial y emotivo, sin caer en cursi.
- "tecnico": más enfocado en datos, specs y nerd details.
- "cotorro": relajado, cercano, tono de comunidad / lifestyle.

Longitud (length):
- "corto": 1–2 líneas (ideal para stories, tweets rápidos).
- "medio": 2–4 líneas.
- "largo": texto más desarrollado tipo caption de Instagram (pero sin novela infinita).

Idioma (language):
- "es": copys en español.
- "en": copys en inglés.
- "bi": mezcla ES/EN en el mismo copy (ej: primera línea en español, segunda en inglés).

Hashtags:
- Si "includeHashtags" es true, genera 5–10 hashtags relevantes por plataforma.
- Si es false, devuelve "hashtags": [].

CTA:
- Si "includeCta" es true, genera un "cta" acorde a la plataforma.
- Si es false, usa "cta": "" (string vacío).

Contexto editorial:
- MotorWelt es joven, entusiasta, amante del performance, trackdays, motos y autos.
- Evita sonidos demasiado "boomer" o frases muy genéricas tipo "no te lo puedes perder".
- Puedes mencionar MotorWelt de forma natural, pero no en todos los copys si no hace falta.

Recuerda: SOLO devuelves el JSON final, sin comentarios ni explicaciones.
`.trim();

    const userContext = {
      title,
      subtitle,
      section,
      contentType,
      tags,
      seoTitle,
      seoDescription,
      body: articleBody,
      options: {
        tone,
        length,
        language,
        includeHashtags,
        includeCta,
      },
    };

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: systemPrompt,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify(userContext, null, 2),
            },
          ],
        },
      ],
      max_output_tokens: 900,
      temperature: 0.7,
    });

    // Leer la respuesta del nuevo Responses API
    const firstItem = response.output[0];
    const firstContent = firstItem.content[0];

    const rawText =
      firstContent.type === "output_text" ? firstContent.text : "";

    if (!rawText) {
      return res.status(500).json({
        error: "La IA no devolvió texto interpretable.",
      });
    }

    let parsed: AiSocialCopyResponse;

    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      // Intento de limpieza por si el modelo metió algo alrededor del JSON
      const firstBrace = rawText.indexOf("{");
      const lastBrace = rawText.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No se encontró JSON en la respuesta de la IA");
      }
      const jsonSlice = rawText.slice(firstBrace, lastBrace + 1);
      parsed = JSON.parse(jsonSlice);
    }

    // Normalizar un poco por si faltan campos
    if (!parsed.platforms || !Array.isArray(parsed.platforms)) {
      return res.status(500).json({
        error: "La IA no devolvió el formato esperado (platforms[]).",
      });
    }

    const sanitizedPlatforms: SocialCopyPack[] = parsed.platforms.map((p) => ({
      platform: p.platform,
      copyPrincipal: p.copyPrincipal ?? "",
      variaciones: Array.isArray(p.variaciones) ? p.variaciones : [],
      hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
      cta: typeof p.cta === "string" ? p.cta : "",
    }));

    const finalResponse: AiSocialCopyResponse = {
      platforms: sanitizedPlatforms,
    };

    return res.status(200).json(finalResponse);
  } catch (error: any) {
    console.error("Error en /api/ai/social-copy:", error);
    return res.status(500).json({
      error: "Error al generar copys para redes con IA",
      detail: error?.message ?? "Unknown error",
    });
  }
}
