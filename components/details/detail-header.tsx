"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronLeft, type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export function DetailHeader({
  eyebrow,
  backHref,
  backLabel,
  icon: Icon,
  title,
  subtitle,
  badges,
  actions,
}: {
  eyebrow?: string;
  backHref: string;
  backLabel: string;
  icon: LucideIcon;
  title: ReactNode;
  subtitle?: ReactNode;
  badges?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4"
    >
      <Link
        href={backHref}
        className="inline-flex items-center gap-1 text-xs text-white/45 hover:text-white/80 transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl border border-signal-500/30 bg-signal-500/10 flex items-center justify-center shrink-0">
            <Icon className="h-6 w-6 text-signal-400" strokeWidth={1.6} />
          </div>
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-[11px] uppercase tracking-[0.25em] text-signal-400 font-medium">
                {eyebrow}
              </div>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-semibold tracking-tight leading-tight mt-1">
              {title}
            </h1>
            {subtitle && <div className="text-sm text-white/55 mt-1.5">{subtitle}</div>}
            {badges && <div className="flex flex-wrap items-center gap-2 mt-3">{badges}</div>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </motion.div>
  );
}
