// pages/api/ai/correct-article.ts
import type { NextApiRequest, NextApiResponse } from "next";

type CorrectArticleRequest = {
  title?: string;
  section?: string;
  contentType?: string;
  body: string;
};

type CorrectArticleResponse = {
  correctedBody: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CorrectArticleResponse | { error: string; detail?: any }>
) {
  // Solo POST (si lo abres en el navegador será GET y devolverá 405)
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método no permitido" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res
      .status(500)
      .json({ error: "Falta OPENAI_API_KEY en variables de entorno" });
  }

  const { title, section, contentType, body } = (req.body || {}) as Partial<CorrectArticleRequest>;

  if (!body || typeof body !== "string") {
    return res.status(400).json({ error: "Falta el campo 'body' en la petición" });
  }

  const safeTitle = (title || "Sin título").toString().trim();
  const safeSection = (section || "sin_seccion").toString().trim();
  const safeType = (contentType || "noticia").toString().trim();

  const systemPrompt = `
Eres un editor profesional de una revista de motor llamada MotorWelt.

Tarea:
- Corregir ortografía, gramática y puntuación en ESPAÑOL.
- Mantener el tono y estilo original lo más posible.
- Mejorar levemente la fluidez solo si es necesario.
- NO agregar información nueva ni inventar datos.
- NO cambiar nombres propios, modelos de autos/motos ni cifras.

Devuelve SOLO el texto corregido, sin explicaciones.
`.trim();

  const userPrompt = `Título: ${safeTitle}
Sección: ${safeSection}
Tipo: ${safeType}

TEXTO:
${body}`.trim();

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
          // ✅ En chat/completions, content debe ser STRING (no array)
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!completion.ok) {
      const errText = await completion.text();
      console.error("Error OpenAI:", errText);
      return res.status(500).json({
        error: "Error al llamar a OpenAI",
        detail: errText,
      });
    }

    const data = await completion.json();

    const corrected =
      (data?.choices?.[0]?.message?.content ?? "").toString().trim() || body;

    return res.status(200).json({ correctedBody: corrected });
  } catch (error: any) {
    console.error("Error /api/ai/correct-article:", error?.message || error);
    return res.status(500).json({ error: "Error interno en el servidor" });
  }
}
