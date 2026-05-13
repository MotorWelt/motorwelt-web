import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const fullName = String(req.body?.fullName || req.body?.name || "").trim();
  const email = String(req.body?.email || "").trim();
  const phone = String(req.body?.phone || "").trim();
  const subject = String(req.body?.subject || "").trim();

  if (!fullName || !email || !phone || !subject) {
    return res.status(400).json({ ok: false, error: "Faltan campos obligatorios." });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ ok: false, error: "Falta configurar RESEND_API_KEY." });
  }

  try {
    const { error } = await resend.emails.send({
      from: "MotorWelt <contacto@motorwelt.mx>",
      to: ["contacto@motorwelt.mx"],
      replyTo: email,
      subject: `Contacto MotorWelt: ${subject}`,
      text: `
Nombre completo: ${fullName}
Correo: ${email}
Teléfono: ${phone}
Asunto: ${subject}

Mensaje enviado desde el formulario de contacto de MotorWelt.
      `.trim(),
      html: `
        <h2>Nuevo mensaje desde MotorWelt</h2>
        <p><strong>Nombre completo:</strong> ${fullName}</p>
        <p><strong>Correo:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Asunto:</strong> ${subject}</p>
        <p>Mensaje enviado desde el formulario de contacto de MotorWelt.</p>
      `,
    });

    if (error) {
      return res.status(500).json({ ok: false, error: "No se pudo enviar el correo." });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false, error: "Error interno al enviar el correo." });
  }
}