import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@sanity/client";

const sanity = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
});

type PartnerLogo = {
  id: string;
  name: string;
  logoUrl?: string;
  href?: string;
};

type AdConfig = {
  enabled: boolean;
  label: string;
  imageUrl: string;
  href: string;
};

type HomeSettingsPayload = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    mpu: AdConfig;
    billboard: AdConfig;
  };
  partnerLogos: PartnerLogo[];
};

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(`${name}=`));
  if (!found) return "";
  return decodeURIComponent(found.split("=").slice(1).join("="));
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const cookieRole = getCookieValue(req.headers.cookie, "mw_role");
    const headerRole = String(req.headers["x-mw-role"] || "");
    const bodyRole = String(req.body?.session?.role || "");

    const role = cookieRole || headerRole || bodyRole;

    console.log("HOME SAVE AUTH DEBUG:", {
      cookieRole,
      headerRole,
      bodyRole,
      finalRole: role,
    });

    if (!["admin", "editor"].includes(role)) {
      return res.status(403).json({
        ok: false,
        error: "Unauthorized - Session not found",
        debug: {
          cookieRole,
          headerRole,
          bodyRole,
          finalRole: role,
        },
      });
    }

    const settings = req.body?.settings as HomeSettingsPayload | undefined;

    if (!settings) {
      return res.status(400).json({
        ok: false,
        error: "Missing settings",
      });
    }

    const doc = {
      _id: "homeSettings_main",
      _type: "homeSettings",
      heroImageUrl: settings.heroImageUrl || "",
      ads: {
        leaderboard: {
          enabled: Boolean(settings.ads?.leaderboard?.enabled),
          label: settings.ads?.leaderboard?.label || "",
          imageUrl: settings.ads?.leaderboard?.imageUrl || "",
          href: settings.ads?.leaderboard?.href || "",
        },
        mpu: {
          enabled: Boolean(settings.ads?.mpu?.enabled),
          label: settings.ads?.mpu?.label || "",
          imageUrl: settings.ads?.mpu?.imageUrl || "",
          href: settings.ads?.mpu?.href || "",
        },
        billboard: {
          enabled: Boolean(settings.ads?.billboard?.enabled),
          label: settings.ads?.billboard?.label || "",
          imageUrl: settings.ads?.billboard?.imageUrl || "",
          href: settings.ads?.billboard?.href || "",
        },
      },
      partnerLogos: Array.isArray(settings.partnerLogos)
        ? settings.partnerLogos.map((item, index) => ({
            _key: item.id || `partner-${index}`,
            name: item.name || `Partner ${index + 1}`,
            logoUrl: item.logoUrl || "",
            href: item.href || "",
          }))
        : [],
    };

    await sanity.createOrReplace(doc);

    return res.status(200).json({
      ok: true,
      settings: doc,
    });
  } catch (error) {
    console.error("HOME SAVE ERROR:", error);
    return res.status(500).json({
      ok: false,
      error: "Internal server error",
    });
  }
}