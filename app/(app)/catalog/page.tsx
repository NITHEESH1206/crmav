import { ModuleShell } from "@/components/app/module-shell";
import { CatalogBrowser } from "@/components/catalog/catalog-browser";
import { listCatalog, catalogCategories, catalogBrands } from "@/lib/data/catalog";

export default async function CatalogPage() {
  const [products, categories, brands] = await Promise.all([
    listCatalog(),
    catalogCategories(),
    catalogBrands(),
  ]);

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
      title="AV Products"
      description={`${products.length} products from ${Object.keys(brands).length} brands. Filter by brand or category, drop into any room's BOQ.`}
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
    >
      <CatalogBrowser
        items={products.map((p) => ({
          id: p.id,
          sku: p.sku,
          name: p.name,
          brand: p.brand,
          category: p.category,
          description: p.description,
          listPriceCents: p.listPriceCents,
          costCents: p.costCents,
          imageUrl: p.imageUrl,
        }))}
        brands={brands}
        categories={categories}
      />
    </ModuleShell>
  );
}
