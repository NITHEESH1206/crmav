"use client";

import { Sparkles, ArrowUpRight } from "lucide-react";
import { useAssistant } from "@/lib/stores/assistant";
import type { AttentionItem } from "@/lib/data/mission-control";

/**
 * AI Brief — the "what to watch today" card on the dashboard.
 *
 * To stay snappy and avoid burning tokens on every load, we synthesise the
 * brief deterministically from the top attention items. The "Open with AI"
 * action hands the same context to the assistant drawer for deeper analysis.
 */
export function AIBriefWidget({ items }: { items: AttentionItem[] }) {
  const showAssistant = useAssistant((s) => s.show);
  const bullets = synthesizeBullets(items);

  function openWithAI() {
    const summary = bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
    showAssistant(
      `I'm looking at today's Mission Control. Help me build an action plan.\n\n${summary}\n\nWhich should I tackle first, who do I delegate to, and what specific message do I send?`
    );
  }

  return (
    <section className="glass-signal relative rounded-[20px] overflow-hidden">
      {/* Top accent stripe — signal-orange for the AI surface */}
      <span
        aria-hidden
        className="absolute top-0 left-3 right-3 h-px pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(255,90,31,0.65), transparent)",
        }}
      />
      <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-signal-500/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-6 w-6 rounded-lg bg-signal-500/25 backdrop-blur-md border border-signal-500/30 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]">
            <Sparkles className="h-3 w-3 text-signal-700" strokeWidth={2.5} />
          </div>
          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-signal-700/80 leading-tight">
              AI Brief · Today
            </div>
            <h3 className="text-[13px] font-semibold text-ink-300 leading-tight mt-0.5">What to watch</h3>
          </div>
        </div>
        <button
          onClick={openWithAI}
          className="inline-flex items-center gap-1 text-[11px] text-signal-700 hover:text-signal-800 font-medium shrink-0 rounded-full px-2 py-1 hover:bg-white/40 transition-colors"
        >
          Open with AI
          <ArrowUpRight className="h-3 w-3" />
        </button>
      </header>
      <div className="p-4 space-y-2.5">
        {bullets.length === 0 ? (
          <p className="text-[12.5px] text-ink-300/55">
            Nothing pressing today. Use the spare cycles to push proposals out.
          </p>
        ) : (
          <ol className="space-y-2.5 list-none">
            {bullets.map((b, i) => (
              <li key={i} className="flex gap-2.5 text-[12.5px] text-ink-300/85 leading-relaxed">
                <span className="font-mono text-[10.5px] text-signal-600 mt-0.5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{b}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function synthesizeBullets(items: AttentionItem[]): string[] {
  const bullets: string[] = [];
  const groups = groupBy(items, (i) => i.kind);

  const sla = groups.get("sla-breach") ?? [];
  if (sla.length > 0) {
    bullets.push(
      `${sla.length === 1 ? `Ticket ${sla[0].title.split("·")[1]?.trim() ?? "is"} ` : `${sla.length} tickets are`} at SLA risk — handle these first to protect health scores.`
    );
  }

  const invoices = groups.get("overdue-invoice") ?? [];
  if (invoices.length > 0) {
    const total = invoices.reduce((s, i) => s + (i.value ?? 0), 0);
    bullets.push(
      `$${total.toLocaleString(undefined, { maximumFractionDigits: 0 })} sitting in ${invoices.length} overdue invoice${invoices.length === 1 ? "" : "s"} — chase the oldest before noon.`
    );
  }

  const pos = groups.get("delayed-po") ?? [];
  if (pos.length > 0) {
    bullets.push(
      `${pos.length} purchase order${pos.length === 1 ? "" : "s"} past expected date — ping vendors and update project timelines so PMs aren't blindsided.`
    );
  }

  const risk = groups.get("at-risk-project") ?? [];
  if (risk.length > 0) {
    bullets.push(
      `${risk.length} project${risk.length === 1 ? "" : "s"} flagged HIGH risk — schedule a 15-min review with each project lead today.`
    );
  }

  const amc = groups.get("amc-expiring") ?? [];
  if (amc.length > 0 && bullets.length < 3) {
    bullets.push(
      `${amc.length} AMC contract${amc.length === 1 ? "" : "s"} renewing within 30 days — confirm renewal scope while the relationship is warm.`
    );
  }

  return bullets.slice(0, 3);
}

function groupBy<T, K>(arr: T[], key: (t: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of arr) {
    const k = key(item);
    const list = map.get(k) ?? [];
    list.push(item);
    map.set(k, list);
  }
  return map;
}
