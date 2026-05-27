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

  const exportRows = projects.map((p) => ({
    name: p.name,
    account: p.account?.name ?? "",
    phase: p.phase,
    status: p.status,
    contract_value_usd: (p.contractValueCents / 100).toFixed(2),
    progress_pct: p.progress,
    risk: p.riskLevel,
    due_date: p.dueDate ? p.dueDate.toISOString().slice(0, 10) : "",
    created_at: p.createdAt.toISOString(),
  }));

  return (
    <ModuleShell
      eyebrow="Projects"
      title="AV Projects"
      description="Room-wise BOQ tracking, Gantt timelines, milestones, and live project profitability."
      exportConfig={{
        filenamePrefix: "projects",
        rows: exportRows,
        columns: [
          { key: "name", header: "Name" },
          { key: "account", header: "Account" },
          { key: "phase", header: "Phase" },
          { key: "status", header: "Status" },
          { key: "contract_value_usd", header: "Contract value (USD)" },
          { key: "progress_pct", header: "Progress %" },
          { key: "risk", header: "Risk" },
          { key: "due_date", header: "Due" },
          { key: "created_at", header: "Created" },
        ],
      }}
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
              <div className="text-[10px] uppercase tracking-wider text-ink-300/50">{p.phase.toLowerCase()}</div>
              <div className="font-display text-2xl font-semibold tracking-tight mt-1">{p.count}</div>
              <div className="text-[10px] text-ink-300/45 mt-0.5">projects</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active projects</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header (md+) */}
          <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_120px_80px_60px] text-[10px] uppercase tracking-wider text-ink-300/50 px-5 py-3 border-y border-bone-300/45 bg-bone-50/40">
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
              className="grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_120px_80px_60px] items-start md:items-center gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-bone-300/45 hover:bg-bone-50/50 transition-colors"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{p.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-ink-300/50">
                  <Building2 className="h-3 w-3" />
                  <span className="truncate">{p.account?.name ?? "—"}</span>
                </div>
                {/* Mobile-only meta strip */}
                <div className="md:hidden mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                  <Badge variant="secondary" className="capitalize">{p.phase.toLowerCase()}</Badge>
                  <span className="text-ink-300/75 font-mono">${formatCompact(p.contractValueCents / 100)}</span>
                  <span className="text-ink-300/50">{p.progress}%</span>
                  {p.dueDate && (
                    <span className="text-ink-300/50">· {formatDate(p.dueDate, { month: "short", day: "numeric" })}</span>
                  )}
                </div>
              </div>
              {/* Desktop columns */}
              <div className="hidden md:block"><Badge variant="secondary" className="capitalize">{p.phase.toLowerCase()}</Badge></div>
              <div className="hidden md:block text-sm font-mono">${formatCompact(p.contractValueCents / 100)}</div>
              <div className="hidden md:flex items-center gap-2">
                <Progress value={p.progress} className="flex-1" />
                <span className="text-[10px] text-ink-300/65 font-mono w-7 text-right">{p.progress}%</span>
              </div>
              <div className="hidden md:block text-[11px] text-ink-300/65">
                {p.dueDate ? formatDate(p.dueDate, { month: "short", day: "numeric" }) : "—"}
              </div>
              {/* Risk badge — visible always (top-right on mobile, last col on desktop) */}
              <div className="self-start md:self-center">
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
