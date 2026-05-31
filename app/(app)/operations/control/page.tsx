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
      description="Power, restart and control AV devices from anywhere. Type a device IP and it connects — through a lightweight software connector that runs on a PC you already have on-site. No hardware to buy, no VPN, no inbound ports."
    >
      {/* How it works banner */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-start gap-3">
          <span className="h-10 w-10 rounded-2xl bg-signal-500/12 border border-signal-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-signal-700" strokeWidth={1.9} />
          </span>
          <div className="min-w-0">
            <h3 className="text-[14px] font-medium text-ink-300">100% software — no hardware to buy</h3>
            <p className="text-[12.5px] text-ink-300/65 mt-1 leading-relaxed max-w-2xl">
              A cloud app can't reach a private device IP (like <span className="font-mono text-ink-300/80">192.168.1.50</span>) directly — every network on earth has one, and the site firewall blocks it. So the <strong>ZynexAV Connector</strong> — pure software — runs once on any always-on PC you already have on-site (reception PC, AV-rack PC, signage player). It connects <em>outbound</em> to ZynexAV and relays your commands to each device. After that one install, you just <strong>type the device IP and it connects.</strong>
            </p>
            <div className="mt-3 grid sm:grid-cols-3 gap-2">
              {[
                ["1", "Install the connector", "One command on any on-site PC. Survives reboots."],
                ["2", "Type the device IP", "Add the IP + protocol in ZynexAV. The connector verifies it."],
                ["3", "Control from anywhere", "Power, restart, inputs — from any browser, on any network."],
              ].map(([n, t, d]) => (
                <div key={n} className="rounded-xl bg-white/60 border border-bone-300/50 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-signal-700">
                    <span className="h-4 w-4 rounded-full bg-signal-500/15 flex items-center justify-center text-[10px]">{n}</span>
                    {t}
                  </div>
                  <p className="text-[11px] text-ink-300/55 mt-1 leading-snug">{d}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2 text-[11.5px] text-ink-300/55 font-mono">
              <Download className="h-3 w-3" />
              Connector: <span className="text-ink-300/80">agent/zynex-agent.mjs</span> · setup guide in <span className="text-ink-300/80">agent/README.md</span> · Node 18+ · zero dependencies
            </div>
          </div>
        </div>
      </div>

      <ControlPanel agents={agents} devices={devices} commands={commands} />
    </ModuleShell>
  );
}
