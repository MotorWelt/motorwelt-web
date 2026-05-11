// pages/api/analytics/auth.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

const CLIENT_ID = process.env.GA_CLIENT_ID!;
const CLIENT_SECRET = process.env.GA_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:3000/api/analytics/callback";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const oauth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI,
  );

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/analytics.readonly"],
  });

  res.redirect(url);
}