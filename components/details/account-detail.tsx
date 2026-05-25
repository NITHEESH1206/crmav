"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  FolderKanban,
  LifeBuoy,
  Receipt,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Mail,
  Star,
} from "lucide-react";
import { DetailHeader } from "@/components/details/detail-header";
import { EditableField } from "@/components/details/editable-field";
import { StatusPill } from "@/components/details/status-pill";
import { RelatedList } from "@/components/details/related-list";
import { AICard } from "@/components/ai/ai-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { updateAccount } from "@/app/actions/update";
import { formatCompact, initials } from "@/lib/utils";

type Account = {
  id: string;
  name: string;
  tier: string;
  industry: string | null;
  website: string | null;
  ltvCents: number;
  healthScore: number;
  contacts: { id: string; firstName: string; lastName: string; title: string | null; email: string | null; isPrimary: boolean }[];
  projects: { id: string; name: string; phase: string; contractValueCents: number }[];
  tickets: { id: string; number: string; title: string; status: string; priority: string }[];
  invoices: { id: string; number: string; status: string; totalCents: number; issuedAt: Date | null }[];
  subscriptions: { id: string; plan: string; monthlyCents: number; renewsAt: Date | null }[];
  amcs: { id: string; name: string; tier: string; healthScore: number; endDate: Date }[];
};

const TIER_OPTS = [
  { value: "STARTER", label: "Starter", tone: "neutral" as const },
  { value: "GROWTH", label: "Growth", tone: "default" as const },
  { value: "ENTERPRISE", label: "Enterprise", tone: "success" as const },
];

export function AccountDetail({ account }: { account: Account }) {
  const mrr = account.subscriptions.reduce((s, x) => s + x.monthlyCents, 0);

  return (
    <div className="space-y-6">
      <DetailHeader
        eyebrow="Account"
        backHref="/accounts"
        backLabel="Back to accounts"
        icon={Building2}
        title={account.name}
        subtitle={account.industry}
        badges={
          <>
            <StatusPill
              value={account.tier}
              options={TIER_OPTS}
              onChange={(v) => updateAccount({ id: account.id, tier: v as typeof account.tier as never })}
            />
            <Badge variant="secondary">${formatCompact(account.ltvCents / 100)} LTV</Badge>
            <Badge variant={account.healthScore >= 80 ? "success" : account.healthScore >= 60 ? "warning" : "destructive"}>
              {account.healthScore}% health
            </Badge>
            {mrr > 0 && <Badge>${formatCompact(mrr / 100)}/mo recurring</Badge>}
          </>
        }
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Mail className="h-3.5 w-3.5" />
              Email
            </Button>
            <Button size="sm">
              <Sparkles className="h-3.5 w-3.5" />
              Account brief
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5">
            <EditableField
              label="Company name"
              value={account.name}
              onSave={(name) => updateAccount({ id: account.id, name })}
            />
            <EditableField
              label="Industry"
              value={account.industry ?? ""}
              onSave={(industry) => updateAccount({ id: account.id, industry: industry || null })}
            />
            <EditableField
              label="Website"
              value={account.website ?? ""}
              onSave={(website) => updateAccount({ id: account.id, website: website || null })}
            />
            <EditableField
              label="Health score (%)"
              value={account.healthScore}
              kind="number"
              displayValue={`${account.healthScore}%`}
              onSave={(v) => updateAccount({ id: account.id, healthScore: parseInt(v, 10) })}
            />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">Lifetime value</div>
              <div className="mt-1 text-sm font-mono">${(account.ltvCents / 100).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/40">Recurring MRR</div>
              <div className="mt-1 text-sm font-mono">${(mrr / 100).toLocaleString()}/mo</div>
            </div>
          </CardContent>
        </Card>

        <AICard
          title="Executive brief"
          description="AI-generated account analysis for your QBR"
          endpoint="/api/ai/account-brief"
          payload={{ accountId: account.id }}
          cta="Generate brief"
          initialAutoRun={false}
        />
      </div>

      {/* Contacts */}
      <Card>
        <CardHeader className="flex-row items-center gap-2">
          <Users className="h-3.5 w-3.5 text-aether-400" />
          <CardTitle className="text-sm">Contacts</CardTitle>
          <Badge variant="secondary" className="ml-auto">{account.contacts.length}</Badge>
        </CardHeader>
        <CardContent className="p-0">
          {account.contacts.length === 0 ? (
            <div className="px-6 pb-6 text-xs text-white/40 italic">No contacts yet.</div>
          ) : (
            <div className="border-t border-white/[0.04]">
              {account.contacts.map((c) => (
                <div key={c.id} className="flex items-center gap-3 px-6 py-3 border-b border-white/[0.04] last:border-b-0">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-[10px]">
                      {initials(`${c.firstName} ${c.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium flex items-center gap-1.5">
                      {c.firstName} {c.lastName}
                      {c.isPrimary && <Star className="h-3 w-3 fill-aether-400 text-aether-400" />}
                    </div>
                    <div className="text-[11px] text-white/45">{c.title ?? "—"} · {c.email ?? "no email"}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RelatedList
          title="Projects"
          icon={FolderKanban}
          items={account.projects.map((p) => ({
            id: p.id,
            label: p.name,
            meta: `${p.phase.toLowerCase()} · $${formatCompact(p.contractValueCents / 100)}`,
            href: `/projects/${p.id}`,
          }))}
          empty="No projects yet."
        />
        <RelatedList
          title="Tickets"
          icon={LifeBuoy}
          items={account.tickets.map((t) => ({
            id: t.id,
            label: t.title,
            meta: `${t.number} · ${t.status.toLowerCase()}`,
            href: `/service/${t.id}`,
            badge: {
              label: t.priority,
              tone: t.priority === "P1" ? "destructive" : t.priority === "P2" ? "warning" : "secondary",
            },
          }))}
          empty="No tickets."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RelatedList
          title="Invoices"
          icon={Receipt}
          items={account.invoices.map((i) => ({
            id: i.id,
            label: i.number,
            meta: i.issuedAt?.toLocaleDateString() ?? "—",
            badge: {
              label: i.status,
              tone: i.status === "PAID" ? "success" : i.status === "OVERDUE" ? "destructive" : "secondary",
            },
            right: (
              <span className="text-sm font-mono text-white/85">
                ${formatCompact(i.totalCents / 100)}
              </span>
            ),
          }))}
          empty="No invoices."
        />
        <RelatedList
          title="Subscriptions & AMC"
          icon={ShieldCheck}
          items={[
            ...account.subscriptions.map((s) => ({
              id: s.id,
              label: s.plan,
              meta: `Renews ${s.renewsAt?.toLocaleDateString() ?? "—"}`,
              right: (
                <span className="text-sm font-mono text-aether-400 flex items-center gap-1">
                  <RefreshCcw className="h-3 w-3" />
                  ${formatCompact(s.monthlyCents / 100)}/mo
                </span>
              ),
            })),
            ...account.amcs.map((a) => ({
              id: a.id,
              label: a.name,
              meta: `${a.tier.toLowerCase()} · expires ${a.endDate.toLocaleDateString()}`,
              badge: {
                label: `${a.healthScore}%`,
                tone: a.healthScore >= 80 ? ("success" as const) : ("warning" as const),
              },
            })),
          ]}
          empty="No subscriptions or AMC contracts."
        />
      </div>
    </div>
  );
}
