import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listTodos() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.todo.findMany({
    where: { workspaceId },
    include: { project: true, assignee: true },
    orderBy: [{ done: "asc" }, { priority: "asc" }, { dueDate: "asc" }],
  });
}
