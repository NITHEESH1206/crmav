"use client";

import Link from "next/link";
import { Boxes, ArrowRight, ArrowLeft, Check, ExternalLink, AlertCircle } from "lucide-react";

export function CatalogStep({
  catalogCount,
  onContinue,
  onBack,
}: {
  catalogCount: number;
  onContinue: () => void;
  onBack: () => void;
}) {
  const seeded = catalogCount > 0;

  return (
    <div className="glass-card p-7 md:p-10">
      <div className="flex items-center gap-3 mb-7">
        <span className="h-11 w-11 rounded-2xl bg-signal-500/15 border border-signal-500/25 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
          <Boxes className="h-5 w-5 text-signal-700" strokeWidth={2} />
        </span>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-300/55">
            Step 2 of 5
          </div>
          <h2 className="text-[22px] md:text-[24px] font-medium tracking-[-0.014em] text-ink-300 leading-tight">
            Your AV catalog
          </h2>
        </div>
      </div>

      {seeded ? (
        <div className="space-y-5">
          <div className="rounded-2xl bg-status-success-bg/60 border border-status-success-fg/20 p-5">
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-status-success-fg/15 flex items-center justify-center">
                <Check className="h-4 w-4 text-status-success-fg" strokeWidth={2.5} />
              </span>
              <div>
                <div className="text-[15px] font-medium text-ink-300">
                  {catalogCount.toLocaleString()} products ready
                </div>
                <div className="text-[12.5px] text-ink-300/65 mt-0.5">
                  Real SKUs across the major brands — Crestron, Q-SYS, Extron, Biamp, Shure, Bose, Samsung, Lumens, and more.
                </div>
              </div>
            </div>
          </div>

          <p className="text-[14.5px] text-ink-300/75 leading-[1.55]">
            The AI Builder will pick equipment from this catalog when designing rooms. You can browse the full list, add more products, or extend brands from{" "}
            <Link
              href="/catalog"
              className="text-signal-700 hover:text-signal-800 font-medium inline-flex items-center gap-0.5"
            >
              Catalog
              <ExternalLink className="h-3 w-3" />
            </Link>
            {" "}any time.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="rounded-2xl bg-status-warning-bg/60 border border-status-warning-fg/20 p-5">
            <div className="flex items-start gap-3">
              <span className="h-7 w-7 rounded-full bg-status-warning-fg/15 flex items-center justify-center shrink-0">
                <AlertCircle className="h-4 w-4 text-status-warning-fg" strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-medium text-ink-300">
                  Your catalog is empty
                </div>
                <div className="text-[12.5px] text-ink-300/70 mt-1 leading-snug">
                  The AI Builder needs real products to pick from. Seed ~140 production AV SKUs with one command:
                </div>
                <pre className="mt-3 rounded-xl bg-ink-300 text-bone-100 px-3 py-2 text-[12px] font-mono overflow-x-auto">
                  npx tsx prisma/seed-catalog.ts
                </pre>
                <p className="mt-2 text-[11.5px] text-ink-300/55">
                  Idempotent — safe to re-run. Adds Crestron, Q-SYS, Extron, Biamp, Shure, Sennheiser, Bose, JBL, Yamaha, Samsung, LG, Sony, Lumens, AVer, Logitech, Poly, Yealink, Cisco, Atlona, AVPro Edge, Kramer, Lightware, Middle Atlantic, APC, Furman, NETGEAR.
                </p>
              </div>
            </div>
          </div>
          <p className="text-[13px] text-ink-300/60">
            You can skip ahead and seed later, but the AI Builder won't work until the catalog has products.
          </p>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-bone-300/35 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="hover-glass inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13.5px] text-ink-300/75 hover:text-ink-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="btn-glass-signal inline-flex items-center gap-2 h-10 px-5 rounded-full text-[14px] font-medium"
        >
          Continue
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
