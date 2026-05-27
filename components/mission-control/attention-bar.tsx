"use client";

import Link from "next/link";
import { AlertTriangle, Clock, ShoppingCart, FileWarning, Boxes, Shield, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AttentionItem, AttentionKind } from "@/lib/data/mission-control";

const KIND_META: Record<
  AttentionKind,
  { icon: typeof AlertTriangle; tone: string; label: string }
> = {
  "sla-breach": {
    icon: AlertTriangle,
    tone: "border-status-danger-fg/35 bg-status-danger-bg text-status-danger-fg",
    label: "SLA",
  },
  "overdue-invoice": {
    icon: FileWarning,
    tone: "border-status-danger-fg/35 bg-status-danger-bg text-status-danger-fg",
    label: "Overdue",
  },
  "delayed-po": {
    icon: ShoppingCart,
    tone: "border-status-warning-fg/35 bg-status-warning-bg text-status-warning-fg",
    label: "PO delay",
  },
  "low-stock": {
    icon: Boxes,
    tone: "border-status-warning-fg/35 bg-status-warning-bg text-status-warning-fg",
    label: "Low stock",
  },
  "at-risk-project": {
    icon: AlertTriangle,
    tone: "border-status-warning-fg/35 bg-status-warning-bg text-status-warning-fg",
    label: "Risk",
  },
  "amc-expiring": {
    icon: Shield,
    tone: "border-status-info-fg/35 bg-status-info-bg text-status-info-fg",
    label: "AMC",
  },
  "approval-needed": {
    icon: Clock,
    tone: "border-status-info-fg/35 bg-status-info-bg text-status-info-fg",
    label: "Approval",
  },
};

export function AttentionBar({ items }: { items: AttentionItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-bone-300/55 px-4 py-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-status-success-fg/70" />
        <span className="text-[13px] text-ink-300/75">
          All clear. Nothing needs attention right now.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-thin">
      <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-300/55 font-semibold shrink-0 pr-2">
        Attention
      </span>
      {items.map((item) => {
        const meta = KIND_META[item.kind];
        const Icon = meta.icon;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "group inline-flex items-center gap-2 rounded-md border pl-2.5 pr-1.5 py-1.5 text-[12px] shrink-0 transition-all hover:-translate-y-px",
              meta.tone
            )}
          >
            <Icon className="h-3 w-3 shrink-0" strokeWidth={2} />
            <span className="font-medium truncate max-w-[280px]">{item.title}</span>
            <span className="text-current/65 truncate hidden lg:inline max-w-[180px]">
              · {item.meta}
            </span>
            <span className="h-5 w-5 rounded flex items-center justify-center bg-white/50 group-hover:bg-white">
              <ChevronRight className="h-3 w-3" strokeWidth={2} />
            </span>
          </Link>
        );
      })}
    </div>
  );
}
