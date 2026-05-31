#!/usr/bin/env node
/**
 * ZynexAV Connector  (v2 — production-grade)
 *
 * Pure software. Runs on any always-on PC already on the SAME LAN as your AV
 * devices (reception PC, AV-rack PC, signage player). Bridges those devices to
 * the ZynexAV cloud so you monitor + control them from anywhere — no inbound
 * ports, no VPN, no static IP, no hardware to buy.
 *
 * What's new in v2:
 *   • Subnet auto-discovery — scans your LAN and reports AV devices it finds,
 *     so you click "Add & control" instead of typing IPs.
 *   • Self-update — `--update` pulls the latest connector from the cloud.
 *   • Service install helper — `--install` sets it up to survive reboots.
 *
 * ── Usage ───────────────────────────────────────────────────────────────────
 *   export ZYNEX_CLOUD_URL="https://your-app.vercel.app"
 *   export ZYNEX_AGENT_KEY="zyx_agt_xxxxxxxxxxxxxxxx"
 *   node zynex-agent.mjs              # run the connector
 *   node zynex-agent.mjs --discover   # one-shot LAN scan (prints results)
 *   node zynex-agent.mjs --install    # set up as a background service
 *   node zynex-agent.mjs --update     # pull the latest connector & exit
 *
 * Optional env:
 *   ZYNEX_SCAN=off                    # disable auto-discovery
 *   ZYNEX_SCAN_CIDR=192.168.10        # scan a specific /24 instead of auto
 *   ZYNEX_SCAN_INTERVAL_MIN=15        # minutes between scans (default 15)
 *
 * Zero dependencies — pure Node stdlib. Works on Node 18+.
 */

import net from "node:net";
import os from "node:os";
import fs from "node:fs";

const AGENT_VERSION = "2.0.0";

const CLOUD_URL = (process.env.ZYNEX_CLOUD_URL || "").replace(/\/$/, "");
const AGENT_KEY = process.env.ZYNEX_AGENT_KEY || "";
const POLL_MS_DEFAULT = 4000;
const DEVICE_REFRESH_MS = 60_000;
const TCP_TIMEOUT_MS = 4000;

const SCAN_ENABLED = (process.env.ZYNEX_SCAN || "on").toLowerCase() !== "off";
const SCAN_CIDR = process.env.ZYNEX_SCAN_CIDR || ""; // e.g. "192.168.1"
const SCAN_INTERVAL_MS = Math.max(2, Number(process.env.ZYNEX_SCAN_INTERVAL_MIN || 15)) * 60_000;
const SCAN_PROBE_TIMEOUT_MS = 800;
const SCAN_CONCURRENCY = 48;

const ARGS = new Set(process.argv.slice(2));

/* ─────────────────────────────────────────────────────────────────────────
   Cloud transport
   ───────────────────────────────────────────────────────────────────────── */

async function cloudFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(`${CLOUD_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${AGENT_KEY}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${path} → HTTP ${res.status}`);
  return res.json();
}

let devices = [];
let lastDeviceRefresh = 0;

async function refreshDevices() {
  const data = await cloudFetch("/api/agent/devices");
  devices = data.devices || [];
  lastDeviceRefresh = Date.now();
  console.log(`[zynex] roster: ${devices.length} device(s) at ${data.agent?.location ?? data.agent?.name ?? "site"}`);
}

/* ─────────────────────────────────────────────────────────────────────────
   Low-level TCP
   ───────────────────────────────────────────────────────────────────────── */

function tcpSend(host, port, payload, { expectReply = true } = {}) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let buf = "";
    const done = (err, val) => {
      socket.destroy();
      err ? reject(err) : resolve(val);
    };
    socket.setTimeout(TCP_TIMEOUT_MS);
    socket.on("timeout", () => done(new Error("timeout")));
    socket.on("error", (e) => done(e));
    socket.on("data", (d) => {
      buf += d.toString("ascii");
      if (expectReply) done(null, buf);
    });
    socket.connect(port, host, () => {
      socket.write(payload);
      if (!expectReply) setTimeout(() => done(null, ""), 250);
    });
  });
}

function tcpReachable(host, port, timeoutMs = TCP_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeoutMs);
    socket.on("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.on("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.on("error", () => resolve(false));
    socket.connect(port, host);
  });
}

/** Open a port and grab any greeting banner (for protocol identification). */
function probePort(host, port, timeoutMs = SCAN_PROBE_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let banner = "";
    let settled = false;
    const finish = (open) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve({ open, banner: banner.trim().slice(0, 120) });
    };
    socket.setTimeout(timeoutMs);
    socket.on("timeout", () => finish(banner ? true : false));
    socket.on("error", () => finish(false));
    socket.on("data", (d) => {
      banner += d.toString("ascii");
      // PJLink/telnet devices greet immediately; give a short grace then close.
      setTimeout(() => finish(true), 120);
    });
    socket.on("connect", () => {
      // If nothing is sent by the device, still treat the open port as a hit.
      setTimeout(() => finish(true), timeoutMs - 100);
    });
    socket.connect(port, host);
  });
}

/* ─────────────────────────────────────────────────────────────────────────
   Device protocols (control)
   ───────────────────────────────────────────────────────────────────────── */

const PJLINK = {
  port: 4352,
  async power(host, port, on) {
    const reply = await tcpSend(host, port, `%1POWR ${on ? 1 : 0}\r`);
    return reply.includes("OK") || reply.includes("=OK");
  },
  async input(host, port, code) {
    const reply = await tcpSend(host, port, `%1INPT ${code}\r`);
    return reply.includes("OK");
  },
  async query(host, port) {
    const pow = await tcpSend(host, port, `%1POWR ?\r`).catch(() => "");
    const m = pow.match(/POWR=(\d)/);
    const map = { "0": "OFF", "1": "ON", "2": "COOLING", "3": "WARMING" };
    return { powerState: m ? map[m[1]] ?? "UNKNOWN" : "UNKNOWN" };
  },
};

const TCP_RAW = {
  async send(host, port, command) {
    return tcpSend(host, port, command.endsWith("\r") ? command : command + "\r");
  },
};

const COMMON_TCP = { power_on: "PON", power_off: "POF", mute: "AMT 1" };
const ok = (b) => ({ status: b ? "SUCCESS" : "FAILED", result: b ? "ok" : "device declined" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function execute(device, action, params) {
  const host = device.ip;
  const proto = device.protocol;
  const port = device.port || (proto === "PJLINK" ? PJLINK.port : 23);
  if (!host) return { status: "FAILED", result: "No IP configured" };

  try {
    switch (proto) {
      case "PJLINK": {
        if (action === "power_on") return ok(await PJLINK.power(host, port, true));
        if (action === "power_off") return ok(await PJLINK.power(host, port, false));
        if (action === "restart") {
          await PJLINK.power(host, port, false);
          await sleep(8000);
          return ok(await PJLINK.power(host, port, true));
        }
        if (action === "input") return ok(await PJLINK.input(host, port, String(params.input || params.code || "31")));
        if (action === "raw") return { status: "SUCCESS", result: await tcpSend(host, port, params.command) };
        return { status: "FAILED", result: `PJLink doesn't support "${action}"` };
      }
      case "TCP_RAW":
      case "CRESTRON":
      case "TELNET": {
        const cmd = action === "raw" ? params.command : params[action] || COMMON_TCP[action];
        if (!cmd) return { status: "FAILED", result: `No command string for "${action}"` };
        const reply = await TCP_RAW.send(host, port, cmd);
        return { status: "SUCCESS", result: reply.slice(0, 200) };
      }
      case "HTTP": {
        const r = await fetch(params.url, { method: params.method || "GET" });
        return { status: r.ok ? "SUCCESS" : "FAILED", result: `HTTP ${r.status}` };
      }
      default:
        return { status: "FAILED", result: `Unsupported protocol ${proto}` };
    }
  } catch (e) {
    return { status: "FAILED", result: e.message };
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Telemetry
   ───────────────────────────────────────────────────────────────────────── */

async function gatherTelemetry() {
  const out = [];
  for (const d of devices) {
    if (!d.ip) {
      out.push({ deviceId: d.id, reachable: false });
      continue;
    }
    const port = d.port || (d.protocol === "PJLINK" ? PJLINK.port : 23);
    const reachable = await tcpReachable(d.ip, port);
    let powerState = "UNKNOWN";
    if (reachable && d.protocol === "PJLINK") {
      powerState = (await PJLINK.query(d.ip, port).catch(() => ({ powerState: "UNKNOWN" }))).powerState;
    }
    out.push({ deviceId: d.id, reachable, powerState });
  }
  return out;
}

/* ─────────────────────────────────────────────────────────────────────────
   Subnet auto-discovery
   ───────────────────────────────────────────────────────────────────────── */

// Probe ports in PRIORITY order — first open one wins the protocol guess.
const SCAN_PORTS = [
  { port: 4352, protocol: "PJLINK", label: "PJLink projector" },
  { port: 41794, protocol: "CRESTRON", label: "Crestron processor" },
  { port: 23, protocol: "TELNET", label: "Telnet device" },
  { port: 80, protocol: "HTTP", label: "HTTP device" },
  { port: 443, protocol: "HTTP", label: "HTTPS device" },
];

/** Discover local /24 subnets from this machine's network interfaces. */
function localSubnets() {
  if (SCAN_CIDR) return [{ base: SCAN_CIDR.replace(/\.$/, ""), self: null }];
  const out = [];
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const ni of ifaces[name] || []) {
      if (ni.family !== "IPv4" || ni.internal) continue;
      const parts = ni.address.split(".");
      if (parts.length !== 4) continue;
      const base = parts.slice(0, 3).join(".");
      if (!out.find((o) => o.base === base)) out.push({ base, self: ni.address });
    }
  }
  return out;
}

async function mapLimit(items, limit, fn) {
  const results = [];
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx]);
    }
  });
  await Promise.all(workers);
  return results;
}

/** Probe a single host across candidate ports; return best discovered entry or null. */
async function probeHost(ip) {
  const probes = await Promise.all(
    SCAN_PORTS.map(async (sp) => ({ ...sp, ...(await probePort(ip, sp.port)) }))
  );
  const open = probes.filter((p) => p.open);
  if (!open.length) return null;
  // SCAN_PORTS is priority-ordered; pick the first open one in that order.
  const best = SCAN_PORTS.map((sp) => open.find((o) => o.port === sp.port)).find(Boolean);
  let label = best.label;
  if (best.port === 4352 && /PJLINK/i.test(best.banner)) label = "PJLink projector";
  return {
    ip,
    port: best.port,
    protocol: best.protocol,
    label,
    banner: best.banner || undefined,
  };
}

let pendingDiscovered = null; // attached to the next poll then cleared
let lastScanAt = 0;
let scanning = false;

async function runScan() {
  if (!SCAN_ENABLED || scanning) return;
  scanning = true;
  const subnets = localSubnets();
  if (!subnets.length) {
    console.warn("[zynex] discovery: no LAN subnet found (set ZYNEX_SCAN_CIDR to force).");
    scanning = false;
    return;
  }
  const found = [];
  for (const sn of subnets) {
    const hosts = [];
    for (let h = 1; h <= 254; h++) hosts.push(`${sn.base}.${h}`);
    console.log(`[zynex] scanning ${sn.base}.0/24 …`);
    const results = await mapLimit(hosts, SCAN_CONCURRENCY, probeHost);
    for (const r of results) if (r) found.push(r);
  }
  lastScanAt = Date.now();
  scanning = false;
  console.log(`[zynex] discovery: found ${found.length} candidate device(s).`);
  if (found.length) pendingDiscovered = found;
  return found;
}

/* ─────────────────────────────────────────────────────────────────────────
   Version / self-update
   ───────────────────────────────────────────────────────────────────────── */

let upgradeNoticeShown = false;
function noteVersion(latest) {
  if (!latest || latest === AGENT_VERSION || upgradeNoticeShown) return;
  upgradeNoticeShown = true;
  console.log(
    `[zynex] ⬆ A newer connector is available (you: ${AGENT_VERSION}, latest: ${latest}). ` +
      `Run:  node ${scriptPath()} --update`
  );
}

function scriptPath() {
  return process.argv[1] || "zynex-agent.mjs";
}

async function selfUpdate() {
  if (!CLOUD_URL) {
    console.error("[zynex] --update needs ZYNEX_CLOUD_URL set.");
    process.exit(1);
  }
  const url = `${CLOUD_URL}/connector/zynex-agent.mjs`;
  console.log(`[zynex] downloading latest connector from ${url} …`);
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    if (!text.includes("ZynexAV Connector")) throw new Error("downloaded file doesn't look like the connector");
    const target = scriptPath();
    fs.copyFileSync(target, `${target}.bak`);
    fs.writeFileSync(target, text, "utf8");
    console.log(`[zynex] updated ${target} (backup at ${target}.bak). Restart the connector/service to apply.`);
    process.exit(0);
  } catch (e) {
    console.error(`[zynex] update failed: ${e.message}`);
    process.exit(1);
  }
}

/* ─────────────────────────────────────────────────────────────────────────
   Service install helper
   ───────────────────────────────────────────────────────────────────────── */

function installService() {
  const platform = os.platform();
  const node = process.execPath;
  const script = scriptPath();
  const env = { ZYNEX_CLOUD_URL: CLOUD_URL, ZYNEX_AGENT_KEY: AGENT_KEY };
  if (!CLOUD_URL || !AGENT_KEY) {
    console.error("[zynex] Set ZYNEX_CLOUD_URL and ZYNEX_AGENT_KEY before --install.");
    process.exit(1);
  }

  if (platform === "linux") {
    const unit = `[Unit]
Description=ZynexAV Connector
After=network-online.target

[Service]
Environment=ZYNEX_CLOUD_URL=${env.ZYNEX_CLOUD_URL}
Environment=ZYNEX_AGENT_KEY=${env.ZYNEX_AGENT_KEY}
ExecStart=${node} ${script}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
`;
    fs.writeFileSync("zynex-connector.service", unit, "utf8");
    console.log(`[zynex] Wrote zynex-connector.service. Install it with:

  sudo cp zynex-connector.service /etc/systemd/system/
  sudo systemctl enable --now zynex-connector
  journalctl -u zynex-connector -f
`);
  } else if (platform === "darwin") {
    const plistPath = `${os.homedir()}/Library/LaunchAgents/com.zynexav.connector.plist`;
    const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.zynexav.connector</string>
  <key>ProgramArguments</key>
  <array><string>${node}</string><string>${script}</string></array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>ZYNEX_CLOUD_URL</key><string>${env.ZYNEX_CLOUD_URL}</string>
    <key>ZYNEX_AGENT_KEY</key><string>${env.ZYNEX_AGENT_KEY}</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
`;
    try {
      fs.writeFileSync(plistPath, plist, "utf8");
      console.log(`[zynex] Wrote ${plistPath}. Start it with:

  launchctl load ${plistPath}
`);
    } catch (e) {
      console.error(`[zynex] couldn't write plist: ${e.message}`);
    }
  } else if (platform === "win32") {
    console.log(`[zynex] On Windows, run as a service with NSSM (https://nssm.cc):

  nssm install ZynexAVConnector "${node}" "${script}"
  nssm set ZynexAVConnector AppEnvironmentExtra ZYNEX_CLOUD_URL=${env.ZYNEX_CLOUD_URL} ZYNEX_AGENT_KEY=${env.ZYNEX_AGENT_KEY}
  nssm start ZynexAVConnector
`);
  } else {
    console.log(`[zynex] Unsupported platform "${platform}" for auto-install. Run with a process manager (pm2/docker).`);
  }
  process.exit(0);
}

/* ─────────────────────────────────────────────────────────────────────────
   Main loop
   ───────────────────────────────────────────────────────────────────────── */

async function tick() {
  let pollMs = POLL_MS_DEFAULT;
  try {
    if (Date.now() - lastDeviceRefresh > DEVICE_REFRESH_MS || devices.length === 0) {
      await refreshDevices().catch((e) => console.warn("[zynex] roster refresh failed:", e.message));
    }

    // Kick off a background scan on schedule (don't block the loop).
    if (SCAN_ENABLED && !scanning && Date.now() - lastScanAt > SCAN_INTERVAL_MS) {
      runScan().catch((e) => console.warn("[zynex] scan failed:", e.message));
    }

    const telemetry = await gatherTelemetry();
    const discovered = pendingDiscovered;
    pendingDiscovered = null;

    const res = await cloudFetch("/api/agent/poll", {
      method: "POST",
      body: { version: AGENT_VERSION, telemetry, results: [], discovered: discovered || undefined },
    });
    pollMs = res.pollIntervalMs || POLL_MS_DEFAULT;
    noteVersion(res.latestVersion);

    const results = [];
    for (const cmd of res.commands || []) {
      const device = devices.find((d) => d.id === cmd.deviceId);
      if (!device) {
        results.push({ commandId: cmd.id, status: "FAILED", result: "Device not in local roster" });
        continue;
      }
      console.log(`[zynex] exec ${cmd.action} → ${device.name} (${device.ip})`);
      const r = await execute(device, cmd.action, cmd.params || {});
      results.push({ commandId: cmd.id, status: r.status, result: r.result });
    }

    if (results.length) {
      await cloudFetch("/api/agent/poll", {
        method: "POST",
        body: { version: AGENT_VERSION, telemetry: [], results },
      });
    }
  } catch (e) {
    console.warn("[zynex] tick error:", e.message);
    pollMs = 8000;
  }
  setTimeout(tick, pollMs);
}

/* ─────────────────────────────────────────────────────────────────────────
   Entry point
   ───────────────────────────────────────────────────────────────────────── */

async function main() {
  if (ARGS.has("--help") || ARGS.has("-h")) {
    console.log(`ZynexAV Connector v${AGENT_VERSION}
  node zynex-agent.mjs              run the connector
  node zynex-agent.mjs --discover   one-shot LAN scan
  node zynex-agent.mjs --install    set up as a background service
  node zynex-agent.mjs --update     pull the latest connector & exit`);
    process.exit(0);
  }

  if (ARGS.has("--update")) return selfUpdate();
  if (ARGS.has("--install")) return installService();

  if (ARGS.has("--discover")) {
    if (!CLOUD_URL || !AGENT_KEY) console.warn("[zynex] (no cloud creds — scan only, results not uploaded)");
    const found = await runScan();
    console.table((found || []).map((f) => ({ ip: f.ip, port: f.port, protocol: f.protocol, label: f.label })));
    process.exit(0);
  }

  if (!CLOUD_URL || !AGENT_KEY) {
    console.error("[zynex] Missing ZYNEX_CLOUD_URL or ZYNEX_AGENT_KEY env vars.");
    process.exit(1);
  }

  console.log(`[zynex] connector v${AGENT_VERSION} starting → ${CLOUD_URL}  (scan: ${SCAN_ENABLED ? "on" : "off"})`);
  tick();
}

main();
