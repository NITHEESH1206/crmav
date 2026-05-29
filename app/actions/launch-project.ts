"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";
import { buildRackLayout, isRackable } from "@/lib/av/rack-builder";
import { buildSignalFlow } from "@/lib/av/signal-flow-builder";
import type { Prisma } from "@prisma/client";

/**
 * Launch a project from a validated multi-room AI plan.
 *
 * Creates (in a single transaction so partial failures roll back):
 *   1. Account (find-or-create by name)
 *   2. Opportunity (CLOSED_WON since user committed to launch)
 *   3. Project (engineering phase, contract value = sum of all room totals)
 *   4. For each room:
 *      a. Room with persisted dimensions
 *      b. BOQItem rows
 *      c. AVRack with auto-stacked layout (only if rackable devices exist)
 *      d. SignalFlow with deterministic diagram
 *
 * Returns the IDs of all created rooms plus the project — the wizard's
 * done screen lists them so the user can pick which 3D room to open first.
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

const roomLaunchSchema = z.object({
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
  devices: z.array(validatedDeviceSchema).min(1),
});

const launchInputSchema = z.object({
  accountName: z.string().min(2),
  projectName: z.string().min(2),
  narrative: z.string(),
  estimatedValueCents: z.number().int().min(0),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH"]),
  callouts: z.array(z.string()).default([]),
  rooms: z.array(roomLaunchSchema).min(1).max(20),
});

export type LaunchInput = z.infer<typeof launchInputSchema>;

export type RoomLaunchResult = {
  id: string;
  name: string;
  boqLines: number;
  rackUnits: number;
  flowNodes: number;
  totalCents: number;
};

export type LaunchResult =
  | {
      ok: true;
      projectId: string;
      accountId: string;
      rooms: RoomLaunchResult[];
      total: {
        boqLines: number;
        rackUnits: number;
        flowNodes: number;
        totalCents: number;
      };
    }
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

  // Contract value = sum of all rooms' device totals (not the AI's estimate)
  const projectTotalCents = data.rooms.reduce(
    (sum, room) =>
      sum +
      room.devices.reduce((s, d) => s + d.quantity * d.listPriceCents, 0),
    0
  );

  try {
    const result = await prisma.$transaction(
      async (tx) => {
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

        // 2. Opportunity
        const opportunity = await tx.opportunity.create({
          data: {
            workspaceId,
            accountId: account.id,
            name: data.projectName,
            stage: "CLOSED_WON",
            valueCents: projectTotalCents,
            probability: 100,
            aiScore: data.riskLevel === "LOW" ? 92 : data.riskLevel === "MEDIUM" ? 78 : 64,
          },
        });

        // 3. Project
        const project = await tx.project.create({
          data: {
            workspaceId,
            accountId: account.id,
            opportunityId: opportunity.id,
            name: data.projectName,
            phase: "ENGINEERING",
            status: "ACTIVE",
            contractValueCents: projectTotalCents,
            progress: 0,
            riskLevel: data.riskLevel,
          },
        });

        // 4. Per-room creation
        const roomResults: RoomLaunchResult[] = [];

        for (const roomData of data.rooms) {
          const roomTotalCents = roomData.devices.reduce(
            (s, d) => s + d.quantity * d.listPriceCents,
            0
          );

          // Notes — pull room-level callouts from the project-level set into the
          // largest room (heuristic: the room with the most devices).
          const notes =
            roomData === data.rooms[indexOfRichestRoom(data.rooms)] && data.callouts.length
              ? data.callouts.map((c) => `• ${c}`).join("\n")
              : null;

          const room = await tx.room.create({
            data: {
              workspaceId,
              projectId: project.id,
              accountId: account.id,
              name: roomData.name,
              roomType: roomData.roomType,
              capacity: roomData.capacity,
              lengthM: roomData.lengthM,
              widthM: roomData.widthM,
              heightM: roomData.heightM,
              notes,
            },
          });

          // BOQ rows
          const boqRows: Prisma.BOQItemCreateManyInput[] = roomData.devices.map((d) => ({
            projectId: project.id,
            roomId: room.id,
            catalogId: d.catalogId,
            description: d.name,
            quantity: d.quantity,
            unitPriceCents: d.listPriceCents,
          }));
          await tx.bOQItem.createMany({ data: boqRows });

          // Rack (only if rackable devices exist)
          const rackable = roomData.devices.filter((d) => isRackable(d.category));
          let rackUnits = 0;
          if (rackable.length > 0) {
            const rackLayout = buildRackLayout(roomData.devices);
            rackUnits = rackLayout.items.length;
            await tx.aVRack.create({
              data: {
                workspaceId,
                roomId: room.id,
                name: `${roomData.name} — Rack`,
                totalU: rackLayout.totalU,
                layoutJson: rackLayout as unknown as Prisma.InputJsonValue,
              },
            });
          }

          // Signal flow
          const flow = buildSignalFlow(roomData.devices);
          await tx.signalFlow.create({
            data: {
              workspaceId,
              roomId: room.id,
              name: `${roomData.name} — Signal Flow`,
              diagramJson: flow as unknown as Prisma.InputJsonValue,
            },
          });

          roomResults.push({
            id: room.id,
            name: roomData.name,
            boqLines: boqRows.length,
            rackUnits,
            flowNodes: flow.nodes.length,
            totalCents: roomTotalCents,
          });
        }

        return {
          projectId: project.id,
          accountId: account.id,
          rooms: roomResults,
        };
      },
      // Transactions for multi-room builds can be slow — extend the timeout.
      { timeout: 30_000, maxWait: 10_000 }
    );

    // Revalidate everything that just got new data
    revalidatePath("/dashboard");
    revalidatePath("/projects");
    revalidatePath("/opportunities");
    revalidatePath("/accounts");
    revalidatePath("/rooms");
    revalidatePath(`/projects/${result.projectId}`);
    for (const r of result.rooms) {
      revalidatePath(`/rooms/${r.id}`);
    }

    const totalBoqLines = result.rooms.reduce((s, r) => s + r.boqLines, 0);
    const totalRackUnits = result.rooms.reduce((s, r) => s + r.rackUnits, 0);
    const totalFlowNodes = result.rooms.reduce((s, r) => s + r.flowNodes, 0);

    return {
      ok: true,
      projectId: result.projectId,
      accountId: result.accountId,
      rooms: result.rooms,
      total: {
        boqLines: totalBoqLines,
        rackUnits: totalRackUnits,
        flowNodes: totalFlowNodes,
        totalCents: projectTotalCents,
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Launch failed",
    };
  }
}

/** Picks the index of the room with the most devices — used to attach
 *  project-level callouts to one logical room rather than every room. */
function indexOfRichestRoom(
  rooms: Array<{ devices: { quantity: number }[] }>
): number {
  let best = 0;
  let bestCount = -1;
  for (let i = 0; i < rooms.length; i++) {
    const total = rooms[i].devices.reduce((s, d) => s + d.quantity, 0);
    if (total > bestCount) {
      bestCount = total;
      best = i;
    }
  }
  return best;
}
