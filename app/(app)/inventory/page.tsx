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

  const exportRows = items.map((i) => ({
    sku: i.catalogItem.sku,
    product: i.catalogItem.name,
    brand: i.catalogItem.brand,
    category: i.catalogItem.category,
    warehouse: i.warehouse?.name ?? "",
    stock: i.stock,
    allocated: i.allocated,
    reorder_level: i.reorderLevel,
    unit_price_usd: (i.catalogItem.listPriceCents / 100).toFixed(2),
    stock_value_usd: ((i.stock * i.catalogItem.listPriceCents) / 100).toFixed(2),
  }));

  return (
    <ModuleShell
      eyebrow="Inventory"
      title="Warehouse & Devices"
      description="Serial-number tracking, barcode scanning, multi-warehouse, RMA workflows, device lifecycle."
      exportConfig={{
        filenamePrefix: "inventory",
        rows: exportRows,
        columns: [
          { key: "sku", header: "SKU" },
          { key: "product", header: "Product" },
          { key: "brand", header: "Brand" },
          { key: "category", header: "Category" },
          { key: "warehouse", header: "Warehouse" },
          { key: "stock", header: "Stock" },
          { key: "allocated", header: "Allocated" },
          { key: "reorder_level", header: "Reorder level" },
          { key: "unit_price_usd", header: "Unit price (USD)" },
          { key: "stock_value_usd", header: "Stock value (USD)" },
        ],
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.l}>
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl border flex items-center justify-center mb-3 ${s.alert ? "bg-amber-500/10 border-amber-500/30" : "bg-signal-500/10 border-signal-500/30"}`}>
                  <Icon className={`h-4 w-4 ${s.alert ? "text-amber-400" : "text-signal-400"}`} />
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
          <div className="hidden md:grid grid-cols-[140px_2fr_1fr_60px_60px_60px_140px_60px] text-[10px] uppercase tracking-wider text-white/40 px-5 py-3 border-y border-white/[0.04]">
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
              <div key={i.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[140px_2fr_1fr_60px_60px_60px_140px_60px] items-start md:items-center gap-3 px-4 md:px-5 py-3 md:py-3.5 border-b border-white/[0.04] hover:bg-white/[0.015] cursor-pointer">
                <div className="hidden md:block text-[11px] text-white/40 font-mono truncate">{i.catalogItem.sku}</div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{i.catalogItem.name}</div>
                  <div className="md:hidden mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-white/55">
                    <span className="font-mono text-white/40">{i.catalogItem.sku}</span>
                    <span>·</span>
                    <span>{i.catalogItem.brand}</span>
                    <span>·</span>
                    <span className={i.stock <= i.reorderLevel ? "text-amber-400 font-mono" : "font-mono"}>{i.stock} in stock</span>
                    <span className="text-white/40">({i.allocated} allocated)</span>
                  </div>
                </div>
                <div className="hidden md:block text-xs text-white/55">{i.catalogItem.brand}</div>
                <div className={`hidden md:block text-sm font-mono ${i.stock <= i.reorderLevel ? "text-amber-400" : "text-white"}`}>{i.stock}</div>
                <div className="hidden md:block text-sm font-mono text-white/55">{i.allocated}</div>
                <div className="hidden md:block text-xs text-white/40">{i.reorderLevel}</div>
                <div className="hidden md:flex items-center gap-2">
                  <Progress value={health} className="flex-1" />
                  <span className="text-[10px] font-mono w-7 text-right">{health}</span>
                </div>
                <div className="text-xs font-mono text-white/55 self-start md:self-center whitespace-nowrap">
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
