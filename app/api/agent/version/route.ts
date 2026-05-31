import { NextResponse } from "next/server";
import { LATEST_AGENT_VERSION } from "@/lib/agents/version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public version endpoint — lets a connector (or a human) check the latest
 * connector version and where to download it for a self-update.
 */
export function GET() {
  return NextResponse.json({
    version: LATEST_AGENT_VERSION,
    download: "/connector/zynex-agent.mjs",
  });
}
