import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { MarginChart, ServiceMixChart } from "@/components/modules/reports-charts";
import { projectMarginData, serviceMix, reportsSummary } from "@/lib/data/reports";
import { formatCompact } from "@/lib/utils";

export default async function ReportsPage() {
  const [margins, mix, summary] = await Promise.all([
    projectMarginData(),
    serviceMix(),
    reportsSummary(),
  ]);

  const stats = [
    { l: "Revenue (paid)", v: `$${formatCompact(summary.revenueYtdCents / 100)}` },
    { l: "Avg project margin", v: `${summary.avgMargin.toFixed(1)}%` },
    { l: "Service rooms", v: mix.reduce((s, d) => s + d.count, 0).toString() },
    { l: "Active projects", v: margins.length.toString() },
  ];

  return (
    <ModuleShell
      eyebrow="Reports"
      title="Analytics"
      description="Revenue reports, project profitability, service analytics, inventory valuation, technician productivity."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <MarginChart data={margins} />
        <ServiceMixChart data={mix} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
        {stats.map((s) => (
          <Card key={s.l}>
            <CardContent className="p-5">
              <div className="text-xs text-white/45">{s.l}</div>
              <div className="font-display text-3xl font-semibold tracking-tight mt-1 text-gradient">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ModuleShell>
  );
}
