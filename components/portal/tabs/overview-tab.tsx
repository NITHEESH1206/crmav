"use client";

import { ArrowRight, CheckCircle2, AlertCircle, FileSignature } from "lucide-react";
import { formatCompact } from "@/lib/utils";
import { SignProposalButton } from "../sign-proposal";
import type { PortalData, PortalTab } from "../portal-shell";

export function OverviewTab({
  data,
  onJump,
}: {
  data: PortalData;
  onJump: (t: PortalTab) => void;
}) {
  const primaryContact = data.contacts[0];
  const pendingProposals = data.proposals.filter((p) => p.status !== "SIGNED");

  // "Awaiting action" — synthesised from overdue invoices and projects waiting for client review
  const actions: { label: string; detail: string; cta: string; jump: PortalTab }[] = [];
  if (data.snapshot.outstandingCount > 0) {
    actions.push({
      label: "Open invoices",
      detail: `$${formatCompact(data.snapshot.outstandingCents / 100)} across ${data.snapshot.outstandingCount} invoice${data.snapshot.outstandingCount === 1 ? "" : "s"}`,
      cta: "Review & pay",
      jump: "invoices",
    });
  }
  const activeProjectsList = data.projects.filter(
    (p) => p.phase !== "CLOSED" && p.phase !== "HANDOVER"
  );

  return (
    <div className="space-y-6">
      {/* Hero strip */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Stat label="Active projects" value={data.snapshot.activeProjects.toString()} />
        <Stat
          label="Outstanding"
          value={`$${formatCompact(data.snapshot.outstandingCents / 100)}`}
          hint={`${data.snapshot.outstandingCount} invoices`}
        />
        <Stat label="Open tickets" value={data.snapshot.openTickets.toString()} />
        <Stat label="AMC contracts" value={data.snapshot.amcCount.toString()} />
      </section>

      {/* Awaiting action */}
      {actions.length > 0 && (
        <section className="rounded-lg bg-white border border-bone-300/55">
          <header className="px-4 py-2.5 border-b border-bone-300/45">
            <h2 className="text-[13px] font-semibold text-ink-300">Awaiting your action</h2>
          </header>
          <ul className="divide-y divide-bone-300/35">
            {actions.map((a, i) => (
              <li key={i} className="px-4 py-3 flex items-center gap-3">
                <AlertCircle className="h-4 w-4 text-status-warning-fg shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-ink-300">{a.label}</div>
                  <div className="text-[11.5px] text-ink-300/55 mt-0.5">{a.detail}</div>
                </div>
                <button
                  type="button"
                  onClick={() => onJump(a.jump)}
                  className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-ink-300 text-bone-100 text-[12px] font-medium hover:bg-ink-200"
                >
                  {a.cta}
                  <ArrowRight className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Proposals awaiting signature */}
      {data.proposals.length > 0 && (
        <section className="glass-card overflow-hidden">
          <header className="px-4 py-2.5 border-b border-bone-300/40 flex items-center gap-2">
            <FileSignature className="h-3.5 w-3.5 text-signal-700" />
            <h2 className="text-[13px] font-semibold text-ink-300">Proposals</h2>
            {pendingProposals.length > 0 && (
              <span className="font-mono text-[10px] text-signal-700 px-1.5 py-0.5 rounded-md bg-signal-500/10 border border-signal-500/20">
                {pendingProposals.length} to sign
              </span>
            )}
          </header>
          <ul className="divide-y divide-bone-300/25">
            {data.proposals.map((p) => (
              <li key={p.quoteId} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-ink-300 truncate">
                    {p.opportunityName}
                    <span className="ml-2 font-mono text-[11px] text-ink-300/45">{p.number}</span>
                  </div>
                  <div className="text-[11.5px] text-ink-300/55 mt-0.5">
                    ${formatCompact(p.totalCents / 100)}
                    {p.status === "SIGNED" && p.signedByName && (
                      <span className="ml-1.5 text-status-success-fg">
                        · signed by {p.signedByName}
                      </span>
                    )}
                  </div>
                </div>
                <SignProposalButton
                  proposal={{
                    quoteId: p.quoteId,
                    number: p.number,
                    totalCents: p.totalCents,
                    status: p.status,
                    signedByName: p.signedByName,
                    signedAt: p.signedAt,
                  }}
                  accountId={data.account.id}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Active projects */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[13px] font-semibold text-ink-300">Active projects</h2>
          <button
            type="button"
            onClick={() => onJump("projects")}
            className="text-[11.5px] text-ink-300/65 hover:text-ink-300 inline-flex items-center gap-0.5"
          >
            View all
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
        {activeProjectsList.length === 0 ? (
          <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-10 text-center text-[12.5px] text-ink-300/55">
            No active projects right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeProjectsList.slice(0, 4).map((p) => (
              <article key={p.id} className="rounded-lg bg-white border border-bone-300/55 p-4">
                <div className="text-[13px] font-semibold text-ink-300">{p.name}</div>
                <div className="text-[11.5px] text-ink-300/55 mt-0.5">
                  {p.phase.toLowerCase()} · {p.progress}% complete
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-bone-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-ink-300 transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
                <div className="mt-3 text-[11.5px] text-ink-300/65">
                  {p.dueDate
                    ? `Due ${p.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : "No due date set"}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Account team */}
      {primaryContact && (
        <section className="rounded-lg bg-white border border-bone-300/55 px-4 py-3 flex items-center gap-3">
          <CheckCircle2 className="h-4 w-4 text-status-success-fg shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] text-ink-300">
              Your account team is led by{" "}
              <span className="font-semibold">
                {primaryContact.firstName} {primaryContact.lastName}
              </span>
              {primaryContact.title && (
                <span className="text-ink-300/55"> · {primaryContact.title}</span>
              )}
            </div>
            {primaryContact.email && (
              <a
                href={`mailto:${primaryContact.email}`}
                className="text-[11.5px] text-ink-300/65 hover:text-ink-300 underline-offset-2 hover:underline"
              >
                {primaryContact.email}
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 p-4">
      <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
        {label}
      </div>
      <div className="font-display text-display-lg tracking-tight text-ink-300 mt-1 leading-none">
        {value}
      </div>
      {hint && <div className="text-[11px] text-ink-300/55 mt-1">{hint}</div>}
    </div>
  );
}
