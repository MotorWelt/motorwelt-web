// pages/api/ai/tasks-suggest.ts
import type { NextApiRequest, NextApiResponse } from "next";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Task = {
  id: number;
  title: string;
  section: string;
  status: string;
  priority: string;
  owner: string;
  due?: string;
};

type AiTaskSuggestion = {
  suggestedTasks: {
    title: string;
    section: string;
    priority: "alta" | "media" | "baja";
    description: string;
  }[];
  insights: string[];
};

type Body = {
  currentUser?: {
    name?: string;
    role?: string;
  } | null;
  tasks: Task[];
};

/* Helpers para normalizar/filtrar sugerencias */

const PRIORITY_ORDER: Record<"alta" | "media" | "baja", number> = {
  alta: 0,
  media: 1,
  baja: 2,
};

function normalizePriority(p: string | undefined | null): "alta" | "media" | "baja" {
  const v = (p || "").toLowerCase().trim();
  if (v === "alta" || v === "high") return "alta";
  if (v === "media" || v === "medium") return "media";
  if (v === "baja" || v === "low") return "baja";
  return "media";
}

function makeKey(section: string, title: string) {
  return `${section}`.trim().toLowerCase() + "::" + `${title}`.trim().toLowerCase();
}

/**
 * Limpia, normaliza y elimina duplicados:
 * - Contra el listado de tareas actuales.
 * - Entre las propias sugerencias de la IA.
 */
function postProcessSuggestions(
  suggestions: AiTaskSuggestion["suggestedTasks"] | undefined,
  existingTasks: Task[]
): AiTaskSuggestion["suggestedTasks"] {
  if (!Array.isArray(suggestions)) return [];

  const existingKeys = new Set(
    existingTasks
      .filter((t) => t.title && t.section)
      .map((t) => makeKey(t.section, t.title))
  );

  const seenSuggestionKeys = new Set<string>();

  const cleaned: AiTaskSuggestion["suggestedTasks"] = [];

  for (const raw of suggestions) {
    if (!raw || !raw.title || !raw.section) continue;

    const priority = normalizePriority(raw.priority);
    const key = makeKey(raw.section, raw.title);

    // Saltar si ya existe como tarea actual
    if (existingKeys.has(key)) continue;
    // Saltar si ya se sugirió antes
    if (seenSuggestionKeys.has(key)) continue;

    seenSuggestionKeys.add(key);

    cleaned.push({
      title: raw.title.trim(),
      section: raw.section.trim(),
      priority,
      description: (raw.description || "").trim(),
    });
  }

  // Ordenar por prioridad (alta -> media -> baja) y limitar a 8
  return cleaned
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 8);
}

/* ======================================================================= */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res
      .status(500)
      .json({ error: "OPENAI_API_KEY no está configurada en .env.local" });
  }

  let body: Body;

  try {
    body = req.body as Body;
  } catch (err) {
    return res.status(400).json({ error: "JSON inválido en el body" });
  }

  const { currentUser, tasks } = body;

  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
Eres "MotorWelt AI Editor", un asistente que ayuda a organizar y priorizar el trabajo del equipo editorial de MotorWelt.

Recibirás:
- currentUser: { name, role }
- tasks: lista de tareas actuales del equipo (con título, sección, estado, prioridad, owner, due opcional).

Debes devolver SIEMPRE un JSON **válido** con este formato EXACTO (sin texto extra, sin explicaciones):

{
  "suggestedTasks": [
    {
      "title": "string",
      "section": "string",
      "priority": "alta" | "media" | "baja",
      "description": "string"
    }
  ],
  "insights": [
    "string",
    "string"
  ]
}

Instrucciones importantes:

1) ADAPTARTE AL ROL
- Si role = "admin": prioriza tareas de planificación editorial, revisión de calidad, definición de línea editorial, coordinación de equipo, revisión de métricas y ajustes de estrategia.
- Si role = "editor": prioriza edición, pulido de textos, coordinación de coberturas, calendarios de publicación y títulos/SEO.
- Si role = "autor": prioriza generación de ideas de notas, crónicas, entrevistas, reseñas y contenidos que sumen al calendario.

2) EVITAR DUPLICADOS
- Analiza las tareas existentes que ya vienen en "tasks".
- NO propongas tareas que sean básicamente lo mismo que una ya existente (mismo tema, misma sección y objetivo).
- No repitas dos veces la misma sugerencia con títulos casi idénticos.

3) PRIORIDAD
- Usa siempre "alta" | "media" | "baja".
- "alta": cosas que deberían hacerse esta semana o que impactan fuerte en la visibilidad / lanzamientos / portadas.
- "media": importante pero no urgente.
- "baja": ideas a futuro, nice-to-have.

4) SECCIONES PERMITIDAS
Usa sólo estas secciones (elige la que mejor encaje):
- "Noticias Autos"
- "Noticias Motos"
- "Deportes"
- "Lifestyle"
- "Comunidad"

5) DESCRIPCIÓN
- En "description" explica en 1–3 frases:
  - qué implica la tarea
  - por qué es relevante ahora
  - si aplica, qué tipo de contenido sería (nota rápida, crónica, video corto, etc.)

6) CANTIDAD
- Máximo 8 tareas sugeridas.
- Si no hay tareas actuales o la lista es pequeña, propon ideas que ayuden a llenar el calendario editorial de la próxima semana.

Aquí están el usuario y las tareas actuales:

${JSON.stringify({ currentUser, tasks }, null, 2)}
      `.trim(),
      max_output_tokens: 800,
      temperature: 0.6,
    });

    const rawText = response.output_text;

    if (!rawText || typeof rawText !== "string") {
      return res
        .status(500)
        .json({ error: "La IA no devolvió texto interpretable." });
    }

    let parsed: AiTaskSuggestion;

    try {
      parsed = JSON.parse(rawText);
    } catch (err) {
      // Limpieza rápida si el modelo rodea el JSON con texto
      const firstBrace = rawText.indexOf("{");
      const lastBrace = rawText.lastIndexOf("}");
      if (firstBrace === -1 || lastBrace === -1) {
        throw new Error("No se encontró JSON válido en la respuesta de la IA");
      }
      const slice = rawText.slice(firstBrace, lastBrace + 1);
      parsed = JSON.parse(slice);
    }

    // Post-proceso: limpiar y deduplicar sugerencias
    const cleanedSuggestions = postProcessSuggestions(
      parsed?.suggestedTasks,
      tasks || []
    );

    let finalPayload: AiTaskSuggestion = {
      suggestedTasks: cleanedSuggestions,
      insights: Array.isArray(parsed?.insights) ? parsed.insights : [],
    };

    // Fallback si algo vino vacío o raro
    if (finalPayload.suggestedTasks.length === 0) {
      finalPayload = {
        suggestedTasks: [
          {
            title: "Revisión SEO y titulares de las últimas notas publicadas",
            section: "Noticias Autos",
            priority: "alta",
            description:
              "Revisar títulos, subtítulos y meta descripciones de las notas recientes para mejorar CTR y posicionamiento orgánico.",
          },
          {
            title: "Plan editorial de la próxima semana",
            section: "Comunidad",
            priority: "media",
            description:
              "Definir al menos 5 temas clave para la próxima semana, repartidos entre Autos, Motos, Lifestyle y Comunidad.",
          },
        ],
        insights: [
          "Cuando no hay muchas tareas definidas, es buen momento para fortalecer SEO y planificar el calendario editorial.",
        ],
      };
    }

    return res.status(200).json(finalPayload);
  } catch (error: any) {
    console.error("Error en /api/ai/tasks-suggest:", error);
    return res.status(500).json({
      error: "Error al generar sugerencias con IA",
      detail: error?.message ?? "Unknown error",
    });
  }
}
