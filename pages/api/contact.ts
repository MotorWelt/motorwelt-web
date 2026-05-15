import type { NextApiRequest, NextApiResponse } from "next";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const {
      fullName,
      email,
      phone,
      subject,
    } = req.body || {};

    if (!fullName || !email || !phone || !subject) {
      return res.status(400).json({
        ok: false,
        error: "Faltan campos.",
      });
    }

    await resend.emails.send({
      from: "MotorWelt <contacto@motorwelt.mx>",
      to: process.env.CONTACT_EMAIL || "contacto@motorwelt.mx",
      replyTo: email,
      subject: `Nuevo contacto MotorWelt — ${subject}`,
      html: `
        <div style="font-family:Arial,sans-serif;padding:24px;">
          <h2>Nuevo mensaje desde MotorWelt</h2>

          <p><strong>Nombre:</strong> ${fullName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Teléfono:</strong> ${phone}</p>
          <p><strong>Asunto:</strong> ${subject}</p>
        </div>
      `,
    });

    return res.status(200).json({
      ok: true,
    });
  } catch (error: any) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: "No se pudo enviar el correo.",
    });
  }
}