import { notFound } from "next/navigation";
import {
  getPortalAccount,
  getPortalProjects,
  getPortalProposals,
  getPortalDocuments,
  getPortalTickets,
  getPortalInvoices,
  getPortalAMCs,
  getPortalSnapshot,
} from "@/lib/data/portal";
import { PortalShell, type PortalData } from "@/components/portal/portal-shell";

export default async function PortalPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  const { accountId } = await params;

  const [account, projects, proposals, documents, tickets, invoices, amcs, snapshot] = await Promise.all([
    getPortalAccount(accountId),
    getPortalProjects(accountId),
    getPortalProposals(accountId),
    getPortalDocuments(accountId),
    getPortalTickets(accountId),
    getPortalInvoices(accountId),
    getPortalAMCs(accountId),
    getPortalSnapshot(accountId),
  ]);

  if (!account) notFound();

  const data: PortalData = {
    account: {
      id: account.id,
      name: account.name,
      healthScore: account.healthScore,
      tier: account.tier,
    },
    workspaceName: account.workspace?.name ?? "ZynexAV",
    contacts: account.contacts.map((c) => ({
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      title: c.title,
    })),
    snapshot: {
      activeProjects: snapshot.activeProjects,
      outstandingCents: snapshot.outstandingCents,
      outstandingCount: snapshot.outstandingCount,
      openTickets: snapshot.openTickets,
      amcCount: snapshot.amcCount,
    },
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      phase: p.phase,
      progress: p.progress,
      dueDate: p.dueDate,
      contractValueCents: p.contractValueCents,
      milestones: p.milestones,
      counts: { rooms: p._count.rooms, drawings: p._count.drawings },
    })),
    documents: documents.map((d) => ({
      id: d.id,
      name: d.name,
      fileUrl: d.fileUrl,
      version: d.version,
      createdAt: d.createdAt,
      project: d.project ? { id: d.project.id, name: d.project.name } : null,
    })),
    tickets: tickets.map((t) => ({
      id: t.id,
      number: t.number,
      title: t.title,
      priority: t.priority,
      status: t.status,
      createdAt: t.createdAt,
    })),
    invoices: invoices.map((i) => ({
      id: i.id,
      number: i.number,
      status: i.status,
      totalCents: i.totalCents,
      issuedAt: i.issuedAt,
      dueAt: i.dueAt,
    })),
    amcs: amcs.map((a) => ({
      id: a.id,
      name: a.name,
      tier: a.tier,
      startDate: a.startDate,
      endDate: a.endDate,
      visitsTotal: a.visitsTotal,
      visitsUsed: a.visitsUsed,
      monthlyValueCents: a.monthlyValueCents,
    })),
    proposals: proposals.map((p) => ({
      quoteId: p.id,
      number: p.number,
      status: p.status,
      totalCents: p.totalCents,
      signedByName: p.signedByName,
      signedAt: p.signedAt,
      opportunityName: p.opportunity.name,
    })),
  };

  return <PortalShell data={data} />;
}
