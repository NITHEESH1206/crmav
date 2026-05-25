import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building2, FolderKanban } from "lucide-react";
import { formatCompact, formatDate } from "@/lib/utils";
import { listProjects, getPhaseSummary } from "@/lib/data/projects";
import { OpenableRow } from "@/components/app/openable";
import { EmptyState } from "@/components/app/empty-state";

const riskColor = (r: string) =>
  r === "HIGH" ? ("destructive" as const) : r === "MEDIUM" ? ("warning" as const) : ("success" as const);

export default async function ProjectsPage() {
  const [projects, phases] = await Promise.all([listProjects(), getPhaseSummary()]);

  return (
    <ModuleShell
      eyebrow="Projects"
      title="AV Projects"
      description="Room-wise BOQ tracking, Gantt timelines, milestones, and live project profitability."
    >
      {projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Convert a won opportunity into a project, or create one directly. Track phases from engineering to handover with live margin and BOQ tracking."
          cta="Create your first project"
          ctaKind="project"
        />
      ) : (
        <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {phases.map((p) => (
          <Card key={p.phase}>
            <CardContent className="p-4">
              <div className="text-[10px] uppercase tracking-wider text-white/40">{p.phase.toLowerCase()}</div>
              <div className="font-display text-2xl font-semibold tracking-tight mt-1">{p.count}</div>
              <div className="text-[10px] text-white/35 mt-0.5">projects</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active projects</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="grid grid-cols-[2fr_1fr_1fr_120px_80px_60px] text-[10px] uppercase tracking-wider text-white/40 px-5 py-3 border-y border-white/[0.04] bg-white/[0.01]">
            <div>Project</div>
            <div>Phase</div>
            <div>Value</div>
            <div>Progress</div>
            <div>Due</div>
            <div>Risk</div>
          </div>
          {projects.map((p) => (
            <OpenableRow
              key={p.id}
              kind="project"
              id={p.id}
              className="grid grid-cols-[2fr_1fr_1fr_120px_80px_60px] items-center gap-3 px-5 py-4 border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-white/40">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{p.account?.name ?? "—"}</span>
                </div>
              </div>
              <div><Badge variant="secondary" className="capitalize">{p.phase.toLowerCase()}</Badge></div>
              <div className="text-sm font-mono">${formatCompact(p.contractValueCents / 100)}</div>
              <div className="flex items-center gap-2">
                <Progress value={p.progress} className="flex-1" />
                <span className="text-[10px] text-white/55 font-mono w-7 text-right">{p.progress}%</span>
              </div>
              <div className="text-[11px] text-white/55">
                {p.dueDate ? formatDate(p.dueDate, { month: "short", day: "numeric" }) : "—"}
              </div>
              <div>
                <Badge variant={riskColor(p.riskLevel)} className="capitalize">
                  {p.riskLevel.toLowerCase()}
                </Badge>
              </div>
            </OpenableRow>
          ))}
        </CardContent>
      </Card>
        </>
      )}
    </ModuleShell>
  );
}
