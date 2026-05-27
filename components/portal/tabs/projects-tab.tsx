"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { formatCompact } from "@/lib/utils";
import type { PortalData } from "../portal-shell";

export function ProjectsTab({ projects }: { projects: PortalData["projects"] }) {
  if (projects.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center text-[12.5px] text-ink-300/55">
        No projects yet.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {projects.map((p) => {
        const done = p.milestones.filter((m) => m.done).length;
        return (
          <article key={p.id} className="rounded-lg bg-white border border-bone-300/55 p-4">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[14px] font-semibold text-ink-300">{p.name}</h3>
                <div className="text-[12px] text-ink-300/55 mt-0.5">
                  {p.phase.toLowerCase()} · {p.counts.rooms} rooms · {p.counts.drawings} documents
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
                  Contract value
                </div>
                <div className="font-display text-heading-md tracking-tight text-ink-300 mt-0.5">
                  ${formatCompact(p.contractValueCents / 100)}
                </div>
              </div>
            </header>

            <div className="mt-4">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[11px] text-ink-300/65">{p.progress}% complete</span>
                <span className="text-[11px] text-ink-300/45">
                  {p.dueDate
                    ? `Due ${p.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : "—"}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-bone-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-ink-300 transition-all"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>

            {/* Milestones */}
            <div className="mt-4 pt-4 border-t border-bone-300/45">
              <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold mb-2">
                Milestones · {done}/{p.milestones.length}
              </div>
              {p.milestones.length === 0 ? (
                <div className="text-[12px] text-ink-300/45 italic">No milestones published.</div>
              ) : (
                <ul className="space-y-1.5">
                  {p.milestones.map((m) => (
                    <li key={m.id} className="flex items-center gap-2 text-[12.5px]">
                      {m.done ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-status-success-fg shrink-0" />
                      ) : (
                        <Circle className="h-3.5 w-3.5 text-ink-300/35 shrink-0" />
                      )}
                      <span className={m.done ? "text-ink-300/65 line-through" : "text-ink-300"}>
                        {m.name}
                      </span>
                      {m.dueDate && (
                        <span className="ml-auto text-[11px] text-ink-300/45">
                          {m.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}
