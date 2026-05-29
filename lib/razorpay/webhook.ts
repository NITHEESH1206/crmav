import "server-only";
import crypto from "crypto";
import { RazorpayError } from "./client";

/**
 * Razorpay sends webhooks signed with HMAC-SHA256 of the raw body using your
 * webhook secret (configured in the Razorpay dashboard, NOT the API secret).
 *
 * The signature is in the `X-Razorpay-Signature` header. We must compute it
 * against the EXACT raw body bytes — no JSON parsing first.
 */

export function verifyWebhookSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader) return false;
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    throw new RazorpayError(
      "not_configured",
      "RAZORPAY_WEBHOOK_SECRET is not set. Configure it in the Razorpay dashboard and add to .env.local."
    );
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  // Constant-time compare
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, "hex"),
      Buffer.from(signatureHeader, "hex")
    );
  } catch {
    return false;
  }
}

/** Razorpay webhook event names we care about. */
export type WebhookEvent =
  | "payment_link.paid"
  | "payment_link.cancelled"
  | "payment_link.expired"
  | "payment.captured"
  | "payment.failed";
