import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { sanityAdminClient, assertWriteToken } from "@/lib/sanityClient";

export const config = {
  api: { bodyParser: false },
};

type Data =
  | { ok: true; assetId: string; url: string }
  | { ok: false; error: string; details?: any };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  try {
    assertWriteToken();

    const { files } = await new Promise<{ files: formidable.Files }>(
      (resolve, reject) => {
        form.parse(req, (err, _fields, files) => {
          if (err) reject(err);
          else resolve({ files });
        });
      }
    );

    const file = files.file;
    const f = Array.isArray(file) ? file[0] : file;

    if (!f) {
      return res.status(400).json({
        ok: false,
        error: "No file provided. Field name must be 'file'.",
      });
    }

    const buffer = fs.readFileSync(f.filepath);

    const asset = await sanityAdminClient.assets.upload("image", buffer, {
      filename: f.originalFilename || "upload.jpg",
      contentType: f.mimetype || undefined,
    });

    return res.status(200).json({ ok: true, assetId: asset._id, url: asset.url });
  } catch (e: any) {
    const status = e?.statusCode || e?.response?.statusCode || 500;

    console.error("UPLOAD IMAGE ERROR (raw):", e);
    console.error("UPLOAD IMAGE ERROR message:", e?.message);
    console.error("UPLOAD IMAGE ERROR details:", e?.details);

    return res.status(status).json({
      ok: false,
      error: e?.message || "Error uploading image to Sanity",
      details: e?.details || e?.responseBody || null,
    });
  }
}
