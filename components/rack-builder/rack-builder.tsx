"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Server, Save, Trash2, Plus, Zap, Layers, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { saveRackLayout } from "@/app/actions/racks";
import type { RackItem, RackLayout } from "@/lib/data/racks";
import { ExportMenu, type ExportFormat } from "@/components/app/export-menu";
import { buildRackSVG } from "@/lib/export/rack-svg";
import { downloadSVG, downloadSVGAsPNG } from "@/lib/export/svg";
import { downloadJSON, downloadCSV, timestampedFilename } from "@/lib/export/download";
import { cn } from "@/lib/utils";

type CatalogEntry = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  uHeight: number;
};

type Rack = {
  id: string;
  name: string;
  totalU: number;
  layout: RackLayout;
};

const U_HEIGHT_PX = 18;

export function RackBuilder({ racks, catalog }: { racks: Rack[]; catalog: CatalogEntry[] }) {
  const [activeId, setActiveId] = useState(racks[0]?.id ?? null);
  const active = useMemo(() => racks.find((r) => r.id === activeId), [racks, activeId]);
  const [items, setItems] = useState<RackItem[]>(active?.layout.items ?? []);
  const [dragging, setDragging] = useState<CatalogEntry | null>(null);
  const [filter, setFilter] = useState("");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");

  // when active rack changes, hydrate the local state
  useState(() => {
    if (active) setItems(active.layout.items);
  });

  function switchRack(id: string) {
    setActiveId(id);
    const r = racks.find((x) => x.id === id);
    setItems(r?.layout.items ?? []);
    setSaved("idle");
  }

  const filtered = catalog.filter(
    (c) =>
      c.name.toLowerCase().includes(filter.toLowerCase()) ||
      c.brand.toLowerCase().includes(filter.toLowerCase()) ||
      c.sku.toLowerCase().includes(filter.toLowerCase())
  );

  const totalU = active?.totalU ?? 42;
  const usedU = items.reduce((s, i) => s + i.uHeight, 0);
  const remainingU = totalU - usedU;
  const estPowerW = items.length * 240; // illustrative

  function canPlaceAt(uStart: number, uHeight: number, ignoreId?: string) {
    if (uStart < 1 || uStart + uHeight - 1 > totalU) return false;
    return items.every((it) => {
      if (it.id === ignoreId) return true;
      const a1 = it.uStart;
      const a2 = it.uStart + it.uHeight - 1;
      const b1 = uStart;
      const b2 = uStart + uHeight - 1;
      return a2 < b1 || b2 < a1;
    });
  }

  function findFreeSlot(uHeight: number) {
    for (let u = totalU - uHeight + 1; u >= 1; u--) {
      if (canPlaceAt(u, uHeight)) return u;
    }
    return null;
  }

  function addItem(entry: CatalogEntry) {
    const slot = findFreeSlot(entry.uHeight);
    if (slot == null) return;
    const newItem: RackItem = {
      id: crypto.randomUUID(),
      uStart: slot,
      uHeight: entry.uHeight,
      catalogSku: entry.sku,
      label: entry.name,
    };
    setItems((arr) => [...arr, newItem]);
    setSaved("idle");
  }

  function removeItem(id: string) {
    setItems((arr) => arr.filter((it) => it.id !== id));
    setSaved("idle");
  }

  function handleDrop(e: React.DragEvent, uHovered: number) {
    e.preventDefault();
    if (!dragging) return;
    // place so the BOTTOM of the item is at uHovered
    const candidates = [uHovered, uHovered - 1, uHovered + 1];
    const slot = candidates.find((u) => canPlaceAt(u, dragging.uHeight)) ?? findFreeSlot(dragging.uHeight);
    if (slot == null) {
      setDragging(null);
      return;
    }
    const newItem: RackItem = {
      id: crypto.randomUUID(),
      uStart: slot,
      uHeight: dragging.uHeight,
      catalogSku: dragging.sku,
      label: dragging.name,
    };
    setItems((arr) => [...arr, newItem]);
    setDragging(null);
    setSaved("idle");
  }

  async function handleExport(format: ExportFormat) {
    if (!active) return;
    const slug = active.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "rack";
    try {
      if (format === "json") {
        downloadJSON({ name: active.name, totalU: active.totalU, items }, timestampedFilename(slug, "json"));
        toast.success("Exported JSON");
        return;
      }
      if (format === "csv") {
        downloadCSV(
          items.map((i) => ({
            u_start: i.uStart,
            u_end: i.uStart + i.uHeight - 1,
            height: i.uHeight,
            sku: i.catalogSku ?? "",
            label: i.label,
          })),
          timestampedFilename(slug, "csv"),
          [
            { key: "u_start", header: "U Start" },
            { key: "u_end", header: "U End" },
            { key: "height", header: "Height" },
            { key: "sku", header: "SKU" },
            { key: "label", header: "Description" },
          ]
        );
        toast.success("Exported CSV");
        return;
      }
      const svg = buildRackSVG({ name: active.name, totalU: active.totalU, items });
      if (format === "svg") {
        downloadSVG(svg, timestampedFilename(slug, "svg"));
        toast.success("Exported SVG");
        return;
      }
      if (format === "png") {
        await downloadSVGAsPNG(svg, timestampedFilename(slug, "png"), { background: "#ffffff" });
        toast.success("Exported PNG", { description: `${items.length} items · ${active.totalU}U` });
      }
    } catch (e) {
      toast.error("Export failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  function save() {
    if (!active) return;
    setSaved("saving");
    startTransition(async () => {
      try {
        await saveRackLayout(active.id, { items });
        setSaved("saved");
        toast.success("Rack layout saved", {
          description: `${items.length} items · ${active.name}`,
        });
        setTimeout(() => setSaved("idle"), 2200);
      } catch (e) {
        toast.error("Couldn't save layout", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
        setSaved("idle");
      }
    });
  }

  if (!active) {
    return <div className="text-sm text-ink-300/55">No racks yet. Create one to get started.</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr_300px] gap-5">
      {/* Rack list */}
      <Card className="self-start">
        <CardContent className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-300/55 mb-3">Your racks</div>
          <div className="space-y-1">
            {racks.map((r) => (
              <button
                key={r.id}
                onClick={() => switchRack(r.id)}
                className={cn(
                  "w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors",
                  r.id === activeId
                    ? "bg-signal-500/15 text-signal-300 ring-1 ring-signal-500/30"
                    : "text-ink-300/75 hover:bg-bone-50"
                )}
              >
                <div className="flex items-center gap-2">
                  <Server className="h-3.5 w-3.5" />
                  <span className="truncate">{r.name}</span>
                </div>
                <div className="text-[10px] text-ink-300/50 mt-0.5 ml-5">
                  {r.layout.items.length} items · {r.totalU}U
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Rack visualization */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-signal-400">Editing</div>
              <div className="font-display text-xl font-semibold tracking-tight">{active.name}</div>
            </div>
            <div className="flex items-center gap-2">
              {saved === "saved" && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-[11px] text-emerald-400 flex items-center gap-1 mr-1"
                >
                  <Sparkles className="h-3 w-3" />
                  Saved
                </motion.span>
              )}
              <ExportMenu formats={["png", "svg", "csv", "json"]} onExport={handleExport} />
              <Button size="sm" onClick={save} disabled={isPending}>
                <Save className="h-3.5 w-3.5" />
                {isPending ? "Saving…" : "Save layout"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <Stat label="Total" value={`${totalU}U`} icon={Layers} />
            <Stat label="Used" value={`${usedU}U`} icon={Server} tone={usedU / totalU > 0.8 ? "warn" : "default"} />
            <Stat label="Est. power" value={`${estPowerW}W`} icon={Zap} />
          </div>

          <div
            className={cn(
              "relative rounded-2xl border-2 border-bone-300/65 bg-bone-50 p-4",
              dragging && "border-signal-500/50 bg-signal-500/[0.04]"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
          >
            <div className="flex items-stretch gap-2">
              {/* U labels */}
              <div className="flex flex-col-reverse pt-1">
                {Array.from({ length: totalU }).map((_, i) => {
                  const u = i + 1;
                  return (
                    <div
                      key={u}
                      style={{ height: U_HEIGHT_PX }}
                      className="text-[9px] text-ink-300/45 font-mono pr-2 flex items-center justify-end w-8"
                    >
                      {u}
                    </div>
                  );
                })}
              </div>

              {/* Rack frame */}
              <div className="relative flex-1 rounded-lg border border-bone-300/65 bg-gradient-to-b from-white to-bone-50">
                {/* Rack rails */}
                <div className="absolute inset-y-0 left-1 w-1 bg-bone-100/70 rounded-l" />
                <div className="absolute inset-y-0 right-1 w-1 bg-bone-100/70 rounded-r" />

                {/* Hover targets per U */}
                <div className="absolute inset-0 flex flex-col-reverse">
                  {Array.from({ length: totalU }).map((_, i) => {
                    const u = i + 1;
                    return (
                      <div
                        key={u}
                        onDrop={(e) => handleDrop(e, u)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "copy";
                        }}
                        style={{ height: U_HEIGHT_PX }}
                        className={cn(
                          "border-b border-bone-300/40 last:border-b-0",
                          dragging && "hover:bg-signal-500/15"
                        )}
                      />
                    );
                  })}
                </div>

                {/* Items */}
                <AnimatePresence>
                  {items.map((it) => (
                    <motion.div
                      key={it.id}
                      initial={{ opacity: 0, scale: 0.96, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "absolute",
                        left: 8,
                        right: 8,
                        bottom: (it.uStart - 1) * U_HEIGHT_PX,
                        height: it.uHeight * U_HEIGHT_PX - 2,
                      }}
                      className="group rounded-md bg-gradient-to-r from-signal-500/20 via-signal-500/10 to-signal-500/5 border border-signal-500/40 px-3 flex items-center justify-between text-xs hover:from-signal-500/30 hover:border-signal-500/60 transition-colors"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[9px] text-ink-300/55 font-mono shrink-0">
                          U{it.uStart}-{it.uStart + it.uHeight - 1}
                        </span>
                        <span className="font-medium truncate text-ink-300/95">{it.label}</span>
                      </div>
                      <button
                        onClick={() => removeItem(it.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-ink-300/65 hover:text-red-400"
                        aria-label="Remove"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {items.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-xs text-ink-300/45 pointer-events-none">
                    Drag items from the catalog → into the rack
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Catalog palette */}
      <Card className="self-start">
        <CardContent className="p-4">
          <div className="text-[10px] uppercase tracking-wider text-ink-300/55 mb-3">Catalog</div>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-300/45" />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter devices…"
              className="h-9 w-full rounded-lg border border-bone-300/55 bg-bone-50/60 pl-8 pr-2 text-xs text-ink-300 placeholder:text-ink-300/45 focus:outline-none focus:border-signal-500/40"
            />
          </div>
          <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-1">
            {filtered.map((c) => (
              <div
                key={c.id}
                draggable
                onDragStart={() => setDragging(c)}
                onDragEnd={() => setDragging(null)}
                className={cn(
                  "group rounded-lg border border-bone-300/55 bg-bone-50/60 p-2.5 cursor-grab active:cursor-grabbing hover:border-signal-500/30 hover:bg-bone-100/70 transition-all",
                  dragging?.id === c.id && "opacity-50 scale-95"
                )}
              >
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">{c.brand}</Badge>
                  <Badge variant="default" className="h-4 px-1.5 text-[9px]">{c.uHeight}U</Badge>
                </div>
                <div className="text-xs font-medium mt-1.5 leading-tight">{c.name}</div>
                <button
                  onClick={() => addItem(c)}
                  className="mt-1.5 w-full text-[10px] text-ink-300/55 hover:text-signal-400 flex items-center justify-center gap-1 py-1 rounded border border-dashed border-bone-300/55 hover:border-signal-500/40 transition-colors"
                >
                  <Plus className="h-2.5 w-2.5" />
                  Add to rack
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-xs text-ink-300/50 text-center py-6">No matches.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "warn";
}) {
  return (
    <div className="rounded-xl border border-bone-300/55 bg-bone-50/60 p-3 flex items-center gap-3">
      <div
        className={cn(
          "h-9 w-9 rounded-lg flex items-center justify-center border",
          tone === "warn"
            ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
            : "bg-signal-500/10 border-signal-500/30 text-signal-400"
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-ink-300/55">{label}</div>
        <div className="font-display text-lg font-semibold leading-tight">{value}</div>
      </div>
    </div>
  );
}
