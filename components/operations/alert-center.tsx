"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, AlertCircle, Info, Check, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { OpsAlert } from "@/lib/data/operations";

const SEV = {
  critical: { icon: AlertTriangle, tone: "border-status-danger-fg/30 bg-status-danger-bg text-status-danger-fg" },
  warning:  { icon: AlertCircle,   tone: "border-status-warning-fg/30 bg-status-warning-bg text-status-warning-fg" },
  info:     { icon: Info,          tone: "border-status-info-fg/30 bg-status-info-bg text-status-info-fg" },
};

export function AlertCenter({ alerts }: { alerts: OpsAlert[] }) {
  const [snoozed, setSnoozed] = useState<Set<string>>(new Set());

  const visible = alerts.filter((a) => !snoozed.has(a.id));

  return (
    <section className="rounded-lg bg-white border border-bone-300/55 flex flex-col">
      <header className="px-4 py-2.5 border-b border-bone-300/45 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-3.5 w-3.5 text-status-warning-fg" />
          <h3 className="text-[13px] font-semibold text-ink-300">Active alerts</h3>
          <span className="text-[10px] font-mono text-ink-300/55 px-1.5 py-0.5 rounded bg-bone-100">
            {visible.length}
          </span>
        </div>
        <button className="text-[11.5px] text-ink-300/55 hover:text-ink-300">
          Mute all
        </button>
      </header>

      {visible.length === 0 ? (
        <div className="px-6 py-10 text-center text-[12.5px] text-ink-300/55">
          All clear. Nothing's burning right now.
        </div>
      ) : (
        <ul className="divide-y divide-bone-300/35 max-h-[520px] overflow-y-auto">
          {visible.map((a) => {
            const meta = SEV[a.severity];
            const Icon = meta.icon;
            return (
              <li key={a.id} className="px-4 py-3 flex items-start gap-3">
                <span
                  className={cn(
                    "h-6 w-6 rounded-md border flex items-center justify-center shrink-0 mt-0.5",
                    meta.tone
                  )}
                >
                  <Icon className="h-3 w-3" strokeWidth={2} />
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={a.href}
                    className="text-[13px] font-medium text-ink-300 hover:text-signal-600 truncate block"
                  >
                    {a.title}
                  </Link>
                  <div className="text-[11px] text-ink-300/55 mt-0.5 truncate">
                    {a.meta} · {a.raisedAt.toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSnoozed((s) => new Set(s).add(a.id));
                      toast.success("Snoozed for 4h");
                    }}
                    title="Snooze 4h"
                    className="h-6 w-6 rounded text-ink-300/55 hover:text-ink-300 hover:bg-bone-100 flex items-center justify-center"
                  >
                    <Clock className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSnoozed((s) => new Set(s).add(a.id));
                      toast.success("Acknowledged");
                    }}
                    title="Acknowledge"
                    className="h-6 w-6 rounded text-ink-300/55 hover:text-status-success-fg hover:bg-status-success-bg flex items-center justify-center"
                  >
                    <Check className="h-3 w-3" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
