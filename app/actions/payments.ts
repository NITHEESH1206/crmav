"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import {
  createPaymentLink,
  isRazorpayConfigured,
  type RazorpayCurrency,
} from "@/lib/razorpay/client";
import { revalidatePath } from "next/cache";

/**
 * Create (or re-use) a Razorpay payment link for an invoice.
 *
 * Callable from both the app's Billing module (workspace member) and the
 * client portal (account contact). Surface validates that the requester
 * has access to the invoice via either context.
 */

const inputSchema = z.object({
  invoiceId: z.string().min(1),
  /** When the request comes from the portal, the account id is passed so we
   *  can confirm the invoice belongs to that account. App callers omit. */
  fromAccountId: z.string().optional(),
});

export type CreatePaymentLinkResult =
  | { ok: true; url: string; id: string; reused: boolean }
  | { ok: false; error: string };

const SUPPORTED_CURRENCIES: RazorpayCurrency[] = ["INR", "USD", "EUR", "GBP", "SGD", "AED"];

export async function createInvoicePaymentLink(
  raw: z.infer<typeof inputSchema>
): Promise<CreatePaymentLinkResult> {
  const parsed = inputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request" };
  }
  const { invoiceId, fromAccountId } = parsed.data;

  if (!isRazorpayConfigured()) {
    return {
      ok: false,
      error:
        "Razorpay isn't configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local.",
    };
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      account: { include: { contacts: { where: { isPrimary: true }, take: 1 } } },
      workspace: { select: { name: true, currency: true } },
    },
  });
  if (!invoice) return { ok: false, error: "Invoice not found" };

  // Cross-context auth checks
  if (fromAccountId) {
    if (invoice.accountId !== fromAccountId) {
      return { ok: false, error: "Invoice doesn't belong to this account" };
    }
  } else {
    const workspaceId = await getCurrentWorkspaceId();
    if (invoice.workspaceId !== workspaceId) {
      return { ok: false, error: "Invoice not in your workspace" };
    }
  }

  if (invoice.status === "PAID") {
    return { ok: false, error: "Invoice is already paid" };
  }
  if (invoice.status === "VOID" || invoice.status === "DRAFT") {
    return { ok: false, error: `Invoice is ${invoice.status.toLowerCase()} — issue it before requesting payment` };
  }
  if (invoice.totalCents <= 0) {
    return { ok: false, error: "Invoice has zero value — nothing to pay" };
  }

  // Re-use existing link if there is one (Razorpay links are valid until paid/cancelled/expired)
  if (invoice.razorpayPaymentLinkUrl && invoice.razorpayPaymentLinkId) {
    return {
      ok: true,
      url: invoice.razorpayPaymentLinkUrl,
      id: invoice.razorpayPaymentLinkId,
      reused: true,
    };
  }

  // Determine currency — workspace default, fallback INR for Razorpay
  const wsCurrency = (invoice.workspace.currency ?? "INR") as string;
  const currency = (SUPPORTED_CURRENCIES.find((c) => c === wsCurrency) ?? "INR") as RazorpayCurrency;

  // Build customer object from the account's primary contact
  const primary = invoice.account?.contacts[0];
  const customer = primary
    ? {
        name: `${primary.firstName} ${primary.lastName}`.trim(),
        email: primary.email ?? undefined,
        phone: primary.phone ?? undefined,
      }
    : undefined;

  try {
    const link = await createPaymentLink({
      amountCents: invoice.totalCents,
      currency,
      description: `${invoice.workspace.name} · Invoice ${invoice.number}`,
      referenceId: invoice.id,
      customer,
      notifyByEmail: Boolean(customer?.email),
      // The callback URL is where Razorpay redirects after payment success.
      // Portal payers land back on their portal invoices page.
      callbackUrl: fromAccountId
        ? `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/portal/${fromAccountId}?paid=${invoice.id}`
        : `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/billing?paid=${invoice.id}`,
    });

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        razorpayPaymentLinkId: link.id,
        razorpayPaymentLinkUrl: link.shortUrl,
      },
    });

    revalidatePath("/billing");
    if (fromAccountId) revalidatePath(`/portal/${fromAccountId}`);

    return {
      ok: true,
      url: link.shortUrl,
      id: link.id,
      reused: false,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Couldn't create payment link",
    };
  }
}
