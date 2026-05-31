import Link from "next/link";
import { Cpu, Wifi, WifiOff, AlertTriangle, Activity, Radio, ArrowUpRight } from "lucide-react";
import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { OpsShell } from "@/components/operations/ops-shell";
import { AlertCenter } from "@/components/operations/alert-center";
import { IntegrationsPanel } from "@/components/operations/integrations-panel";
import { getRoomsWithHealth, getActiveAlerts, getOpsSummary } from "@/lib/data/operations";

export default async function OperationsPage() {
  const [rooms, alerts, summary] = await Promise.all([
    getRoomsWithHealth(),
    getActiveAlerts(12),
    getOpsSummary(),
  ]);

  const stats = [
    { label: "Rooms",      value: summary.rooms,       icon: Activity,       tone: "text-ink-300/85" },
    { label: "Total devices", value: summary.devices,  icon: Cpu,            tone: "text-ink-300/85" },
    { label: "Online",     value: summary.online,      icon: Wifi,           tone: "text-status-success-fg" },
    { label: "Warning",    value: summary.warning,     icon: AlertTriangle,  tone: "text-status-warning-fg" },
    { label: "Offline",    value: summary.offline,     icon: WifiOff,        tone: "text-status-danger-fg" },
  ];

  return (
    <ModuleShell
      eyebrow="Operations"
      title="Operations Center"
      description="Live AV health across every monitored room. Acknowledge alerts, manage connectors, run NOC mode on the wall display."
      actions={
        <Link
          href="/operations/control"
          className="btn-glass-signal inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-[13px] font-medium"
        >
          <Radio className="h-3.5 w-3.5" />
          Remote control
          <ArrowUpRight className="h-3 w-3" strokeWidth={2} />
        </Link>
      }
    >
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
                  <Icon className={`h-3 w-3 ${s.tone}`} />
                  {s.label}
                </div>
                <div className="font-display text-display-lg tracking-tight text-ink-300 mt-1 leading-none">
                  {s.value}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Uptime headline */}
      <div className="rounded-lg bg-white border border-bone-300/55 px-4 py-3 mb-4 flex items-center justify-between">
        <div>
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
            Fleet uptime
          </div>
          <div className="text-heading-lg font-display text-ink-300 mt-0.5">
            {summary.uptimePct}%
          </div>
        </div>
        <div className="text-[11.5px] text-ink-300/55">
          Based on current online vs total device states. SLO-grade reporting available per AMC contract.
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4">
        <OpsShell rooms={rooms} />
        <div className="space-y-3">
          <AlertCenter alerts={alerts} />
          <IntegrationsPanel />
        </div>
      </div>
    </ModuleShell>
  );
}
