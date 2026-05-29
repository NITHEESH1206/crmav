"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Boxes,
  Layers3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatCompact } from "@/lib/utils";
import type { ValidatedPlan, ValidatedRoom } from "@/lib/ai/plan-schema";

export function PlanReview({
  plan,
  onBack,
  onRefine,
  onConfirm,
  refining,
  launching,
}: {
  plan: ValidatedPlan;
  onBack: () => void;
  onRefine: (refinement: string) => void;
  onConfirm: () => void;
  refining?: boolean;
  launching?: boolean;
}) {
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [expandedRoom, setExpandedRoom] = useState<number | null>(0);

  const riskTone =
    plan.riskLevel === "HIGH"
      ? "danger"
      : plan.riskLevel === "MEDIUM"
        ? "warning"
        : "success";

  const totalDevices = plan.validatedRooms.reduce(
    (s, r) => s + r.validatedDevices.reduce((sum, d) => sum + d.quantity, 0),
    0
  );
  const totalLines = plan.validatedRooms.reduce((s, r) => s + r.validatedDevices.length, 0);

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="glass-card p-7 md:p-9">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-signal-700 mb-3">
              <Sparkles className="h-3 w-3" strokeWidth={2.5} />
              Step 2 · AI plan
            </div>
            <h2 className="text-[26px] md:text-[30px] font-medium tracking-[-0.018em] text-ink-300 leading-tight">
              {plan.projectName}
            </h2>
            <p className="mt-3 text-[15px] text-ink-300/70 leading-[1.55] max-w-[680px]">
              {plan.narrative}
            </p>
          </div>
          <RiskBadge tone={riskTone}>{plan.riskLevel}</RiskBadge>
        </div>

        {/* Totals strip */}
        <div className="mt-7 pt-6 border-t border-bone-300/30 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Project total" value={`$${formatCompact(plan.totalCents / 100)}`} signal />
          <Stat label="Rooms" value={plan.validatedRooms.length.toString()} />
          <Stat label="Devices" value={totalDevices.toString()} />
          <Stat label="Line items" value={totalLines.toString()} />
        </div>

        {/* Warnings + callouts */}
        {plan.warnings.length > 0 && (
          <div className="mt-5 rounded-xl bg-status-warning-bg/60 border border-status-warning-fg/20 p-3.5">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-status-warning-fg font-medium mb-1">
              <AlertTriangle className="h-3 w-3" />
              {plan.warnings.length} mapped SKU{plan.warnings.length === 1 ? "" : "s"}
            </div>
            <ul className="text-[12.5px] text-ink-300/80 space-y-0.5">
              {plan.warnings.map((w, i) => (
                <li key={i}>· {w}</li>
              ))}
            </ul>
          </div>
        )}

        {plan.callouts.length > 0 && (
          <div className="mt-4 rounded-xl bg-signal-500/8 border border-signal-500/15 p-3.5">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.06em] text-signal-700 font-medium mb-1">
              <CheckCircle2 className="h-3 w-3" />
              Verify before installing
            </div>
            <ul className="text-[12.5px] text-ink-300/80 space-y-0.5">
              {plan.callouts.map((c, i) => (
                <li key={i}>· {c}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Per-room cards */}
      <div className="space-y-3">
        {plan.validatedRooms.map((room, idx) => (
          <RoomCard
            key={idx}
            room={room}
            index={idx}
            totalRooms={plan.validatedRooms.length}
            expanded={expandedRoom === idx}
            onToggle={() => setExpandedRoom((cur) => (cur === idx ? null : idx))}
          />
        ))}
      </div>

      {/* Refine input */}
      {refineOpen && (
        <div className="glass-card p-5">
          <label className="block">
            <span className="font-mono text-[11px] uppercase tracking-[0.06em] text-signal-700 font-medium">
              Refine the plan
            </span>
            <input
              autoFocus
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && refineText.trim()) {
                  onRefine(refineText.trim());
                }
              }}
              placeholder='e.g. "Add a fourth huddle room", "Use Crestron instead of Q-SYS for audio", "Add wireless mics to the boardroom"'
              className="input-glass mt-2"
            />
            <p className="text-[11.5px] text-ink-300/55 mt-2">
              The AI will regenerate the whole plan with your refinement applied.
            </p>
          </label>
        </div>
      )}

      {/* Action bar */}
      <div className="glass-card p-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          disabled={launching || refining}
          className="hover-glass inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13.5px] text-ink-300/75 hover:text-ink-300 disabled:opacity-50"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to brief
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRefineOpen((v) => !v)}
            disabled={launching}
            className="hover-glass inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13.5px] text-ink-300/75 hover:text-ink-300 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refining ? "animate-spin" : ""}`} />
            {refineOpen ? (refining ? "Regenerating…" : "Cancel refine") : "Refine"}
          </button>

          {refineOpen && refineText.trim() && (
            <button
              type="button"
              onClick={() => onRefine(refineText.trim())}
              disabled={refining}
              className="btn-glass-primary inline-flex items-center gap-1.5 h-10 px-4 rounded-full text-[13.5px]"
            >
              Re-run
            </button>
          )}

          {!refineOpen && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={launching}
              className="btn-glass-signal inline-flex items-center gap-2 h-11 px-6 rounded-full text-[14.5px] font-medium"
            >
              {launching
                ? "Launching…"
                : `Accept & launch ${plan.validatedRooms.length === 1 ? "project" : `${plan.validatedRooms.length}-room project`}`}
              <ArrowRight className="h-4 w-4" strokeWidth={2} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Per-room expandable card ─── */
function RoomCard({
  room,
  index,
  totalRooms,
  expanded,
  onToggle,
}: {
  room: ValidatedRoom;
  index: number;
  totalRooms: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  // Group devices by category for readability
  const grouped = new Map<string, ValidatedRoom["validatedDevices"]>();
  for (const d of room.validatedDevices) {
    const list = grouped.get(d.category) ?? [];
    list.push(d);
    grouped.set(d.category, list);
  }
  const categoryList = Array.from(grouped.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  return (
    <div className="glass-card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="hover-glass w-full px-6 py-4 flex items-center justify-between gap-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="h-9 w-9 rounded-xl bg-signal-500/15 border border-signal-500/25 flex items-center justify-center font-mono text-[12px] text-signal-700 font-medium shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0">
            <div className="text-[16px] font-medium text-ink-300 truncate flex items-center gap-2">
              {room.name}
              <span className="font-mono text-[10.5px] text-ink-300/55 px-1.5 py-0.5 rounded-md bg-white/60 border border-bone-300/40 uppercase tracking-[0.06em]">
                {room.roomType.toLowerCase().replace("_", " ")}
              </span>
            </div>
            <div className="text-[12px] text-ink-300/60 mt-0.5">
              {room.capacity} seats · {room.lengthM.toFixed(1)} × {room.widthM.toFixed(1)} × {room.heightM.toFixed(1)}m · {room.validatedDevices.length} line items
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="font-display text-[18px] font-medium text-signal-700 tracking-tight leading-none">
              ${formatCompact(room.totalCents / 100)}
            </div>
            <div className="text-[10.5px] text-ink-300/55 mt-0.5">
              {((room.totalCents / 100) > 0 ? room.totalCents : 0)
                ? `${Math.round((room.totalCents / (room.totalCents || 1)) * 100)}%`
                : ""}
            </div>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-ink-300/55" />
          ) : (
            <ChevronDown className="h-4 w-4 text-ink-300/55" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-bone-300/35">
          {categoryList.map(([cat, items]) => {
            const catTotal = items.reduce((s, d) => s + d.quantity * d.listPriceCents, 0);
            return (
              <div key={cat} className="border-b border-bone-300/25 last:border-b-0">
                <div className="px-6 py-2.5 flex items-center justify-between bg-white/30">
                  <div className="flex items-center gap-2.5">
                    <Boxes className="h-3 w-3 text-ink-300/55" strokeWidth={1.75} />
                    <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/70 font-medium">
                      {cat}
                    </span>
                    <span className="text-[10.5px] font-mono text-ink-300/45 px-1.5 py-0.5 rounded bg-white/60 border border-bone-300/40">
                      {items.length}
                    </span>
                  </div>
                  <span className="font-mono text-[12px] text-ink-300/75">
                    ${formatCompact(catTotal / 100)}
                  </span>
                </div>
                <ul className="divide-y divide-bone-300/20">
                  {items.map((d) => (
                    <li
                      key={d.catalogId}
                      className="px-6 py-2.5 grid grid-cols-1 md:grid-cols-[1fr_auto_60px_100px] gap-3 items-center"
                    >
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-ink-300 truncate">
                          {d.name}
                          <span className="ml-2 font-mono text-[11px] text-ink-300/45">
                            {d.sku}
                          </span>
                        </div>
                        {d.rationale && (
                          <div className="text-[11.5px] text-ink-300/60 mt-0.5 italic">
                            {d.rationale}
                          </div>
                        )}
                      </div>
                      <div className="text-[12px] text-ink-300/60 font-mono">{d.brand}</div>
                      <div className="text-right font-mono text-[12px] text-ink-300/85">
                        ×{d.quantity}
                      </div>
                      <div className="text-right font-mono text-[12px] text-ink-300 font-medium">
                        ${formatCompact((d.quantity * d.listPriceCents) / 100)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  signal,
}: {
  label: string;
  value: string;
  signal?: boolean;
}) {
  return (
    <div>
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55 font-medium">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-[22px] tracking-[-0.018em] font-medium leading-none ${
          signal ? "text-signal-700" : "text-ink-300"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function RiskBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const c =
    tone === "danger" ? "pill-danger" : tone === "warning" ? "pill-warning" : "pill-success";
  return (
    <span
      className={`${c} inline-flex items-center rounded-full px-3 py-1 font-mono text-[10.5px] uppercase tracking-[0.08em] font-medium shrink-0`}
    >
      {children} risk
    </span>
  );
}
