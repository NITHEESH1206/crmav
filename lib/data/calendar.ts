import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function getWeekEvents() {
  const workspaceId = await getCurrentWorkspaceId();
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay()); // Sunday
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  return prisma.calendarEvent.findMany({
    where: { workspaceId, startsAt: { gte: start, lt: end } },
    orderBy: { startsAt: "asc" },
  });
}
