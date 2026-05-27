"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Density = "comfortable" | "compact" | "mission";

type DensityState = {
  density: Density;
  setDensity: (d: Density) => void;
};

export const useDensity = create<DensityState>()(
  persist(
    (set) => ({
      density: "comfortable",
      setDensity: (density) => set({ density }),
    }),
    {
      name: "zynexav.density",
    }
  )
);

/**
 * Apply the current density to the document root as `data-density`.
 * CSS variables in globals.css respond automatically.
 *
 * Mount once near the top of the app tree (in a small client wrapper).
 */
export function applyDensityAttribute(density: Density) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-density", density);
}
