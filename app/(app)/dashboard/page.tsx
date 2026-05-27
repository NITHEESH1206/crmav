import { ModuleShell } from "@/components/app/module-shell";
import {
  getAttentionBar,
  getAtRiskProjects,
  getDelayedProcurement,
  getOverdueInvoices,
  getLowStock,
  getExpiringAMCs,
  getTodaysOps,
  getTeamUtilization,
  getPipelineSnapshot,
} from "@/lib/data/mission-control";
import { AttentionBar } from "@/components/mission-control/attention-bar";
import { AIBriefWidget } from "@/components/mission-control/ai-brief";
import { DashboardFrame } from "@/components/mission-control/dashboard-frame";
import {
  AtRiskProjectsWidget,
  DelayedProcurementWidget,
  OverdueInvoicesWidget,
  LowStockWidget,
  AMCRenewalsWidget,
  TodaysOpsWidget,
  PipelineRevenueWidget,
  TeamUtilizationWidget,
} from "@/components/mission-control/widgets";

export default async function DashboardPage() {
  const [
    attention,
    atRisk,
    delayedPOs,
    overdueInv,
    lowStock,
    amcs,
    todays,
    pipeline,
    team,
  ] = await Promise.all([
    getAttentionBar(7),
    getAtRiskProjects(5),
    getDelayedProcurement(5),
    getOverdueInvoices(5),
    getLowStock(5),
    getExpiringAMCs(5),
    getTodaysOps(),
    getPipelineSnapshot(),
    getTeamUtilization(),
  ]);

  return (
    <ModuleShell
      eyebrow="Mission Control"
      title="Today's operations"
      description="What needs attention, ranked by dollar at risk and time sensitivity. Every metric drills into its module."
    >
      <DashboardFrame>
        {/* ── Attention Bar ── */}
        <div className="mb-5">
          <AttentionBar items={attention} />
        </div>

        {/* ── Row 1: Today's Ops · Pipeline · Team · AI Brief ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-3">
          <TodaysOpsWidget {...todays} />
          <PipelineRevenueWidget {...pipeline} />
          <TeamUtilizationWidget {...team} />
          <AIBriefWidget items={attention} />
        </div>

        {/* ── Row 2: Operational risk ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mb-3">
          <AtRiskProjectsWidget projects={atRisk} />
          <DelayedProcurementWidget pos={delayedPOs} />
          <OverdueInvoicesWidget
            items={overdueInv.items}
            totalCents={overdueInv.totalCents}
            totalCount={overdueInv.totalCount}
          />
        </div>

        {/* ── Row 3: Inventory · AMC ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <LowStockWidget items={lowStock.items} totalLow={lowStock.totalLow} />
          <AMCRenewalsWidget items={amcs.items} totalMrrCents={amcs.totalMrrCents} />
        </div>
      </DashboardFrame>
    </ModuleShell>
  );
}
