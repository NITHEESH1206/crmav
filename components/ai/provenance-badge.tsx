"use client";

import { Sparkles, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ProvenanceBadge — non-removable label on every AI-generated artefact.
 * Required by the design spec: shows model + reviewer (if any) + date, with a
 * "View source" link that opens the full transcript.
 */
export function ProvenanceBadge({
  reviewedBy,
  date,
  onViewSource,
  className,
}: {
  reviewedBy?: string;
  date: Date | string;
  onViewSource?: () => void;
  className?: string;
}) {
  const dateStr =
    typeof date === "string"
      ? date
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md bg-signal-500/8 border border-signal-500/20 px-2 py-0.5 text-[10.5px] text-signal-700 font-medium",
        className
      )}
    >
      <Sparkles className="h-2.5 w-2.5" strokeWidth={2} />
      <span>AI-generated</span>
      {reviewedBy && (
        <>
          <span className="text-signal-700/50">·</span>
          <span>Reviewed by {reviewedBy}</span>
        </>
      )}
      <span className="text-signal-700/50">·</span>
      <span className="font-mono">{dateStr}</span>
      {onViewSource && (
        <>
          <span className="text-signal-700/50">·</span>
          <button
            type="button"
            onClick={onViewSource}
            className="inline-flex items-center gap-0.5 hover:text-signal-800"
          >
            <Eye className="h-2.5 w-2.5" />
            Source
          </button>
        </>
      )}
    </div>
  );
}
