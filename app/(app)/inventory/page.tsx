import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Boxes, ScanBarcode, AlertTriangle, RotateCcw } from "lucide-react";
import { listInventory, inventorySummary } from "@/lib/data/inventory";

export default async function InventoryPage() {
  const [items, summary] = await Promise.all([listInventory(), inventorySummary()]);

  const stats = [
    { l: "SKUs tracked", v: summary.skus.toLocaleString(), icon: Boxes },
    { l: "Devices allocated", v: summary.devicesDeployed.toLocaleString(), icon: ScanBarcode },
    { l: "Low-stock alerts", v: summary.lowStock.toString(), icon: AlertTriangle, alert: summary.lowStock > 0 },
    { l: "Open RMAs", v: summary.openRMAs.toString(), icon: RotateCcw },
  ];

  return (
    <ModuleShell
      eyebrow="Inventory"
      title="Warehouse & Devices"
      description="Serial-number tracking, barcode scanning, multi-warehouse, RMA workflows, device lifecycle."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.l}>
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-3 ${s.alert ? "bg-amber-500/10 border-amber-500/30" : "bg-aether-500/10 border-aether-500/30"}`}>
                  <Icon className={`h-4 w-4 ${s.alert ? "text-amber-400" : "text-aether-400"}`} />
                </div>
                <div className="text-xs text-white/45">{s.l}</div>
                <div className="font-display text-3xl font-semibold tracking-tight mt-1">{s.v}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader><CardTitle>Stock levels</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[140px_2fr_1fr_60px_60px_60px_140px_60px] text-[10px] uppercase tracking-wider text-white/40 px-5 py-3 border-y border-white/[0.04]">
            <div>SKU</div>
            <div>Product</div>
            <div>Brand</div>
            <div>Stock</div>
            <div>Alloc.</div>
            <div>Reord.</div>
            <div>Health</div>
            <div>Value</div>
          </div>
          {items.map((i) => {
            const health = Math.min(100, Math.round((i.stock / Math.max(1, i.reorderLevel * 3)) * 100));
            return (
              <div key={i.id} className="grid grid-cols-[140px_2fr_1fr_60px_60px_60px_140px_60px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.015] cursor-pointer">
                <div className="text-[11px] text-white/40 font-mono truncate">{i.catalogItem.sku}</div>
                <div className="text-sm font-medium truncate">{i.catalogItem.name}</div>
                <div className="text-xs text-white/55">{i.catalogItem.brand}</div>
                <div className={`text-sm font-mono ${i.stock <= i.reorderLevel ? "text-amber-400" : "text-white"}`}>{i.stock}</div>
                <div className="text-sm font-mono text-white/55">{i.allocated}</div>
                <div className="text-xs text-white/40">{i.reorderLevel}</div>
                <div className="flex items-center gap-2">
                  <Progress value={health} className="flex-1" />
                  <span className="text-[10px] font-mono w-7 text-right">{health}</span>
                </div>
                <div className="text-xs font-mono text-white/55">
                  ${((i.stock * i.catalogItem.listPriceCents) / 100_000).toFixed(0)}k
                </div>
              </div>
            );
          })}
          {items.length === 0 && <div className="px-5 py-8 text-center text-xs text-white/40">No inventory yet.</div>}
        </CardContent>
      </Card>
    </ModuleShell>
  );
}
