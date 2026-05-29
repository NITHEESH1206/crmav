import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/razorpay/webhook";
import { revalidatePath } from "next/cache";

/**
 * Razorpay webhook handler.
 *
 * Razorpay POSTs JSON events to this endpoint, signed with HMAC-SHA256 of the
 * raw body using your webhook secret (configured in the Razorpay dashboard,
 * NOT the same as your API key secret).
 *
 * Configure once:
 *   1. Razorpay dashboard → Settings → Webhooks → Add new
 *   2. URL:     https://yourdomain.com/api/webhooks/razorpay
 *   3. Events:  payment_link.paid, payment_link.cancelled, payment_link.expired,
 *               payment.captured, payment.failed
 *   4. Secret:  set RAZORPAY_WEBHOOK_SECRET to the value Razorpay generates
 *
 * Idempotent — re-receiving the same paid event is safe (no-op on already-paid
 * invoices).
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");

  // Verify HMAC signature before parsing — never act on unsigned events
  let valid = false;
  try {
    valid = verifyWebhookSignature(rawBody, signature);
  } catch (err) {
    // RAZORPAY_WEBHOOK_SECRET missing
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Verifier failed" },
      { status: 500 }
    );
  }
  if (!valid) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  // Now safe to parse
  let event: unknown;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  if (!isRzpEvent(event)) {
    return NextResponse.json({ ok: false, error: "Unknown event shape" }, { status: 400 });
  }

  switch (event.event) {
    case "payment_link.paid":
      await handlePaymentLinkPaid(event);
      break;
    case "payment_link.cancelled":
    case "payment_link.expired":
      await handlePaymentLinkClosed(event);
      break;
    case "payment.captured":
      // Standalone payment.captured: we mostly rely on payment_link.paid
      // for invoice attribution, but log it for audit.
      await logEvent(event);
      break;
    case "payment.failed":
      await logEvent(event);
      break;
    default:
      // Unknown but signed — log and 200 so Razorpay doesn't retry forever
      break;
  }

  return NextResponse.json({ ok: true });
}

/* ─── Event handlers ─── */

type RzpEvent = {
  event: string;
  payload?: {
    payment_link?: {
      entity?: {
        id: string;
        reference_id?: string;
        amount: number;
        status: string;
      };
    };
    payment?: {
      entity?: {
        id: string;
        amount: number;
        status: string;
      };
    };
  };
};

function isRzpEvent(x: unknown): x is RzpEvent {
  return (
    typeof x === "object" &&
    x !== null &&
    "event" in x &&
    typeof (x as { event: unknown }).event === "string"
  );
}

async function handlePaymentLinkPaid(event: RzpEvent) {
  const link = event.payload?.payment_link?.entity;
  if (!link?.reference_id) return;

  // reference_id === invoice.id (we set it that way in createPaymentLink)
  const invoice = await prisma.invoice.findUnique({
    where: { id: link.reference_id },
  });
  if (!invoice) return;
  if (invoice.status === "PAID") return; // idempotent — already handled

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      status: "PAID",
      paidAt: new Date(),
      paidVia: "razorpay",
    },
  });

  // Refresh anything that surfaces invoice status
  revalidatePath("/billing");
  revalidatePath("/dashboard");
  if (invoice.accountId) {
    revalidatePath(`/portal/${invoice.accountId}`);
    revalidatePath(`/accounts/${invoice.accountId}`);
  }

  await logEvent(event, {
    invoiceId: invoice.id,
    action: "marked-paid",
  });
}

async function handlePaymentLinkClosed(event: RzpEvent) {
  const link = event.payload?.payment_link?.entity;
  if (!link?.reference_id) return;

  // Clear our stored link reference so a fresh one is generated next time
  await prisma.invoice.update({
    where: { id: link.reference_id },
    data: {
      razorpayPaymentLinkId: null,
      razorpayPaymentLinkUrl: null,
    },
  });
  await logEvent(event, { invoiceId: link.reference_id, action: "link-cleared" });
}

async function logEvent(event: RzpEvent, meta?: Record<string, unknown>) {
  try {
    // Write to AuditLog without a workspaceId scope (cross-tenant by nature)
    // — pick the workspace from the invoice if we can.
    const link = event.payload?.payment_link?.entity;
    let workspaceId: string | null = null;
    if (link?.reference_id) {
      const inv = await prisma.invoice.findUnique({
        where: { id: link.reference_id },
        select: { workspaceId: true },
      });
      workspaceId = inv?.workspaceId ?? null;
    }
    if (!workspaceId) return; // can't log without a workspace
    await prisma.auditLog.create({
      data: {
        workspaceId,
        action: `razorpay.${event.event}`,
        entityType: "Invoice",
        entityId: link?.reference_id ?? null,
        metadata: { ...meta, event } as object,
      },
    });
  } catch {
    // Swallow audit errors — never block the webhook on logging
  }
}
