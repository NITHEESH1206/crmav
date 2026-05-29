"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft, Check, X, Building2, Briefcase, Boxes, Sparkle, Users } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "@/components/app/brand-mark";
import { IdentityStep } from "./steps/identity-step";
import { CatalogStep } from "./steps/catalog-step";
import { AccountStep } from "./steps/account-step";
import { BuildHandoffStep } from "./steps/build-handoff-step";
import { TeamStep } from "./steps/team-step";
import type { getOnboardingStatus } from "@/app/actions/onboarding";

type Status = Awaited<ReturnType<typeof getOnboardingStatus>>;

const STEPS = [
  { n: 1, label: "Workspace", icon: Building2, key: "workspace" as const },
  { n: 2, label: "Catalog",   icon: Boxes,     key: "catalog" as const },
  { n: 3, label: "Account",   icon: Briefcase, key: "account" as const },
  { n: 4, label: "Build",     icon: Sparkle,   key: "project" as const },
  { n: 5, label: "Team",      icon: Users,     key: "team" as const },
];

export function WelcomeWizard({
  initialStep,
  status,
}: {
  initialStep: number;
  status: Status;
}) {
  const router = useRouter();
  const [step, setStep] = useState(initialStep);
  const [pending, startTransition] = useTransition();

  function goNext() {
    if (step < STEPS.length) {
      setStep((s) => s + 1);
      // Update URL so refresh keeps the user on the same step
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(step + 1));
      window.history.replaceState({}, "", url);
    } else {
      finish();
    }
  }

  function goPrev() {
    if (step > 1) {
      setStep((s) => s - 1);
      const url = new URL(window.location.href);
      url.searchParams.set("step", String(step - 1));
      window.history.replaceState({}, "", url);
    }
  }

  function finish() {
    startTransition(() => {
      toast.success("Welcome to ZynexAV", {
        description: "You're all set. Drop into Mission Control whenever you're ready.",
      });
      router.push("/dashboard");
    });
  }

  function handleSkip() {
    toast.info("Setup skipped — you can pick it up from the dashboard anytime.");
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top brand bar */}
      <header className="w-full">
        <div className="max-w-[1100px] mx-auto px-6 lg:px-10 py-5 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <BrandMark variant="full" height={22} invertForDark={false} />
          </Link>
          <button
            type="button"
            onClick={handleSkip}
            className="hover-glass inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] text-ink-300/65 hover:text-ink-300 border border-transparent"
          >
            <X className="h-3.5 w-3.5" />
            Skip for now
          </button>
        </div>
      </header>

      <div className="flex-1 max-w-[920px] mx-auto px-6 lg:px-10 pb-16 w-full">
        {/* Hero */}
        <div className="text-center max-w-[640px] mx-auto pt-6 mb-10">
          <div className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-signal-700 mb-3">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            Welcome · {status.workspace?.name ?? "ZynexAV"}
          </div>
          <h1 className="text-[36px] md:text-[44px] font-medium tracking-[-0.024em] text-ink-300 leading-[1.05]">
            Your first project — in seven minutes.
          </h1>
          <p className="mt-3 text-[16px] text-ink-300/65 leading-[1.55] max-w-[560px] mx-auto">
            Five quick steps. Each one is real — we'll persist your workspace, catalog and first project so you land in Mission Control with something to look at.
          </p>
        </div>

        {/* Step indicator */}
        <ol className="flex items-center justify-center gap-1.5 md:gap-2 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => {
            const isActive = s.n === step;
            const isDone = s.n < step || status.steps[s.key];
            const Icon = s.icon;
            return (
              <li key={s.n} className="flex items-center gap-1.5 md:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setStep(s.n)}
                  className={`inline-flex items-center gap-2 h-9 pl-1 pr-3 rounded-full transition-all ${
                    isActive
                      ? "glass-pill-active text-ink-300"
                      : isDone
                        ? "bg-status-success-fg/10 text-status-success-fg hover:bg-status-success-fg/15"
                        : "hover-glass border border-bone-300/55 text-ink-300/50"
                  }`}
                >
                  <span
                    className={`h-7 w-7 rounded-full flex items-center justify-center font-mono text-[11px] font-medium ${
                      isActive
                        ? "bg-signal-500/15 text-signal-700"
                        : isDone
                          ? "bg-status-success-fg/15"
                          : "bg-white/40 border border-bone-300/45"
                    }`}
                  >
                    {isDone ? <Check className="h-3 w-3" strokeWidth={2.5} /> : String(s.n).padStart(2, "0")}
                  </span>
                  <span className="text-[12.5px] font-medium hidden md:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && (
                  <span
                    className={`w-3 md:w-6 h-px ${
                      isDone ? "bg-status-success-fg/40" : "bg-bone-300/55"
                    }`}
                  />
                )}
              </li>
            );
          })}
        </ol>

        {/* Step content */}
        <div className="max-w-[760px] mx-auto">
          {step === 1 && (
            <IdentityStep
              initial={{
                name: status.workspace?.name ?? "",
                logoUrl: status.workspace?.logoUrl ?? "",
                currency: status.workspace?.currency ?? "USD",
                timezone: status.workspace?.timezone ?? "UTC",
              }}
              onContinue={goNext}
            />
          )}
          {step === 2 && (
            <CatalogStep
              catalogCount={status.counts.catalogCount}
              onContinue={goNext}
              onBack={goPrev}
            />
          )}
          {step === 3 && (
            <AccountStep
              accountCount={status.counts.accountCount}
              onContinue={goNext}
              onBack={goPrev}
            />
          )}
          {step === 4 && (
            <BuildHandoffStep
              projectCount={status.counts.projectCount}
              onSkip={goNext}
              onBack={goPrev}
            />
          )}
          {step === 5 && (
            <TeamStep
              memberCount={status.counts.memberCount}
              onFinish={finish}
              onBack={goPrev}
              finishing={pending}
            />
          )}
        </div>

        {/* Footer hint */}
        <div className="text-center mt-10">
          <p className="text-[12px] text-ink-300/45">
            Step {step} of {STEPS.length} ·{" "}
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 1}
              className="underline-offset-2 hover:underline disabled:opacity-30"
            >
              <ArrowLeft className="inline h-3 w-3 mr-0.5" />
              Back
            </button>
            {" · "}
            <button
              type="button"
              onClick={goNext}
              className="underline-offset-2 hover:underline"
            >
              Next
              <ArrowRight className="inline h-3 w-3 ml-0.5" />
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
