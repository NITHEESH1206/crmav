"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles, Users, Zap, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { setWorkspacePlan, createPlanUpgradeLink } from "@/app/actions/billing";
import {
  PLAN_LABEL,
  PLAN_PRICE_CENTS,
  PLAN_ORDER,
  formatInr,
  priceForPeriod,
  type BillingPeriod,
} from "@/lib/billing/plans";

type Plan = "BASIC" | "PRO" | "ENTERPRISE";

type Info = {
  plan: Plan;
  seatsUsed: number;
  seatLimit: number;
  aiUsed: number;
  aiLimit: number;
  period: string;
  isOwner: boolean;
};

const FEATURES: Record<Plan, string[]> = {
  BASIC: ["2 users", "Pipeline, projects & BOQ", "Catalog & rack builder", "150 AI generations / mo"],
  PRO: ["12 users", "Everything in Basic", "AI Builder & Co-pilot", "Operations + remote control", "2,000 AI generations / mo"],
  ENTERPRISE: ["Unlimited users", "Everything in Pro", "SSO & advanced permissions", "Dedicated success manager"],
};

export function BillingTab({ info }: { info: Info }) {
  const [pending, startTransition] = useTransition();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  function meter(used: number, limit: number) {
    const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const danger = pct >= 90;
    return (
      <div>
        <div className="h-2 rounded-full bg-bone-100 overflow-hidden">
          <div
            className={cn("h-full rounded-full", danger ? "bg-status-danger-fg" : "bg-signal-500")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    );
  }

  function switchPlan(plan: Plan) {
    startTransition(async () => {
      const r = await setWorkspacePlan({ plan });
      if (r.ok) toast.success(`Plan set to ${PLAN_LABEL[plan]}`);
      else toast.error("Couldn't change plan");
    });
  }

  function upgrade(plan: Plan) {
    if (plan === "ENTERPRISE") {
      window.location.href = "mailto:sales@zynexav.com?subject=ZynexAV%20Enterprise";
      return;
    }
    startTransition(async () => {
      const r = await createPlanUpgradeLink({ plan, period });
      if (r.ok && r.url) {
        toast.success("Opening secure checkout…");
        window.open(r.url, "_blank");
      } else {
        toast.error("Couldn't start checkout", { description: r.ok ? undefined : r.error });
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Current plan + usage */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="inline-flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-ink-300/55" />
            Your plan
          </CardTitle>
          <Badge className="bg-signal-500/15 text-signal-700 border-signal-500/25">{PLAN_LABEL[info.plan]}</Badge>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-5">
          <div>
            <div className="flex items-center justify-between text-[12.5px] text-ink-300/70 mb-1.5">
              <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> Team seats</span>
              <span className="font-mono">{info.seatsUsed} / {info.seatLimit}</span>
            </div>
            {meter(info.seatsUsed, info.seatLimit)}
          </div>
          <div>
            <div className="flex items-center justify-between text-[12.5px] text-ink-300/70 mb-1.5">
              <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> AI generations ({info.period})</span>
              <span className="font-mono">{info.aiUsed} / {info.aiLimit}</span>
            </div>
            {meter(info.aiUsed, info.aiLimit)}
          </div>
        </CardContent>
      </Card>

      {!info.isOwner && (
        <p className="text-[12.5px] text-ink-300/55">Only an owner or admin can change the plan.</p>
      )}

      {/* Billing period toggle */}
      <div className="flex justify-center">
        <div className="glass inline-flex items-center gap-1 rounded-full p-1">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={cn(
              "h-8 px-4 rounded-full text-[12.5px] font-medium transition-all",
              period === "monthly" ? "glass-pill-active text-ink-300" : "text-ink-300/60 hover:text-ink-300"
            )}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPeriod("annual")}
            className={cn(
              "h-8 pl-4 pr-2 rounded-full text-[12.5px] font-medium transition-all inline-flex items-center gap-2",
              period === "annual" ? "glass-pill-active text-ink-300" : "text-ink-300/60 hover:text-ink-300"
            )}
          >
            Annual
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              period === "annual" ? "bg-signal-500 text-white" : "bg-signal-500/15 text-signal-700"
            )}>
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {PLAN_ORDER.map((plan) => {
          const current = plan === info.plan;
          const price = PLAN_PRICE_CENTS[plan];
          return (
            <div
              key={plan}
              className={cn(
                "rounded-2xl border p-5 flex flex-col",
                current ? "border-signal-500/40 bg-signal-500/[0.04]" : "border-bone-300/55 bg-white"
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-medium text-ink-300">{PLAN_LABEL[plan]}</h3>
                {current && <Badge className="bg-signal-500 text-white text-[10px]">Current</Badge>}
              </div>
              <div className="mt-2 mb-3">
                {plan === "ENTERPRISE" || price === 0 ? (
                  <span className="font-display text-[22px] text-ink-300">Let&apos;s talk</span>
                ) : period === "annual" ? (
                  <span className="font-display text-[22px] text-ink-300">
                    {formatInr(priceForPeriod(plan, "annual"))}
                    <span className="text-[12px] text-ink-300/55 font-sans"> / yr</span>
                  </span>
                ) : (
                  <span className="font-display text-[22px] text-ink-300">
                    {formatInr(price)}
                    <span className="text-[12px] text-ink-300/55 font-sans"> / mo</span>
                  </span>
                )}
              </div>
              <ul className="space-y-1.5 flex-1">
                {FEATURES[plan].map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-[12px] text-ink-300/70">
                    <Check className="h-3 w-3 mt-0.5 text-signal-700 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              {info.isOwner && !current && (
                <div className="mt-4 flex flex-col gap-2">
                  {plan !== "ENTERPRISE" && PLAN_PRICE_CENTS[plan] > 0 && (
                    <button
                      onClick={() => upgrade(plan)}
                      disabled={pending}
                      className="btn-glass-signal inline-flex items-center justify-center gap-1.5 h-9 rounded-full text-[12.5px] font-medium"
                    >
                      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                      Upgrade — pay with Razorpay
                    </button>
                  )}
                  {plan === "ENTERPRISE" && (
                    <button
                      onClick={() => upgrade(plan)}
                      className="btn-glass-secondary inline-flex items-center justify-center h-9 rounded-full text-[12.5px] font-medium"
                    >
                      Contact sales
                    </button>
                  )}
                  <button
                    onClick={() => switchPlan(plan)}
                    disabled={pending}
                    className="text-[11px] text-ink-300/50 hover:text-ink-300/80"
                  >
                    Set manually (no payment)
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-ink-300/45">
        Paying via Razorpay auto-upgrades your plan on success. &quot;Set manually&quot; is for comped/internal accounts.
        Plans gate team seats and monthly AI generations.
      </p>
    </div>
  );
}
