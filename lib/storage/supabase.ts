import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase Storage integration for real file uploads.
 *
 * Required env vars (when present, uploads go to Supabase; when absent, the
 * UI falls back to URL-paste so the app still works without a storage backend):
 *  - SUPABASE_URL                  — project URL (https://xxx.supabase.co)
 *  - SUPABASE_SERVICE_ROLE_KEY     — service-role key (server-only, never exposed)
 *  - SUPABASE_STORAGE_BUCKET       — bucket name (default: "documents")
 *
 * Create the bucket once in the Supabase dashboard (or it auto-creates on first
 * upload via the admin API). Set it to public-read for direct file URLs, or
 * keep it private and we'll generate signed URLs.
 */

let _client: SupabaseClient | null = null;

export function isStorageConfigured(): boolean {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabase(): SupabaseClient {
  if (!isStorageConfigured()) {
    throw new StorageError(
      "not_configured",
      "Supabase Storage isn't configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local."
    );
  }
  if (_client) return _client;
  _client = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
  return _client;
}

export function getBucket(): string {
  return process.env.SUPABASE_STORAGE_BUCKET || "documents";
}

export class StorageError extends Error {
  constructor(public code: "not_configured" | "upload" | "unknown", message: string) {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * Uploads a file buffer to Supabase Storage and returns a public URL.
 *
 * Path convention: <workspaceId>/<folder>/<timestamp>-<sanitizedName>
 */
export async function uploadFile(opts: {
  workspaceId: string;
  folder: string;
  fileName: string;
  contentType: string;
  data: ArrayBuffer | Buffer;
}): Promise<{ url: string; path: string }> {
  const supabase = getSupabase();
  const bucket = getBucket();

  const safe = opts.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${opts.workspaceId}/${opts.folder}/${Date.now()}-${safe}`;

  const { error } = await supabase.storage.from(bucket).upload(path, opts.data, {
    contentType: opts.contentType,
    upsert: false,
  });
  if (error) {
    throw new StorageError("upload", error.message);
  }

  // Public URL (works when bucket is public). For private buckets, swap to
  // createSignedUrl with an expiry.
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: pub.publicUrl, path };
}
