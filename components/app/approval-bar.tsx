"use client";

import { Check, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type Approver = {
  name: string;
  role: string;
  /** `pending` is the next-in-line; `done` already approved; `todo` awaiting earlier. */
  state: "done" | "pending" | "todo" | "rejected";
};

/**
 * ApprovalBar — placed inline at the top of an entity (PO, proposal, invoice)
 * that's awaiting an approval chain. Renders the chain with state, plus action
 * buttons for the current user when they're the next approver.
 */
export function ApprovalBar({
  entityLabel,
  amount,
  chain,
  isCurrentApprover,
  onApprove,
  onReject,
  onRequestChanges,
  className,
}: {
  entityLabel: string;
  amount?: string;
  chain: Approver[];
  isCurrentApprover?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestChanges?: () => void;
  className?: string;
}) {
  const overallDone = chain.every((a) => a.state === "done");
  const anyRejected = chain.some((a) => a.state === "rejected");

  return (
    <div
      className={cn(
        "rounded-lg border px-4 py-3 flex flex-col md:flex-row md:items-center gap-3",
        overallDone
          ? "bg-status-success-bg/40 border-status-success-fg/25"
          : anyRejected
            ? "bg-status-danger-bg border-status-danger-fg/25"
            : "bg-status-warning-bg/60 border-status-warning-fg/25",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] uppercase tracking-[0.14em] font-semibold text-ink-300/55">
          {overallDone ? "Approved" : anyRejected ? "Rejected" : "Awaiting approval"}
        </div>
        <div className="mt-0.5 text-[13px] font-medium text-ink-300 truncate">
          {entityLabel}
          {amount && <span className="ml-2 font-mono text-ink-300/70">· {amount}</span>}
        </div>
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          {chain.map((a, i) => (
            <div key={i} className="flex items-center gap-1">
              <ApproverDot approver={a} />
              {i < chain.length - 1 && <span className="text-ink-300/30">→</span>}
            </div>
          ))}
        </div>
      </div>
      {isCurrentApprover && !overallDone && !anyRejected && (
        <div className="flex items-center gap-1.5 shrink-0">
          {onRequestChanges && (
            <button
              type="button"
              onClick={onRequestChanges}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-white border border-bone-300/65 text-[12.5px] font-medium text-ink-300/75 hover:text-ink-300 hover:border-ink-300/30"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Request changes
            </button>
          )}
          {onReject && (
            <button
              type="button"
              onClick={onReject}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-status-danger-fg/35 bg-white text-[12.5px] font-medium text-status-danger-fg hover:bg-status-danger-bg"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
          )}
          {onApprove && (
            <button
              type="button"
              onClick={onApprove}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-ink-300 text-bone-100 text-[12.5px] font-medium hover:bg-ink-200"
            >
              <Check className="h-3.5 w-3.5" />
              Approve
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ApproverDot({ approver }: { approver: Approver }) {
  const initials = approver.name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      title={`${approver.name} · ${approver.role} · ${approver.state}`}
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium",
        approver.state === "done" && "bg-status-success-bg text-status-success-fg",
        approver.state === "pending" && "bg-ink-300 text-bone-100",
        approver.state === "todo" && "bg-white border border-bone-300/65 text-ink-300/55",
        approver.state === "rejected" && "bg-status-danger-bg text-status-danger-fg"
      )}
    >
      {approver.state === "done" && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
      {approver.state === "rejected" && <X className="h-2.5 w-2.5" strokeWidth={3} />}
      <span className="font-mono text-[9.5px] tracking-wider">{initials}</span>
      <span>{approver.name.split(" ")[0]}</span>
    </span>
  );
}
