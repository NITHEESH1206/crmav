import { NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import * as XLSX from "xlsx";
import { isAIConfigured } from "@/lib/ai/client";
import { extractBoqItems } from "@/lib/ai/boq-extract";
import { matchBoqItems } from "@/lib/av/boq-match";
import { getCurrentWorkspaceId } from "@/lib/data/workspace";
import { checkAiQuota, recordAiUsage, quotaMessage } from "@/lib/ai/usage";

export const runtime = "nodejs";
export const maxDuration = 120;

const bodySchema = z.object({
  kind: z.enum(["image", "pdf", "excel"]),
  dataBase64: z.string().min(1),
  mediaType: z.string().optional(),
});

export async function POST(req: Request) {
  if (!isAIConfigured()) {
    return NextResponse.json({ ok: false, error: "AI is not configured (missing ANTHROPIC_API_KEY)." }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }
  const { kind, dataBase64, mediaType } = parsed.data;

  const workspaceId = await getCurrentWorkspaceId();
  const quota = await checkAiQuota(workspaceId);
  if (!quota.allowed) {
    return NextResponse.json({ ok: false, error: quotaMessage(quota) }, { status: 429 });
  }

  // Build the content block for Claude based on file kind.
  let content: Anthropic.ContentBlockParam[];
  try {
    if (kind === "excel") {
      const buf = Buffer.from(dataBase64, "base64");
      const wb = XLSX.read(buf, { type: "buffer" });
      let text = "";
      for (const sheet of wb.SheetNames) {
        text += `# Sheet: ${sheet}\n${XLSX.utils.sheet_to_csv(wb.Sheets[sheet])}\n\n`;
      }
      if (!text.trim()) {
        return NextResponse.json({ ok: false, error: "Couldn't read any rows from that spreadsheet." }, { status: 422 });
      }
      content = [{ type: "text", text: `Bill of Quantities (spreadsheet export):\n\n${text.slice(0, 80_000)}` }];
    } else if (kind === "pdf") {
      content = [{ type: "document", source: { type: "base64", media_type: "application/pdf", data: dataBase64 } }];
    } else {
      const mt = (mediaType && /^image\//.test(mediaType) ? mediaType : "image/png") as
        | "image/png" | "image/jpeg" | "image/gif" | "image/webp";
      content = [{ type: "image", source: { type: "base64", media_type: mt, data: dataBase64 } }];
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: `Couldn't read the file: ${e instanceof Error ? e.message : "unknown"}` }, { status: 422 });
  }

  try {
    const { items, inputTokens, outputTokens } = await extractBoqItems(content);
    await recordAiUsage(workspaceId, { inputTokens, outputTokens });
    const matched = await matchBoqItems(items, workspaceId);
    const matchedCount = matched.filter((m) => m.matched).length;
    return NextResponse.json({ ok: true, items: matched, matchedCount, total: matched.length });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Extraction failed." },
      { status: 500 }
    );
  }
}
