"use client";

import { useState, useTransition } from "react";
import { Workflow, Sparkles, History, Plus, Play, Trash2, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { TemplateGallery } from "./template-gallery";
import { VisualBuilder } from "./visual-builder";
import { TRIGGERS, ACTIONS } from "@/lib/automations/catalog";
import {
  toggleAutomation,
  deleteAutomation,
  runAutomationsNow,
} from "@/app/actions/automations";

type Tab = "active" | "templates" | "builder" | "log";

export type AutomationRow = {
  id: string;
  name: string;
  templateId: string | null;
  triggerId: string;
  enabled: boolean;
  runCount: number;
  lastRunAt: Date | null;
  actions: unknown;
};

export type RunRow = {
  id: string;
  outcome: string;
  entityLabel: string | null;
  detail: string | null;
  createdAt: Date;
  automation: { name: string };
};

export function AutomationsShell({
  automations,
  runs,
  installedTemplateIds,
}: {
  automations: AutomationRow[];
  runs: RunRow[];
  installedTemplateIds: string[];
}) {
  const [tab, setTab] = useState<Tab>(automations.length > 0 ? "active" : "templates");
  const [running, startRun] = useTransition();

  function runNow() {
    startRun(async () => {
      const r = await runAutomationsNow();
      if (r.ok) {
        toast.success(`Ran ${r.automations} automation${r.automations === 1 ? "" : "s"}`, {
          description: `${r.totalRan} action${r.totalRan === 1 ? "" : "s"} fired across ${r.totalMatched} matched record${r.totalMatched === 1 ? "" : "s"}.`,
        });
      }
    });
  }

  return (
    <div>
      {/* Tab bar + Run now */}
      <div className="flex items-center justify-between border-b border-bone-300/55 mb-5 -mt-2">
        <div className="flex items-center gap-1">
          {([
            { id: "active",    label: `Active${automations.length ? ` · ${automations.length}` : ""}`, icon: Workflow },
            { id: "templates", label: "Templates", icon: Sparkles },
            { id: "builder",   label: "New automation", icon: Plus },
            { id: "log",       label: "Execution log", icon: History },
          ] as { id: Tab; label: string; icon: typeof Workflow }[]).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 h-9 px-3 text-[12.5px] font-medium transition-colors",
                  tab === t.id ? "text-ink-300" : "text-ink-300/55 hover:text-ink-300"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {tab === t.id && (
                  <span className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full bg-ink-300" />
                )}
              </button>
            );
          })}
        </div>
        {automations.length > 0 && (
          <button
            type="button"
            onClick={runNow}
            disabled={running}
            className="btn-glass-primary inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium mb-1"
          >
            {running ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
            {running ? "Running…" : "Run now"}
          </button>
        )}
      </div>

      {tab === "active" && <ActiveList automations={automations} />}
      {tab === "templates" && <TemplateGallery installedIds={installedTemplateIds} />}
      {tab === "builder" && (
        <div className="space-y-4">
          <VisualBuilder />
          <p className="text-[12px] text-ink-300/55 text-center">
            Custom-builder persistence ships next — for now, install from Templates to activate real automations.
          </p>
        </div>
      )}
      {tab === "log" && <RealExecutionLog runs={runs} />}
    </div>
  );
}

/* ─── Active automations list ─── */
function ActiveList({ automations }: { automations: AutomationRow[] }) {
  if (automations.length === 0) {
    return (
      <div className="glass-card px-6 py-16 text-center">
        <Workflow className="h-6 w-6 mx-auto text-ink-300/35 mb-2" />
        <p className="text-[13px] text-ink-300/75">No active automations yet.</p>
        <p className="text-[12px] text-ink-300/45 mt-1">
          Install one from <span className="text-ink-300">Templates</span> to get started.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {automations.map((a) => (
        <AutomationCard key={a.id} automation={a} />
      ))}
    </div>
  );
}

function AutomationCard({ automation }: { automation: AutomationRow }) {
  const [enabled, setEnabled] = useState(automation.enabled);
  const [, startTransition] = useTransition();
  const trigger = TRIGGERS.find((t) => t.id === automation.triggerId);
  const actions = (automation.actions as { id: string }[]) ?? [];

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      await toggleAutomation(automation.id, next);
    });
  }

  function remove() {
    if (!confirm(`Delete "${automation.name}"?`)) return;
    startTransition(async () => {
      await deleteAutomation(automation.id);
      toast.success("Automation removed");
    });
  }

  return (
    <article className="glass-card p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className={cn(
          "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border",
          enabled
            ? "bg-signal-500/12 border-signal-500/25 text-signal-700"
            : "bg-bone-100 border-bone-300/55 text-ink-300/45"
        )}>
          <Zap className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="text-[14px] font-medium text-ink-300 truncate">{automation.name}</div>
          <div className="text-[11.5px] text-ink-300/55 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="font-mono">{trigger?.label ?? automation.triggerId}</span>
            <span className="text-ink-300/30">→</span>
            <span>{actions.length} action{actions.length === 1 ? "" : "s"}</span>
            <span className="text-ink-300/30">·</span>
            <span>{automation.runCount} run{automation.runCount === 1 ? "" : "s"}</span>
            {automation.lastRunAt && (
              <>
                <span className="text-ink-300/30">·</span>
                <span>last {new Date(automation.lastRunAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={toggle}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors border",
            enabled ? "bg-signal-500/90 border-signal-600/40" : "bg-bone-200/80 border-bone-300/60"
          )}
        >
          <span className={cn(
            "absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white shadow-[0_1px_2px_rgba(10,10,10,0.2)] transition-all",
            enabled ? "left-[18px]" : "left-0.5"
          )} />
        </button>
        <button
          type="button"
          onClick={remove}
          className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/45 hover:text-status-danger-fg"
          aria-label="Delete"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </article>
  );
}

/* ─── Real execution log ─── */
function RealExecutionLog({ runs }: { runs: RunRow[] }) {
  if (runs.length === 0) {
    return (
      <div className="glass-card px-6 py-16 text-center">
        <History className="h-6 w-6 mx-auto text-ink-300/35 mb-2" />
        <p className="text-[13px] text-ink-300/75">No runs yet.</p>
        <p className="text-[12px] text-ink-300/45 mt-1">
          Install an automation and hit <span className="text-ink-300">Run now</span>, or wait for the hourly cron.
        </p>
      </div>
    );
  }
  return (
    <div className="glass-card overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-bone-300/30 bg-white/30 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55">
            <th className="text-left px-4 py-2.5 w-[36px]"></th>
            <th className="text-left px-4 py-2.5">Automation</th>
            <th className="text-left px-4 py-2.5">Entity</th>
            <th className="text-left px-4 py-2.5">Detail</th>
            <th className="text-right px-4 py-2.5">When</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id} className="border-b border-bone-300/25 hover:bg-white/40">
              <td className="px-4 py-2.5">
                <span className={cn(
                  "h-2 w-2 rounded-full inline-block",
                  r.outcome === "success" ? "bg-status-success-fg" :
                  r.outcome === "failed" ? "bg-status-danger-fg" : "bg-ink-300/35"
                )} />
              </td>
              <td className="px-4 py-2.5 text-ink-300 font-medium">{r.automation.name}</td>
              <td className="px-4 py-2.5 text-ink-300/75">{r.entityLabel ?? "—"}</td>
              <td className="px-4 py-2.5 text-ink-300/60 truncate">{r.detail ?? "—"}</td>
              <td className="px-4 py-2.5 text-right font-mono text-ink-300/55">
                {new Date(r.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
