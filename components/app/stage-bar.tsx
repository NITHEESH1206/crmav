"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

/**
 * Stage Bar — the workflow spine UI placed on every spine entity.
 *
 * Spine: Opportunity → Proposal → Project → Rack → Signal Flow → Commissioning → AMC
 *
 * Pass the full set of stages with their state. Optionally provide a
 * `onPromote` handler to render the "Promote to next stage" button.
 */

export type StageState = "done" | "current" | "todo" | "blocked";

export type Stage = {
  key: string;
  label: string;
  state: StageState;
  /** Where clicking the segment takes you (optional). */
  href?: string;
};

export function StageBar({
  stages,
  currentNote,
  nextGate,
  onPromote,
  promoteLabel = "Promote to next stage",
  promoteDisabled,
  className,
}: {
  stages: Stage[];
  currentNote?: string;
  nextGate?: string;
  onPromote?: () => void;
  promoteLabel?: string;
  promoteDisabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg bg-white border border-bone-300/55 p-4", className)}>
      <ol className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
        {stages.map((s, i) => {
          const isLast = i === stages.length - 1;
          return (
            <li key={s.key} className="flex items-center gap-1.5 shrink-0">
              <StageDot state={s.state} label={s.label} />
              {!isLast && (
                <span
                  className={cn(
                    "h-px w-8",
                    s.state === "done" ? "bg-ink-300/55" : "bg-bone-300/65"
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>

      {(currentNote || nextGate || onPromote) && (
        <div className="mt-3 pt-3 border-t border-bone-300/45 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {currentNote && (
              <div className="text-[13px] text-ink-300">
                Currently: <span className="font-medium">{currentNote}</span>
              </div>
            )}
            {nextGate && (
              <div className="text-caption text-ink-300/55 mt-0.5">
                Next gate: {nextGate}
              </div>
            )}
          </div>
          {onPromote && (
            <button
              type="button"
              onClick={onPromote}
              disabled={promoteDisabled}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-[12.5px] font-medium transition-colors shrink-0",
                promoteDisabled
                  ? "bg-bone-100 text-ink-300/45 cursor-not-allowed"
                  : "bg-ink-300 text-bone-100 hover:bg-ink-200"
              )}
            >
              {promoteLabel} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function StageDot({ state, label }: { state: StageState; label: string }) {
  return (
    <div
      className="flex items-center gap-1.5"
      title={`${label} · ${state}`}
    >
      <span
        className={cn(
          "h-5 w-5 rounded-full border flex items-center justify-center text-[10px] font-mono shrink-0",
          state === "done" && "bg-ink-300 border-ink-300 text-bone-100",
          state === "current" && "bg-signal-500 border-signal-500 text-white animate-pulse-soft",
          state === "todo" && "bg-white border-bone-300/75 text-ink-300/45",
          state === "blocked" && "bg-status-warning-bg border-status-warning-fg/40 text-status-warning-fg"
        )}
      >
        {state === "done" ? <Check className="h-3 w-3" strokeWidth={2.5} /> : null}
      </span>
      <span
        className={cn(
          "text-[12px]",
          state === "current" && "text-ink-300 font-medium",
          state === "done" && "text-ink-300/75",
          state === "todo" && "text-ink-300/45",
          state === "blocked" && "text-status-warning-fg"
        )}
      >
        {label}
      </span>
    </div>
  );
}

/** Canonical spine — call with per-entity progress to render a complete bar. */
export const SPINE_STAGES: { key: string; label: string }[] = [
  { key: "opp",   label: "Opportunity" },
  { key: "prop",  label: "Proposal" },
  { key: "proj",  label: "Project" },
  { key: "rack",  label: "Rack" },
  { key: "flow",  label: "Signal Flow" },
  { key: "comm",  label: "Commissioning" },
  { key: "amc",   label: "AMC" },
];

export function buildSpine(currentKey: string, blockedKeys: string[] = []): Stage[] {
  const idx = SPINE_STAGES.findIndex((s) => s.key === currentKey);
  return SPINE_STAGES.map((s, i) => {
    if (blockedKeys.includes(s.key)) {
      return { ...s, state: "blocked" as StageState };
    }
    if (i < idx) return { ...s, state: "done" as StageState };
    if (i === idx) return { ...s, state: "current" as StageState };
    return { ...s, state: "todo" as StageState };
  });
}
