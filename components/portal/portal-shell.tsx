"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  LifeBuoy,
  Receipt,
  Shield,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OverviewTab } from "./tabs/overview-tab";
import { ProjectsTab } from "./tabs/projects-tab";
import { DocumentsTab } from "./tabs/documents-tab";
import { TicketsTab } from "./tabs/tickets-tab";
import { InvoicesTab } from "./tabs/invoices-tab";
import { AMCsTab } from "./tabs/amcs-tab";

export type PortalTab = "overview" | "projects" | "documents" | "tickets" | "invoices" | "amc";

export type PortalData = {
  account: {
    id: string;
    name: string;
    healthScore: number;
    tier: string;
  };
  workspaceName: string;
  contacts: { firstName: string; lastName: string; email: string | null; title: string | null }[];
  snapshot: {
    activeProjects: number;
    outstandingCents: number;
    outstandingCount: number;
    openTickets: number;
    amcCount: number;
  };
  projects: {
    id: string;
    name: string;
    phase: string;
    progress: number;
    dueDate: Date | null;
    contractValueCents: number;
    milestones: { id: string; name: string; done: boolean; dueDate: Date | null }[];
    counts: { rooms: number; drawings: number };
  }[];
  documents: {
    id: string;
    name: string;
    fileUrl: string;
    version: number;
    createdAt: Date;
    project: { id: string; name: string } | null;
  }[];
  tickets: {
    id: string;
    number: string;
    title: string;
    priority: string;
    status: string;
    createdAt: Date;
  }[];
  invoices: {
    id: string;
    number: string;
    status: string;
    totalCents: number;
    issuedAt: Date | null;
    dueAt: Date | null;
  }[];
  amcs: {
    id: string;
    name: string;
    tier: string;
    startDate: Date;
    endDate: Date;
    visitsTotal: number;
    visitsUsed: number;
    monthlyValueCents: number;
  }[];
  proposals: {
    quoteId: string;
    number: string;
    status: string;
    totalCents: number;
    signedByName: string | null;
    signedAt: Date | null;
    opportunityName: string;
  }[];
};

const TABS: { id: PortalTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview",  label: "Overview",  icon: LayoutDashboard },
  { id: "projects",  label: "Projects",  icon: FolderKanban },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "tickets",   label: "Tickets",   icon: LifeBuoy },
  { id: "invoices",  label: "Invoices",  icon: Receipt },
  { id: "amc",       label: "AMC",       icon: Shield },
];

export function PortalShell({ data }: { data: PortalData }) {
  const [tab, setTab] = useState<PortalTab>("overview");

  return (
    <>
      {/* Branded header */}
      <header className="border-b border-bone-300/55 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-8 w-8 rounded-md bg-ink-300 text-bone-100 flex items-center justify-center text-[12px] font-bold shrink-0">
              {data.workspaceName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-[11px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold leading-tight">
                Powered by {data.workspaceName}
              </div>
              <h1 className="text-heading-md font-display text-ink-300 leading-tight truncate">
                Welcome, {data.account.name}
              </h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[12px]">
            <Building2 className="h-3.5 w-3.5 text-ink-300/45" />
            <span className="text-ink-300/65">Health score</span>
            <span className="font-mono text-status-success-fg font-medium">
              {data.account.healthScore}%
            </span>
          </div>
        </div>

        {/* Tab strip */}
        <nav className="max-w-[1280px] mx-auto px-6 flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative shrink-0 inline-flex items-center gap-1.5 h-10 px-3 text-[13px] font-medium transition-colors",
                  active ? "text-ink-300" : "text-ink-300/55 hover:text-ink-300"
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {t.label}
                {active && (
                  <span className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full bg-signal-500" />
                )}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="max-w-[1280px] mx-auto px-6 py-8">
        {tab === "overview"  && <OverviewTab data={data} onJump={setTab} />}
        {tab === "projects"  && <ProjectsTab projects={data.projects} />}
        {tab === "documents" && <DocumentsTab documents={data.documents} />}
        {tab === "tickets"   && <TicketsTab tickets={data.tickets} />}
        {tab === "invoices"  && <InvoicesTab invoices={data.invoices} accountId={data.account.id} />}
        {tab === "amc"       && <AMCsTab amcs={data.amcs} />}
      </main>

      <footer className="border-t border-bone-300/55 bg-white">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between text-[11px] text-ink-300/55">
          <span>© {new Date().getFullYear()} {data.workspaceName}</span>
          <span>Need help? Reach your account team via the Tickets tab.</span>
        </div>
      </footer>
    </>
  );
}
