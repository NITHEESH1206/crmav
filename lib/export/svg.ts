"use client";

import { downloadBlob } from "./download";

/**
 * Convert an in-memory SVG string into a PNG and trigger a download.
 * Renders at 2x device scale for crisp output.
 */
export async function downloadSVGAsPNG(svgString: string, filename: string, opts?: { scale?: number; background?: string }) {
  const scale = opts?.scale ?? 2;
  const background = opts?.background ?? "#fafaf9";

  // Read width/height from the SVG root
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const root = doc.documentElement;
  const widthAttr = root.getAttribute("width");
  const heightAttr = root.getAttribute("height");
  let width = widthAttr ? parseFloat(widthAttr) : 0;
  let height = heightAttr ? parseFloat(heightAttr) : 0;
  if (!width || !height) {
    const vb = (root.getAttribute("viewBox") || "").split(/\s+/).map(parseFloat);
    if (vb.length === 4) {
      width = vb[2];
      height = vb[3];
    }
  }
  if (!width || !height) {
    width = 1200;
    height = 800;
  }

  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("Could not get 2d canvas context"));
      }
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((png) => {
        if (!png) return reject(new Error("Canvas toBlob returned null"));
        downloadBlob(png, filename);
        resolve();
      }, "image/png");
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

export function downloadSVG(svgString: string, filename: string) {
  downloadBlob(new Blob([svgString], { type: "image/svg+xml;charset=utf-8" }), filename);
}
