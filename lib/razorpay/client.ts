import "server-only";
import Razorpay from "razorpay";

/**
 * Razorpay singleton.
 *
 * Required env vars:
 *  - RAZORPAY_KEY_ID         — public key (rzp_live_xxx or rzp_test_xxx)
 *  - RAZORPAY_KEY_SECRET     — secret key
 *  - RAZORPAY_WEBHOOK_SECRET — webhook signing secret (configured in Razorpay dashboard)
 *
 * Razorpay's Node SDK is callback-style by default but supports promises via
 * the `.then()` interface. We wrap the bits we use to keep callsites tidy.
 */

let _client: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new RazorpayError(
      "not_configured",
      "Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."
    );
  }
  if (_client) return _client;
  _client = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  return _client;
}

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
}

export class RazorpayError extends Error {
  constructor(
    public code: "not_configured" | "api" | "validation" | "signature" | "unknown",
    message: string
  ) {
    super(message);
    this.name = "RazorpayError";
  }
}

/**
 * Razorpay returns amounts in the smallest currency unit (paise for INR,
 * cents for USD, etc.). Our DB already stores cents, so the conversion is
 * a no-op for USD but a useful explicit type here.
 */
export type RazorpayCurrency = "INR" | "USD" | "EUR" | "GBP" | "SGD" | "AED";

/** Razorpay payment-link create input (subset used in this app). */
export type PaymentLinkInput = {
  amountCents: number;
  currency: RazorpayCurrency;
  description: string;
  /** Reference ID echoed back via webhook. We use this to attribute the
   *  payment to a specific invoice. */
  referenceId: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  notifyByEmail?: boolean;
  /** Where to send the user after payment success. */
  callbackUrl?: string;
};

export type CreatedPaymentLink = {
  id: string;
  shortUrl: string;
  status: string;
};

export async function createPaymentLink(
  input: PaymentLinkInput
): Promise<CreatedPaymentLink> {
  const razorpay = getRazorpay();

  // Reasonable expiry: 30 days from now (in seconds since epoch)
  const expireBy = Math.floor(Date.now() / 1000) + 30 * 86400;

  try {
    // The SDK's typings are loose — cast through unknown.
    const result = (await (razorpay.paymentLink.create as unknown as (
      x: unknown
    ) => Promise<{ id: string; short_url: string; status: string }>)({
      amount: input.amountCents,
      currency: input.currency,
      description: input.description,
      reference_id: input.referenceId,
      ...(input.customer ? { customer: input.customer } : {}),
      notify: {
        sms: false,
        email: input.notifyByEmail ?? false,
      },
      reminder_enable: false,
      expire_by: expireBy,
      ...(input.callbackUrl
        ? {
            callback_url: input.callbackUrl,
            callback_method: "get",
          }
        : {}),
    })) ;

    return {
      id: result.id,
      shortUrl: result.short_url,
      status: result.status,
    };
  } catch (err) {
    throw new RazorpayError(
      "api",
      err instanceof Error ? err.message : "Razorpay API call failed"
    );
  }
}
