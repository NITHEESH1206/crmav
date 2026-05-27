"use client";

import { useMemo, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, Plus, Minus, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatCompact } from "@/lib/utils";
import { addCatalogItemsToRoom } from "@/app/actions/rooms";

export type CatalogPickItem = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  category: string;
  listPriceCents: number;
};

/**
 * AddDevicePicker — drawer for picking catalog items in bulk and writing
 * them as BOQItem rows on the room. Selected items appear in the 3D view
 * immediately because /rooms/[id] revalidates after the mutation.
 */
export function AddDevicePicker({
  open,
  onClose,
  roomId,
  roomName,
  catalog,
}: {
  open: boolean;
  onClose: () => void;
  roomId: string;
  roomName: string;
  catalog: CatalogPickItem[];
}) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [pending, startTransition] = useTransition();

  const brands = useMemo(() => Array.from(new Set(catalog.map((c) => c.brand))).sort(), [catalog]);
  const categories = useMemo(
    () => Array.from(new Set(catalog.map((c) => c.category))).sort(),
    [catalog]
  );

  const filtered = useMemo(() => {
    return catalog.filter((c) => {
      if (brand && c.brand !== brand) return false;
      if (category && c.category !== category) return false;
      if (q) {
        const ql = q.toLowerCase();
        if (
          !c.name.toLowerCase().includes(ql) &&
          !c.sku.toLowerCase().includes(ql) &&
          !c.brand.toLowerCase().includes(ql)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [catalog, q, brand, category]);

  const pickedItems = useMemo(
    () =>
      Object.entries(picked)
        .filter(([, qty]) => qty > 0)
        .map(([id, qty]) => ({ id, qty, item: catalog.find((c) => c.id === id)! }))
        .filter((p) => p.item),
    [picked, catalog]
  );

  const pickedTotalCents = pickedItems.reduce(
    (s, p) => s + p.qty * p.item.listPriceCents,
    0
  );

  function bump(id: string, delta: number) {
    setPicked((prev) => {
      const next = { ...prev, [id]: Math.max(0, (prev[id] ?? 0) + delta) };
      if (next[id] === 0) delete next[id];
      return next;
    });
  }

  function setQty(id: string, qty: number) {
    setPicked((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[id];
      else next[id] = Math.min(500, Math.floor(qty));
      return next;
    });
  }

  function submit() {
    if (pickedItems.length === 0) return;
    startTransition(async () => {
      const r = await addCatalogItemsToRoom({
        roomId,
        items: pickedItems.map((p) => ({ catalogId: p.id, quantity: p.qty })),
      });
      if (r.ok) {
        toast.success(`Added ${r.added} line${r.added === 1 ? "" : "s"} to BOQ`, {
          description: `${roomName} · $${formatCompact(pickedTotalCents / 100)}`,
        });
        setPicked({});
        onClose();
      } else {
        toast.error("Couldn't add to room", { description: r.error ?? "Unknown error" });
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink-300/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-[720px] bg-white border-l border-bone-300/65 flex flex-col"
          >
            <header className="px-5 py-3.5 border-b border-bone-300/55 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-300/55 font-semibold">
                  Catalog · {catalog.length} items
                </div>
                <h2 className="text-heading-md font-display text-ink-300 truncate">
                  Add to {roomName}
                </h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="h-8 w-8 rounded-md text-ink-300/55 hover:text-ink-300 hover:bg-bone-100 flex items-center justify-center shrink-0"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            {/* Filters */}
            <div className="px-5 py-3 border-b border-bone-300/45 space-y-2.5">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-300/45" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, SKU, or brand…"
                  className="h-9 w-full rounded-md border border-bone-300/65 bg-bone-50 pl-8 pr-2.5 text-[13px] text-ink-300 placeholder:text-ink-300/40 outline-none focus:border-ink-300/30"
                  autoFocus
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <FilterPill
                  label="All brands"
                  active={brand === null}
                  onClick={() => setBrand(null)}
                />
                {brands.slice(0, 8).map((b) => (
                  <FilterPill key={b} label={b} active={brand === b} onClick={() => setBrand(b)} />
                ))}
                {brands.length > 8 && (
                  <select
                    value={brand ?? ""}
                    onChange={(e) => setBrand(e.target.value || null)}
                    className="h-6 rounded-md border border-bone-300/65 bg-white text-[11px] px-1.5 text-ink-300/85"
                  >
                    <option value="">More brands…</option>
                    {brands.slice(8).map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <FilterPill
                  label="All categories"
                  active={category === null}
                  onClick={() => setCategory(null)}
                />
                {categories.slice(0, 6).map((c) => (
                  <FilterPill
                    key={c}
                    label={c.replace(/^(.+?) - /, "")}
                    active={category === c}
                    onClick={() => setCategory(c)}
                  />
                ))}
                {categories.length > 6 && (
                  <select
                    value={category ?? ""}
                    onChange={(e) => setCategory(e.target.value || null)}
                    className="h-6 rounded-md border border-bone-300/65 bg-white text-[11px] px-1.5 text-ink-300/85"
                  >
                    <option value="">More categories…</option>
                    {categories.slice(6).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-6 py-16 text-center text-[13px] text-ink-300/55">
                  No matches. Try clearing filters.
                </div>
              ) : (
                <ul>
                  {filtered.slice(0, 200).map((c) => {
                    const qty = picked[c.id] ?? 0;
                    return (
                      <li
                        key={c.id}
                        className={cn(
                          "flex items-center gap-3 px-5 py-2.5 border-b border-bone-300/35 transition-colors",
                          qty > 0 ? "bg-bone-100/60" : "hover:bg-bone-50"
                        )}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-ink-300 truncate">
                            {c.name}
                          </div>
                          <div className="text-[11px] text-ink-300/55 truncate mt-0.5">
                            <span className="font-mono">{c.sku}</span> · {c.brand} · {c.category}
                          </div>
                        </div>
                        <div className="font-mono text-[12px] text-ink-300/75 shrink-0 w-[80px] text-right">
                          ${formatCompact(c.listPriceCents / 100)}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => bump(c.id, -1)}
                            disabled={qty === 0}
                            className="h-7 w-7 rounded-md border border-bone-300/65 bg-white text-ink-300/70 hover:text-ink-300 hover:bg-bone-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            value={qty}
                            onChange={(e) => setQty(c.id, parseInt(e.target.value || "0", 10))}
                            className="h-7 w-12 rounded-md border border-bone-300/65 bg-white text-center text-[12px] font-mono text-ink-300 outline-none focus:border-ink-300/30"
                            min={0}
                            max={500}
                          />
                          <button
                            type="button"
                            onClick={() => bump(c.id, +1)}
                            className="h-7 w-7 rounded-md bg-ink-300 text-bone-100 hover:bg-ink-200 flex items-center justify-center"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            <footer className="border-t border-bone-300/55 px-5 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
                  Selection
                </div>
                <div className="text-[13px] text-ink-300 mt-0.5">
                  {pickedItems.length === 0 ? (
                    <span className="text-ink-300/45">Nothing selected yet</span>
                  ) : (
                    <>
                      {pickedItems.length} item{pickedItems.length === 1 ? "" : "s"} ·{" "}
                      <span className="font-mono">
                        ${formatCompact(pickedTotalCents / 100)}
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button size="sm" onClick={submit} disabled={pickedItems.length === 0 || pending}>
                  <Check className="h-3.5 w-3.5" />
                  {pending ? "Adding…" : `Add ${pickedItems.length || ""} to BOQ`}
                </Button>
              </div>
            </footer>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-6 px-2.5 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap",
        active
          ? "bg-ink-300 text-bone-100"
          : "bg-bone-50 text-ink-300/70 hover:text-ink-300 border border-bone-300/55"
      )}
    >
      {label}
    </button>
  );
}
