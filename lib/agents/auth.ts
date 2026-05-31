import "server-only";
import { randomBytes, createHash, timingSafeEqual } from "crypto";

/**
 * Agent key management.
 *
 * An agent authenticates every poll with a bearer key. We store only the
 * SHA-256 hash; the raw key is shown to the user once at creation time and
 * baked into the agent's config on the on-site box.
 *
 * Key format: zyx_agt_<32 hex chars> — the "zyx_agt_" prefix makes it
 * recognisable in logs and lets us store a short prefix for display.
 */

export function generateAgentKey(): { raw: string; hash: string; prefix: string } {
  const body = randomBytes(24).toString("hex"); // 48 hex chars
  const raw = `zyx_agt_${body}`;
  const hash = createHash("sha256").update(raw).digest("hex");
  const prefix = raw.slice(0, 14); // "zyx_agt_xxxxxx"
  return { raw, hash, prefix };
}

export function hashAgentKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Constant-time comparison of two hex-encoded hashes. */
export function hashesEqual(a: string, b: string): boolean {
  try {
    return timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

/** Extracts a bearer token from an Authorization header. */
export function bearerFrom(header: string | null): string | null {
  if (!header) return null;
  const m = header.match(/^Bearer\s+(.+)$/i);
  return m ? m[1].trim() : null;
}
