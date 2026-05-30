"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { CheckCircle2, ArrowUpRight, Loader2 } from "lucide-react";
import { formatCompact } from "@/lib/utils";
import { createInvoicePaymentLink } from "@/app/actions/payments";
import type { PortalData } from "../portal-shell";

const STATUS_TONE: Record<string, string> = {
  PAID:    "pill-success",
  SENT:    "pill-info",
  OVERDUE: "pill-danger",
  DRAFT:   "pill-neutral",
  VOID:    "pill-neutral",
};

export function InvoicesTab({
  invoices,
  accountId,
}: {
  invoices: PortalData["invoices"];
  accountId: string;
}) {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const searchParams = useSearchParams();

  // Razorpay redirects back with ?paid=<invoiceId> on success
  useEffect(() => {
    const paid = searchParams.get("paid");
    if (paid) {
      toast.success("Payment received", {
        description: "Thanks — we've updated your invoice. Refresh in a moment to see PAID.",
      });
    }
  }, [searchParams]);

  function startPay(invoiceId: string) {
    setPayingId(invoiceId);
    startTransition(async () => {
      try {
        const r = await createInvoicePaymentLink({
          invoiceId,
          fromAccountId: accountId,
        });
        if (r.ok) {
          // Redirect to the Razorpay hosted page in the same tab
          window.location.href = r.url;
          return;
        }
        toast.error("Couldn't start payment", { description: r.error });
      } catch (err) {
        toast.error("Payment error", {
          description: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
        setPayingId(null);
      }
    });
  }

  if (invoices.length === 0) {
    return (
      <div className="glass-card px-6 py-16 text-center text-[12.5px] text-ink-300/55">
        No invoices issued yet.
      </div>
    );
  }
  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-bone-300/30 bg-white/30">
            <th className="text-left px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-medium w-[110px]">
              Invoice
            </th>
            <th className="text-right px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-medium w-[120px]">
              Amount
            </th>
            <th className="text-left px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-medium w-[120px]">
              Issued
            </th>
            <th className="text-left px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-medium w-[120px]">
              Due
            </th>
            <th className="text-left px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-medium w-[100px]">
              Status
            </th>
            <th className="text-right px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-medium w-[140px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => {
            const isPayable = inv.status === "SENT" || inv.status === "OVERDUE";
            const isPaying = payingId === inv.id;
            return (
              <tr key={inv.id} className="border-b border-bone-300/25 hover:bg-white/40 transition-colors">
                <td className="px-4 py-2.5 font-mono text-ink-300">{inv.number}</td>
                <td className="px-4 py-2.5 text-right font-mono text-ink-300 font-medium">
                  ${formatCompact(inv.totalCents / 100)}
                </td>
                <td className="px-4 py-2.5 text-ink-300/55">
                  {inv.issuedAt
                    ? inv.issuedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-ink-300/55">
                  {inv.dueAt
                    ? inv.dueAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${
                      STATUS_TONE[inv.status] ?? "pill-neutral"
                    }`}
                  >
                    {inv.status === "PAID" && <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" strokeWidth={2.5} />}
                    {inv.status.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">
                  {isPayable ? (
                    <button
                      type="button"
                      onClick={() => startPay(inv.id)}
                      disabled={isPaying}
                      className="btn-glass-signal inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12px] font-medium disabled:opacity-60"
                    >
                      {isPaying ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Redirecting…
                        </>
                      ) : (
                        <>
                          Pay
                          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
                        </>
                      )}
                    </button>
                  ) : (
                    <a
                      href={`/api/invoices/${inv.id}/pdf?account=${accountId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover-glass inline-flex items-center gap-1 h-8 px-3 rounded-full text-[12px] text-ink-300/65 hover:text-ink-300 border border-transparent"
                    >
                      PDF
                    </a>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
