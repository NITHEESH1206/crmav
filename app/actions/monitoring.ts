"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { generateAgentKey } from "@/lib/agents/auth";
import { revalidatePath } from "next/cache";

/* ─── Register a new on-site agent ─── */
const registerSchema = z.object({
  name: z.string().min(2).max(80),
  location: z.string().max(120).optional(),
});

export async function registerAgent(input: z.infer<typeof registerSchema>) {
  const data = registerSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  const { raw, hash, prefix } = generateAgentKey();

  const agent = await prisma.deviceAgent.create({
    data: {
      workspaceId,
      name: data.name,
      location: data.location || null,
      hashedKey: hash,
      keyPrefix: prefix,
    },
  });

  revalidatePath("/operations");
  // raw key returned ONCE — never stored in plaintext
  return { ok: true as const, agentId: agent.id, rawKey: raw };
}

export async function deleteAgent(agentId: string) {
  const workspaceId = await getCurrentWorkspaceId();
  // Detach devices first
  await prisma.device.updateMany({
    where: { agentId, workspaceId },
    data: { agentId: null, controlProtocol: "NONE" },
  });
  await prisma.deviceAgent.deleteMany({ where: { id: agentId, workspaceId } });
  revalidatePath("/operations");
  return { ok: true };
}

/* ─── Configure a device for control ─── */
const configureSchema = z.object({
  deviceId: z.string(),
  agentId: z.string().nullable(),
  controlProtocol: z.enum(["NONE", "PJLINK", "TCP_RAW", "CRESTRON", "TELNET", "HTTP"]),
  ipAddress: z.string().max(60).optional().nullable(),
  controlPort: z.number().int().min(1).max(65535).optional().nullable(),
});

export async function configureDeviceControl(input: z.infer<typeof configureSchema>) {
  const data = configureSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();

  await prisma.device.updateMany({
    where: { id: data.deviceId, workspaceId },
    data: {
      agentId: data.agentId,
      controlProtocol: data.controlProtocol,
      ipAddress: data.ipAddress ?? undefined,
      controlPort: data.controlPort ?? undefined,
    },
  });
  revalidatePath("/operations");
  revalidatePath(`/devices`);
  return { ok: true };
}

/* ─── Enqueue a control command ─── */
const commandSchema = z.object({
  deviceId: z.string(),
  action: z.enum(["power_on", "power_off", "restart", "input", "volume", "mute", "raw"]),
  params: z.record(z.unknown()).optional(),
});

export async function sendDeviceCommand(input: z.infer<typeof commandSchema>) {
  const data = commandSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();

  const device = await prisma.device.findFirst({
    where: { id: data.deviceId, workspaceId },
    select: { id: true, agentId: true, controlProtocol: true },
  });
  if (!device) return { ok: false as const, error: "Device not found" };
  if (!device.agentId) {
    return { ok: false as const, error: "Device isn't linked to an agent yet. Configure control first." };
  }
  if (device.controlProtocol === "NONE") {
    return { ok: false as const, error: "No control protocol set for this device." };
  }

  const command = await prisma.deviceCommand.create({
    data: {
      workspaceId,
      deviceId: device.id,
      agentId: device.agentId,
      action: data.action,
      params: (data.params ?? {}) as object,
      status: "PENDING",
    },
  });

  revalidatePath("/operations");
  return { ok: true as const, commandId: command.id };
}

/* ─── Poll a command's status (UI waits for the agent to execute) ─── */
export async function getCommandStatus(commandId: string) {
  const workspaceId = await getCurrentWorkspaceId();
  const cmd = await prisma.deviceCommand.findFirst({
    where: { id: commandId, workspaceId },
    select: { status: true, result: true, executedAt: true },
  });
  return cmd ?? { status: "EXPIRED" as const, result: null, executedAt: null };
}
