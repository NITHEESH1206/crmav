"use client";

import { useEffect } from "react";
import { useDensity, applyDensityAttribute } from "@/lib/stores/density";

/**
 * Mounts once inside the (app) layout and writes `data-density` to <html>
 * whenever the user's density preference changes. Headless component.
 */
export function DensityMount() {
  const density = useDensity((s) => s.density);

  useEffect(() => {
    applyDensityAttribute(density);
  }, [density]);

  return null;
}
