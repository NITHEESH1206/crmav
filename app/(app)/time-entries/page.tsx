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

  return (
    <ModuleShell
      eyebrow="Time"
      title="Time Entries"
      description="Technician timesheets, billable hours, productivity analytics."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <Card key={s.l}>
            <CardContent className="p-5">
              <div className="text-xs text-white/45">{s.l}</div>
              <div className="font-display text-3xl font-semibold tracking-tight mt-1">{s.v}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Weekly timesheet</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[2fr_1.5fr_100px_100px_160px] text-[10px] uppercase tracking-wider text-white/40 px-5 py-3 border-y border-white/[0.04]">
            <div>Technician</div>
            <div>Top project</div>
            <div>Hours</div>
            <div>Billable</div>
            <div>Utilization</div>
          </div>
          {entries.map((e) => (
            <div key={e.tech} className="grid grid-cols-[2fr_1.5fr_100px_100px_160px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04]">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-[10px]">{initials(e.tech)}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">{e.tech}</div>
              </div>
              <div className="text-xs text-white/55 truncate">{e.project}</div>
              <div className="text-sm font-mono">{e.hours}h</div>
              <div className="text-sm font-mono text-emerald-400">{e.billable}h</div>
              <div className="flex items-center gap-2">
                <Progress value={e.util} className="flex-1" />
                <span className="text-[10px] font-mono w-9 text-right">{e.util}%</span>
              </div>
            </div>
          ))}
          {entries.length === 0 && <div className="px-5 py-8 text-center text-xs text-white/40">No time entries this week.</div>}
        </CardContent>
      </Card>
    </ModuleShell>
  );
}
