"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { revalidatePath } from "next/cache";

/* ─────────────────────────────────────────────────────────────────────────
   Bulk CSV import — the scalable path to "every device, with photos".
   Feed a distributor / manufacturer product feed (CSV) and it upserts each
   row by SKU, including image URLs. Column names are matched flexibly.
   ───────────────────────────────────────────────────────────────────────── */

/** Minimal RFC-4180-ish CSV parser (handles quotes, escaped quotes, CRLF). */
function parseCsv(text: string): string[][] {
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
      // Skip blank lines
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

const HEADER_ALIASES: Record<string, string[]> = {
  sku: ["sku", "model", "model_no", "part", "part_number", "partno", "item"],
  name: ["name", "product", "product_name", "title", "short_description"],
  brand: ["brand", "manufacturer", "mfr", "make"],
  category: ["category", "type", "product_type", "group"],
  description: ["description", "desc", "long_description", "details"],
  list: ["list_price", "list_price_usd", "list", "msrp", "price", "retail"],
  cost: ["cost", "dealer", "dealer_cost", "cost_usd", "buy", "wholesale"],
  image: ["image_url", "image", "imageurl", "photo", "photo_url", "img"],
  datasheet: ["datasheet_url", "datasheet", "spec_url", "spec_sheet", "pdf"],
};

function resolveColumns(header: string[]) {
  const norm = header.map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));
  const find = (key: keyof typeof HEADER_ALIASES) => {
    for (const alias of HEADER_ALIASES[key]) {
      const i = norm.indexOf(alias);
      if (i >= 0) return i;
    }
    return -1;
  };
  return {
    sku: find("sku"),
    name: find("name"),
    brand: find("brand"),
    category: find("category"),
    description: find("description"),
    list: find("list"),
    cost: find("cost"),
    image: find("image"),
    datasheet: find("datasheet"),
  };
}

function toCents(raw: string | undefined): number {
  if (!raw) return 0;
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : Math.round(n * 100);
}

export type ImportResult = {
  ok: boolean;
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
  error?: string;
};

export async function importCatalogCsv(csvText: string): Promise<ImportResult> {
  const base: ImportResult = { ok: false, added: 0, updated: 0, skipped: 0, errors: [] };
  const workspaceId = await getCurrentWorkspaceId();

  const rows = parseCsv((csvText ?? "").trim());
  if (rows.length < 2) {
    return { ...base, error: "Need a header row plus at least one product row." };
  }

  const col = resolveColumns(rows[0]);
  if (col.sku < 0 || col.name < 0 || col.brand < 0) {
    return {
      ...base,
      error: "CSV must include at least 'sku', 'name' and 'brand' columns.",
    };
  }

  let added = 0;
  let updated = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const r of rows.slice(1)) {
    const sku = (r[col.sku] ?? "").trim();
    if (!sku) {
      skipped++;
      continue;
    }
    const data = {
      name: (r[col.name] ?? "").trim() || sku,
      brand: (r[col.brand] ?? "").trim() || "Unknown",
      category: (col.category >= 0 ? (r[col.category] ?? "").trim() : "") || "Accessory",
      description: col.description >= 0 ? (r[col.description] ?? "").trim() || null : null,
      listPriceCents: toCents(r[col.list]),
      costCents: toCents(r[col.cost]),
      imageUrl: col.image >= 0 ? (r[col.image] ?? "").trim() || null : null,
      datasheetUrl: col.datasheet >= 0 ? (r[col.datasheet] ?? "").trim() || null : null,
    };

    try {
      const existing = await prisma.catalogItem.findUnique({
        where: { workspaceId_sku: { workspaceId, sku } },
        select: { id: true },
      });
      if (existing) {
        await prisma.catalogItem.update({
          where: { workspaceId_sku: { workspaceId, sku } },
          data,
        });
        updated++;
      } else {
        await prisma.catalogItem.create({ data: { workspaceId, sku, ...data } });
        added++;
      }
    } catch (e) {
      if (errors.length < 12) errors.push(`${sku}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  revalidatePath("/catalog");
  return { ok: true, added, updated, skipped, errors };
}

/* ─── Set/replace a single product's photo (e.g. after a Supabase upload) ─── */
export async function setCatalogImage(itemId: string, imageUrl: string | null) {
  const workspaceId = await getCurrentWorkspaceId();
  await prisma.catalogItem.updateMany({
    where: { id: itemId, workspaceId },
    data: { imageUrl: imageUrl?.trim() || null },
  });
  revalidatePath("/catalog");
  return { ok: true };
}
