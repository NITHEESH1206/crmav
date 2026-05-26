"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  FolderKanban,
  Layers3,
  Boxes,
  Wrench,
  Receipt,
  CheckCircle2,
  Circle,
  Sparkles,
  Building2,
} from "lucide-react";
import { DetailHeader } from "@/components/details/detail-header";
import { EditableField } from "@/components/details/editable-field";
import { StatusPill } from "@/components/details/status-pill";
import { RelatedList } from "@/components/details/related-list";
import { updateProject } from "@/app/actions/update";
import { formatCompact, initials } from "@/lib/utils";

type Project = {
  id: string;
  name: string;
  phase: string;
  status: string;
  contractValueCents: number;
  progress: number;
  riskLevel: string;
  dueDate: Date | null;
  account: { id: string; name: string } | null;
  opportunity: { id: string; name: string } | null;
  rooms: { id: string; name: string; roomType: string; _count: { devices: number; racks: number; signalFlows: number } }[];
  boqItems: { id: string; description: string; quantity: number; unitPriceCents: number; catalogItem: { name: string; costCents: number } | null }[];
  milestones: { id: string; name: string; done: boolean; dueDate: Date | null }[];
  technicians: { id: string; user: { id: string; name: string }; role: string | null }[];
  tickets: { id: string; number: string; title: string; status: string; priority: string }[];
  invoices: { id: string; number: string; status: string; totalCents: number; issuedAt: Date | null }[];
};

const PHASE_OPTS = [
  { value: "ENGINEERING", label: "Engineering", tone: "info" as const },
  { value: "PROCUREMENT", label: "Procurement", tone: "default" as const },
  { value: "INSTALLATION", label: "Installation", tone: "warning" as const },
  { value: "COMMISSIONING", label: "Commissioning", tone: "default" as const },
  { value: "HANDOVER", label: "Handover", tone: "success" as const },
  { value: "CLOSED", label: "Closed", tone: "neutral" as const },
];

const RISK_OPTS = [
  { value: "LOW", label: "Low risk", tone: "success" as const },
  { value: "MEDIUM", label: "Medium risk", tone: "warning" as const },
  { value: "HIGH", label: "High risk", tone: "destructive" as const },
];

export function ProjectDetail({ project }: { project: Project }) {
  const boqTotal = project.boqItems.reduce((s, b) => s + b.quantity * b.unitPriceCents, 0);
  const boqCost = project.boqItems.reduce(
    (s, b) => s + (b.catalogItem?.costCents ?? 0) * b.quantity,
    0
  );
  const margin =
    project.contractValueCents > 0
      ? Math.round(((project.contractValueCents - boqCost) / project.contractValueCents) * 100)
      : 0;

  const doneMilestones = project.milestones.filter((m) => m.done).length;

  return (
    <div className="space-y-6">
      <DetailHeader
        eyebrow="Project"
        backHref="/projects"
        backLabel="Back to projects"
        icon={FolderKanban}
        title={project.name}
        subtitle={
          project.account && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {project.account.name}
            </span>
          )
        }
        badges={
          <>
            <StatusPill
              value={project.phase}
              options={PHASE_OPTS}
              onChange={(v) => updateProject({ id: project.id, phase: v as typeof project.phase as never })}
            />
            <StatusPill
              value={project.riskLevel}
              options={RISK_OPTS}
              onChange={(v) => updateProject({ id: project.id, riskLevel: v as typeof project.riskLevel as never })}
            />
            <Badge variant="secondary">${formatCompact(project.contractValueCents / 100)}</Badge>
            <Badge variant="success">{margin}% margin</Badge>
          </>
        }
      />

      {/* Progress strip */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">Project progress</div>
              <div className="font-display text-3xl font-semibold tracking-tight">{project.progress}%</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-white/40">Milestones</div>
              <div className="font-display text-3xl font-semibold tracking-tight">
                {doneMilestones}<span className="text-white/40">/{project.milestones.length || "—"}</span>
              </div>
            </div>
          </div>
          <Progress value={project.progress} className="h-2" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5">
            <EditableField
              label="Project name"
              value={project.name}
              onSave={(name) => updateProject({ id: project.id, name })}
            />
            <EditableField
              label="Contract value (USD)"
              value={project.contractValueCents / 100}
              kind="money"
              displayValue={`$${(project.contractValueCents / 100).toLocaleString()}`}
              onSave={(v) =>
                updateProject({ id: project.id, contractValueCents: Math.round(parseFloat(v) * 100) })
              }
            />
            <EditableField
              label="Progress (%)"
              value={project.progress}
              kind="number"
              displayValue={`${project.progress}%`}
              onSave={(v) => updateProject({ id: project.id, progress: parseInt(v, 10) })}
            />
            <EditableField
              label="Due date"
              value={project.dueDate ? project.dueDate.toISOString().slice(0, 10) : ""}
              kind="date"
              displayValue={project.dueDate?.toLocaleDateString() ?? "—"}
              onSave={(v) => updateProject({ id: project.id, dueDate: v || null })}
            />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">BOQ subtotal</div>
              <div className="mt-1 text-sm font-mono">${formatCompact(boqTotal / 100)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">Est. cost</div>
              <div className="mt-1 text-sm font-mono">${formatCompact(boqCost / 100)}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-signal-400" />
              AI suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm text-white/75 leading-relaxed">
            <p>• Margin {margin >= 30 ? "looks healthy" : "is tight — flag any cost overrun > 3%"}.</p>
            <p>• {project.rooms.length} rooms configured — consider rack design for each.</p>
            <p>• Schedule commissioning walkthrough this week.</p>
            <Button variant="secondary" size="sm" className="w-full mt-3">
              Generate full project plan
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle>Milestones</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {project.milestones.length === 0 ? (
            <div className="px-6 pb-6 text-xs text-white/40 italic">No milestones yet.</div>
          ) : (
            <div className="border-t border-white/[0.04]">
              {project.milestones.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.04] last:border-b-0">
                  {m.done ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Circle className="h-4 w-4 text-white/30" />
                  )}
                  <div className="flex-1 text-sm">{m.name}</div>
                  <div className="text-xs text-white/45">
                    {m.dueDate?.toLocaleDateString() ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BOQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers3 className="h-3.5 w-3.5 text-signal-400" />
            Bill of Quantities
            <Badge variant="secondary" className="ml-auto">{project.boqItems.length} lines</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {project.boqItems.length === 0 ? (
            <div className="px-6 pb-6 text-xs text-white/40 italic">
              No BOQ items yet. Generate from /rooms.
            </div>
          ) : (
            <div className="border-t border-white/[0.04]">
              <div className="grid grid-cols-[2fr_60px_100px_100px] text-[10px] uppercase tracking-wider text-white/40 px-6 py-2 border-b border-white/[0.04] bg-white/[0.01]">
                <div>Item</div>
                <div className="text-right">Qty</div>
                <div className="text-right">Unit</div>
                <div className="text-right">Subtotal</div>
              </div>
              {project.boqItems.map((b) => (
                <div key={b.id} className="grid grid-cols-[2fr_60px_100px_100px] px-6 py-2.5 border-b border-white/[0.04] last:border-b-0 text-sm">
                  <div className="truncate">{b.description}</div>
                  <div className="text-right font-mono">{b.quantity}</div>
                  <div className="text-right font-mono text-white/55">
                    ${(b.unitPriceCents / 100).toLocaleString()}
                  </div>
                  <div className="text-right font-mono">
                    ${((b.quantity * b.unitPriceCents) / 100).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RelatedList
          title="Rooms"
          icon={Layers3}
          items={project.rooms.map((r) => ({
            id: r.id,
            label: r.name,
            meta: `${r.roomType.toLowerCase()} · ${r._count.devices} devices · ${r._count.racks} racks`,
            href: "/rooms",
          }))}
          empty="No rooms yet."
        />
        <RelatedList
          title="Crew"
          icon={Boxes}
          items={project.technicians.map((t) => ({
            id: t.id,
            label: t.user.name,
            meta: t.role ?? "Technician",
            right: (
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-[9px]">{initials(t.user.name)}</AvatarFallback>
              </Avatar>
            ),
          }))}
          empty="No crew assigned yet."
        />
        <RelatedList
          title="Tickets"
          icon={Wrench}
          items={project.tickets.map((t) => ({
            id: t.id,
            label: t.title,
            meta: `${t.number} · ${t.status.toLowerCase()}`,
            href: `/service/${t.id}`,
            badge: { label: t.priority, tone: t.priority === "P1" ? "destructive" : t.priority === "P2" ? "warning" : "secondary" },
          }))}
          empty="No tickets linked."
        />
      </div>

      <RelatedList
        title="Invoices"
        icon={Receipt}
        items={project.invoices.map((i) => ({
          id: i.id,
          label: i.number,
          meta: i.issuedAt?.toLocaleDateString() ?? "—",
          badge: { label: i.status, tone: i.status === "PAID" ? "success" : i.status === "OVERDUE" ? "destructive" : "secondary" },
          right: (
            <span className="text-sm font-mono text-white/85">
              ${formatCompact(i.totalCents / 100)}
            </span>
          ),
        }))}
        empty="No invoices issued yet."
      />
    </div>
  );
}
