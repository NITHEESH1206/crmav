import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bearerFrom, hashAgentKey } from "@/lib/agents/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Agent device roster — returns the devices this agent is responsible for,
 * with the connection details it needs to reach them on the LAN.
 *
 * The agent fetches this on startup and periodically refreshes, so adding a
 * device in the UI makes it monitorable without restarting the agent.
 */
export async function GET(req: Request) {
  const token = bearerFrom(req.headers.get("authorization"));
  if (!token) {
    return NextResponse.json({ ok: false, error: "Missing agent key" }, { status: 401 });
  }

  const agent = await prisma.deviceAgent.findUnique({
    where: { hashedKey: hashAgentKey(token) },
  });
  if (!agent) {
    return NextResponse.json({ ok: false, error: "Invalid agent key" }, { status: 401 });
  }

  const devices = await prisma.device.findMany({
    where: { agentId: agent.id, status: { not: "RETIRED" } },
    include: { catalogItem: { select: { name: true, brand: true } } },
  });

  return NextResponse.json({
    ok: true,
    agent: { id: agent.id, name: agent.name, location: agent.location },
    devices: devices.map((d) => ({
      id: d.id,
      name: d.catalogItem?.name ?? d.serialNumber ?? "Device",
      brand: d.catalogItem?.brand ?? null,
      ip: d.ipAddress,
      protocol: d.controlProtocol,
      port: d.controlPort,
    })),
  });
}
