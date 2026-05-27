"use client";

import { Calendar } from "lucide-react";
import { formatCompact } from "@/lib/utils";
import type { PortalData } from "../portal-shell";

export function AMCsTab({ amcs }: { amcs: PortalData["amcs"] }) {
  if (amcs.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center text-[12.5px] text-ink-300/55">
        No AMC contracts on file.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {amcs.map((a) => {
        const days = Math.max(0, Math.floor((+a.endDate - Date.now()) / 86_400_000));
        const visitsRemaining = Math.max(0, a.visitsTotal - a.visitsUsed);
        return (
          <article key={a.id} className="rounded-lg bg-white border border-bone-300/55 p-4">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-ink-300">{a.name}</h3>
                <div className="text-[12px] text-ink-300/55 mt-0.5">
                  {a.tier.toLowerCase()} · expires{" "}
                  {a.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}{" "}
                  ({days}d)
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
                  MRR
                </div>
                <div className="font-display text-heading-md tracking-tight text-ink-300 mt-0.5">
                  ${formatCompact(a.monthlyValueCents / 100)}/mo
                </div>
              </div>
            </header>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-[12px]">
              <KV label="Started" value={a.startDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })} />
              <KV label="Visits used" value={`${a.visitsUsed} / ${a.visitsTotal}`} />
              <KV label="Visits remaining" value={visitsRemaining.toString()} />
              <KV
                label="Days remaining"
                value={`${days}d`}
                tone={days < 30 ? "warn" : days < 90 ? "info" : "ok"}
              />
            </div>

            <div className="mt-4 pt-4 border-t border-bone-300/45 flex items-center gap-2 text-[11.5px] text-ink-300/65">
              <Calendar className="h-3.5 w-3.5" />
              Next preventive visit will be scheduled by your account team — check the calendar tab in your inbox.
            </div>
          </article>
        );
      })}
    </div>
  );
}

function KV({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "ok" | "warn" | "info";
}) {
  const colour =
    tone === "warn"
      ? "text-status-warning-fg"
      : tone === "info"
        ? "text-status-info-fg"
        : "text-ink-300";
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
        {label}
      </div>
      <div className={`font-display text-heading-sm tracking-tight mt-0.5 ${colour}`}>
        {value}
      </div>
    </div>
  );
}
