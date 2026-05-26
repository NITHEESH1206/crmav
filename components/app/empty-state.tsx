"use client";

import { motion } from "framer-motion";
import { type LucideIcon, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickCreate } from "@/lib/stores/quick-create";
import { cn } from "@/lib/utils";

type Kind = "todo" | "opportunity" | "ticket" | "project";

export function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  ctaKind,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  cta?: string;
  ctaKind?: Kind;
  className?: string;
}) {
  const show = useQuickCreate((s) => s.show);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "relative rounded-3xl border border-white/[0.06] bg-gradient-to-b from-white/[0.02] to-transparent p-12 text-center overflow-hidden",
        className
      )}
    >
      {/* Decorative orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 bg-signal-500/15 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <div className="relative">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 22 }}
          className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-signal-500/20 to-signal-500/[0.04] border border-signal-500/30 flex items-center justify-center shadow-glow-sm"
        >
          <Icon className="h-7 w-7 text-signal-400" strokeWidth={1.6} />
        </motion.div>

        <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-white/55 max-w-md mx-auto leading-relaxed">
          {description}
        </p>

        {cta && ctaKind && (
          <Button
            size="lg"
            className="mt-7"
            onClick={() => show(ctaKind)}
          >
            <Plus className="h-4 w-4" />
            {cta}
          </Button>
        )}

        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-white/35">
          <Sparkles className="h-3 w-3 text-signal-400/60" />
          Tip: press <kbd className="px-1.5 py-0.5 rounded border border-white/[0.08] bg-white/[0.04] font-mono text-[10px]">N</kbd> anywhere to open quick-create
        </div>
      </div>
    </motion.div>
  );
}
