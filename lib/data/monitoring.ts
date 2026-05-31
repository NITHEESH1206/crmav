import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listAgents() {
  const workspaceId = await getCurrentWorkspaceId();
  const agents = await prisma.deviceAgent.findMany({
    where: { workspaceId },
    include: { _count: { select: { devices: true } } },
    orderBy: { createdAt: "desc" },
  });
  const now = Date.now();
  return agents.map((a) => ({
    id: a.id,
    name: a.name,
    location: a.location,
    keyPrefix: a.keyPrefix,
    version: a.version,
    deviceCount: a._count.devices,
    // Agent is "online" if it polled in the last 30s
    online: a.lastSeenAt ? now - +a.lastSeenAt < 30_000 : false,
    lastSeenAt: a.lastSeenAt,
  }));
}

export async function listControllableDevices() {
  const workspaceId = await getCurrentWorkspaceId();
  const devices = await prisma.device.findMany({
    where: { workspaceId },
    include: {
      catalogItem: { select: { name: true, brand: true, category: true } },
      room: { select: { name: true, account: { select: { name: true } } } },
      agent: { select: { id: true, name: true, online: true, lastSeenAt: true } },
    },
    orderBy: { lastPolledAt: "desc" },
  });
  const now = Date.now();
  return devices.map((d) => ({
    id: d.id,
    name: d.label ?? d.catalogItem?.name ?? d.serialNumber ?? "Device",
    brand: d.catalogItem?.brand ?? null,
    category: d.catalogItem?.category ?? null,
    room: d.room?.name ?? null,
    account: d.room?.account?.name ?? null,
    ip: d.ipAddress,
    status: d.status,
    powerState: d.powerState,
    controlProtocol: d.controlProtocol,
    controlPort: d.controlPort,
    agentId: d.agentId,
    agentName: d.agent?.name ?? null,
    agentOnline: d.agent?.lastSeenAt ? now - +d.agent.lastSeenAt < 30_000 : false,
    lastPolledAt: d.lastPolledAt,
    telemetry: (d.telemetryJson as Record<string, unknown> | null) ?? null,
  }));
}

export async function listDiscoveredDevices() {
  const workspaceId = await getCurrentWorkspaceId();
  const found = await prisma.discoveredDevice.findMany({
    where: { workspaceId, status: "NEW" },
    include: { agent: { select: { name: true, location: true } } },
    orderBy: { lastSeenAt: "desc" },
    take: 60,
  });
  return found.map((d) => ({
    id: d.id,
    ip: d.ipAddress,
    port: d.port,
    protocol: d.protocol,
    label: d.label,
    hostname: d.hostname,
    banner: d.banner,
    agentName: d.agent?.name ?? null,
    agentLocation: d.agent?.location ?? null,
    lastSeenAt: d.lastSeenAt,
  }));
}

export async function listRecentCommands(limit = 20) {
  const workspaceId = await getCurrentWorkspaceId();
  const cmds = await prisma.deviceCommand.findMany({
    where: { workspaceId },
    include: { device: { include: { catalogItem: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return cmds.map((c) => ({
    id: c.id,
    action: c.action,
    status: c.status,
    result: c.result,
    deviceName: c.device.label ?? c.device.catalogItem?.name ?? "Device",
    createdAt: c.createdAt,
    executedAt: c.executedAt,
  }));
}
