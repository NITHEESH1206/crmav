import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Sparkles, Cable, MonitorPlay, Radio, Cpu, type LucideIcon } from "lucide-react";
import { listCatalog, catalogCategories } from "@/lib/data/catalog";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  Displays: MonitorPlay,
  Audio: Radio,
  Control: Cpu,
  Distribution: Cable,
  Conferencing: MonitorPlay,
};

export default async function CatalogPage() {
  const [products, categories] = await Promise.all([listCatalog(), catalogCategories()]);

  const exportRows = products.map((p) => ({
    sku: p.sku,
    name: p.name,
    brand: p.brand,
    category: p.category,
    list_price_usd: (p.listPriceCents / 100).toFixed(2),
    cost_usd: (p.costCents / 100).toFixed(2),
    margin_usd: ((p.listPriceCents - p.costCents) / 100).toFixed(2),
  }));

  return (
    <ModuleShell
      eyebrow="Catalog"
      exportConfig={{
        filenamePrefix: "catalog",
        rows: exportRows,
        columns: [
          { key: "sku", header: "SKU" },
          { key: "name", header: "Product" },
          { key: "brand", header: "Brand" },
          { key: "category", header: "Category" },
          { key: "list_price_usd", header: "List price (USD)" },
          { key: "cost_usd", header: "Cost (USD)" },
          { key: "margin_usd", header: "Margin (USD)" },
        ],
      }}
      title="AV Products"
      description="Brands, specifications, datasheets, and AV package builder. Drives quotes and BOQs."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(categories)
          .slice(0, 4)
          .map(([name, count]) => {
            const Icon = CATEGORY_ICONS[name] ?? Cable;
            return (
              <Card key={name}>
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-aether-500/20 to-aether-500/5 border border-aether-500/30 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-aether-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-xs text-white/40 mt-0.5">{count} products</div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <Card key={p.id} className="overflow-hidden group hover-lift cursor-pointer">
            <div className="aspect-[16/9] relative bg-gradient-to-br from-aether-500/10 via-transparent to-transparent border-b border-white/[0.06]">
              <div className="absolute inset-0 grid-pattern opacity-30" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cable className="h-12 w-12 text-white/20 group-hover:text-aether-400/60 transition-colors" strokeWidth={1.2} />
              </div>
              <Badge variant="secondary" className="absolute top-3 left-3">{p.brand}</Badge>
            </div>
            <CardContent className="p-4">
              <div className="text-sm font-medium leading-tight">{p.name}</div>
              <div className="text-[11px] text-white/45 mt-1">{p.category}</div>
              <div className="mt-3 flex items-center justify-between">
                <div className="font-display text-lg font-semibold text-gradient">
                  ${(p.listPriceCents / 100).toLocaleString()}
                </div>
                <button className="text-aether-400 text-xs flex items-center gap-1 hover:text-aether-300">
                  <Download className="h-3 w-3" />
                  Datasheet
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardContent className="p-5 flex flex-col sm:flex-row items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-aether-500/15 border border-aether-500/30 flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-aether-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">AV Package Builder</div>
            <div className="text-xs text-white/55 mt-0.5">
              Pre-configured kits for boardrooms, huddle rooms, training spaces, command centers — drop into any quote.
            </div>
          </div>
        </CardContent>
      </Card>
    </ModuleShell>
  );
}
