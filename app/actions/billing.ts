"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { getCurrentUser } from "@/lib/auth";
import { createPaymentLink } from "@/lib/razorpay/client";
import { PLAN_PRICE_CENTS, PLAN_LABEL, priceForPeriod } from "@/lib/billing/plans";
import { revalidatePath } from "next/cache";
import type { Plan } from "@prisma/client";

async function assertOwner() {
  const me = await getCurrentUser();
  if (!me || (me.role !== "OWNER" && me.role !== "ADMIN")) {
    throw new Error("Only an owner or admin can change the plan.");
  }
  return me;
}

const planSchema = z.object({ plan: z.enum(["BASIC", "PRO", "ENTERPRISE"]) });

/** Manual plan switch — owner/admin only (comps, internal, or post-payment). */
export async function setWorkspacePlan(input: z.infer<typeof planSchema>) {
  const { plan } = planSchema.parse(input);
  await assertOwner();
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.workspace.update({ where: { id: workspaceId }, data: { plan } });
  revalidatePath("/settings");
  return { ok: true as const, plan };
}

/**
 * Create a Razorpay payment link to upgrade to a paid plan. On payment, the
 * webhook (reference_id `plan_<plan>_<workspaceId>`) flips Workspace.plan.
 */
const upgradeSchema = planSchema.extend({
  period: z.enum(["monthly", "annual"]).default("monthly"),
});

export async function createPlanUpgradeLink(input: z.infer<typeof upgradeSchema>) {
  const { plan, period } = upgradeSchema.parse(input);
  await assertOwner();
  if (plan === "ENTERPRISE") {
    return { ok: false as const, error: "Enterprise is contact-sales — reach out to sales@zynexav.com." };
  }
  const amountCents = priceForPeriod(plan, period);
  if (!amountCents) return { ok: false as const, error: "No price configured for this plan." };

  const workspaceId = await getCurrentWorkspaceId();
  const me = await getCurrentUser();

  try {
    const link = await createPaymentLink({
      amountCents,
      currency: "INR",
      description: `ZynexAV ${PLAN_LABEL[plan]} plan — ${period === "annual" ? "1 year" : "1 month"}`,
      referenceId: `plan_${plan}_${workspaceId}`,
      customer: me?.email ? { email: me.email, name: me.name } : undefined,
      notifyByEmail: Boolean(me?.email),
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/settings?upgraded=${plan}`,
    });
    return { ok: true as const, url: link.shortUrl, id: link.id };
  } catch (err) {
    return {
      ok: false as const,
      error: err instanceof Error ? err.message : "Couldn't create payment link. Is Razorpay configured?",
    };
  }
}

/** Set a workspace's plan by id — used by the webhook after a paid upgrade link. */
export async function applyPaidPlan(workspaceId: string, plan: Plan) {
  await prisma.workspace.update({ where: { id: workspaceId }, data: { plan } });
}
