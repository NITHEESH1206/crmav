import type { Plan } from "@prisma/client";

/** Seat limits per plan (matches the public pricing page). */
export const PLAN_SEAT_LIMITS: Record<Plan, number> = {
  BASIC: 2,
  PRO: 12,
  ENTERPRISE: 1000,
};

/** Monthly list price per plan, in paise (INR smallest unit). */
export const PLAN_PRICE_CENTS: Record<Plan, number> = {
  BASIC: 1_499_900, // ₹14,999
  PRO: 4_999_900, // ₹49,999
  ENTERPRISE: 0, // contact sales — no self-serve link
};

export const PLAN_LABEL: Record<Plan, string> = {
  BASIC: "Basic",
  PRO: "Pro",
  ENTERPRISE: "Enterprise",
};

export const PLAN_ORDER: Plan[] = ["BASIC", "PRO", "ENTERPRISE"];

export type BillingPeriod = "monthly" | "annual";

/** Annual billing saves 20% (matches the public pricing page). */
export const ANNUAL_DISCOUNT = 0.2;

/** Amount to charge for a plan over the chosen period, in paise. */
export function priceForPeriod(plan: Plan, period: BillingPeriod): number {
  const monthly = PLAN_PRICE_CENTS[plan];
  if (period === "annual") return Math.round(monthly * 12 * (1 - ANNUAL_DISCOUNT));
  return monthly;
}

export function formatInr(paise: number): string {
  return "₹" + Math.round(paise / 100).toLocaleString("en-IN");
}
