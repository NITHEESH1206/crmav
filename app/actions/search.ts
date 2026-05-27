"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";

export type SearchResultKind =
  | "project"
  | "opportunity"
  | "account"
  | "ticket"
  | "invoice"
  | "po"
  | "device"
  | "room"
  | "catalog"
  | "user";

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  meta: string;
  href: string;
  badge?: string;
};

const LIMIT_PER_KIND = 5;

export async function searchWorkspace(query: string): Promise<SearchResult[]> {
  const q = query.trim();
  if (q.length < 1) return [];
  const workspaceId = await getCurrentWorkspaceId();

  const [
    projects,
    opportunities,
    accounts,
    tickets,
    invoices,
    pos,
    devices,
    rooms,
    catalog,
    users,
  ] = await Promise.all([
    prisma.project.findMany({
      where: {
        workspaceId,
        OR: [{ name: { contains: q, mode: "insensitive" } }],
      },
      include: { account: true },
      take: LIMIT_PER_KIND,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.opportunity.findMany({
      where: {
        workspaceId,
        OR: [{ name: { contains: q, mode: "insensitive" } }],
      },
      include: { account: true },
      take: LIMIT_PER_KIND,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.account.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { industry: { contains: q, mode: "insensitive" } },
        ],
      },
      take: LIMIT_PER_KIND,
      orderBy: { updatedAt: "desc" },
    }),
    prisma.serviceTicket.findMany({
      where: {
        workspaceId,
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { number: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { account: true },
      take: LIMIT_PER_KIND,
      orderBy: { createdAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: {
        workspaceId,
        OR: [{ number: { contains: q, mode: "insensitive" } }],
      },
      include: { account: true },
      take: LIMIT_PER_KIND,
      orderBy: { createdAt: "desc" },
    }),
    prisma.purchaseOrder.findMany({
      where: {
        workspaceId,
        OR: [
          { number: { contains: q, mode: "insensitive" } },
          { trackingNumber: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { vendor: true },
      take: LIMIT_PER_KIND,
      orderBy: { createdAt: "desc" },
    }),
    prisma.device.findMany({
      where: {
        workspaceId,
        OR: [
          { serialNumber: { contains: q, mode: "insensitive" } },
          { ipAddress: { contains: q, mode: "insensitive" } },
        ],
      },
      include: { catalogItem: true, room: { include: { account: true } } },
      take: LIMIT_PER_KIND,
    }),
    prisma.room.findMany({
      where: {
        workspaceId,
        OR: [{ name: { contains: q, mode: "insensitive" } }],
      },
      include: { account: true, project: true },
      take: LIMIT_PER_KIND,
    }),
    prisma.catalogItem.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { brand: { contains: q, mode: "insensitive" } },
        ],
      },
      take: LIMIT_PER_KIND,
    }),
    prisma.user.findMany({
      where: {
        workspaceId,
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { email: { contains: q, mode: "insensitive" } },
        ],
      },
      take: LIMIT_PER_KIND,
    }),
  ]);

  const results: SearchResult[] = [];

  for (const p of projects) {
    results.push({
      id: p.id,
      kind: "project",
      title: p.name,
      meta: `${p.account?.name ?? "—"} · ${p.phase.toLowerCase()}`,
      href: `/projects?project=${p.id}`,
      badge: p.status === "ACTIVE" ? "Active" : p.status.toLowerCase(),
    });
  }
  for (const o of opportunities) {
    results.push({
      id: o.id,
      kind: "opportunity",
      title: o.name,
      meta: `${o.account?.name ?? "—"} · ${o.stage.toLowerCase()} · $${(o.valueCents / 100).toLocaleString()}`,
      href: `/opportunities?deal=${o.id}`,
    });
  }
  for (const a of accounts) {
    results.push({
      id: a.id,
      kind: "account",
      title: a.name,
      meta: `${a.tier} · health ${a.healthScore}`,
      href: `/accounts?account=${a.id}`,
    });
  }
  for (const t of tickets) {
    results.push({
      id: t.id,
      kind: "ticket",
      title: `${t.number} · ${t.title}`,
      meta: `${t.account?.name ?? "—"} · ${t.priority} · ${t.status.toLowerCase()}`,
      href: `/service?ticket=${t.id}`,
      badge: t.priority,
    });
  }
  for (const inv of invoices) {
    results.push({
      id: inv.id,
      kind: "invoice",
      title: `${inv.number}`,
      meta: `${inv.account?.name ?? "—"} · ${inv.status.toLowerCase()} · $${(inv.totalCents / 100).toLocaleString()}`,
      href: `/billing?invoice=${inv.id}`,
    });
  }
  for (const po of pos) {
    results.push({
      id: po.id,
      kind: "po",
      title: `${po.number}`,
      meta: `${po.vendor.name} · ${po.status.toLowerCase()} · $${(po.totalCents / 100).toLocaleString()}`,
      href: `/procurement?po=${po.id}`,
    });
  }
  for (const d of devices) {
    results.push({
      id: d.id,
      kind: "device",
      title: d.catalogItem?.name ?? d.serialNumber ?? "Device",
      meta: `${d.serialNumber ?? "—"} · ${d.room?.account?.name ?? "Unassigned"} · ${d.status.toLowerCase()}`,
      href: `/devices?device=${d.id}`,
    });
  }
  for (const r of rooms) {
    results.push({
      id: r.id,
      kind: "room",
      title: r.name,
      meta: `${r.account?.name ?? "—"} · ${r.project?.name ?? "—"} · ${r.roomType.toLowerCase()}`,
      href: `/rooms?room=${r.id}`,
    });
  }
  for (const c of catalog) {
    results.push({
      id: c.id,
      kind: "catalog",
      title: c.name,
      meta: `${c.brand} · ${c.sku} · ${c.category}`,
      href: `/catalog?item=${c.id}`,
    });
  }
  for (const u of users) {
    results.push({
      id: u.id,
      kind: "user",
      title: u.name,
      meta: `${u.email} · ${u.role.toLowerCase()}`,
      href: `/settings?member=${u.id}`,
    });
  }

  return results;
}
