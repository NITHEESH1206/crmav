"use client";

import { useState } from "react";
import { toast } from "sonner";
import { BriefForm, type Brief } from "./brief-form";
import { PlanReview } from "./plan-review";
import { LaunchProgress } from "./launch-progress";
import { launchProjectFromPlan } from "@/app/actions/launch-project";
import type { ValidatedPlan } from "@/lib/ai/plan-schema";

type Stage = "brief" | "review" | "launching" | "done" | "error";

export function BuilderShell() {
  const [stage, setStage] = useState<Stage>("brief");
  const [brief, setBrief] = useState<Brief | null>(null);
  const [plan, setPlan] = useState<ValidatedPlan | null>(null);
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | undefined>();
  const [launchResult, setLaunchResult] = useState<{
    projectId: string;
    roomId: string;
    accountId: string;
    totals: { boqLines: number; rackUnits: number; flowNodes: number; boqTotalCents: number };
  } | null>(null);

  async function generatePlan(newBrief: Brief, refinement?: string) {
    const body: Record<string, unknown> = { ...newBrief };
    if (refinement) body.requirements = `${newBrief.requirements ? newBrief.requirements + " " : ""}REFINEMENT: ${refinement}`;
    const res = await fetch("/api/ai/generate/project-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.ok) {
      throw new Error(data.error || "Generation failed");
    }
    return data.plan as ValidatedPlan;
  }

  async function handleBriefSubmit(b: Brief) {
    setBrief(b);
    setGenerating(true);
    try {
      const newPlan = await generatePlan(b);
      setPlan(newPlan);
      setStage("review");
    } catch (err) {
      toast.error("Couldn't generate plan", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setGenerating(false);
    }
  }

  async function handleRefine(refinement: string) {
    if (!brief) return;
    setRefining(true);
    try {
      const newPlan = await generatePlan(brief, refinement);
      setPlan(newPlan);
      toast.success("Plan refined");
    } catch (err) {
      toast.error("Refine failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setRefining(false);
    }
  }

  async function handleConfirm() {
    if (!plan || !brief) return;
    setLaunching(true);
    setStage("launching");

    try {
      const r = await launchProjectFromPlan({
        accountName: brief.accountName,
        projectName: plan.projectName,
        narrative: plan.narrative,
        estimatedValueCents: plan.estimatedValueCents,
        riskLevel: plan.riskLevel,
        callouts: plan.callouts,
        room: {
          name: plan.room.name,
          roomType: plan.room.roomType,
          capacity: plan.room.capacity,
          lengthM: plan.room.lengthM,
          widthM: plan.room.widthM,
          heightM: plan.room.heightM,
        },
        devices: plan.validatedDevices.map((d) => ({
          catalogId: d.catalogId,
          sku: d.sku,
          name: d.name,
          brand: d.brand,
          category: d.category,
          listPriceCents: d.listPriceCents,
          quantity: d.quantity,
          rationale: d.rationale,
        })),
      });
      if (!r.ok) {
        setStage("error");
        setLaunchError(r.error);
        return;
      }
      setLaunchResult({
        projectId: r.projectId,
        roomId: r.roomId,
        accountId: r.accountId,
        totals: {
          boqLines: r.total.boqLines,
          rackUnits: r.total.rackUnits,
          flowNodes: r.total.flowNodes,
          boqTotalCents: plan.totalCents,
        },
      });
      setStage("done");
      toast.success("Project launched", {
        description: `${plan.projectName} is live with ${r.total.boqLines} BOQ items.`,
      });
    } catch (err) {
      setStage("error");
      setLaunchError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLaunching(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <ol className="flex items-center justify-center gap-2">
        {(["brief", "review", "launching"] as const).map((s, i) => {
          const order = ["brief", "review", "launching"].indexOf(stage);
          const target = i;
          const state =
            order === target || (target === 2 && stage === "done")
              ? "active"
              : order > target
                ? "done"
                : "pending";
          const label = ["Brief", "Review", "Launch"][i];
          return (
            <li key={s} className="flex items-center gap-2">
              <span
                className={`inline-flex items-center justify-center h-7 w-7 rounded-full font-mono text-[11px] font-medium ${
                  state === "active"
                    ? "glass-pill-active text-ink-300"
                    : state === "done"
                      ? "bg-status-success-fg/15 text-status-success-fg"
                      : "bg-white/40 text-ink-300/45 border border-bone-300/45"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className={`text-[12.5px] font-medium ${
                  state === "active"
                    ? "text-ink-300"
                    : state === "done"
                      ? "text-ink-300/65"
                      : "text-ink-300/40"
                }`}
              >
                {label}
              </span>
              {i < 2 && (
                <span
                  className={`w-10 h-px ${
                    state === "done" ? "bg-status-success-fg/40" : "bg-bone-300/55"
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      {stage === "brief" && (
        <BriefForm
          initial={brief ?? undefined}
          onSubmit={handleBriefSubmit}
          submitting={generating}
        />
      )}

      {stage === "review" && plan && (
        <PlanReview
          plan={plan}
          onBack={() => setStage("brief")}
          onRefine={handleRefine}
          onConfirm={handleConfirm}
          refining={refining}
          launching={launching}
        />
      )}

      {(stage === "launching" || stage === "done" || stage === "error") && (
        <LaunchProgress
          status={
            stage === "launching" ? "running" : stage === "done" ? "done" : "error"
          }
          projectId={launchResult?.projectId}
          roomId={launchResult?.roomId}
          accountId={launchResult?.accountId}
          errors={launchError}
          totals={launchResult?.totals}
        />
      )}
    </div>
  );
}
