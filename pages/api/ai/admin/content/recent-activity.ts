// pages/api/admin/recent-activity.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sanityReadClient } from "@/lib/sanityClient";

const RECENT_ACTIVITY_QUERY = `*[_type == "article"]
  | order(_updatedAt desc)[0...12]{
    _id,
    title,
    section,
    status,
    "slug": slug.current,
    publishedAt,
    "updatedAt": _updatedAt
  }`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const data = await sanityReadClient.fetch(RECENT_ACTIVITY_QUERY);
    return res.status(200).json(Array.isArray(data) ? data : []);
  } catch (e: any) {
    return res.status(500).json({
      message: e?.message ?? "Failed to fetch recent activity",
    });
  }
}