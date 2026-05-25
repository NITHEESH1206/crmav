import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Clock, CheckCircle2, ShieldCheck } from "lucide-react";
import { listTickets, ticketCounts, listAMCs } from "@/lib/data/service";
import { formatDate } from "@/lib/utils";
import { OpenableRow } from "@/components/app/openable";

export default async function ServicePage() {
  const [tickets, counts, amcs] = await Promise.all([listTickets(), ticketCounts(), listAMCs()]);

  const stats = [
    { label: "Open tickets", value: counts.open, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
    { label: "In progress", value: counts.inProgress, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
    { label: "Resolved (7d)", value: counts.resolved, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { label: "AMC active", value: counts.amcActive, icon: ShieldCheck, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/20" },
  ];

  return (
    <ModuleShell
      eyebrow="Service"
      title="Service Desk"
      description="SLA-aware tickets, preventive maintenance, technician dispatch, and AMC contracts."
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className={`h-10 w-10 rounded-xl border ${s.bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-4 w-4 ${s.color}`} />
                </div>
                <div className="text-xs text-white/45">{s.label}</div>
                <div className="font-display text-3xl font-semibold tracking-tight mt-1">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-5">
        <Card>
          <CardHeader><CardTitle>Tickets</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-[80px_2fr_1fr_60px_100px] text-[10px] uppercase tracking-wider text-white/40 px-5 py-3 border-y border-white/[0.04]">
              <div>ID</div>
              <div>Title</div>
              <div>Client</div>
              <div>Pri.</div>
              <div>Tech</div>
            </div>
            {tickets.map((t) => (
              <OpenableRow
                key={t.id}
                kind="ticket"
                id={t.id}
                className="grid grid-cols-[80px_2fr_1fr_60px_100px] items-center gap-3 px-5 py-3.5 border-b border-white/[0.04] hover:bg-white/[0.015]"
              >
                <div className="text-[11px] text-white/40 font-mono">{t.number}</div>
                <div className="text-sm font-medium truncate">{t.title}</div>
                <div className="text-xs text-white/55 truncate">{t.account?.name ?? "—"}</div>
                <Badge variant={t.priority === "P1" ? "destructive" : t.priority === "P2" ? "warning" : "secondary"} className="h-5 px-1.5 text-[10px]">
                  {t.priority}
                </Badge>
                <div className="text-xs text-white/55 truncate">{t.assignee?.name ?? "—"}</div>
              </OpenableRow>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>AMC contracts</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {amcs.map((a) => (
              <div key={a.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium truncate">{a.account.name}</div>
                  <Badge variant={a.tier === "PREMIER" ? "default" : "secondary"} className="capitalize">{a.tier.toLowerCase()}</Badge>
                </div>
                <div className="text-[11px] text-white/45 mt-1">Expires {formatDate(a.endDate)}</div>
                <div className="mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-white/55">
                    {a.visitsTotal} / {a.visitsUsed} used
                  </span>
                  <span className="text-emerald-400 font-mono">{a.healthScore}% health</span>
                </div>
                <Progress value={a.healthScore} className="mt-2" />
              </div>
            ))}
            {amcs.length === 0 && <div className="text-xs text-white/40">No AMC contracts.</div>}
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  );
}
