import { ModuleShell } from "@/components/app/module-shell";
import { AutomationsShell } from "@/components/automations/automations-shell";
import {
  listAutomations,
  listAutomationRuns,
  getInstalledTemplateIds,
} from "@/lib/data/automations";

export default async function AutomationsPage() {
  const [automations, runs, installed] = await Promise.all([
    listAutomations(),
    listAutomationRuns(40),
    getInstalledTemplateIds(),
  ]);

  return (
    <ModuleShell
      eyebrow="Insights"
      title="Automations"
      description="No-code workflows for AV ops: SLA watchdogs, invoice reminders, AMC renewals, approval routing — wire once, run forever."
    >
      <AutomationsShell
        automations={automations.map((a) => ({
          id: a.id,
          name: a.name,
          templateId: a.templateId,
          triggerId: a.triggerId,
          enabled: a.enabled,
          runCount: a.runCount,
          lastRunAt: a.lastRunAt,
          actions: a.actions,
        }))}
        runs={runs.map((r) => ({
          id: r.id,
          outcome: r.outcome,
          entityLabel: r.entityLabel,
          detail: r.detail,
          createdAt: r.createdAt,
          automation: { name: r.automation.name },
        }))}
        installedTemplateIds={Array.from(installed)}
      />
    </ModuleShell>
  );
}
