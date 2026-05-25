import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export async function listAccounts() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.account.findMany({
    where: { workspaceId },
    include: {
      _count: { select: { contacts: true, projects: true } },
    },
    orderBy: { ltvCents: "desc" },
  });
}

export async function accountsSummary() {
  const workspaceId = await getCurrentWorkspaceId();
  const [accounts, contacts] = await Promise.all([
    prisma.account.count({ where: { workspaceId } }),
    prisma.contact.count({ where: { workspaceId } }),
  ]);
  return { accounts, contacts };
}
