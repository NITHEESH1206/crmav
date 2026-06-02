/** Minimal RFC-4180-ish CSV parser (handles quotes, escaped quotes, CRLF). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.length > 1 || row[0].trim() !== "") rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    if (row.length > 1 || row[0].trim() !== "") rows.push(row);
  }
  return rows;
}

/** Map a header row to column indexes using flexible aliases. */
export function resolveColumns<T extends Record<string, string[]>>(
  header: string[],
  aliases: T
): Record<keyof T, number> {
  const norm = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const out = {} as Record<keyof T, number>;
  for (const key of Object.keys(aliases) as (keyof T)[]) {
    out[key] = -1;
    for (const alias of aliases[key]) {
      const i = norm.indexOf(alias);
      if (i >= 0) {
        out[key] = i;
        break;
      }
    }
  }
  return out;
}

export function dollarsToCents(raw: string | undefined): number {
  if (!raw) return 0;
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}
