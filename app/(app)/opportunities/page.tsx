import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, TrendingUp, Building2 } from "lucide-react";
import { initials, formatCompact } from "@/lib/utils";
import { getOpportunitiesByStage } from "@/lib/data/opportunities";
import { OpenableRow } from "@/components/app/openable";
import { CrmImportButton } from "@/components/crm/import-dialog";

const STAGE_LABEL: Record<string, string> = {
  DISCOVERY: "Discovery",
  PROPOSAL: "Proposal",
  NEGOTIATION: "Negotiation",
  CLOSED_WON: "Closed Won",
};

export default async function OpportunitiesPage() {
  const columns = await getOpportunitiesByStage();
  const totalPipeline = columns
    .filter((c) => c.stage !== "CLOSED_WON" && c.stage !== "CLOSED_LOST")
    .reduce((s, c) => s + c.totalCents, 0);

  const exportRows = columns.flatMap((c) =>
    c.deals.map((d) => ({
      name: d.name,
      account: d.account?.name ?? "",
      stage: d.stage,
      value_usd: (d.valueCents / 100).toFixed(2),
      probability_pct: d.probability,
      ai_score: d.aiScore ?? "",
      owner: d.owner?.name ?? "",
      expected_close: d.expectedClose ? d.expectedClose.toISOString().slice(0, 10) : "",
      created_at: d.createdAt.toISOString(),
    }))
  );

  return (
    <ModuleShell
      eyebrow="Sales"
      title="Opportunities"
      description="Stage-aware kanban with AI deal scoring, quotation builder, and live proposal generation."
      exportConfig={{
        filenamePrefix: "opportunities",
        rows: exportRows,
        columns: [
          { key: "name", header: "Name" },
          { key: "account", header: "Account" },
          { key: "stage", header: "Stage" },
          { key: "value_usd", header: "Value (USD)" },
          { key: "probability_pct", header: "Probability %" },
          { key: "ai_score", header: "AI score" },
          { key: "owner", header: "Owner" },
          { key: "expected_close", header: "Expected close" },
          { key: "created_at", header: "Created" },
        ],
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-[12.5px] text-ink-300/55">
          Total open pipeline · <span className="font-mono text-ink-300/80">${formatCompact(totalPipeline / 100)}</span>
        </div>
        <CrmImportButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => (
          <div key={col.stage} className="flex flex-col gap-3 min-h-[400px]">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{STAGE_LABEL[col.stage] ?? col.stage}</span>
                <Badge variant="secondary" className="h-5">{col.deals.length}</Badge>
              </div>
              <span className="text-xs text-ink-300/55 font-mono">${formatCompact(col.totalCents / 100)}</span>
            </div>

            <div className="flex flex-col gap-2.5 flex-1 rounded-2xl bg-bone-50/50 border border-bone-300/45 p-2.5">
              {col.deals.map((d) => (
                <OpenableRow key={d.id} kind="opportunity" id={d.id}>
                <Card className="hover-lift">
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-2 text-[10px] text-ink-300/45 font-mono">
                      {d.id.slice(0, 8)}
                    </div>
                    <div className="text-sm font-medium mt-1 leading-tight">{d.name}</div>
                    <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-ink-300/55">
                      <Building2 className="h-3 w-3" />
                      {d.account?.name ?? "—"}
                    </div>
                    <div className="mt-3 pt-3 border-t border-bone-300/55 flex items-center justify-between">
                      <div className="font-display text-base font-semibold text-gradient">
                        ${formatCompact(d.valueCents / 100)}
                      </div>
                      <div className="flex items-center gap-2">
                        {d.aiScore !== null && d.aiScore !== undefined && (
                          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-signal-500/10 border border-signal-500/20 text-[10px] text-signal-400">
                            <Sparkles className="h-2.5 w-2.5" />
                            {d.aiScore}
                          </div>
                        )}
                        {d.owner && (
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-[9px]">{initials(d.owner.name)}</AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </OpenableRow>
              ))}
              <button className="rounded-xl border border-dashed border-bone-300/65 text-xs text-ink-300/50 py-3 hover:text-ink-300/80 hover:border-signal-500/40 transition-colors">
                + Add deal
              </button>
            </div>
          </div>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-signal-500/15 border border-signal-500/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-signal-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">AI insight</div>
            <div className="text-xs text-ink-300/65 mt-0.5">
              ${formatCompact(totalPipeline / 100)} active pipeline. Deals stuck in Proposal &gt; 14 days drop 41% in win rate.
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="h-3 w-3" />
            Live data
          </div>
        </CardContent>
      </Card>
    </ModuleShell>
  );
}
