import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import { sanityWriteClient } from "../../../../../lib/sanityClient";

export const config = {
  api: {
    bodyParser: false,
  },
};

type UploadVideoResponse =
  | {
      ok: true;
      assetId: string;
      url: string;
      originalFilename?: string;
      mimeType?: string;
    }
  | {
      ok: false;
      error: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<UploadVideoResponse>,
) {
  if (req.method !== "POST") {
    return res.status(405).json({
      ok: false,
      error: "Method not allowed",
    });
  }

  try {
    const form = formidable({
      multiples: false,
      maxFileSize: 1024 * 1024 * 500, // 500MB
      keepExtensions: true,
    });

    const { files } = await new Promise<{
      fields: formidable.Fields;
      files: formidable.Files;
    }>((resolve, reject) => {
      form.parse(req, (err, fields, parsedFiles) => {
        if (err) reject(err);
        else resolve({ fields, files: parsedFiles });
      });
    });

    const uploadedFile = Array.isArray(files.file)
      ? files.file[0]
      : files.file;

    if (!uploadedFile) {
      return res.status(400).json({
        ok: false,
        error: "No se recibió ningún archivo de video.",
      });
    }

    const mimeType = uploadedFile.mimetype || "";

    if (!mimeType.startsWith("video/")) {
      return res.status(400).json({
        ok: false,
        error: "El archivo seleccionado no es un video válido.",
      });
    }

    const stream = fs.createReadStream(uploadedFile.filepath);

    const asset = await sanityWriteClient.assets.upload("file", stream, {
      filename: uploadedFile.originalFilename || "motorwelt-video",
      contentType: mimeType,
    });

    return res.status(200).json({
      ok: true,
      assetId: asset._id,
      url: asset.url,
      originalFilename: uploadedFile.originalFilename || undefined,
      mimeType,
    });
  } catch (error: any) {
    console.error("[upload-video] error", error);

    return res.status(500).json({
      ok: false,
      error: error?.message || "No se pudo subir el video.",
    });
  }
}