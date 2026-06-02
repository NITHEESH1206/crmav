#!/usr/bin/env node
/**
 * ZynexAV — Anthropic API smoke test.
 *
 *   node scripts/ai-smoke-test.mjs
 *
 * Reads ANTHROPIC_API_KEY from .env.local (or .env), calls the Messages API
 * with the model ZynexAV uses, and reports whether your key + model are live.
 * Zero dependencies — pure Node 18+.
 */

import fs from "node:fs";

// The model ZynexAV is pinned to (see lib/ai/client.ts).
const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-7";

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv(".env.local");
loadEnv(".env");

const key = process.env.ANTHROPIC_API_KEY;
if (!key) {
  console.error("✗ ANTHROPIC_API_KEY not found in .env.local or .env");
  process.exit(1);
}
if (!key.startsWith("sk-ant-")) {
  console.warn("⚠ Key doesn't start with sk-ant- — double-check you copied the API key (not an OAuth token).");
}

console.log(`→ Testing model "${MODEL}" with key ${key.slice(0, 14)}…\n`);

const res = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "x-api-key": key,
    "anthropic-version": "2023-06-01",
    "content-type": "application/json",
  },
  body: JSON.stringify({
    model: MODEL,
    max_tokens: 64,
    messages: [{ role: "user", content: "Reply with exactly: ZynexAV API OK" }],
  }),
});

const data = await res.json().catch(() => ({}));

if (res.ok) {
  const text = data?.content?.[0]?.text ?? "(no text)";
  console.log("✓ SUCCESS — your key and model are live.");
  console.log(`  Model replied: ${text}`);
  console.log(`  Tokens — in: ${data?.usage?.input_tokens}, out: ${data?.usage?.output_tokens}`);
  process.exit(0);
}

console.error(`✗ FAILED — HTTP ${res.status}`);
console.error("  " + JSON.stringify(data?.error ?? data));
if (res.status === 401) console.error("\n  → 401 = bad/disabled key. Recreate it in console.anthropic.com → API Keys.");
if (res.status === 400 && /model/i.test(JSON.stringify(data))) {
  console.error(`\n  → The model id "${MODEL}" may be retired. Run with a current one:`);
  console.error(`     ANTHROPIC_MODEL=claude-sonnet-4-5 node scripts/ai-smoke-test.mjs`);
  console.error("     (check console.anthropic.com → Models for the exact current id)");
}
if (res.status === 402 || /credit|billing/i.test(JSON.stringify(data))) {
  console.error("\n  → Looks like a billing/credit issue. Add credits under Console → Billing.");
}
process.exit(1);
