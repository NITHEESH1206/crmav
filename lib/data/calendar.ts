import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

/** Get all events from the calendar week containing `referenceDate` (Sunday-start). */
export async function getWeekEvents(referenceDate: Date = new Date()) {
  const workspaceId = await getCurrentWorkspaceId();
  const start = new Date(referenceDate);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // back up to Sunday
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  const events = await prisma.calendarEvent.findMany({
    where: { workspaceId, startsAt: { gte: start, lt: end } },
    include: { user: true },
    orderBy: { startsAt: "asc" },
  });

  return events.map((e) => ({
    id: e.id,
    title: e.title,
    startsAt: e.startsAt.toISOString(),
    endsAt: e.endsAt.toISOString(),
    eventType: e.eventType,
    location: e.location,
    userId: e.userId,
    userName: e.user?.name ?? null,
  }));
}

export type CalendarEventDTO = Awaited<ReturnType<typeof getWeekEvents>>[number];
