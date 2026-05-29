"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";
import { buildRackLayout, isRackable } from "@/lib/av/rack-builder";
import { buildSignalFlow } from "@/lib/av/signal-flow-builder";
import type { Prisma } from "@prisma/client";

/**
 * Launch a project from a validated AI plan.
 *
 * Creates (in a single transaction so partial failures roll back):
 *   1. Account (find-or-create by name)
 *   2. Opportunity (in CLOSED_WON to mark "ready to deliver")
 *   3. Project (engineering phase)
 *   4. Room (with persisted dimensions)
 *   5. BOQItem rows for every device
 *   6. AVRack with auto-stacked layout (only rackable devices)
 *   7. SignalFlow with deterministic node + edge diagram
 *
 * Returns the IDs needed to navigate to the new room's 3D view.
 */

const validatedDeviceSchema = z.object({
  catalogId: z.string(),
  sku: z.string(),
  name: z.string(),
  brand: z.string(),
  category: z.string(),
  listPriceCents: z.number().int(),
  quantity: z.number().int().min(1).max(50),
  rationale: z.string().optional(),
});

const launchInputSchema = z.object({
  accountName: z.string().min(2),
  projectName: z.string().min(2),
  narrative: z.string(),
  estimatedValueCents: z.number().int().min(0),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  callouts: z.array(z.string()).default([]),
  room: z.object({
    name: z.string().min(2),
    roomType: z.enum([
      "BOARDROOM",
      "HUDDLE",
      "TRAINING",
      "STUDIO",
      "AUDITORIUM",
      "LOBBY",
      "COMMAND_CENTER",
      "OTHER",
    ]),
    capacity: z.number().int().min(1).max(2000),
    lengthM: z.number(),
    widthM: z.number(),
    heightM: z.number(),
  }),
  devices: z.array(validatedDeviceSchema).min(1),
});

export type LaunchInput = z.infer<typeof launchInputSchema>;

export type LaunchResult =
  | { ok: true; projectId: string; roomId: string; accountId: string; total: { boqLines: number; rackUnits: number; flowNodes: number } }
  | { ok: false; error: string };

export async function launchProjectFromPlan(input: LaunchInput): Promise<LaunchResult> {
  const parsed = launchInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        "Launch input failed validation: " +
        parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "),
    };
  }
  const data = parsed.data;
  const workspaceId = await getCurrentWorkspaceId();

  // BOQ total derived from devices (not the AI's estimate — sum of real prices)
  const boqTotalCents = data.devices.reduce(
    (sum, d) => sum + d.quantity * d.listPriceCents,
    0
  );

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find-or-create account
      let account = await tx.account.findFirst({
        where: { workspaceId, name: { equals: data.accountName, mode: "insensitive" } },
      });
      if (!account) {
        account = await tx.account.create({
          data: {
            workspaceId,
            name: data.accountName,
            tier: "GROWTH",
            healthScore: 80,
          },
        });
      }

      // 2. Opportunity — created in CLOSED_WON because the user committed to launch
      const opportunity = await tx.opportunity.create({
        data: {
          workspaceId,
          accountId: account.id,
          name: data.projectName,
          stage: "CLOSED_WON",
          valueCents: boqTotalCents,
          probability: 100,
          aiScore: data.riskLevel === "LOW" ? 92 : data.riskLevel === "MEDIUM" ? 78 : 64,
        },
      });

      // 3. Project — engineering phase
      const project = await tx.project.create({
        data: {
          workspaceId,
          accountId: account.id,
          opportunityId: opportunity.id,
          name: data.projectName,
          phase: "ENGINEERING",
          status: "ACTIVE",
          contractValueCents: boqTotalCents,
          progress: 0,
          riskLevel: data.riskLevel,
        },
      });

      // 4. Room with persisted dimensions
      const room = await tx.room.create({
        data: {
          workspaceId,
          projectId: project.id,
          accountId: account.id,
          name: data.room.name,
          roomType: data.room.roomType,
          capacity: data.room.capacity,
          lengthM: data.room.lengthM,
          widthM: data.room.widthM,
          heightM: data.room.heightM,
          notes: data.callouts.length
            ? data.callouts.map((c) => `• ${c}`).join("\n")
            : null,
        },
      });

      // 5. BOQ items — one row per device line
      const boqRows: Prisma.BOQItemCreateManyInput[] = data.devices.map((d) => ({
        projectId: project.id,
        roomId: room.id,
        catalogId: d.catalogId,
        description: d.name,
        quantity: d.quantity,
        unitPriceCents: d.listPriceCents,
      }));
      await tx.bOQItem.createMany({ data: boqRows });

      // 6. Rack — only if there are rackable devices
      const rackable = data.devices.filter((d) => isRackable(d.category));
      let rackUnits = 0;
      if (rackable.length > 0) {
        const rackLayout = buildRackLayout(data.devices);
        rackUnits = rackLayout.items.length;
        await tx.aVRack.create({
          data: {
            workspaceId,
            roomId: room.id,
            name: `${data.room.name} — Primary Rack`,
            totalU: rackLayout.totalU,
            layoutJson: rackLayout as unknown as Prisma.InputJsonValue,
          },
        });
      }

      // 7. Signal flow — deterministic diagram
      const flow = buildSignalFlow(data.devices);
      await tx.signalFlow.create({
        data: {
          workspaceId,
          roomId: room.id,
          name: `${data.room.name} — Signal Flow`,
          diagramJson: flow as unknown as Prisma.InputJsonValue,
        },
      });

      return {
        projectId: project.id,
        roomId: room.id,
        accountId: account.id,
        boqLines: boqRows.length,
        rackUnits,
        flowNodes: flow.nodes.length,
      };
    });

    // Revalidate all the surfaces that just got new data
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/opportunities");
    revalidatePath("/accounts");
    revalidatePath("/rooms");
    revalidatePath(`/projects/${result.projectId}`);
    revalidatePath(`/rooms/${result.roomId}`);

    return {
      ok: true,
      projectId: result.projectId,
      roomId: result.roomId,
      accountId: result.accountId,
      total: {
        boqLines: result.boqLines,
        rackUnits: result.rackUnits,
        flowNodes: result.flowNodes,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Launch failed",
    };
  }
}
