import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function projectMarginData() {
  const workspaceId = await getCurrentWorkspaceId();
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: { boqItems: { include: { catalogItem: true } } },
    orderBy: { contractValueCents: "desc" },
    take: 6,
  });
  return projects.map((p) => {
    const cost = p.boqItems.reduce(
      (s, b) => s + (b.catalogItem?.costCents ?? 0) * b.quantity,
      0
    );
    const margin =
      p.contractValueCents === 0 ? 0 : Math.round(((p.contractValueCents - cost) / p.contractValueCents) * 100);
    return { name: p.name.slice(0, 14), margin: Math.max(0, margin) };
  });
}

export async function serviceMix() {
  const workspaceId = await getCurrentWorkspaceId();
  const rooms = await prisma.room.findMany({ where: { workspaceId } });
  const counts = rooms.reduce<Record<string, number>>((acc, r) => {
    acc[r.roomType] = (acc[r.roomType] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts).map(([type, count]) => ({ type, count }));
}

export async function reportsSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const [rev, projects] = await Promise.all([
    prisma.invoice.aggregate({
      where: { workspaceId, status: "PAID" },
      _sum: { totalCents: true },
    }),
    prisma.project.findMany({
      where: { workspaceId },
      include: { boqItems: { include: { catalogItem: true } } },
    }),
  ]);
  const margins = projects.map((p) => {
    const cost = p.boqItems.reduce(
      (s, b) => s + (b.catalogItem?.costCents ?? 0) * b.quantity,
      0
    );
    return p.contractValueCents === 0 ? 0 : ((p.contractValueCents - cost) / p.contractValueCents) * 100;
  });
  const avgMargin =
    margins.length === 0 ? 0 : +(margins.reduce((s, m) => s + m, 0) / margins.length).toFixed(1);
  return {
    revenueYtdCents: rev._sum.totalCents ?? 0,
    avgMargin,
  };
}
