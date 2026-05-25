"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Download, Filter } from "lucide-react";
import { type ReactNode } from "react";
import { useQuickCreate } from "@/lib/stores/quick-create";

type Kind = "todo" | "opportunity" | "ticket" | "project";

const PATH_TO_KIND: Record<string, Kind> = {
  "/opportunities": "opportunity",
  "/projects": "project",
  "/service": "ticket",
  "/todos": "todo",
};

export function ModuleShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const showQuickCreate = useQuickCreate((s) => s.show);
  const matchedKind = Object.entries(PATH_TO_KIND).find(([p]) => pathname.startsWith(p))?.[1];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <div>
          {eyebrow && (
            <div className="text-[11px] uppercase tracking-[0.25em] text-aether-400 font-medium">
              {eyebrow}
            </div>
          )}
          <h1 className="mt-1 font-display text-3xl sm:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
          {description && <p className="mt-1.5 text-sm text-white/45 max-w-2xl">{description}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {actions ?? (
            <>
              <Button variant="secondary" size="sm">
                <Filter className="h-3.5 w-3.5" />
                Filters
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
              {matchedKind && (
                <Button size="sm" onClick={() => showQuickCreate(matchedKind)}>
                  <Plus className="h-3.5 w-3.5" />
                  Create
                </Button>
              )}
            </>
          )}
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function EmptyHint({ message }: { message: string }) {
  return (
    <div className="rounded-2xl glass-card p-10 text-center">
      <div className="mx-auto w-12 h-12 rounded-2xl bg-aether-500/10 border border-aether-500/20 flex items-center justify-center mb-4">
        <Plus className="h-5 w-5 text-aether-400" />
      </div>
      <p className="text-sm text-white/55">{message}</p>
    </div>
  );
}
