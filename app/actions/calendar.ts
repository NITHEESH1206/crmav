"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const moveSchema = z.object({
  id: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
});

export async function moveCalendarEvent(input: z.infer<typeof moveSchema>) {
  const data = moveSchema.parse(input);
  await prisma.calendarEvent.update({
    where: { id: data.id },
    data: {
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
    },
  });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}

const resizeSchema = z.object({
  id: z.string(),
  endsAt: z.string(),
});

export async function resizeCalendarEvent(input: z.infer<typeof resizeSchema>) {
  const data = resizeSchema.parse(input);
  await prisma.calendarEvent.update({
    where: { id: data.id },
    data: { endsAt: new Date(data.endsAt) },
  });
  revalidatePath("/calendar");
  return { ok: true };
}

const createSchema = z.object({
  title: z.string().min(1),
  startsAt: z.string(),
  endsAt: z.string(),
  eventType: z.enum(["MEETING", "SITE_VISIT", "INSTALL", "AMC_VISIT", "TASK"]).default("MEETING"),
  location: z.string().optional().nullable(),
  userId: z.string().optional().nullable(),
});

export async function createCalendarEvent(input: z.infer<typeof createSchema>) {
  const data = createSchema.parse(input);
  const workspaceId = await getCurrentWorkspaceId();
  const event = await prisma.calendarEvent.create({
    data: {
      workspaceId,
      title: data.title,
      startsAt: new Date(data.startsAt),
      endsAt: new Date(data.endsAt),
      eventType: data.eventType,
      location: data.location ?? null,
      userId: data.userId ?? null,
    },
  });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true, id: event.id };
}

export async function deleteCalendarEvent(id: string) {
  await prisma.calendarEvent.delete({ where: { id } });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return { ok: true };
}
