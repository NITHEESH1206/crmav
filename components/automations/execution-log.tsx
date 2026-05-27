"use client";

import { Check, AlertCircle, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SAMPLE_RUNS = [
  {
    id: "r-1",
    automation: "SLA Watchdog",
    entity: "TKT-844 · Marriott NYC",
    outcome: "success",
    at: "14:22",
    detail: "Slack #oncall notified · Aarav P assigned",
  },
  {
    id: "r-2",
    automation: "Low-Stock Reorder",
    entity: "Crestron DM-NVX-360",
    outcome: "success",
    at: "13:51",
    detail: "Draft PO #2156 created to Crestron MEA",
  },
  {
    id: "r-3",
    automation: "Invoice Aging Cascade",
    entity: "INV-4521 · Marriott",
    outcome: "skipped",
    at: "12:00",
    detail: "Recipient opted out of reminders",
  },
  {
    id: "r-4",
    automation: "Procurement Approval",
    entity: "PO #2147 · $84,200",
    outcome: "success",
    at: "11:34",
    detail: "Approval requested from Priya N",
  },
  {
    id: "r-5",
    automation: "Risk Escalation",
    entity: "Hilton Toronto",
    outcome: "failed",
    at: "10:08",
    detail: "Email gateway timeout — retried",
  },
];

const OUTCOME = {
  success: { icon: Check,        tone: "text-status-success-fg" },
  failed:  { icon: AlertCircle,  tone: "text-status-danger-fg" },
  skipped: { icon: MinusCircle,  tone: "text-ink-300/45" },
};

export function ExecutionLog() {
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-bone-300/55 bg-bone-50/60">
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[36px]"></th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Automation
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Entity
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Detail
            </th>
            <th className="text-right px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              When
            </th>
          </tr>
        </thead>
        <tbody>
          {SAMPLE_RUNS.map((r) => {
            const meta = OUTCOME[r.outcome as keyof typeof OUTCOME];
            const Icon = meta.icon;
            return (
              <tr key={r.id} className="border-b border-bone-300/35 hover:bg-bone-50">
                <td className="px-4 py-2 align-top pt-3">
                  <Icon className={cn("h-3.5 w-3.5", meta.tone)} />
                </td>
                <td className="px-4 py-2 text-ink-300 font-medium">{r.automation}</td>
                <td className="px-4 py-2 text-ink-300/75">{r.entity}</td>
                <td className="px-4 py-2 text-ink-300/65 truncate">{r.detail}</td>
                <td className="px-4 py-2 text-right font-mono text-ink-300/55">{r.at}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-4 py-2.5 border-t border-bone-300/45 text-[11px] text-ink-300/55">
        Sample data · live log activates with the job runner.
      </div>
    </div>
  );
}
