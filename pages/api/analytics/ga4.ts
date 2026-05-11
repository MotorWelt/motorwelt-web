// pages/api/analytics/ga4.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { google } from "googleapis";

const GA_PROPERTY_ID = "475330743"; // tu ID de GA4

const CLIENT_ID = process.env.GA_CLIENT_ID!;
const CLIENT_SECRET = process.env.GA_CLIENT_SECRET!;
const REDIRECT_URI = "http://localhost:3000/api/analytics/callback";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const oauth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );

    // 👉 aquí después meteremos token (paso siguiente)
    if (!process.env.GA_REFRESH_TOKEN) {
      return res.status(200).json({
        ok: false,
        message: "Falta conectar Google (no refresh token)",
      });
    }

    oauth2Client.setCredentials({
      refresh_token: process.env.GA_REFRESH_TOKEN,
    });

    const analyticsData = google.analyticsdata({
      version: "v1beta",
      auth: oauth2Client,
    });

    const response = await analyticsData.properties.runReport({
      property: `properties/${GA_PROPERTY_ID.replace("G-", "")}`,
      requestBody: {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        metrics: [
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "sessions" },
          { name: "totalUsers" },
        ],
      },
    });

    return res.status(200).json({
      ok: true,
      data: response.data,
    });
  } catch (error: any) {
    return res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
}