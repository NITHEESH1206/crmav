"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle2,
  FileText,
  ShoppingCart,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

type Item = {
  kind: "po" | "ticket" | "project" | "opp";
  title: string;
  meta: string;
  at: Date;
};

const KIND_ICON: Record<Item["kind"], LucideIcon> = {
  po: ShoppingCart,
  ticket: Wrench,
  project: CheckCircle2,
  opp: FileText,
};

const KIND_ACCENT: Record<Item["kind"], string> = {
  po: "from-aether-400 to-aether-600",
  ticket: "from-sky-400 to-sky-600",
  project: "from-emerald-400 to-emerald-600",
  opp: "from-violet-400 to-violet-600",
};

export function ActivityTimeline({ items }: { items: Item[] }) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Activity</CardTitle>
          <p className="text-xs text-white/45 mt-1">Across all modules · live data</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Streaming
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-px bg-gradient-to-b from-aether-500/40 via-white/[0.06] to-transparent" />
          <div className="space-y-4">
            {items.length === 0 && (
              <div className="text-xs text-white/40 text-center py-8">No recent activity.</div>
            )}
            {items.map((a, i) => {
              const Icon = KIND_ICON[a.kind];
              return (
                <motion.div
                  key={`${a.kind}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.05 }}
                  className="relative flex items-start gap-3 pl-1"
                >
                  <div
                    className={cn(
                      "relative z-10 h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-glow-sm",
                      KIND_ACCENT[a.kind]
                    )}
                  >
                    <Icon className="h-4 w-4 text-white" strokeWidth={2.2} />
                  </div>
                  <div className="min-w-0 flex-1 pt-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium truncate">{a.title}</div>
                      <div className="text-[10px] text-white/40 shrink-0">
                        {formatDistanceToNow(a.at, { addSuffix: true })}
                      </div>
                    </div>
                    <div className="text-[12px] text-white/50 mt-0.5">{a.meta}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
