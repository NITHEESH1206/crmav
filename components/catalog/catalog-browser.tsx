"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Download,
  Cable,
  MonitorPlay,
  Radio,
  Cpu,
  Mic2,
  Camera,
  Server,
  Speaker,
  Sparkles,
  Layers3,
  Boxes,
  Plug,
  Box,
  Tv2,
  Headphones,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCompact } from "@/lib/utils";
import { CatalogImportButton } from "./import-dialog";

export type CatalogRow = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  description: string | null;
  listPriceCents: number;
  costCents: number;
  imageUrl?: string | null;
};

const CATEGORY_ICON: Record<string, LucideIcon> = {
  "Display":                   MonitorPlay,
  "Display - Interactive":     MonitorPlay,
  "Display - Video Wall LED":  Tv2,
  "Display - Outdoor":         MonitorPlay,
  "Projector":                 Tv2,
  "Video Switcher":            Layers3,
  "AVoIP Encoder":             Plug,
  "AVoIP Decoder":             Plug,
  "AVoIP Other":               Plug,
  "DSP":                       Cpu,
  "Amplifier":                 Volume2,
  "Microphone - Ceiling":      Mic2,
  "Microphone - Wireless":     Mic2,
  "Microphone - Boundary":     Mic2,
  "Speaker - Ceiling":         Speaker,
  "Speaker - Surface":         Speaker,
  "Speaker - Subwoofer":       Speaker,
  "Camera - PTZ":              Camera,
  "Camera - Conference":       Camera,
  "Conferencing - Video Bar":  Camera,
  "Conferencing - Codec":      Headphones,
  "Control - Processor":       Cpu,
  "Control - Touch Panel":     Layers3,
  "Control - Keypad":          Layers3,
  "Rack":                      Server,
  "Power":                     Plug,
  "Network Switch":            Cable,
  "Cable":                     Cable,
  "Accessory":                 Box,
};

export function CatalogBrowser({
  items,
  brands,
  categories,
}: {
  items: CatalogRow[];
  brands: Record<string, number>;
  categories: Record<string, number>;
}) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (brand && it.brand !== brand) return false;
      if (category && it.category !== category) return false;
      if (q) {
        const ql = q.toLowerCase();
        if (
          !it.name.toLowerCase().includes(ql) &&
          !it.sku.toLowerCase().includes(ql) &&
          !it.brand.toLowerCase().includes(ql) &&
          !(it.description ?? "").toLowerCase().includes(ql)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [items, q, brand, category]);

  const brandList = useMemo(
    () => Object.entries(brands).sort((a, b) => b[1] - a[1]),
    [brands]
  );
  const categoryList = useMemo(
    () => Object.entries(categories).sort((a, b) => b[1] - a[1]),
    [categories]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
      {/* Sidebar — Brands + Categories */}
      <aside className="space-y-4">
        <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
          <div className="px-3 py-2 border-b border-bone-300/45 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
            Brands · {brandList.length}
          </div>
          <ul className="p-1 max-h-[320px] overflow-y-auto">
            <FilterRow label="All brands" count={items.length} active={brand === null} onClick={() => setBrand(null)} />
            {brandList.map(([b, count]) => (
              <FilterRow key={b} label={b} count={count} active={brand === b} onClick={() => setBrand(b)} />
            ))}
          </ul>
        </div>
        <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
          <div className="px-3 py-2 border-b border-bone-300/45 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
            Categories · {categoryList.length}
          </div>
          <ul className="p-1 max-h-[420px] overflow-y-auto">
            <FilterRow label="All categories" count={items.length} active={category === null} onClick={() => setCategory(null)} />
            {categoryList.map(([c, count]) => (
              <FilterRow key={c} label={c} count={count} active={category === c} onClick={() => setCategory(c)} />
            ))}
          </ul>
        </div>
      </aside>

      <main>
        {/* Search + count */}
        <div className="rounded-lg bg-white border border-bone-300/55 px-3 py-2 mb-3 flex items-center gap-2">
          <Search className="h-3.5 w-3.5 text-ink-300/45 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by SKU, name, brand, or description…"
            className="flex-1 h-8 bg-transparent text-[13px] text-ink-300 placeholder:text-ink-300/40 outline-none"
          />
          {(q || brand || category) && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setBrand(null);
                setCategory(null);
              }}
              className="text-[11.5px] text-ink-300/55 hover:text-ink-300"
            >
              Clear
            </button>
          )}
          <span className="text-[11.5px] font-mono text-ink-300/55 px-2 py-0.5 rounded bg-bone-100">
            {filtered.length}
          </span>
          <CatalogImportButton />
        </div>

        {/* Active filter chips */}
        {(brand || category) && (
          <div className="mb-3 flex items-center gap-1.5 flex-wrap">
            {brand && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-300 text-bone-100 px-2 py-0.5 text-[11px]">
                Brand: {brand}
                <button type="button" onClick={() => setBrand(null)} className="hover:text-bone-100/70">×</button>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-ink-300 text-bone-100 px-2 py-0.5 text-[11px]">
                Category: {category}
                <button type="button" onClick={() => setCategory(null)} className="hover:text-bone-100/70">×</button>
              </span>
            )}
          </div>
        )}

        {/* Products grid */}
        {filtered.length === 0 ? (
          <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center">
            <Box className="h-6 w-6 mx-auto text-ink-300/35 mb-2" />
            <p className="text-[13px] text-ink-300/65">No products match.</p>
            <p className="text-[12px] text-ink-300/45 mt-1">
              {items.length === 0
                ? "Run `npx tsx prisma/seed-catalog.ts` to populate the catalog."
                : "Try widening your filters."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.slice(0, 400).map((it) => (
              <ProductCard key={it.id} item={it} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function FilterRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-[12.5px] transition-colors text-left",
          active
            ? "bg-bone-100 text-ink-300 font-medium"
            : "text-ink-300/70 hover:text-ink-300 hover:bg-bone-50"
        )}
      >
        <span className="truncate">{label}</span>
        <span className="text-[10px] font-mono text-ink-300/45 shrink-0">{count}</span>
      </button>
    </li>
  );
}

function ProductCard({ item }: { item: CatalogRow }) {
  const Icon = CATEGORY_ICON[item.category] ?? Box;
  return (
    <article className="group rounded-lg bg-white border border-bone-300/55 overflow-hidden hover:border-bone-300/85 transition-colors flex flex-col">
      <div className="aspect-[16/10] relative border-b border-bone-300/45 overflow-hidden bg-white">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-3"
          />
        ) : (
          <div className="absolute inset-0 duotone-signal flex items-center justify-center">
            <Icon className="h-10 w-10 text-ink-300/45 group-hover:text-signal-600/70 transition-colors" strokeWidth={1.2} />
          </div>
        )}
        <span className="absolute top-2 left-2 inline-flex items-center rounded-md bg-white/95 backdrop-blur px-1.5 py-0.5 text-[10px] font-medium text-ink-300 border border-bone-300/55 z-10">
          {item.brand}
        </span>
      </div>
      <div className="p-3 flex-1 flex flex-col">
        <div className="text-[13px] font-medium text-ink-300 leading-tight">{item.name}</div>
        <div className="text-[10.5px] text-ink-300/55 mt-0.5 font-mono">{item.sku}</div>
        <div className="text-[11px] text-ink-300/55 mt-1.5 truncate">{item.category}</div>
        <div className="mt-auto pt-3 flex items-baseline justify-between">
          <div className="font-display text-heading-sm tracking-tight text-ink-300">
            ${formatCompact(item.listPriceCents / 100)}
          </div>
          <Link
            href={`/catalog?item=${item.id}`}
            className="text-[11px] text-ink-300/55 hover:text-ink-300 inline-flex items-center gap-0.5"
          >
            <Download className="h-3 w-3" />
            Spec
          </Link>
        </div>
      </div>
    </article>
  );
}
