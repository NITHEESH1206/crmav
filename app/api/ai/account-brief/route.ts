import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { streamCompletion } from "@/lib/ai/stream";
import { ACCOUNT_BRIEF_PROMPT } from "@/lib/ai/prompts";

export const runtime = "nodejs";
export const maxDuration = 60;

const bodySchema = z.object({ accountId: z.string() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "accountId required" }, { status: 400 });
  }
  const { accountId } = parsed.data;

  const a = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      projects: { orderBy: { updatedAt: "desc" }, take: 6 },
      tickets: { orderBy: { createdAt: "desc" }, take: 8 },
      invoices: { orderBy: { issuedAt: "desc" }, take: 6 },
      subscriptions: true,
      amcs: true,
      _count: { select: { projects: true, tickets: true, contacts: true } },
    },
  });
  if (!a) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mrr = a.subscriptions.reduce((s, x) => s + x.monthlyCents, 0);

  const userMessage = [
    "# Account",
    `Name: ${a.name}`,
    `Tier: ${a.tier}`,
    `Industry: ${a.industry ?? "—"}`,
    `Health score: ${a.healthScore}%`,
    `Lifetime value: $${(a.ltvCents / 100).toLocaleString()}`,
    `Recurring MRR: $${(mrr / 100).toLocaleString()}/mo`,
    `Counts: ${a._count.projects} projects · ${a._count.tickets} tickets · ${a._count.contacts} contacts`,
    "",
    "## Projects",
    ...a.projects.map(
      (p) => `- ${p.name} — phase ${p.phase}, $${(p.contractValueCents / 100).toLocaleString()}, ${p.progress}% complete`
    ),
    "",
    "## Recent tickets",
    ...a.tickets.map(
      (t) => `- ${t.number} (${t.priority}, ${t.status}): ${t.title}`
    ),
    "",
    "## Invoices",
    ...a.invoices.map(
      (i) => `- ${i.number}: $${(i.totalCents / 100).toLocaleString()} — ${i.status}, due ${i.dueAt?.toLocaleDateString() ?? "—"}`
    ),
    "",
    "## AMC contracts",
    ...a.amcs.map(
      (c) => `- ${c.name} (${c.tier}): expires ${c.endDate.toLocaleDateString()}, ${c.visitsTotal - c.visitsUsed} visits remaining, ${c.healthScore}% health`
    ),
    "",
    "## Subscriptions",
    ...a.subscriptions.map(
      (s) => `- ${s.plan}: $${(s.monthlyCents / 100).toLocaleString()}/mo, renews ${s.renewsAt?.toLocaleDateString() ?? "—"}`
    ),
  ].join("\n");

  return streamCompletion({
    systemPrompt: ACCOUNT_BRIEF_PROMPT,
    userMessage,
    effort: "high",
    maxTokens: 3_000,
  });
}
