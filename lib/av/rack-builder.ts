/**
 * Deterministic rack layout from a validated device list. The Builder uses
 * this so we don't need the AI to think about rack-U math — it just picks
 * devices, we slot them.
 *
 * Stack order from BOTTOM up (most-stable / heaviest first):
 *   Power → UPS → Network Switch → AVoIP Decoder → AVoIP Encoder
 *   → Video Switcher → DSP → Amplifier → Control Processor → Filler
 *
 * Each device's U height is inferred from category (industry typical).
 */

import type { AvCategory } from "./categories";

type AnyDev = {
  catalogId: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
};

const STACK_ORDER: string[] = [
  "Power",
  "Network Switch",
  "AVoIP Decoder",
  "AVoIP Encoder",
  "AVoIP Other",
  "Video Switcher",
  "DSP",
  "Amplifier",
  "Conferencing - Codec",
  "Control - Processor",
];

const U_HEIGHTS: Record<string, number> = {
  "Power": 1,
  "Network Switch": 1,
  "AVoIP Decoder": 1,
  "AVoIP Encoder": 1,
  "AVoIP Other": 1,
  "Video Switcher": 3,
  "DSP": 1,
  "Amplifier": 2,
  "Conferencing - Codec": 2,
  "Control - Processor": 1,
};

const RACK_CATEGORIES = new Set(STACK_ORDER);

export function isRackable(category: string): boolean {
  return RACK_CATEGORIES.has(category);
}

export type GeneratedRack = {
  totalU: number;
  items: Array<{
    id: string;
    uStart: number;
    uHeight: number;
    catalogSku: string;
    label: string;
  }>;
};

/**
 * Returns a rack layout sized to the largest standard frame that fits the
 * devices (24U for small kits, 32U for medium, 44U for full builds), plus a
 * 4U buffer for cable management / future expansion.
 */
export function buildRackLayout(devices: AnyDev[]): GeneratedRack {
  // Flatten quantity → individual units
  const units: Array<{
    catalogId: string;
    sku: string;
    label: string;
    category: string;
    uHeight: number;
    sortIdx: number;
  }> = [];

  for (const d of devices) {
    if (!isRackable(d.category)) continue;
    for (let i = 0; i < d.quantity; i++) {
      units.push({
        catalogId: d.catalogId,
        sku: d.sku,
        label: `${d.brand} ${d.name}${d.quantity > 1 ? ` (${i + 1}/${d.quantity})` : ""}`,
        category: d.category,
        uHeight: U_HEIGHTS[d.category] ?? 1,
        sortIdx: STACK_ORDER.indexOf(d.category),
      });
    }
  }

  // Sort by stack order; stable so same-category items group together
  units.sort((a, b) => a.sortIdx - b.sortIdx);

  // Stack from U1 up
  let u = 1;
  const items: GeneratedRack["items"] = units.map((unit, i) => {
    const placement = {
      id: `r-${i + 1}`,
      uStart: u,
      uHeight: unit.uHeight,
      catalogSku: unit.sku,
      label: unit.label,
    };
    u += unit.uHeight;
    return placement;
  });

  // Pick the smallest standard rack that fits, +4U buffer
  const consumed = u - 1;
  const required = consumed + 4;
  const standardSizes = [12, 18, 24, 32, 37, 42, 44];
  const totalU = standardSizes.find((s) => s >= required) ?? 44;

  return { totalU, items };
}
