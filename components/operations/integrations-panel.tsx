"use client";

import { Plug, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

type Connector = {
  name: string;
  desc: string;
  status: "connected" | "available" | "error";
  lastSync?: string;
  devices?: number;
};

const CONNECTORS: Connector[] = [
  {
    name: "Crestron Fusion",
    desc: "Device list · uptime · room schedule · alarms",
    status: "connected",
    lastSync: "2m ago",
    devices: 84,
  },
  {
    name: "Q-SYS Reflect",
    desc: "DSP status · audio levels · named controls",
    status: "connected",
    lastSync: "30s ago",
    devices: 22,
  },
  {
    name: "Extron GVE",
    desc: "Switcher routes · room presence · alarms",
    status: "available",
  },
  {
    name: "Biamp SageVue",
    desc: "Tesira state · firmware · perimeter",
    status: "available",
  },
];

const TONE = {
  connected: { dot: "bg-status-success-fg", label: "Connected", labelClass: "text-status-success-fg" },
  available: { dot: "bg-ink-300/30",        label: "Available", labelClass: "text-ink-300/55" },
  error:     { dot: "bg-status-danger-fg",  label: "Error",     labelClass: "text-status-danger-fg" },
};

export function IntegrationsPanel() {
  return (
    <section className="rounded-lg bg-white border border-bone-300/55">
      <header className="px-4 py-2.5 border-b border-bone-300/45 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Plug className="h-3.5 w-3.5 text-ink-300/55" />
          <h3 className="text-[13px] font-semibold text-ink-300">Integrations</h3>
        </div>
        <button className="text-[11.5px] text-ink-300/55 hover:text-ink-300">
          Manage
        </button>
      </header>
      <ul className="divide-y divide-bone-300/35">
        {CONNECTORS.map((c) => {
          const t = TONE[c.status];
          return (
            <li key={c.name} className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
                  <span className="text-[13px] font-medium text-ink-300 truncate">{c.name}</span>
                </div>
                <div className="text-[11px] text-ink-300/55 mt-0.5 truncate">{c.desc}</div>
              </div>
              <div className="text-right shrink-0">
                <div className={cn("text-[11px] font-medium", t.labelClass)}>{t.label}</div>
                {c.lastSync && (
                  <div className="text-[10.5px] text-ink-300/45 inline-flex items-center gap-1 mt-0.5">
                    <RefreshCw className="h-2.5 w-2.5" />
                    {c.lastSync}
                  </div>
                )}
                {c.devices !== undefined && (
                  <div className="text-[10.5px] text-ink-300/45 mt-0.5">{c.devices} devices</div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
