// lib/sanityClient.ts
import { createClient } from "@sanity/client";

const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const apiVersion = process.env.SANITY_API_VERSION || "2024-01-01";

// Token SOLO server
const token = process.env.SANITY_WRITE_TOKEN;

if (!projectId) throw new Error("Missing env: SANITY_PROJECT_ID");
if (!dataset) throw new Error("Missing env: SANITY_DATASET");

// ✅ En prod usamos CDN, en dev NO (para ver cambios al instante)
const useCdn = process.env.NODE_ENV === "production";

export const sanityReadClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn,
});

export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: token || undefined,
  useCdn: false,
});

// ✅ Alias para compatibilidad con imports existentes:
// import { sanityClient } from "@/lib/sanityClient";
export const sanityClient = sanityReadClient;

/**
 * ✅ NUEVO: Alias recomendado para endpoints admin que escriben
 * (save-draft / update-status / delete / upload, etc.)
 *
 * Uso:
 * import { sanityAdminClient, assertWriteToken } from "@/lib/sanityClient";
 * assertWriteToken();
 * await sanityAdminClient.delete(id);
 */
export const sanityAdminClient = sanityWriteClient;

// Helper opcional para forzar token en endpoints que escriben
export function assertWriteToken() {
  if (!process.env.SANITY_WRITE_TOKEN) {
    throw new Error(
      "Missing env: SANITY_WRITE_TOKEN (required for write operations)"
    );
  }
}
