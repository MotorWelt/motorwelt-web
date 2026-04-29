import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const name = String(req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const subject = String(req.body?.subject || "").trim();
  const to = "gabriel@motorwelt.mx";

  if (!name || !email || !subject) {
    return res.status(400).json({ ok: false, error: "Faltan campos obligatorios." });
  }

  const body = encodeURIComponent(
    `Nombre: ${name}\nCorreo: ${email}\nAsunto: ${subject}\n\nMensaje enviado desde el formulario de contacto de MotorWelt.`
  );

  const mailto = `mailto:${to}?subject=${encodeURIComponent(`Contacto MotorWelt: ${subject}`)}&body=${body}`;

  res.writeHead(302, { Location: mailto });
  return res.end();
}
