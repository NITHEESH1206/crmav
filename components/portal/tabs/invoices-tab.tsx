"use client";

import { toast } from "sonner";
import { formatCompact } from "@/lib/utils";
import type { PortalData } from "../portal-shell";

const STATUS_TONE: Record<string, string> = {
  PAID:    "pill-success",
  SENT:    "pill-info",
  OVERDUE: "pill-danger",
  DRAFT:   "pill-neutral",
  VOID:    "pill-neutral",
};

export function InvoicesTab({ invoices }: { invoices: PortalData["invoices"] }) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center text-[12.5px] text-ink-300/55">
        No invoices issued yet.
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-bone-300/55 bg-bone-50/60">
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[110px]">
              Invoice
            </th>
            <th className="text-right px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[120px]">
              Amount
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[120px]">
              Issued
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[120px]">
              Due
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[100px]">
              Status
            </th>
            <th className="text-right px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[120px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id} className="border-b border-bone-300/35 hover:bg-bone-50">
              <td className="px-4 py-2 font-mono text-ink-300">{inv.number}</td>
              <td className="px-4 py-2 text-right font-mono text-ink-300 font-medium">
                ${formatCompact(inv.totalCents / 100)}
              </td>
              <td className="px-4 py-2 text-ink-300/55">
                {inv.issuedAt
                  ? inv.issuedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "—"}
              </td>
              <td className="px-4 py-2 text-ink-300/55">
                {inv.dueAt
                  ? inv.dueAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                  : "—"}
              </td>
              <td className="px-4 py-2">
                <span
                  className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] ${
                    STATUS_TONE[inv.status] ?? "pill-neutral"
                  }`}
                >
                  {inv.status.toLowerCase()}
                </span>
              </td>
              <td className="px-4 py-2 text-right">
                {inv.status === "SENT" || inv.status === "OVERDUE" ? (
                  <button
                    type="button"
                    onClick={() =>
                      toast.info("Pay flow", {
                        description: "Stripe-hosted payment lands when keys are wired.",
                      })
                    }
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-ink-300 text-bone-100 text-[12px] font-medium hover:bg-ink-200"
                  >
                    Pay
                  </button>
                ) : (
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      toast.info("Download", { description: "Invoice PDF generation pending." });
                    }}
                    className="inline-flex items-center gap-1 text-[12px] text-ink-300/65 hover:text-ink-300"
                  >
                    PDF
                  </a>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
