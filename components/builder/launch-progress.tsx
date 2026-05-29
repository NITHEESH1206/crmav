"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Sparkles, ArrowUpRight, Box, FolderKanban, Server, Network, Receipt } from "lucide-react";
import { formatCompact } from "@/lib/utils";

type StepState = "pending" | "active" | "done";

const STEPS = [
  { id: "validating",  label: "Validating plan",   icon: CheckCircle2 },
  { id: "account",     label: "Creating account",  icon: FolderKanban },
  { id: "project",     label: "Creating project",  icon: FolderKanban },
  { id: "boq",         label: "Writing BOQ",       icon: Receipt },
  { id: "rack",        label: "Stacking rack",     icon: Server },
  { id: "flow",        label: "Drawing signal flow", icon: Network },
  { id: "finalize",    label: "Finalising",        icon: Sparkles },
] as const;

export function LaunchProgress({
  status,
  projectId,
  roomId,
  accountId,
  errors,
  totals,
}: {
  status: "running" | "done" | "error";
  projectId?: string;
  roomId?: string;
  accountId?: string;
  errors?: string;
  totals?: { boqLines: number; rackUnits: number; flowNodes: number; boqTotalCents: number };
}) {
  // Mock progress through steps over ~1.2s so users feel the work happening
  const [stepIdx, setStepIdx] = useState(0);
  useEffect(() => {
    if (status !== "running") {
      setStepIdx(STEPS.length); // jump to done
      return;
    }
    const t = setInterval(() => {
      setStepIdx((i) => Math.min(i + 1, STEPS.length - 1));
    }, 200);
    return () => clearInterval(t);
  }, [status]);

  const isDone = status === "done";
  const isError = status === "error";

  return (
    <div className="glass-card p-8 md:p-12">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-signal-700 mb-3">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          Step 3 · Launching
        </div>
        <h2 className="text-[28px] md:text-[36px] font-medium tracking-[-0.02em] text-ink-300 leading-tight">
          {isDone
            ? "Your project is live."
            : isError
              ? "We hit an issue."
              : "Spinning everything up…"}
        </h2>
        {!isDone && !isError && (
          <p className="mt-2 text-[14.5px] text-ink-300/65">
            Hold on — creating the account, project, BOQ, rack and signal flow.
          </p>
        )}
      </div>

      {/* Step list */}
      <ol className="mt-8 max-w-md mx-auto space-y-2">
        {STEPS.map((step, i) => {
          const state: StepState =
            isDone
              ? "done"
              : i < stepIdx
                ? "done"
                : i === stepIdx
                  ? "active"
                  : "pending";
          return (
            <li
              key={step.id}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                state === "active"
                  ? "glass-pill-active"
                  : state === "done"
                    ? "bg-white/30"
                    : "opacity-50"
              }`}
            >
              <span
                className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 ${
                  state === "done"
                    ? "bg-status-success-fg/15 text-status-success-fg"
                    : state === "active"
                      ? "bg-signal-500/15 text-signal-700"
                      : "bg-bone-200/60 text-ink-300/40"
                }`}
              >
                {state === "active" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : state === "done" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.5} />
                ) : (
                  <step.icon className="h-3 w-3" strokeWidth={1.75} />
                )}
              </span>
              <span
                className={`text-[13.5px] flex-1 ${
                  state === "done"
                    ? "text-ink-300/75"
                    : state === "active"
                      ? "text-ink-300 font-medium"
                      : "text-ink-300/55"
                }`}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Done state */}
      {isDone && totals && (
        <div className="mt-9 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-3">
            <DoneStat label="BOQ value" value={`$${formatCompact(totals.boqTotalCents / 100)}`} signal />
            <DoneStat label="BOQ lines" value={totals.boqLines.toString()} />
            <DoneStat label="Rack units" value={totals.rackUnits.toString()} />
            <DoneStat label="Flow nodes" value={totals.flowNodes.toString()} />
          </div>

          <div className="mt-7 flex flex-col gap-2">
            {roomId && (
              <Link
                href={`/rooms/${roomId}`}
                className="btn-glass-signal inline-flex items-center justify-center gap-2 h-11 px-6 rounded-full text-[14.5px] font-medium"
              >
                <Box className="h-4 w-4" strokeWidth={2} />
                Open the 3D room
                <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
              </Link>
            )}
            <div className="grid grid-cols-2 gap-2">
              {projectId && (
                <Link
                  href={`/projects/${projectId}`}
                  className="hover-glass inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13px] text-ink-300/75 hover:text-ink-300"
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  Project hub
                </Link>
              )}
              {accountId && (
                <Link
                  href={`/accounts/${accountId}`}
                  className="hover-glass inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13px] text-ink-300/75 hover:text-ink-300"
                >
                  <FolderKanban className="h-3.5 w-3.5" />
                  Account
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="mt-7 max-w-md mx-auto">
          <div className="rounded-2xl bg-status-danger-bg/60 border border-status-danger-fg/20 p-4">
            <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-status-danger-fg font-medium mb-2">
              What went wrong
            </div>
            <p className="text-[13.5px] text-ink-300/85">{errors ?? "Unknown error"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function DoneStat({ label, value, signal }: { label: string; value: string; signal?: boolean }) {
  return (
    <div className="rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 px-4 py-3">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-medium">
        {label}
      </div>
      <div
        className={`mt-0.5 font-display text-[22px] tracking-[-0.018em] font-medium leading-none ${
          signal ? "text-signal-700" : "text-ink-300"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
