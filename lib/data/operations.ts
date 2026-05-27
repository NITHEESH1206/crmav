import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export type RoomHealth = {
  id: string;
  name: string;
  account: string | null;
  roomType: string;
  deviceCount: number;
  online: number;
  warning: number;
  offline: number;
  retired: number;
  healthScore: number; // 0-100
  topAlert?: string;
};

export async function getRoomsWithHealth(): Promise<RoomHealth[]> {
  const workspaceId = await getCurrentWorkspaceId();
  const rooms = await prisma.room.findMany({
    where: { workspaceId },
    include: {
      account: { select: { name: true } },
      devices: { select: { status: true, catalogItem: { select: { name: true } } } },
    },
    orderBy: { name: "asc" },
  });

  return rooms.map((r) => {
    const counts = {
      online: 0,
      warning: 0,
      offline: 0,
      retired: 0,
    };
    for (const d of r.devices) {
      counts[d.status.toLowerCase() as keyof typeof counts]++;
    }
    const live = counts.online + counts.warning + counts.offline;
    const score = live === 0
      ? 100
      : Math.round((counts.online / live) * 100 - counts.warning * 4 - counts.offline * 10);
    const topAlert = counts.offline > 0
      ? `${counts.offline} device${counts.offline === 1 ? "" : "s"} offline`
      : counts.warning > 0
        ? `${counts.warning} warning${counts.warning === 1 ? "" : "s"}`
        : undefined;

    return {
      id: r.id,
      name: r.name,
      account: r.account?.name ?? null,
      roomType: r.roomType,
      deviceCount: r.devices.length,
      ...counts,
      healthScore: Math.max(0, Math.min(100, score)),
      topAlert,
    };
  });
}

export type OpsAlert = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  meta: string;
  raisedAt: Date;
  href: string;
};

export async function getActiveAlerts(limit = 12): Promise<OpsAlert[]> {
  const workspaceId = await getCurrentWorkspaceId();

  // Synthesise from: offline/warning devices + open P1/P2 tickets.
  const [devices, tickets] = await Promise.all([
    prisma.device.findMany({
      where: { workspaceId, status: { in: ["OFFLINE", "WARNING"] } },
      include: { catalogItem: true, room: { include: { account: true } } },
      orderBy: { lastSeenAt: "desc" },
      take: limit,
    }),
    prisma.serviceTicket.findMany({
      where: {
        workspaceId,
        priority: { in: ["P1", "P2"] },
        status: { in: ["OPEN", "IN_PROGRESS"] },
      },
      include: { account: true },
      take: limit,
    }),
  ]);

  const alerts: OpsAlert[] = [];

  for (const d of devices) {
    alerts.push({
      id: `dev-${d.id}`,
      severity: d.status === "OFFLINE" ? "critical" : "warning",
      title:
        d.status === "OFFLINE"
          ? `Device offline · ${d.catalogItem?.name ?? d.serialNumber ?? "Device"}`
          : `Device warning · ${d.catalogItem?.name ?? d.serialNumber ?? "Device"}`,
      meta: `${d.room?.account?.name ?? "—"} · ${d.room?.name ?? "Unassigned"}`,
      raisedAt: d.lastSeenAt ?? new Date(),
      href: `/devices?device=${d.id}`,
    });
  }

  for (const t of tickets) {
    alerts.push({
      id: `tkt-${t.id}`,
      severity: t.priority === "P1" ? "critical" : "warning",
      title: `${t.priority} ticket · ${t.title}`,
      meta: `${t.account?.name ?? "—"} · ${t.number}`,
      raisedAt: t.createdAt,
      href: `/service?ticket=${t.id}`,
    });
  }

  return alerts
    .sort((a, b) => +b.raisedAt - +a.raisedAt)
    .slice(0, limit);
}

export async function getOpsSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const [rooms, devices, online, offline, warning] = await Promise.all([
    prisma.room.count({ where: { workspaceId } }),
    prisma.device.count({ where: { workspaceId } }),
    prisma.device.count({ where: { workspaceId, status: "ONLINE" } }),
    prisma.device.count({ where: { workspaceId, status: "OFFLINE" } }),
    prisma.device.count({ where: { workspaceId, status: "WARNING" } }),
  ]);

  const uptime = devices === 0 ? 100 : Math.round((online / devices) * 1000) / 10;

  return {
    rooms,
    devices,
    online,
    offline,
    warning,
    uptimePct: uptime,
  };
}
