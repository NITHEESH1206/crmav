import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import { listTimeEntriesByUser, timeSummary } from "@/lib/data/time";

export default async function TimeEntriesPage() {
  const [entries, summary] = await Promise.all([listTimeEntriesByUser(), timeSummary()]);
  const avgUtil =
    entries.length === 0 ? 0 : Math.round(entries.reduce((s, e) => s + e.util, 0) / entries.length);

  const stats = [
    { l: "Hours (week)", v: summary.hours.toString() },
    { l: "Billable", v: summary.billable.toString() },
    { l: "Billable %", v: `${summary.billablePct}%` },
    { l: "Avg utilization", v: `${avgUtil}%` },
  ];

  const exportRows = entries.map((e) => ({
    technician: e.tech,
    project: e.project,
    hours: e.hours,
    billable_hours: e.billable,
    utilization_pct: e.util,
  }));

  return (
    <ModuleShell
      eyebrow="Time"
      title="Time Entries"
      description="Technician timesheets, billable hours, productivity analytics."
      exportConfig={{
        filenamePrefix: "time-entries",
        rows: exportRows,
        columns: [
          { key: "technician", header: "Technician" },
          { key: "project", header: "Project" },
          { key: "hours", header: "Hours" },
          { key: "billable_hours", header: "Billable hours" },
          { key: "utilization_pct", header: "Utilization %" },
        ],
      }}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.l}>
            <CardContent className="p-5">
              <div className="text-xs text-ink-300/55">{s.l}</div>
              <div className="font-display text-3xl font-semibold tracking-tight mt-1">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Weekly timesheet</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[2fr_1.5fr_100px_100px_160px] text-[10px] uppercase tracking-wider text-ink-300/50 px-5 py-3 border-y border-bone-300/45">
            <div>Technician</div>
            <div>Top project</div>
            <div>Hours</div>
            <div>Billable</div>
            <div>Utilization</div>
          </div>
          {entries.map((e) => (
            <div key={e.tech} className="grid grid-cols-[2fr_1.5fr_100px_100px_160px] items-center gap-3 px-5 py-3.5 border-b border-bone-300/45">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[10px]">{initials(e.tech)}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">{e.tech}</div>
              </div>
              <div className="text-xs text-ink-300/65 truncate">{e.project}</div>
              <div className="text-sm font-mono">{e.hours}h</div>
              <div className="text-sm font-mono text-emerald-400">{e.billable}h</div>
              <div className="flex items-center gap-2">
                <Progress value={e.util} className="flex-1" />
                <span className="text-[10px] font-mono w-9 text-right">{e.util}%</span>
              </div>
            </div>
          ))}
          {entries.length === 0 && <div className="px-5 py-8 text-center text-xs text-ink-300/50">No time entries this week.</div>}
        </CardContent>
      </Card>
    </ModuleShell>
  );
}
