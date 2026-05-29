"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ArrowLeft, Server, Network, Box, Check } from "lucide-react";

export function BuildHandoffStep({
  projectCount,
  onSkip,
  onBack,
}: {
  projectCount: number;
  onSkip: () => void;
  onBack: () => void;
}) {
  const hasProject = projectCount > 0;

  return (
    <div className="glass-card p-7 md:p-10">
      <div className="flex items-center gap-3 mb-7">
        <span className="h-11 w-11 rounded-2xl bg-signal-500/15 border border-signal-500/25 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
          <Sparkles className="h-5 w-5 text-signal-700" strokeWidth={2} />
        </span>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-300/55">
            Step 4 of 5
          </div>
          <h2 className="text-[22px] md:text-[24px] font-medium tracking-[-0.014em] text-ink-300 leading-tight">
            Design your first room
          </h2>
        </div>
      </div>

      {hasProject ? (
        <div className="rounded-2xl bg-status-success-bg/60 border border-status-success-fg/20 p-5 mb-6">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-status-success-fg/15 flex items-center justify-center">
              <Check className="h-4 w-4 text-status-success-fg" strokeWidth={2.5} />
            </span>
            <div>
              <div className="text-[15px] font-medium text-ink-300">
                {projectCount} project{projectCount === 1 ? "" : "s"} already on file
              </div>
              <div className="text-[12.5px] text-ink-300/65 mt-0.5">
                Skip ahead or design another room with the AI Builder.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-[15px] text-ink-300/75 leading-[1.55] mb-6">
          Hand off to the AI Builder. You'll give it a brief — client, room type, capacity, tier — and in about a minute you'll have a project with BOQ, rack layout, signal flow, and a 3D room ready to walk through.
        </p>
      )}

      {/* Glass tile showcasing the three artefacts */}
      <div className="glass-signal rounded-2xl p-5 md:p-6 overflow-hidden relative mb-6">
        <span
          aria-hidden
          className="absolute -top-16 -right-12 w-44 h-44 rounded-full bg-signal-500/25 blur-3xl pointer-events-none"
        />
        <span
          aria-hidden
          className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-signal-300/20 blur-3xl pointer-events-none"
        />
        <div className="relative">
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-signal-700 font-medium mb-2">
            What you'll get
          </div>
          <ul className="space-y-2.5 text-[13.5px] text-ink-300/85">
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-md bg-white/65 border border-white/70 flex items-center justify-center shrink-0 mt-0.5">
                <Server className="h-3 w-3 text-signal-700" strokeWidth={2} />
              </span>
              A deterministic rack layout — Power → Network → Encoders → Decoders → Switchers → DSP → Amps → Controllers, U-counted to the smallest standard frame that fits + 4U buffer.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-md bg-white/65 border border-white/70 flex items-center justify-center shrink-0 mt-0.5">
                <Network className="h-3 w-3 text-signal-700" strokeWidth={2} />
              </span>
              A signal flow diagram — sources → distribution → outputs, auto-routed by signal type (HDMI, audio, speaker, network, control).
            </li>
            <li className="flex items-start gap-2.5">
              <span className="h-5 w-5 rounded-md bg-white/65 border border-white/70 flex items-center justify-center shrink-0 mt-0.5">
                <Box className="h-3 w-3 text-signal-700" strokeWidth={2} />
              </span>
              A populated 3D room — every device placed by category (displays on the front wall, ceiling mics in a grid, rack in the corner). Walk around with mouse + scroll.
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-bone-300/35 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="hover-glass inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13.5px] text-ink-300/75 hover:text-ink-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="hover-glass inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13.5px] text-ink-300/65 hover:text-ink-300"
          >
            Skip for now
          </button>
          <Link
            href="/builder?from=welcome"
            className="btn-glass-signal inline-flex items-center gap-2 h-11 px-6 rounded-full text-[14.5px] font-medium"
          >
            Open AI Builder
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </div>
    </div>
  );
}
