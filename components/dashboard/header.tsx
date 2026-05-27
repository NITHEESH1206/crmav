"use client";

import { motion } from "framer-motion";
import { CalendarDays, Filter, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickCreate } from "@/lib/stores/quick-create";

export function DashboardHeader() {
  const showQuickCreate = useQuickCreate((s) => s.show);
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
    >
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-signal-400 font-medium">
          {greeting}
        </div>
        <h1 className="mt-1.5 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
          Welcome back, Marcus
        </h1>
        <p className="mt-1.5 text-sm text-ink-300/55">
          Here&apos;s what&apos;s happening across your AV operations today.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm">
          <CalendarDays className="h-3.5 w-3.5" />
          Last 30 days
        </Button>
        <Button variant="secondary" size="sm">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </Button>
        <Button variant="secondary" size="sm">
          <Download className="h-3.5 w-3.5" />
          Export
        </Button>
        <Button size="sm" onClick={() => showQuickCreate("project")}>
          <Plus className="h-3.5 w-3.5" />
          New project
        </Button>
      </div>
    </motion.div>
  );
}
