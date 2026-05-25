"use server";

import { prisma } from "@/lib/prisma";

export type DetailKind = "opportunity" | "project" | "ticket" | "account";

export async function getDetail(kind: DetailKind, id: string) {
  switch (kind) {
    case "opportunity": {
      const o = await prisma.opportunity.findUnique({
        where: { id },
        include: { account: true, owner: true, quote: true },
      });
      if (!o) return null;
      return {
        kind: "opportunity" as const,
        title: o.name,
        subtitle: o.account?.name ?? null,
        fields: [
          { label: "Stage", value: o.stage.replace("_", " ").toLowerCase() },
          { label: "Value", value: `$${(o.valueCents / 100).toLocaleString()}` },
          { label: "AI score", value: o.aiScore != null ? `${o.aiScore}/100` : "—" },
          { label: "Probability", value: `${o.probability}%` },
          { label: "Owner", value: o.owner?.name ?? "Unassigned" },
          { label: "Expected close", value: o.expectedClose?.toLocaleDateString() ?? "—" },
          { label: "Created", value: o.createdAt.toLocaleDateString() },
        ],
        description: o.quote ? `Quote ${o.quote.number} · ${o.quote.status}` : null,
      };
    }
    case "project": {
      const p = await prisma.project.findUnique({
        where: { id },
        include: {
          account: true,
          rooms: true,
          boqItems: { include: { catalogItem: true } },
          milestones: { orderBy: { position: "asc" } },
          technicians: { include: { user: true } },
        },
      });
      if (!p) return null;
      const boqTotal = p.boqItems.reduce((s, b) => s + b.quantity * b.unitPriceCents, 0);
      const boqCost = p.boqItems.reduce(
        (s, b) => s + (b.catalogItem?.costCents ?? 0) * b.quantity,
        0
      );
      const margin =
        p.contractValueCents > 0
          ? Math.round(((p.contractValueCents - boqCost) / p.contractValueCents) * 100)
          : 0;
      return {
        kind: "project" as const,
        title: p.name,
        subtitle: p.account?.name ?? null,
        fields: [
          { label: "Phase", value: p.phase.toLowerCase() },
          { label: "Progress", value: `${p.progress}%` },
          { label: "Contract value", value: `$${(p.contractValueCents / 100).toLocaleString()}` },
          { label: "BOQ value", value: `$${(boqTotal / 100).toLocaleString()}` },
          { label: "Est. margin", value: `${margin}%` },
          { label: "Risk", value: p.riskLevel.toLowerCase() },
          { label: "Due", value: p.dueDate?.toLocaleDateString() ?? "—" },
          { label: "Rooms", value: `${p.rooms.length}` },
        ],
        description: null,
        related: {
          BOQ: p.boqItems.map((b) => ({
            label: b.description,
            meta: `${b.quantity}× · $${(b.unitPriceCents / 100).toLocaleString()}`,
          })),
          Milestones: p.milestones.map((m) => ({
            label: m.name,
            meta: m.done ? "Done" : m.dueDate?.toLocaleDateString() ?? "—",
          })),
          Crew: p.technicians.map((t) => ({
            label: t.user.name,
            meta: t.role ?? "Technician",
          })),
        },
      };
    }
    case "ticket": {
      const t = await prisma.serviceTicket.findUnique({
        where: { id },
        include: { account: true, project: true, assignee: true, amc: true },
      });
      if (!t) return null;
      return {
        kind: "ticket" as const,
        title: t.title,
        subtitle: `${t.number} · ${t.account?.name ?? ""}`,
        fields: [
          { label: "Status", value: t.status.replace("_", " ").toLowerCase() },
          { label: "Priority", value: t.priority },
          { label: "Account", value: t.account?.name ?? "—" },
          { label: "Project", value: t.project?.name ?? "—" },
          { label: "Assignee", value: t.assignee?.name ?? "Unassigned" },
          { label: "AMC contract", value: t.amc?.name ?? "—" },
          { label: "SLA due", value: t.slaDueAt?.toLocaleString() ?? "—" },
          { label: "Created", value: t.createdAt.toLocaleString() },
          { label: "Resolved", value: t.resolvedAt?.toLocaleString() ?? "—" },
        ],
        description: t.description ?? null,
      };
    }
    case "account": {
      const a = await prisma.account.findUnique({
        where: { id },
        include: {
          contacts: { take: 5 },
          projects: { take: 5 },
          subscriptions: true,
          _count: { select: { contacts: true, projects: true, invoices: true, tickets: true } },
        },
      });
      if (!a) return null;
      return {
        kind: "account" as const,
        title: a.name,
        subtitle: a.tier.toLowerCase(),
        fields: [
          { label: "Tier", value: a.tier.toLowerCase() },
          { label: "Lifetime value", value: `$${(a.ltvCents / 100).toLocaleString()}` },
          { label: "Health", value: `${a.healthScore}%` },
          { label: "Industry", value: a.industry ?? "—" },
          { label: "Website", value: a.website ?? "—" },
          { label: "Contacts", value: `${a._count.contacts}` },
          { label: "Projects", value: `${a._count.projects}` },
          { label: "Tickets", value: `${a._count.tickets}` },
        ],
        description: null,
        related: {
          Contacts: a.contacts.map((c) => ({
            label: `${c.firstName} ${c.lastName}`,
            meta: c.title ?? c.email ?? "—",
          })),
          Projects: a.projects.map((p) => ({
            label: p.name,
            meta: `${p.phase.toLowerCase()} · $${(p.contractValueCents / 100).toLocaleString()}`,
          })),
          Subscriptions: a.subscriptions.map((s) => ({
            label: s.plan,
            meta: `$${(s.monthlyCents / 100).toLocaleString()}/mo`,
          })),
        },
      };
    }
  }
}
