"use client";

import Link from "next/link";
import { Sparkles, Check, ArrowRight } from "lucide-react";

type Status = {
  steps: {
    workspace: boolean;
    catalog: boolean;
    account: boolean;
    project: boolean;
    team: boolean;
  };
  completePct: number;
};

const LABELS = {
  workspace: "Workspace identity",
  catalog: "AV catalog seeded",
  account: "First client added",
  project: "First project launched",
  team: "Team invited",
} as const;

/**
 * Compact widget shown at the top of the dashboard until onboarding is fully
 * complete. Displays the same five-step progress in a horizontal strip with
 * the brand-orange progress ring.
 */
export function SetupProgressWidget({ status }: { status: Status }) {
  const items = Object.entries(LABELS) as [keyof typeof LABELS, string][];

  return (
    <Link
      href="/welcome"
      className="glass-card hover-glass group relative block rounded-[20px] p-5 overflow-hidden transition-transform hover:-translate-y-px"
    >
      <span
        aria-hidden
        className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-signal-500/12 blur-3xl pointer-events-none"
      />

      <div className="relative flex flex-col md:flex-row md:items-center gap-4">
        {/* Progress ring */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative h-12 w-12">
            <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="rgba(10,10,10,0.08)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15"
                fill="none"
                stroke="rgb(255,90,31)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={`${(status.completePct / 100) * (2 * Math.PI * 15)} ${2 * Math.PI * 15}`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-mono text-[11px] font-medium text-signal-700">
              {status.completePct}%
            </span>
          </div>
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-signal-700 font-medium inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              Setup
            </div>
            <div className="text-[14px] font-medium text-ink-300 mt-0.5">
              Finish onboarding
            </div>
          </div>
        </div>

        {/* Step pills */}
        <div className="flex-1 flex items-center gap-1.5 flex-wrap">
          {items.map(([key, label]) => {
            const done = status.steps[key];
            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-medium border ${
                  done
                    ? "bg-status-success-bg/60 border-status-success-fg/25 text-status-success-fg"
                    : "bg-white/40 border-bone-300/55 text-ink-300/55"
                }`}
              >
                {done && <Check className="h-2.5 w-2.5" strokeWidth={2.5} />}
                {label}
              </span>
            );
          })}
        </div>

        <span className="btn-glass-signal inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-medium shrink-0 self-end md:self-auto">
          Continue
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
        </span>
      </div>
    </Link>
  );
}
