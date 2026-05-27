"use client";

import { useState } from "react";
import { ModuleShell } from "@/components/app/module-shell";
import { TemplateGallery } from "@/components/automations/template-gallery";
import { VisualBuilder } from "@/components/automations/visual-builder";
import { ExecutionLog } from "@/components/automations/execution-log";
import { Workflow, Sparkles, History, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "active" | "templates" | "builder" | "log";

export default function AutomationsPage() {
  const [tab, setTab] = useState<Tab>("templates");

  return (
    <ModuleShell
      eyebrow="Insights"
      title="Automations"
      description="No-code workflows for AV ops: SLA watchdogs, invoice reminders, AMC renewals, approval routing — wire once, run forever."
    >
      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-bone-300/55 mb-5 -mt-2">
        {([
          { id: "active",    label: "Active", icon: Workflow },
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

      {tab === "active" && <ActiveAutomations />}
      {tab === "templates" && <TemplateGallery />}
      {tab === "builder" && (
        <div className="space-y-4">
          <VisualBuilder />
          <div className="flex items-center justify-end gap-2">
            <button className="h-8 px-3 rounded-md text-[12.5px] text-ink-300/75 hover:text-ink-300 hover:bg-bone-100">
              Save draft
            </button>
            <button className="h-8 px-3 rounded-md text-[12.5px] text-ink-300/75 hover:text-ink-300 hover:bg-bone-100">
              Test run
            </button>
            <button className="h-8 px-3.5 rounded-md bg-ink-300 text-bone-100 text-[12.5px] font-medium hover:bg-ink-200">
              Activate
            </button>
          </div>
        </div>
      )}
      {tab === "log" && <ExecutionLog />}
    </ModuleShell>
  );
}

function ActiveAutomations() {
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center">
      <Workflow className="h-6 w-6 mx-auto text-ink-300/35 mb-2" />
      <p className="text-[13px] text-ink-300/75">No active automations yet.</p>
      <p className="text-[12px] text-ink-300/45 mt-1">
        Install one from <span className="text-ink-300">Templates</span> or build a custom workflow.
      </p>
    </div>
  );
}
