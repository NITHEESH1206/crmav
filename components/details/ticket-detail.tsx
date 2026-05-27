"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LifeBuoy, MessageSquare, Sparkles, Building2, ShieldCheck, FolderKanban } from "lucide-react";
import { DetailHeader } from "@/components/details/detail-header";
import { EditableField, EditableSelect } from "@/components/details/editable-field";
import { StatusPill } from "@/components/details/status-pill";
import { RelatedList } from "@/components/details/related-list";
import { AICard } from "@/components/ai/ai-card";
import { updateTicket } from "@/app/actions/update";

type Ticket = {
  id: string;
  number: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  slaDueAt: Date | null;
  resolvedAt: Date | null;
  createdAt: Date;
  assigneeId: string | null;
  account: { id: string; name: string } | null;
  project: { id: string; name: string } | null;
  assignee: { id: string; name: string } | null;
  amc: { id: string; name: string; tier: string } | null;
};

const STATUS_OPTS = [
  { value: "OPEN", label: "Open", tone: "destructive" as const },
  { value: "IN_PROGRESS", label: "In progress", tone: "warning" as const },
  { value: "SCHEDULED", label: "Scheduled", tone: "info" as const },
  { value: "WAITING", label: "Waiting", tone: "neutral" as const },
  { value: "RESOLVED", label: "Resolved", tone: "success" as const },
  { value: "CLOSED", label: "Closed", tone: "neutral" as const },
];

const PRIORITY_OPTS = [
  { value: "P1", label: "P1 — Urgent", tone: "destructive" as const },
  { value: "P2", label: "P2 — High", tone: "warning" as const },
  { value: "P3", label: "P3 — Normal", tone: "default" as const },
  { value: "P4", label: "P4 — Low", tone: "neutral" as const },
];

export function TicketDetail({ ticket, users }: { ticket: Ticket; users: { id: string; name: string }[] }) {
  return (
    <div className="space-y-6">
      <DetailHeader
        eyebrow={`Ticket ${ticket.number}`}
        backHref="/service"
        backLabel="Back to service desk"
        icon={LifeBuoy}
        title={ticket.title}
        subtitle={
          ticket.account && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {ticket.account.name}
            </span>
          )
        }
        badges={
          <>
            <StatusPill
              value={ticket.status}
              options={STATUS_OPTS}
              onChange={(v) => updateTicket({ id: ticket.id, status: v as typeof ticket.status as never })}
            />
            <StatusPill
              value={ticket.priority}
              options={PRIORITY_OPTS}
              onChange={(v) => updateTicket({ id: ticket.id, priority: v as typeof ticket.priority as never })}
            />
            {ticket.resolvedAt && (
              <Badge variant="success">
                Resolved {ticket.resolvedAt.toLocaleString()}
              </Badge>
            )}
          </>
        }
        actions={
          <>
            <Button variant="secondary" size="sm">
              <MessageSquare className="h-3.5 w-3.5" />
              Reply
            </Button>
            <Button size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              AI summarize
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <EditableField
              label="Title"
              value={ticket.title}
              onSave={(title) => updateTicket({ id: ticket.id, title })}
            />
            <div className="grid grid-cols-2 gap-x-6 gap-y-5">
              <EditableSelect
                label="Assignee"
                value={ticket.assigneeId ?? ""}
                options={[{ value: "", label: "Unassigned" }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
                onSave={(v) => updateTicket({ id: ticket.id, assigneeId: v || null })}
              />
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-300/50">Created</div>
                <div className="mt-1 text-sm text-ink-300/90">{ticket.createdAt.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-300/50">SLA due</div>
                <div className="mt-1 text-sm text-ink-300/90">
                  {ticket.slaDueAt?.toLocaleString() ?? "—"}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-ink-300/50">Account</div>
                <div className="mt-1 text-sm text-ink-300/90">{ticket.account?.name ?? "—"}</div>
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-300/50 mb-2">Description</div>
              <div className="rounded-xl border border-bone-300/55 bg-bone-50/60 p-4 text-sm text-ink-300/85 leading-relaxed min-h-[80px]">
                {ticket.description ?? <span className="text-ink-300/45 italic">No description.</span>}
              </div>
            </div>
          </CardContent>
        </Card>

        <AICard
          title="AI diagnosis"
          description="Root cause and next steps from Claude Opus 4.7"
          endpoint="/api/ai/ticket-summary"
          payload={{ ticketId: ticket.id }}
          cta="Diagnose this ticket"
          initialAutoRun={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RelatedList
          title="Related project"
          icon={FolderKanban}
          items={
            ticket.project
              ? [{ id: ticket.project.id, label: ticket.project.name, href: `/projects/${ticket.project.id}` }]
              : []
          }
        />
        <RelatedList
          title="AMC contract"
          icon={ShieldCheck}
          items={
            ticket.amc
              ? [{ id: ticket.amc.id, label: ticket.amc.name, meta: ticket.amc.tier.toLowerCase() }]
              : []
          }
        />
      </div>
    </div>
  );
}
