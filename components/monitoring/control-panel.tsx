"use client";

import { useState, useTransition } from "react";
import {
  Power,
  PowerOff,
  RotateCw,
  Cpu,
  Wifi,
  WifiOff,
  Plus,
  Copy,
  Check,
  X,
  Server,
  Loader2,
  Radio,
  Settings2,
  Terminal,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  registerAgent,
  deleteAgent,
  sendDeviceCommand,
  configureDeviceControl,
  getCommandStatus,
} from "@/app/actions/monitoring";

type Agent = {
  id: string;
  name: string;
  location: string | null;
  keyPrefix: string;
  version: string | null;
  deviceCount: number;
  online: boolean;
  lastSeenAt: Date | null;
};

type Device = {
  id: string;
  name: string;
  brand: string | null;
  category: string | null;
  room: string | null;
  account: string | null;
  ip: string | null;
  status: string;
  powerState: string;
  controlProtocol: string;
  controlPort: number | null;
  agentId: string | null;
  agentName: string | null;
  agentOnline: boolean;
  lastPolledAt: Date | null;
  telemetry: Record<string, unknown> | null;
};

type Command = {
  id: string;
  action: string;
  status: string;
  result: string | null;
  deviceName: string;
  createdAt: Date;
  executedAt: Date | null;
};

export function ControlPanel({
  agents,
  devices,
  commands,
}: {
  agents: Agent[];
  devices: Device[];
  commands: Command[];
}) {
  const [newAgentOpen, setNewAgentOpen] = useState(false);
  const [configDevice, setConfigDevice] = useState<Device | null>(null);

  const linkedDevices = devices.filter((d) => d.agentId);
  const unlinkedDevices = devices.filter((d) => !d.agentId);

  return (
    <div className="space-y-6">
      {/* Agents */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-medium text-ink-300 inline-flex items-center gap-2">
            <Server className="h-4 w-4 text-ink-300/55" />
            On-site agents
          </h2>
          <button
            type="button"
            onClick={() => setNewAgentOpen(true)}
            className="btn-glass-primary inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            New agent
          </button>
        </div>
        {agents.length === 0 ? (
          <div className="glass-card px-6 py-12 text-center">
            <Server className="h-6 w-6 mx-auto text-ink-300/35 mb-2" />
            <p className="text-[13px] text-ink-300/75">No agents yet.</p>
            <p className="text-[12px] text-ink-300/50 mt-1 max-w-md mx-auto">
              An agent is a small program you run on a box (Raspberry Pi / mini-PC) on the same network as your AV devices. It bridges them to the cloud for remote control.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {agents.map((a) => (
              <AgentCard key={a.id} agent={a} />
            ))}
          </div>
        )}
      </section>

      {/* Controllable devices */}
      <section>
        <h2 className="text-[15px] font-medium text-ink-300 inline-flex items-center gap-2 mb-3">
          <Radio className="h-4 w-4 text-ink-300/55" />
          Devices under control
        </h2>
        {linkedDevices.length === 0 ? (
          <div className="glass-card px-6 py-12 text-center">
            <Radio className="h-6 w-6 mx-auto text-ink-300/35 mb-2" />
            <p className="text-[13px] text-ink-300/75">No devices linked to an agent yet.</p>
            <p className="text-[12px] text-ink-300/50 mt-1">
              Configure a device below to start controlling it remotely.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {linkedDevices.map((d) => (
              <DeviceControlCard key={d.id} device={d} onConfigure={() => setConfigDevice(d)} />
            ))}
          </div>
        )}
      </section>

      {/* Unlinked devices — config prompts */}
      {unlinkedDevices.length > 0 && agents.length > 0 && (
        <section>
          <h3 className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-300/55 mb-2">
            Not yet controllable · {unlinkedDevices.length}
          </h3>
          <div className="glass-card divide-y divide-bone-300/25">
            {unlinkedDevices.slice(0, 8).map((d) => (
              <div key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium text-ink-300 truncate">{d.name}</div>
                  <div className="text-[11px] text-ink-300/55">
                    {d.room ?? "Unassigned"} · {d.ip ?? "no IP"}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfigDevice(d)}
                  className="hover-glass inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-bone-300/55 text-[12px] text-ink-300/75 hover:text-ink-300"
                >
                  <Settings2 className="h-3 w-3" />
                  Configure
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Command log */}
      <section>
        <h2 className="text-[15px] font-medium text-ink-300 inline-flex items-center gap-2 mb-3">
          <Terminal className="h-4 w-4 text-ink-300/55" />
          Recent commands
        </h2>
        {commands.length === 0 ? (
          <div className="glass-card px-6 py-10 text-center text-[12.5px] text-ink-300/55">
            No commands sent yet.
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-[12.5px]">
              <thead>
                <tr className="border-b border-bone-300/30 bg-white/30 font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-300/55">
                  <th className="text-left px-4 py-2.5 w-[36px]"></th>
                  <th className="text-left px-4 py-2.5">Device</th>
                  <th className="text-left px-4 py-2.5">Action</th>
                  <th className="text-left px-4 py-2.5">Result</th>
                  <th className="text-right px-4 py-2.5">When</th>
                </tr>
              </thead>
              <tbody>
                {commands.map((c) => (
                  <tr key={c.id} className="border-b border-bone-300/25 hover:bg-white/40">
                    <td className="px-4 py-2.5">
                      <span className={cn(
                        "h-2 w-2 rounded-full inline-block",
                        c.status === "SUCCESS" ? "bg-status-success-fg" :
                        c.status === "FAILED" ? "bg-status-danger-fg" :
                        c.status === "EXPIRED" ? "bg-ink-300/35" : "bg-status-warning-fg animate-pulse"
                      )} />
                    </td>
                    <td className="px-4 py-2.5 text-ink-300 font-medium">{c.deviceName}</td>
                    <td className="px-4 py-2.5 font-mono text-ink-300/75">{c.action}</td>
                    <td className="px-4 py-2.5 text-ink-300/60 truncate">{c.result ?? c.status.toLowerCase()}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-ink-300/55">
                      {new Date(c.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {newAgentOpen && <NewAgentDialog onClose={() => setNewAgentOpen(false)} />}
      {configDevice && (
        <ConfigureDialog
          device={configDevice}
          agents={agents}
          onClose={() => setConfigDevice(null)}
        />
      )}
    </div>
  );
}

/* ─── Agent card ─── */
function AgentCard({ agent }: { agent: Agent }) {
  const [, startTransition] = useTransition();
  function remove() {
    if (!confirm(`Delete agent "${agent.name}"? Its devices will be unlinked.`)) return;
    startTransition(async () => {
      await deleteAgent(agent.id);
      toast.success("Agent removed");
    });
  }
  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border",
            agent.online ? "bg-status-success-bg/70 border-status-success-fg/25 text-status-success-fg" : "bg-bone-100 border-bone-300/55 text-ink-300/45"
          )}>
            {agent.online ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <div className="text-[14px] font-medium text-ink-300 truncate">{agent.name}</div>
            <div className="text-[11px] text-ink-300/55 truncate">{agent.location ?? "—"}</div>
          </div>
        </div>
        <button onClick={remove} className="hover-glass h-7 w-7 rounded-full border border-transparent flex items-center justify-center text-ink-300/40 hover:text-status-danger-fg">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 pt-3 border-t border-bone-300/30 flex items-center justify-between text-[11px]">
        <span className={cn("font-medium", agent.online ? "text-status-success-fg" : "text-ink-300/45")}>
          {agent.online ? "Online" : agent.lastSeenAt ? `Last seen ${new Date(agent.lastSeenAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}` : "Never connected"}
        </span>
        <span className="text-ink-300/55 font-mono">{agent.deviceCount} device{agent.deviceCount === 1 ? "" : "s"}</span>
      </div>
    </div>
  );
}

/* ─── Device control card ─── */
function DeviceControlCard({ device, onConfigure }: { device: Device; onConfigure: () => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [power, setPower] = useState(device.powerState);

  function command(action: string, params?: Record<string, unknown>) {
    setBusy(action);
    startTransition(async () => {
      const r = await sendDeviceCommand({ deviceId: device.id, action: action as "power_on", params });
      if (!r.ok) {
        toast.error("Couldn't queue command", { description: r.error });
        setBusy(null);
        return;
      }
      // Poll for the agent to execute (up to ~12s)
      const commandId = r.commandId;
      let tries = 0;
      const iv = setInterval(async () => {
        tries++;
        const st = await getCommandStatus(commandId);
        if (st.status === "SUCCESS" || st.status === "FAILED" || st.status === "EXPIRED" || tries > 8) {
          clearInterval(iv);
          setBusy(null);
          if (st.status === "SUCCESS") {
            toast.success(`${labelFor(action)} sent`, { description: device.name });
            if (action === "power_on") setPower("ON");
            if (action === "power_off") setPower("OFF");
          } else if (st.status === "FAILED") {
            toast.error(`${labelFor(action)} failed`, { description: st.result ?? "Device declined" });
          } else if (st.status === "EXPIRED" || tries > 8) {
            toast.warning("No response from agent", { description: "Is the on-site agent running?" });
          }
        }
      }, 1500);
    });
  }

  const online = device.status === "ONLINE";
  const agentDown = !device.agentOnline;

  return (
    <div className="glass-card p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="h-9 w-9 rounded-xl bg-bone-50 border border-bone-300/55 flex items-center justify-center shrink-0">
            <Cpu className="h-4 w-4 text-ink-300/65" />
          </span>
          <div className="min-w-0">
            <div className="text-[13.5px] font-medium text-ink-300 truncate">{device.name}</div>
            <div className="text-[11px] text-ink-300/55 truncate">
              {device.room ?? "—"} · {device.ip ?? "no IP"} · {device.controlProtocol}
            </div>
          </div>
        </div>
        <button onClick={onConfigure} className="hover-glass h-7 w-7 rounded-full border border-transparent flex items-center justify-center text-ink-300/45 hover:text-ink-300">
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Status strip */}
      <div className="flex items-center gap-2 mb-3 text-[11px]">
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
          online ? "bg-status-success-bg/70 text-status-success-fg" : "bg-status-danger-bg text-status-danger-fg"
        )}>
          <span className={cn("h-1.5 w-1.5 rounded-full", online ? "bg-status-success-fg" : "bg-status-danger-fg")} />
          {online ? "Online" : "Offline"}
        </span>
        <span className={cn(
          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium",
          power === "ON" ? "bg-signal-500/12 text-signal-700" : "bg-bone-100 text-ink-300/55"
        )}>
          {power === "ON" ? <Power className="h-2.5 w-2.5" /> : <PowerOff className="h-2.5 w-2.5" />}
          {power}
        </span>
      </div>

      {agentDown && (
        <div className="mb-3 rounded-lg bg-status-warning-bg/60 border border-status-warning-fg/20 px-2.5 py-1.5 text-[11px] text-status-warning-fg">
          Agent "{device.agentName}" is offline — commands will queue until it reconnects.
        </div>
      )}

      {/* Control buttons */}
      <div className="grid grid-cols-3 gap-2">
        <ControlButton
          icon={Power}
          label="On"
          tone="signal"
          busy={busy === "power_on"}
          onClick={() => command("power_on")}
        />
        <ControlButton
          icon={PowerOff}
          label="Off"
          tone="ink"
          busy={busy === "power_off"}
          onClick={() => command("power_off")}
        />
        <ControlButton
          icon={RotateCw}
          label="Restart"
          tone="ink"
          busy={busy === "restart"}
          onClick={() => command("restart")}
        />
      </div>
    </div>
  );
}

function ControlButton({
  icon: Icon,
  label,
  tone,
  busy,
  onClick,
}: {
  icon: typeof Power;
  label: string;
  tone: "signal" | "ink";
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn(
        "inline-flex flex-col items-center justify-center gap-1 h-14 rounded-xl text-[11px] font-medium transition-all",
        tone === "signal" ? "btn-glass-signal" : "btn-glass-secondary",
        busy && "opacity-70"
      )}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
      {label}
    </button>
  );
}

function labelFor(action: string): string {
  return { power_on: "Power on", power_off: "Power off", restart: "Restart" }[action] ?? action;
}

/* ─── New agent dialog (with one-time key reveal) ─── */
function NewAgentDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function create() {
    if (name.trim().length < 2) {
      toast.error("Name the agent");
      return;
    }
    startTransition(async () => {
      const r = await registerAgent({ name: name.trim(), location: location.trim() || undefined });
      if (r.ok) setRawKey(r.rawKey);
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-300/35 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="glass-card relative w-full max-w-md overflow-hidden">
        <header className="px-5 py-3.5 border-b border-bone-300/40 flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-ink-300">New on-site agent</h3>
          <button onClick={onClose} className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/55 hover:text-ink-300">
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        {!rawKey ? (
          <div className="px-5 py-4 space-y-3">
            <label className="block">
              <span className="text-[11.5px] text-ink-300/65 font-medium">Agent name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Marriott NYC bridge" className="input-glass mt-1" autoFocus />
            </label>
            <label className="block">
              <span className="text-[11.5px] text-ink-300/65 font-medium">Location (optional)</span>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. 14F MDF closet" className="input-glass mt-1" />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button onClick={onClose} className="hover-glass h-9 px-4 rounded-full border border-bone-300/55 text-[13px] text-ink-300/75 hover:text-ink-300">Cancel</button>
              <button onClick={create} disabled={pending} className="btn-glass-signal h-9 px-4 rounded-full text-[13px] font-medium">
                {pending ? "Creating…" : "Create agent"}
              </button>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            <div className="rounded-xl bg-status-warning-bg/60 border border-status-warning-fg/20 p-3 text-[12px] text-ink-300/80">
              Copy this key now — it's shown <strong>only once</strong>. Set it as <span className="font-mono">ZYNEX_AGENT_KEY</span> on your on-site box.
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-ink-300 px-3 py-2.5">
              <code className="flex-1 text-[12px] font-mono text-bone-100 break-all">{rawKey}</code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(rawKey);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="h-8 w-8 rounded-lg bg-bone-100/10 hover:bg-bone-100/20 flex items-center justify-center text-bone-100 shrink-0"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="rounded-xl bg-white/40 border border-bone-300/45 p-3 text-[11.5px] text-ink-300/70 font-mono leading-relaxed">
              export ZYNEX_CLOUD_URL=&quot;https://your-app.vercel.app&quot;<br />
              export ZYNEX_AGENT_KEY=&quot;{rawKey.slice(0, 18)}…&quot;<br />
              node zynex-agent.mjs
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={onClose} className="btn-glass-primary h-9 px-4 rounded-full text-[13px] font-medium">Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Configure device control dialog ─── */
function ConfigureDialog({
  device,
  agents,
  onClose,
}: {
  device: Device;
  agents: Agent[];
  onClose: () => void;
}) {
  const [agentId, setAgentId] = useState(device.agentId ?? "");
  const [protocol, setProtocol] = useState(device.controlProtocol === "NONE" ? "PJLINK" : device.controlProtocol);
  const [ip, setIp] = useState(device.ip ?? "");
  const [port, setPort] = useState(device.controlPort?.toString() ?? "");
  const [pending, startTransition] = useTransition();

  const defaultPort = protocol === "PJLINK" ? "4352" : protocol === "CRESTRON" ? "41794" : "23";

  function save() {
    startTransition(async () => {
      const r = await configureDeviceControl({
        deviceId: device.id,
        agentId: agentId || null,
        controlProtocol: protocol as "PJLINK",
        ipAddress: ip.trim() || null,
        controlPort: port ? parseInt(port, 10) : parseInt(defaultPort, 10),
      });
      if (r.ok) {
        toast.success("Device configured");
        onClose();
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-300/35 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="glass-card relative w-full max-w-md overflow-hidden">
        <header className="px-5 py-3.5 border-b border-bone-300/40 flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-ink-300">Configure control · {device.name}</h3>
          <button onClick={onClose} className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/55 hover:text-ink-300">
            <X className="h-3.5 w-3.5" />
          </button>
        </header>
        <div className="px-5 py-4 space-y-3">
          <label className="block">
            <span className="text-[11.5px] text-ink-300/65 font-medium">Bridge agent</span>
            <select value={agentId} onChange={(e) => setAgentId(e.target.value)} className="input-glass mt-1">
              <option value="">— None —</option>
              {agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}{a.location ? ` · ${a.location}` : ""}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11.5px] text-ink-300/65 font-medium">Control protocol</span>
            <select value={protocol} onChange={(e) => setProtocol(e.target.value)} className="input-glass mt-1">
              <option value="PJLINK">PJLink (projectors)</option>
              <option value="TCP_RAW">Raw TCP (displays / matrix)</option>
              <option value="CRESTRON">Crestron console</option>
              <option value="TELNET">Telnet</option>
              <option value="HTTP">HTTP / REST</option>
            </select>
          </label>
          <div className="grid grid-cols-[2fr_1fr] gap-3">
            <label className="block">
              <span className="text-[11.5px] text-ink-300/65 font-medium">Device IP</span>
              <input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="192.168.1.50" className="input-glass mt-1 font-mono" />
            </label>
            <label className="block">
              <span className="text-[11.5px] text-ink-300/65 font-medium">Port</span>
              <input value={port} onChange={(e) => setPort(e.target.value)} placeholder={defaultPort} className="input-glass mt-1 font-mono" />
            </label>
          </div>
          <p className="text-[11px] text-ink-300/55">
            The agent reaches the device at this LAN IP. PJLink defaults to 4352, Crestron 41794, telnet 23.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="hover-glass h-9 px-4 rounded-full border border-bone-300/55 text-[13px] text-ink-300/75 hover:text-ink-300">Cancel</button>
            <button onClick={save} disabled={pending} className="btn-glass-signal h-9 px-4 rounded-full text-[13px] font-medium">
              {pending ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
