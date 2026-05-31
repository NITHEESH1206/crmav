import { Radio, ShieldCheck, Download } from "lucide-react";
import { ModuleShell } from "@/components/app/module-shell";
import { ControlPanel } from "@/components/monitoring/control-panel";
import { listAgents, listControllableDevices, listRecentCommands } from "@/lib/data/monitoring";

export default async function ControlPage() {
  const [agents, devices, commands] = await Promise.all([
    listAgents(),
    listControllableDevices(),
    listRecentCommands(20),
  ]);

  const breadcrumbs = [
    { label: "Operate" },
    { label: "Operations", href: "/operations" },
    { label: "Remote control" },
  ];

  return (
    <ModuleShell
      eyebrow="Operations"
      title="Remote control"
      breadcrumbs={breadcrumbs}
      description="Power, restart and control AV devices from anywhere — through an on-site agent that bridges your LAN to the cloud. No VPN, no inbound ports."
    >
      {/* How it works banner */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-2xl bg-signal-500/12 border border-signal-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-signal-700" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[14px] font-medium text-ink-300">How remote control works</h3>
            <p className="text-[12.5px] text-ink-300/65 mt-1 leading-relaxed max-w-2xl">
              A small <strong>agent</strong> runs on a box (Raspberry Pi, mini-PC, NUC) on the same network as your AV devices. It connects outbound to ZynexAV and relays your commands to each device over its native protocol — so you control everything from anywhere, even though the devices sit behind the site's firewall.
            </p>
            <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink-300/55 font-mono">
              <Download className="h-3 w-3" />
              Agent script: <span className="text-ink-300/80">agent/zynex-agent.mjs</span> in the repo · Node 18+ · zero dependencies
            </div>
          </div>
        </div>
      </div>

      <ControlPanel agents={agents} devices={devices} commands={commands} />
    </ModuleShell>
  );
}
