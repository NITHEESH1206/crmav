import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { bearerFrom, hashAgentKey } from "@/lib/agents/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Agent poll endpoint — the core of the remote-control bridge.
 *
 * The on-site agent calls this every few seconds with:
 *   Authorization: Bearer <agent key>
 *   body: {
 *     version: "1.0.0",
 *     telemetry: [{ deviceId, reachable, powerState, data, firmware }],
 *     results:   [{ commandId, status: "SUCCESS"|"FAILED", result }]
 *   }
 *
 * It returns the list of PENDING commands the agent should execute next:
 *   { ok, commands: [{ id, deviceId, action, params }], pollIntervalMs }
 *
 * This poll-based design means the agent only needs OUTBOUND HTTPS — it works
 * behind any NAT/firewall with zero inbound ports, and runs fine on Vercel
 * serverless (no persistent connections).
 */

const bodySchema = z.object({
  version: z.string().optional(),
  telemetry: z
    .array(
      z.object({
        deviceId: z.string(),
        reachable: z.boolean(),
        powerState: z.enum(["ON", "OFF", "WARMING", "COOLING", "UNKNOWN"]).optional(),
        data: z.record(z.unknown()).optional(),
        firmware: z.string().optional(),
      })
    )
    .optional(),
  results: z
    .array(
      z.object({
        commandId: z.string(),
        status: z.enum(["SUCCESS", "FAILED"]),
        result: z.string().optional(),
      })
    )
    .optional(),
});

export async function POST(req: Request) {
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

  const raw = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(raw);
  const body = parsed.success ? parsed.data : { telemetry: [], results: [] };

  // 1. Update agent heartbeat
  await prisma.deviceAgent.update({
    where: { id: agent.id },
    data: { lastSeenAt: new Date(), online: true, version: body.version ?? agent.version },
  });

  // 2. Ingest telemetry per device
  if (body.telemetry?.length) {
    for (const t of body.telemetry) {
      // Only touch devices that belong to this agent
      const owned = await prisma.device.findFirst({
        where: { id: t.deviceId, agentId: agent.id },
        select: { id: true },
      });
      if (!owned) continue;
      await prisma.device.update({
        where: { id: t.deviceId },
        data: {
          status: t.reachable ? "ONLINE" : "OFFLINE",
          powerState: t.powerState ?? undefined,
          lastSeenAt: t.reachable ? new Date() : undefined,
          lastPolledAt: new Date(),
          firmware: t.firmware ?? undefined,
          telemetryJson: t.data ? (t.data as object) : undefined,
        },
      });
    }
  }

  // 3. Record command results
  if (body.results?.length) {
    for (const r of body.results) {
      await prisma.deviceCommand.updateMany({
        where: { id: r.commandId, agentId: agent.id },
        data: {
          status: r.status,
          result: r.result ?? null,
          executedAt: new Date(),
        },
      });
    }
  }

  // 4. Expire stale pending commands (older than 5 min, never picked up)
  await prisma.deviceCommand.updateMany({
    where: {
      agentId: agent.id,
      status: "PENDING",
      createdAt: { lt: new Date(Date.now() - 5 * 60_000) },
    },
    data: { status: "EXPIRED" },
  });

  // 5. Hand back pending commands + mark them SENT
  const pending = await prisma.deviceCommand.findMany({
    where: { agentId: agent.id, status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: 20,
    select: { id: true, deviceId: true, action: true, params: true },
  });

  if (pending.length) {
    await prisma.deviceCommand.updateMany({
      where: { id: { in: pending.map((p) => p.id) } },
      data: { status: "SENT" },
    });
  }

  return NextResponse.json({
    ok: true,
    commands: pending.map((p) => ({
      id: p.id,
      deviceId: p.deviceId,
      action: p.action,
      params: p.params ?? {},
    })),
    pollIntervalMs: 4000,
  });
}
