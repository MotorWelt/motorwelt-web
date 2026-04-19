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
  imageUrl?: string;
  logoUrl?: string;
  href?: string;
};

type AdConfig = {
  enabled: boolean;
  label: string;
  imageUrl: string;
  href: string;
};

type PhotoGalleryEntry = {
  id: string;
  title: string;
  subtitle: string;
  coverImageUrl: string;
  galleryUrls: string[];
  when: string;
};

type HomeSettingsPayload = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    mpu?: AdConfig;
    billboard: AdConfig;
  };
  partnerLogos?: PartnerLogo[];
};

type TuningSettingsPayload = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    billboard: AdConfig;
  };
  photoGalleries?: PhotoGalleryEntry[];
};

type StandardPageSettingsPayload = {
  heroImageUrl: string;
  ads: {
    leaderboard: AdConfig;
    billboard: AdConfig;
  };
  partnerLogos?: PartnerLogo[];
};

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return "";
  const parts = cookieHeader.split(";").map((p) => p.trim());
  const found = parts.find((p) => p.startsWith(`${name}=`));
  if (!found) return "";
  return decodeURIComponent(found.split("=").slice(1).join("="));
}

function normalizeAdConfig(ad?: Partial<AdConfig>) {
  return {
    enabled: Boolean(ad?.enabled),
    label: String(ad?.label || ""),
    imageUrl: String(ad?.imageUrl || ""),
    href: String(ad?.href || ""),
  };
}

function normalizePartnerLogos(partnerLogos?: PartnerLogo[]) {
  if (!Array.isArray(partnerLogos)) return [];

  return partnerLogos.map((item, index) => ({
    _key: item.id || `partner-${index}`,
    id: item.id || `partner-${index}`,
    name: item.name || `Partner ${index + 1}`,
    imageUrl: item.imageUrl || item.logoUrl || "",
    logoUrl: item.logoUrl || item.imageUrl || "",
    href: item.href || "",
  }));
}

function normalizePhotoGalleries(photoGalleries?: PhotoGalleryEntry[]) {
  if (!Array.isArray(photoGalleries)) return [];

  return photoGalleries.map((gallery, index) => ({
    _key: gallery.id || `gallery-${index}`,
    id: gallery.id || `gallery-${index}`,
    title: gallery.title || `Galería ${index + 1}`,
    subtitle: gallery.subtitle || "",
    coverImageUrl: gallery.coverImageUrl || "",
    galleryUrls: Array.isArray(gallery.galleryUrls)
      ? gallery.galleryUrls.filter(Boolean)
      : [],
    when: gallery.when || "",
  }));
}

function getDocIdForPage(pageKey: string) {
  const clean = String(pageKey || "home").trim().toLowerCase();

  switch (clean) {
    case "home":
      return "homeSettings_main";
    case "tuning":
      return "tuningSettings_main";
    case "deportes":
      return "deportesSettings_main";
    case "lifestyle":
      return "lifestyleSettings_main";
    case "comunidad":
      return "comunidadSettings_main";
    default:
      return `${clean}Settings_main`;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log("SETTINGS SAVE ENV CHECK", {
      hasProjectId: Boolean(process.env.SANITY_PROJECT_ID),
      hasDataset: Boolean(process.env.SANITY_DATASET),
      hasApiVersion: Boolean(process.env.SANITY_API_VERSION),
      hasWriteToken: Boolean(process.env.SANITY_WRITE_TOKEN),
    });

    if (req.method !== "POST") {
      return res.status(405).json({ ok: false, error: "Method not allowed" });
    }

    const cookieRole = getCookieValue(req.headers.cookie, "mw_role");
    const headerRole = String(req.headers["x-mw-role"] || "");
    const bodyRole = String(req.body?.session?.role || "");
    const role = cookieRole || headerRole || bodyRole;

    console.log("SAVE AUTH DEBUG:", {
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

    const pageKey = String(req.body?.pageKey || "home").trim().toLowerCase();
    const settings = req.body?.settings;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({
        ok: false,
        error: "Missing settings",
      });
    }

    if (!process.env.SANITY_WRITE_TOKEN) {
      return res.status(500).json({
        ok: false,
        error: "Missing SANITY_WRITE_TOKEN on server",
      });
    }

    const baseDoc = {
      _id: getDocIdForPage(pageKey),
      _type: "homeSettings",
      pageKey,
      heroImageUrl: String(settings.heroImageUrl || ""),
    };

    let doc: Record<string, any>;

    if (pageKey === "home") {
      const home = settings as HomeSettingsPayload;

      doc = {
        ...baseDoc,
        ads: {
          leaderboard: normalizeAdConfig(home.ads?.leaderboard),
          mpu: normalizeAdConfig(home.ads?.mpu),
          billboard: normalizeAdConfig(home.ads?.billboard),
        },
        partnerLogos: normalizePartnerLogos(home.partnerLogos),
      };
    } else if (pageKey === "tuning") {
      const tuning = settings as TuningSettingsPayload;

      doc = {
        ...baseDoc,
        ads: {
          leaderboard: normalizeAdConfig(tuning.ads?.leaderboard),
          billboard: normalizeAdConfig(tuning.ads?.billboard),
        },
        photoGalleries: normalizePhotoGalleries(tuning.photoGalleries),
      };
    } else if (
      pageKey === "deportes" ||
      pageKey === "lifestyle" ||
      pageKey === "comunidad"
    ) {
      const page = settings as StandardPageSettingsPayload;

      doc = {
        ...baseDoc,
        ads: {
          leaderboard: normalizeAdConfig(page.ads?.leaderboard),
          billboard: normalizeAdConfig(page.ads?.billboard),
        },
        partnerLogos: normalizePartnerLogos(page.partnerLogos),
      };
    } else {
      const generic = settings as StandardPageSettingsPayload;

      doc = {
        ...baseDoc,
        ads: {
          leaderboard: normalizeAdConfig(generic.ads?.leaderboard),
          billboard: normalizeAdConfig(generic.ads?.billboard),
        },
        partnerLogos: normalizePartnerLogos(generic.partnerLogos),
      };
    }

    await sanity.createOrReplace(doc);

    return res.status(200).json({
      ok: true,
      pageKey,
      settings: doc,
    });
  } catch (error: any) {
    console.error("SAVE ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error?.message || "Internal server error",
      details: error?.responseBody || null,
      stack:
        process.env.NODE_ENV !== "production" ? error?.stack || null : null,
    });
  }
}