import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, CheckCircle2, Clock } from "lucide-react";
import { formatCompact, formatDate } from "@/lib/utils";
import { listPurchaseOrders, poSummary } from "@/lib/data/procurement";

const stateIcon = (s: string) => (s === "IN_TRANSIT" ? Truck : s === "DELIVERED" ? CheckCircle2 : Clock);
const stateColor = (s: string) =>
  s === "IN_TRANSIT" ? "text-aether-400" : s === "DELIVERED" ? "text-emerald-400" : "text-amber-400";

export default async function ProcurementPage() {
  const [pos, summary] = await Promise.all([listPurchaseOrders(), poSummary()]);

  const stats = [
    { l: "Open POs", v: summary.open.toString() },
    { l: "In-transit value", v: `$${formatCompact(summary.inTransitCents / 100)}` },
    { l: "Pending approval", v: summary.pending.toString() },
    { l: "Avg lead time", v: `${summary.avgLeadDays}d` },
  ];

  return (
    <ModuleShell
      eyebrow="Procurement"
      title="Purchase Orders & Vendors"
      description="Vendor management, quote comparison, approval workflows, and live shipment tracking."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.l}>
            <CardContent className="p-5">
              <div className="text-xs text-white/45">{s.l}</div>
              <div className="font-display text-3xl font-semibold tracking-tight mt-1">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Purchase orders</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[100px_1fr_120px_120px_100px] text-[10px] uppercase tracking-wider text-white/40 px-5 py-3 border-y border-white/[0.04]">
            <div>PO</div>
            <div>Vendor</div>
            <div>Value</div>
            <div>ETA</div>
            <div>Status</div>
          </div>
          {pos.map((po) => {
            const Icon = stateIcon(po.status);
            return (
              <div key={po.id} className="grid grid-cols-[100px_1fr_120px_120px_100px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.015] cursor-pointer">
                <div className="text-[11px] text-white/40 font-mono">{po.number}</div>
                <div className="text-sm font-medium">{po.vendor.name}</div>
                <div className="text-sm font-mono">${formatCompact(po.totalCents / 100)}</div>
                <div className="text-xs text-white/55">
                  {po.expectedDate ? formatDate(po.expectedDate, { month: "short", day: "numeric" }) : "—"}
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-3.5 w-3.5 ${stateColor(po.status)}`} />
                  <span className="text-xs capitalize">{po.status.toLowerCase().replace("_", " ")}</span>
                </div>
              </div>
            );
          })}
          {pos.length === 0 && <div className="px-5 py-8 text-center text-xs text-white/40">No purchase orders.</div>}
        </CardContent>
      </Card>
    </ModuleShell>
  );
}
