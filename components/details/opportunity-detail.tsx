"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileSignature, MessageSquare, Target, Building2 } from "lucide-react";
import { DetailHeader } from "@/components/details/detail-header";
import { EditableField, EditableSelect } from "@/components/details/editable-field";
import { StatusPill } from "@/components/details/status-pill";
import { RelatedList } from "@/components/details/related-list";
import { updateOpportunity } from "@/app/actions/update";
import { formatCompact } from "@/lib/utils";
import { StageBar, type Stage, type StageState } from "@/components/app/stage-bar";
import { GenerateButton } from "@/components/ai/generate-button";
import { ProvenanceBadge } from "@/components/ai/provenance-badge";

type Opp = {
  id: string;
  name: string;
  stage: string;
  valueCents: number;
  probability: number;
  aiScore: number | null;
  expectedClose: Date | null;
  ownerId: string | null;
  createdAt: Date;
  account: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
  quote: { id: string; number: string; status: string; totalCents: number } | null;
  project: { id: string; name: string; phase: string } | null;
};

const STAGE_OPTS = [
  { value: "DISCOVERY", label: "Discovery", tone: "neutral" as const },
  { value: "SITE_SURVEY", label: "Site Survey", tone: "info" as const },
  { value: "PROPOSAL", label: "Proposal", tone: "default" as const },
  { value: "NEGOTIATION", label: "Negotiation", tone: "warning" as const },
  { value: "CLOSED_WON", label: "Closed Won", tone: "success" as const },
  { value: "CLOSED_LOST", label: "Closed Lost", tone: "destructive" as const },
];

export function OpportunityDetail({ opp, users }: { opp: Opp; users: { id: string; name: string }[] }) {
  return (
    <div className="space-y-6">
      <DetailHeader
        eyebrow="Opportunity"
        backHref="/opportunities"
        backLabel="Back to opportunities"
        icon={Target}
        title={opp.name}
        subtitle={
          opp.account && (
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5" />
              {opp.account.name}
            </span>
          )
        }
        badges={
          <>
            <StatusPill
              value={opp.stage}
              options={STAGE_OPTS}
              onChange={(stage) =>
                updateOpportunity({ id: opp.id, stage: stage as typeof opp.stage as never })
              }
            />
            <Badge variant="secondary">${formatCompact(opp.valueCents / 100)}</Badge>
            <Badge variant="secondary">{opp.probability}% prob.</Badge>
            {opp.aiScore != null && (
              <Badge variant="default" className="gap-1">
                <Sparkles className="h-3 w-3" />
                AI {opp.aiScore}
              </Badge>
            )}
          </>
        }
        actions={
          <>
            <GenerateButton
              entityId={opp.id}
              entityLabel={opp.name}
              sourceLabel={opp.account?.name}
              size="sm"
              options={[
                {
                  kind: "opportunity-proposal",
                  label: "Proposal",
                  description: "Full client-ready proposal narrative",
                },
                {
                  kind: "opportunity-email-followup",
                  label: "Follow-up email",
                  description: "Short stage-aware client email",
                },
                {
                  kind: "opportunity-account-brief",
                  label: "Account brief",
                  description: "QBR-ready account summary",
                },
              ]}
            />
            <Button size="sm" variant="secondary">
              <MessageSquare className="h-3.5 w-3.5" />
              Email client
            </Button>
          </>
        }
      />

      <StageBar
        stages={buildOppSpine(opp)}
        currentNote={`Stage · ${opp.stage.toLowerCase().replace("_", " ")}`}
        nextGate={NEXT_STAGE[opp.stage] ?? "Close the deal"}
        onPromote={
          NEXT_STAGE[opp.stage]
            ? () =>
                updateOpportunity({
                  id: opp.id,
                  stage: NEXT_STAGE[opp.stage] as typeof opp.stage as never,
                })
            : undefined
        }
        promoteLabel={NEXT_STAGE[opp.stage] ? `Move to ${NEXT_STAGE[opp.stage]!.toLowerCase().replace("_", " ")}` : "Mark as won"}
        promoteDisabled={opp.stage === "CLOSED_WON" || opp.stage === "CLOSED_LOST"}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5">
            <EditableField
              label="Name"
              value={opp.name}
              onSave={(name) => updateOpportunity({ id: opp.id, name })}
            />
            <EditableField
              label="Deal value (USD)"
              value={opp.valueCents / 100}
              kind="money"
              displayValue={`$${(opp.valueCents / 100).toLocaleString()}`}
              onSave={(v) =>
                updateOpportunity({ id: opp.id, valueCents: Math.round(parseFloat(v) * 100) })
              }
            />
            <EditableField
              label="Probability (%)"
              value={opp.probability}
              kind="number"
              displayValue={`${opp.probability}%`}
              onSave={(v) => updateOpportunity({ id: opp.id, probability: parseInt(v, 10) })}
            />
            <EditableField
              label="Expected close"
              value={opp.expectedClose ? opp.expectedClose.toISOString().slice(0, 10) : ""}
              kind="date"
              displayValue={opp.expectedClose?.toLocaleDateString() ?? "—"}
              onSave={(v) => updateOpportunity({ id: opp.id, expectedClose: v || null })}
            />
            <EditableSelect
              label="Owner"
              value={opp.ownerId ?? ""}
              options={[{ value: "", label: "Unassigned" }, ...users.map((u) => ({ value: u.id, label: u.name }))]}
              onSave={(v) => updateOpportunity({ id: opp.id, ownerId: v || null })}
            />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-ink-300/50">Created</div>
              <div className="mt-1 text-sm text-ink-300/90">{opp.createdAt.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-signal-500" />
              AI insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5 text-sm text-ink-300/85 leading-relaxed">
            <ProvenanceBadge date={opp.createdAt} className="mb-3" />
            <p>· Similar deals at this stage close in 14–22 days on average.</p>
            <p>· Account health is {opp.account ? "strong" : "unknown"} — outreach likely well-received.</p>
            <p>· Recommended next step: schedule a discovery call within 3 days.</p>
            <p>· Suggested BOQ template: Boardroom Premium (Crestron + Q-SYS + Shure).</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RelatedList
          title="Quote"
          icon={FileSignature}
          items={
            opp.quote
              ? [
                  {
                    id: opp.quote.id,
                    label: `Quote ${opp.quote.number}`,
                    meta: `$${formatCompact(opp.quote.totalCents / 100)} · ${opp.quote.status}`,
                    badge: { label: opp.quote.status, tone: opp.quote.status === "SIGNED" ? "success" : "secondary" },
                  },
                ]
              : []
          }
          empty="No quote yet. Generate one from the AI button above."
        />
        <RelatedList
          title="Project"
          items={
            opp.project
              ? [
                  {
                    id: opp.project.id,
                    label: opp.project.name,
                    meta: opp.project.phase.toLowerCase(),
                    href: `/projects/${opp.project.id}`,
                  },
                ]
              : []
          }
          empty="No project linked yet. Will be auto-created when stage moves to Closed Won."
        />
      </div>
    </div>
  );
}

/** Opportunity stage → next stage progression. */
const NEXT_STAGE: Record<string, string | null> = {
  DISCOVERY: "SITE_SURVEY",
  SITE_SURVEY: "PROPOSAL",
  PROPOSAL: "NEGOTIATION",
  NEGOTIATION: "CLOSED_WON",
  CLOSED_WON: null,
  CLOSED_LOST: null,
};

const OPP_STAGE_TO_SPINE: Record<string, string> = {
  DISCOVERY: "opp",
  SITE_SURVEY: "opp",
  PROPOSAL: "prop",
  NEGOTIATION: "prop",
  CLOSED_WON: "proj",
  CLOSED_LOST: "opp",
};

const SPINE_KEYS = ["opp", "prop", "proj", "rack", "flow", "comm", "amc"] as const;
const SPINE_LABELS: Record<string, string> = {
  opp: "Opportunity",
  prop: "Proposal",
  proj: "Project",
  rack: "Rack",
  flow: "Signal Flow",
  comm: "Commissioning",
  amc: "AMC",
};

function buildOppSpine(opp: { stage: string; project: { id: string } | null }): Stage[] {
  const currentKey = OPP_STAGE_TO_SPINE[opp.stage] ?? "opp";
  const currentIdx = SPINE_KEYS.indexOf(currentKey as (typeof SPINE_KEYS)[number]);
  return SPINE_KEYS.map((key, i) => {
    let state: StageState;
    if (i < currentIdx) state = "done";
    else if (i === currentIdx) state = "current";
    else state = "todo";
    // If project exists and we're still in opp/prop, mark project as in-progress hint.
    if (key === "proj" && opp.project && i > currentIdx) state = "done";
    return { key, label: SPINE_LABELS[key], state };
  });
}
