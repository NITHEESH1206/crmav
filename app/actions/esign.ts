"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Proposal e-signature.
 *
 * The portal renders the proposal (quote) + a signature pad. On submit we
 * capture the signature image, the signer's name/email, a timestamp, and the
 * request IP — a defensible audit trail — then lock the quote as SIGNED and
 * advance the linked opportunity toward close.
 */

const signSchema = z.object({
  quoteId: z.string().min(1),
  accountId: z.string().min(1), // portal auth context
  signedByName: z.string().min(2).max(120),
  signedByEmail: z.string().email().optional().or(z.literal("")).nullable(),
  /** Data URL of the rendered signature (drawn canvas or typed-to-image). */
  signatureDataUrl: z.string().min(20).max(500_000),
});

export type SignResult = { ok: true } | { ok: false; error: string };

export async function signProposal(input: z.infer<typeof signSchema>): Promise<SignResult> {
  const parsed = signSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid signature submission" };
  }
  const data = parsed.data;

  const quote = await prisma.quote.findUnique({
    where: { id: data.quoteId },
    include: { opportunity: { select: { id: true, accountId: true, stage: true } } },
  });
  if (!quote) return { ok: false, error: "Proposal not found" };

  // Portal auth: the quote's opportunity must belong to the signing account
  if (quote.opportunity.accountId !== data.accountId) {
    return { ok: false, error: "This proposal doesn't belong to your account" };
  }
  if (quote.status === "SIGNED") {
    return { ok: false, error: "This proposal is already signed" };
  }

  // Capture requester IP for the audit trail
  const hdrs = await headers();
  const ip =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  await prisma.$transaction(async (tx) => {
    await tx.quote.update({
      where: { id: quote.id },
      data: {
        status: "SIGNED",
        signedAt: new Date(),
        signedByName: data.signedByName,
        signedByEmail: data.signedByEmail || null,
        signatureDataUrl: data.signatureDataUrl,
        signatureIp: ip,
      },
    });

    // Advance the opportunity — a signed proposal moves the deal forward.
    // We bump to NEGOTIATION (not auto-won) so the integrator still confirms.
    if (
      quote.opportunity.stage !== "CLOSED_WON" &&
      quote.opportunity.stage !== "CLOSED_LOST"
    ) {
      await tx.opportunity.update({
        where: { id: quote.opportunity.id },
        data: { stage: "NEGOTIATION", probability: 90 },
      });
    }

    // Audit log
    const wsQuote = await tx.quote.findUnique({
      where: { id: quote.id },
      include: { opportunity: { select: { workspaceId: true } } },
    });
    if (wsQuote?.opportunity.workspaceId) {
      await tx.auditLog.create({
        data: {
          workspaceId: wsQuote.opportunity.workspaceId,
          action: "proposal.signed",
          entityType: "Quote",
          entityId: quote.id,
          metadata: {
            signedByName: data.signedByName,
            signedByEmail: data.signedByEmail,
            ip,
          },
        },
      });
    }
  });

  revalidatePath(`/portal/${data.accountId}`);
  revalidatePath("/opportunities");
  revalidatePath("/dashboard");
  return { ok: true };
}
