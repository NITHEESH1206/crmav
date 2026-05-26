"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCompact } from "@/lib/utils";

const STAGE_META: Record<string, { label: string; color: string; width: number }> = {
  DISCOVERY: { label: "Discovery", color: "from-signal-300/40 to-signal-300/10", width: 100 },
  SITE_SURVEY: { label: "Site Survey", color: "from-signal-400/50 to-signal-400/10", width: 84 },
  PROPOSAL: { label: "Proposal", color: "from-signal-500/60 to-signal-500/10", width: 68 },
  NEGOTIATION: { label: "Negotiation", color: "from-signal-600/70 to-signal-600/10", width: 52 },
  CLOSED_WON: { label: "Closed Won", color: "from-signal-700/80 to-signal-700/10", width: 36 },
};

type Stage = { stage: string; count: number; valueCents: number };

export function PipelineFunnel({ stages }: { stages: Stage[] }) {
  // Keep the canonical visual order
  const order = ["DISCOVERY", "SITE_SURVEY", "PROPOSAL", "NEGOTIATION", "CLOSED_WON"];
  const ordered = order
    .map((s) => stages.find((x) => x.stage === s) ?? { stage: s, count: 0, valueCents: 0 })
    .filter((s) => STAGE_META[s.stage]);
  const total = ordered.reduce((s, x) => s + x.valueCents, 0);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Sales pipeline</CardTitle>
          <p className="text-xs text-white/45 mt-1">By stage · last 30 days</p>
        </div>
        <Badge>${formatCompact(total / 100)}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {ordered.map((s, i) => {
          const meta = STAGE_META[s.stage]!;
          return (
            <motion.div
              key={s.stage}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-white/75 font-medium">{meta.label}</span>
                  <span className="text-white/35">{s.count}</span>
                </div>
                <span className="text-white/55 font-mono">${formatCompact(s.valueCents / 100)}</span>
              </div>
              <div className="relative h-7 rounded-md bg-white/[0.02] border border-white/[0.04] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${meta.width}%` }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.21, 0.47, 0.32, 0.98] }}
                  className={`h-full rounded-md bg-gradient-to-r ${meta.color} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-shine bg-[length:200%_100%] opacity-30 animate-shimmer" />
                </motion.div>
              </div>
            </motion.div>
          );
        })}
      </CardContent>
    </Card>
  );
}
