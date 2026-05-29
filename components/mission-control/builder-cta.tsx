"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, Box, Server, Network } from "lucide-react";

/**
 * AI Builder CTA — sits at the top of Mission Control as the hero entry to
 * the AI-driven project creation flow. Signal-tinted glass so brand presence
 * is unmistakable; copy frames it as the fastest path from brief → 3D room.
 */
export function BuilderCTA() {
  return (
    <Link
      href="/builder"
      className="glass-signal hover-glass group relative rounded-[20px] block p-5 md:p-6 overflow-hidden transition-transform hover:-translate-y-px"
    >
      {/* Decorative orbs */}
      <span
        aria-hidden
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-signal-500/20 blur-3xl pointer-events-none"
      />
      <span
        aria-hidden
        className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-signal-300/15 blur-3xl pointer-events-none"
      />

      <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start gap-4 min-w-0">
          <span className="h-11 w-11 rounded-2xl bg-white/65 backdrop-blur-md border border-white/70 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.9),0_2px_8px_-2px_rgba(255,90,31,0.25)]">
            <Sparkles className="h-5 w-5 text-signal-700" strokeWidth={2.25} />
          </span>
          <div className="min-w-0">
            <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-signal-700 font-medium">
              AI Builder
            </div>
            <h3 className="mt-0.5 text-[18px] md:text-[20px] font-medium text-ink-300 leading-tight tracking-[-0.014em]">
              From brief to launched project — in five minutes.
            </h3>
            <p className="mt-1.5 text-[13px] text-ink-300/70 leading-snug max-w-[640px]">
              Tell the AI a room, capacity and tier. It picks devices from your real catalog, stacks the rack, draws the signal flow, and creates the project. You land in the 3D room with everything wired.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-stretch md:items-end gap-2 shrink-0">
          <span className="btn-glass-signal inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full text-[13.5px] font-medium">
            Start a build
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
          </span>
          <div className="hidden md:flex items-center gap-3 text-[10.5px] text-ink-300/55 font-mono uppercase tracking-[0.08em]">
            <span className="inline-flex items-center gap-1"><Server className="h-3 w-3" /> rack</span>
            <span className="inline-flex items-center gap-1"><Network className="h-3 w-3" /> flow</span>
            <span className="inline-flex items-center gap-1"><Box className="h-3 w-3" /> 3D</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
