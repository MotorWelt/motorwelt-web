// pages/api/analytics/callback.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

const CLIENT_ID = process.env.GA_CLIENT_ID!;
const CLIENT_SECRET = process.env.GA_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:3000/api/analytics/callback";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const code = String(req.query.code || "");

    if (!code) {
      return res.status(400).send("Falta code de Google.");
    }

    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI,
    );

    const { tokens } = await oauth2Client.getToken(code);

    return res.status(200).send(`
      <h1>MotorWelt GA4 conectado</h1>
      <p>Copia este refresh token y guárdalo en tu .env.local:</p>
      <pre style="white-space: pre-wrap; word-break: break-all;">${tokens.refresh_token || "NO_REFRESH_TOKEN"}</pre>
    `);
  } catch (error: any) {
    return res.status(500).send(error?.message || "Error conectando GA4.");
  }
}