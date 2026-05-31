import { NextResponse } from "next/server";
import { runAllAutomations } from "@/lib/automations/runner";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Cron entrypoint for the automations runner.
 *
 * Wire in vercel.json:
 *   { "crons": [{ "path": "/api/cron/automations", "schedule": "0 * * * *" }] }
 *
 * Protected by CRON_SECRET — Vercel Cron sends an Authorization: Bearer header
 * matching the env var. Manual GETs without the secret are rejected (unless no
 * secret is configured, for local dev).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const result = await runAllAutomations();
    return NextResponse.json({ ok: true, ...result, ranAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : "Runner failed" },
      { status: 500 }
    );
  }
}
