"use client";

/** Trigger a browser download for a Blob with the given filename. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 0);
}

/** Convert any array of plain objects to CSV (RFC-4180 quoted). */
export function toCSV<T extends Record<string, unknown>>(
  rows: T[],
  columns?: { key: keyof T; header: string }[]
): string {
  if (rows.length === 0) return "";
  const cols = columns ?? (Object.keys(rows[0]) as (keyof T)[]).map((k) => ({ key: k, header: String(k) }));
  const headers = cols.map((c) => c.header);
  const esc = (v: unknown): string => {
    if (v == null) return "";
    if (v instanceof Date) return v.toISOString();
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const lines = [headers.map(esc).join(",")];
  for (const r of rows) {
    lines.push(cols.map((c) => esc(r[c.key])).join(","));
  }
  return lines.join("\n");
}

export function downloadCSV<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  columns?: { key: keyof T; header: string }[]
) {
  const csv = toCSV(rows, columns);
  // BOM so Excel auto-detects UTF-8
  downloadBlob(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }), filename);
}

export function downloadJSON(data: unknown, filename: string) {
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), filename);
}

export function timestampedFilename(prefix: string, ext: string) {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 19).replace(/[T:]/g, "-");
  return `${prefix}-${stamp}.${ext}`;
}
