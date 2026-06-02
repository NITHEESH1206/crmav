"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { parseCsv, resolveColumns, dollarsToCents } from "@/lib/csv";
import { revalidatePath } from "next/cache";
import type { AccountTier, OpportunityStage } from "@prisma/client";

/**
 * Bulk pipeline import. One CSV row = one client/deal. The importer:
 *  - upserts the Account by name (creates if new),
 *  - optionally creates a Contact (if contact columns present),
 *  - optionally creates an Opportunity (if a deal name/value present).
 * Works for "just accounts", "accounts + contacts", or a full pipeline.
 */

const ALIASES = {
  account: ["account", "company", "client", "account_name", "customer", "organisation", "organization"],
  tier: ["tier", "account_tier", "size"],
  industry: ["industry", "sector", "vertical"],
  website: ["website", "url", "site", "domain"],
  contactName: ["contact", "contact_name", "name", "poc"],
  firstName: ["first_name", "firstname", "given_name"],
  lastName: ["last_name", "lastname", "surname", "family_name"],
  email: ["email", "contact_email", "e-mail"],
  phone: ["phone", "contact_phone", "mobile", "tel"],
  title: ["title", "role", "job_title", "designation"],
  opportunity: ["opportunity", "deal", "deal_name", "opp", "opportunity_name", "project"],
  value: ["value", "amount", "deal_value", "value_usd", "amount_usd", "budget"],
  stage: ["stage", "opportunity_stage", "deal_stage", "status"],
  probability: ["probability", "prob", "win_pct"],
  expectedClose: ["expected_close", "close_date", "expected_close_date", "closing", "close"],
};

const TIER_MAP: Record<string, AccountTier> = {
  starter: "STARTER", small: "STARTER",
  growth: "GROWTH", mid: "GROWTH", medium: "GROWTH",
  enterprise: "ENTERPRISE", large: "ENTERPRISE", strategic: "ENTERPRISE",
};

function mapStage(raw: string | undefined): OpportunityStage {
  const s = (raw ?? "").trim().toLowerCase();
  if (/won|closed.?won/.test(s)) return "CLOSED_WON";
  if (/lost|closed.?lost/.test(s)) return "CLOSED_LOST";
  if (/nego/.test(s)) return "NEGOTIATION";
  if (/proposal|quote|propos/.test(s)) return "PROPOSAL";
  if (/survey|site/.test(s)) return "SITE_SURVEY";
  return "DISCOVERY";
}

export type CrmImportResult = {
  ok: boolean;
  accountsCreated: number;
  accountsReused: number;
  contactsCreated: number;
  opportunitiesCreated: number;
  skipped: number;
  errors: string[];
  error?: string;
};

export async function importCrmCsv(csvText: string): Promise<CrmImportResult> {
  const base: CrmImportResult = {
    ok: false, accountsCreated: 0, accountsReused: 0, contactsCreated: 0,
    opportunitiesCreated: 0, skipped: 0, errors: [],
  };
  const workspaceId = await getCurrentWorkspaceId();

  const rows = parseCsv((csvText ?? "").trim());
  if (rows.length < 2) return { ...base, error: "Need a header row plus at least one data row." };

  const col = resolveColumns(rows[0], ALIASES);
  if (col.account < 0) {
    return { ...base, error: "CSV must include an 'account' (company) column." };
  }

  const cache = new Map<string, string>(); // account name (lower) -> id
  let accountsCreated = 0, accountsReused = 0, contactsCreated = 0, opportunitiesCreated = 0, skipped = 0;
  const errors: string[] = [];
  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");

  for (const r of rows.slice(1)) {
    const accountName = get(r, col.account);
    if (!accountName) { skipped++; continue; }

    try {
      // 1. Resolve or create the account
      let accountId = cache.get(accountName.toLowerCase());
      if (!accountId) {
        const existing = await prisma.account.findFirst({
          where: { workspaceId, name: accountName },
          select: { id: true },
        });
        if (existing) {
          accountId = existing.id;
          accountsReused++;
        } else {
          const tierRaw = get(r, col.tier).toLowerCase();
          const created = await prisma.account.create({
            data: {
              workspaceId,
              name: accountName,
              tier: TIER_MAP[tierRaw] ?? "STARTER",
              industry: get(r, col.industry) || null,
              website: get(r, col.website) || null,
            },
            select: { id: true },
          });
          accountId = created.id;
          accountsCreated++;
        }
        cache.set(accountName.toLowerCase(), accountId);
      }

      // 2. Optional contact
      const first = get(r, col.firstName);
      const last = get(r, col.lastName);
      const whole = get(r, col.contactName);
      const email = get(r, col.email);
      let cFirst = first, cLast = last;
      if (!cFirst && whole) {
        const parts = whole.split(/\s+/);
        cFirst = parts[0] ?? "";
        cLast = parts.slice(1).join(" ");
      }
      if (cFirst || email) {
        const dupe = email
          ? await prisma.contact.findFirst({ where: { workspaceId, accountId, email }, select: { id: true } })
          : null;
        if (!dupe) {
          await prisma.contact.create({
            data: {
              workspaceId,
              accountId,
              firstName: cFirst || email.split("@")[0] || "Contact",
              lastName: cLast || "",
              email: email || null,
              phone: get(r, col.phone) || null,
              title: get(r, col.title) || null,
              isPrimary: true,
            },
          });
          contactsCreated++;
        }
      }

      // 3. Optional opportunity
      const oppName = get(r, col.opportunity);
      const valueCents = dollarsToCents(get(r, col.value));
      if (oppName || valueCents > 0) {
        const name = oppName || `${accountName} opportunity`;
        const dupe = await prisma.opportunity.findFirst({
          where: { workspaceId, accountId, name },
          select: { id: true },
        });
        if (!dupe) {
          const probRaw = parseInt(get(r, col.probability).replace(/[^0-9]/g, ""), 10);
          const closeRaw = get(r, col.expectedClose);
          const close = closeRaw ? new Date(closeRaw) : null;
          await prisma.opportunity.create({
            data: {
              workspaceId,
              accountId,
              name,
              stage: mapStage(get(r, col.stage)),
              valueCents,
              probability: Number.isFinite(probRaw) ? Math.min(100, Math.max(0, probRaw)) : 50,
              expectedClose: close && !isNaN(close.getTime()) ? close : null,
            },
          });
          opportunitiesCreated++;
        }
      }
    } catch (e) {
      if (errors.length < 12) errors.push(`${accountName}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }

  revalidatePath("/opportunities");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");
  return { ok: true, accountsCreated, accountsReused, contactsCreated, opportunitiesCreated, skipped, errors };
}
