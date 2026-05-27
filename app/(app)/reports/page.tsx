import { ModuleShell } from "@/components/app/module-shell";
import {
  RevenueTrendCard,
  PipelineFunnelCard,
  ProfitabilityCard,
  SLAComplianceCard,
  UtilizationCard,
  HealthDistributionCard,
  ReportStat,
} from "@/components/reports/report-cards";
import {
  revenueByMonth,
  pipelineFunnelDetail,
  projectProfitability,
  slaComplianceTrend,
  technicianUtilization,
  customerHealthDistribution,
  reportsSummary,
} from "@/lib/data/reports";
import { formatCompact } from "@/lib/utils";

export default async function ReportsPage() {
  const [revenue, pipeline, profitability, sla, utilization, health, summary] = await Promise.all([
    revenueByMonth(),
    pipelineFunnelDetail(),
    projectProfitability(),
    slaComplianceTrend(),
    technicianUtilization(),
    customerHealthDistribution(),
    reportsSummary(),
  ]);

  return (
    <ModuleShell
      eyebrow="Reports"
      title="Analytics"
      description="Live revenue, pipeline, profitability, service SLA, technician utilization, and customer health — all driven from your live Neon data."
    >
      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <ReportStat label="Revenue (paid)" value={`$${formatCompact(summary.revenueYtdCents / 100)}`} iconKey="dollar" />
        <ReportStat label="Avg project margin" value={`${summary.avgMargin}%`} iconKey="trending" />
        <ReportStat label="Active accounts" value={summary.activeAccounts.toString()} iconKey="building" />
        <ReportStat label="Tickets resolved" value={summary.resolvedTickets.toString()} iconKey="wrench" />
      </div>

      {/* Hero row — revenue trend (2 cols) + pipeline funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <RevenueTrendCard data={revenue} />
        <PipelineFunnelCard data={pipeline} />
      </div>

      {/* Mid row — profitability + SLA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <ProfitabilityCard data={profitability} />
        <SLAComplianceCard data={sla} />
      </div>

      {/* Bottom row — utilization + health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <UtilizationCard data={utilization} />
        <HealthDistributionCard data={health} />
      </div>
    </ModuleShell>
  );
}
