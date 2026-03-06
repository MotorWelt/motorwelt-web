// pages/api/ai/seo-insights.ts
import type { NextApiRequest, NextApiResponse } from "next";

type SeoInsightsRequest = {
  title?: string;
  subtitle?: string;
  body: string;
  section?: string;
  contentType?: string;
  tags?: string;
};

type SeoInsightsResponse = {
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SeoInsightsResponse | { error: string }>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Falta OPENAI_API_KEY en variables de entorno" });
  }

  const { title, subtitle, body, section, contentType, tags } =
    req.body as SeoInsightsRequest;

  if (!body || typeof body !== "string") {
    return res.status(400).json({ error: "Falta el campo 'body' en la petición" });
  }

  const systemPrompt = `
Eres un especialista en SEO para una revista de autos y motos llamada MotorWelt.
Debes generar:

1) Un TÍTULO SEO (máx. 60 caracteres), atractivo, claro y con la keyword principal.
2) Una META DESCRIPCIÓN (140–160 caracteres) en español, con gancho y natural.
3) Un listado de 5–10 PALABRAS CLAVE (keywords) separadas.

Reglas:
- No exagerar con mayúsculas ni clickbait barato.
- No inventar información que no esté en el texto.
- Mantener enfoque en motor / lifestyle / deportes según el contexto.

Devuelve la respuesta en JSON con esta forma EXACTA:
{
  "seoTitle": "...",
  "seoDescription": "...",
  "keywords": ["...", "..."]
}
`.trim();

  try {
    const completion = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `
Título original: ${title || "Sin título"}
Bajada/subtítulo: ${subtitle || "Sin bajada"}
Sección: ${section || "sin sección"}
Tipo de pieza: ${contentType || "sin tipo"}
Tags actuales: ${tags || "sin tags"}

TEXTO DEL ARTÍCULO:
${body}
                `.trim(),
              },
            ],
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!completion.ok) {
      const errText = await completion.text();
      console.error("Error OpenAI SEO:", errText);
      return res.status(500).json({ error: "Error al llamar a OpenAI" });
    }

    const data = await completion.json();
    const raw = data?.choices?.[0]?.message?.content?.toString() || "{}";

    let parsed: SeoInsightsResponse;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // fallback: intentar extraer de forma básica
      parsed = {
        seoTitle: "Propuesta SEO MotorWelt",
        seoDescription:
          "Resumen optimizado generado automáticamente para esta nota de MotorWelt.",
        keywords: [],
      };
    }

    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Error /api/ai/seo-insights:", error);
    return res.status(500).json({ error: "Error interno en el servidor" });
  }
}
