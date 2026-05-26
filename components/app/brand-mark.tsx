"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * ZynexAV logo — uses the brand asset at /public/logo.png as-is.
 *
 * Because the logo is dark text on a light/transparent background and the app
 * runs on a dark theme, we invert it for the dark-mode placements so the
 * "zynex" portion reads as bone/off-white while "AV" stays signal orange.
 *
 * - variant="full" → the full wordmark
 * - variant="icon" → crops to the right ~22% ("AV") for tight placements
 */
export function BrandMark({
  variant = "full",
  className,
  height = 28,
  invertForDark = true,
}: {
  variant?: "full" | "icon";
  className?: string;
  height?: number;
  invertForDark?: boolean;
}) {
  // Approximate the "zynex" portion as dark-text → bone via the filter chain
  // below. The orange "AV" stays itself because the hue-rotate keeps reds.
  const darkModeFilter = invertForDark
    ? "invert(94%) sepia(7%) saturate(160%) hue-rotate(7deg) brightness(102%) contrast(91%)"
    : undefined;

  if (variant === "icon") {
    // Square crop: show only the right side of the wordmark (the "AV").
    const aspect = 2048 / 508;
    const fullW = height * aspect;
    const cropRatio = 0.22; // rightmost 22% holds "AV"
    return (
      <div
        className={cn("relative shrink-0 overflow-hidden", className)}
        style={{ height, width: height, borderRadius: 8 }}
      >
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: fullW,
            height,
          }}
        >
          <Image
            src="/logo.png"
            alt="ZynexAV"
            width={2048}
            height={508}
            priority
            style={{
              height,
              width: fullW,
              filter: darkModeFilter,
              objectFit: "contain",
            }}
          />
        </div>
        <span className="sr-only">ZynexAV</span>
      </div>
    );
  }

  return (
    <div className={cn("relative shrink-0 inline-flex items-center", className)}>
      <Image
        src="/logo.png"
        alt="ZynexAV"
        width={2048}
        height={508}
        priority
        style={{ height, width: "auto", filter: darkModeFilter }}
      />
    </div>
  );
}
