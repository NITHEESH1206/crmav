#!/usr/bin/env node
/**
 * ZynexAV on-site agent.
 *
 * Runs on a small always-on box (Raspberry Pi / mini-PC / NUC) on the SAME LAN
 * as your AV devices. It bridges those devices to the ZynexAV cloud so you can
 * monitor + control them from anywhere — no inbound ports, no VPN, no static IP.
 *
 * How it works:
 *   1. Connects OUTBOUND to the cloud (HTTPS poll every few seconds).
 *   2. Fetches its device roster (IPs + protocols) from /api/agent/devices.
 *   3. Pings each device to report online/offline + power state (telemetry).
 *   4. Picks up queued commands from /api/agent/poll and executes them on the
 *      device over its native protocol (PJLink / raw TCP / Crestron / telnet).
 *   5. Reports results back on the next poll.
 *
 * ── Setup ──────────────────────────────────────────────────────────────────
 *   1. Create an agent in ZynexAV: Operations → Agents → New agent.
 *      Copy the one-time agent key (zyx_agt_...).
 *   2. On the on-site box (needs Node 18+):
 *        export ZYNEX_CLOUD_URL="https://your-app.vercel.app"
 *        export ZYNEX_AGENT_KEY="zyx_agt_xxxxxxxxxxxxxxxx"
 *        node zynex-agent.mjs
 *   3. (Recommended) Run it as a service so it survives reboots:
 *        - systemd unit, pm2, or Docker. See README at the bottom.
 *
 * Zero dependencies — pure Node stdlib (net, https). Works on Node 18+.
 */

import net from "node:net";

const CLOUD_URL = (process.env.ZYNEX_CLOUD_URL || "").replace(/\/$/, "");
const AGENT_KEY = process.env.ZYNEX_AGENT_KEY || "";
const POLL_MS_DEFAULT = 4000;
const DEVICE_REFRESH_MS = 60_000;
const TCP_TIMEOUT_MS = 4000;

if (!CLOUD_URL || !AGENT_KEY) {
  console.error("[zynex-agent] Missing ZYNEX_CLOUD_URL or ZYNEX_AGENT_KEY env vars.");
  process.exit(1);
}

let devices = [];
let lastDeviceRefresh = 0;

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
  if (!res.ok) {
    throw new Error(`${path} → HTTP ${res.status}`);
  }
  return res.json();
}

async function refreshDevices() {
  const data = await cloudFetch("/api/agent/devices");
  devices = data.devices || [];
  lastDeviceRefresh = Date.now();
  console.log(`[zynex-agent] roster: ${devices.length} device(s) at ${data.agent?.location ?? data.agent?.name ?? "site"}`);
}

/* ─────────────────────────────────────────────────────────────────────────
   Device protocols
   ───────────────────────────────────────────────────────────────────────── */

/** Open a TCP socket, send `payload`, resolve with the first response chunk. */
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
      if (!expectReply) {
        // Give the device a moment to accept then close
        setTimeout(() => done(null, ""), 250);
      }
    });
  });
}

/* ── PJLink (projectors — open standard, default port 4352) ──
   Class 1, no-auth. Commands: %1POWR 1 (on), %1POWR 0 (off), %1POWR ? (query). */
const PJLINK = {
  port: 4352,
  async power(host, port, on) {
    const reply = await tcpSend(host, port, `%1POWR ${on ? 1 : 0}\r`);
    return reply.includes("OK") || reply.includes("=OK");
  },
  async input(host, port, code) {
    // code like "31" (HDMI1) — PJLink input codes: 1x RGB, 2x video, 3x digital, 4x storage, 5x network
    const reply = await tcpSend(host, port, `%1INPT ${code}\r`);
    return reply.includes("OK");
  },
  async query(host, port) {
    const pow = await tcpSend(host, port, `%1POWR ?\r`).catch(() => "");
    // reply: %1POWR=0 / =1 / =2 (cooling) / =3 (warming)
    const m = pow.match(/POWR=(\d)/);
    const map = { "0": "OFF", "1": "ON", "2": "COOLING", "3": "WARMING" };
    return { powerState: m ? map[m[1]] ?? "UNKNOWN" : "UNKNOWN" };
  },
};

/* ── Generic raw TCP (displays, matrix switchers with documented strings) ──
   The "raw" command action sends params.command verbatim. Power/input use
   common patterns but vary by vendor — override via raw if needed. */
const TCP_RAW = {
  async send(host, port, command) {
    return tcpSend(host, port, command.endsWith("\r") ? command : command + "\r");
  },
};

/** Translate a high-level command to the device protocol + execute. */
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
          await sleep(8000); // cooldown before re-power
          return ok(await PJLINK.power(host, port, true));
        }
        if (action === "input") return ok(await PJLINK.input(host, port, String(params.input || params.code || "31")));
        if (action === "raw") return { status: "SUCCESS", result: await tcpSend(host, port, params.command) };
        return { status: "FAILED", result: `PJLink doesn't support "${action}"` };
      }
      case "TCP_RAW":
      case "CRESTRON":
      case "TELNET": {
        // For these, the UI/device config supplies the exact command strings via
        // a per-action map in params, or use the raw action.
        const cmd =
          action === "raw"
            ? params.command
            : params[action] || COMMON_TCP[action];
        if (!cmd) return { status: "FAILED", result: `No command string for "${action}"` };
        const reply = await TCP_RAW.send(host, port, cmd);
        return { status: "SUCCESS", result: reply.slice(0, 200) };
      }
      case "HTTP": {
        // Device exposes a REST endpoint; params.url + params.method.
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

// Reasonable default command strings for common displays over TCP (PJLink-less)
const COMMON_TCP = {
  power_on: "PON",
  power_off: "POF",
  mute: "AMT 1",
};

const ok = (b) => ({ status: b ? "SUCCESS" : "FAILED", result: b ? "ok" : "device declined" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ─────────────────────────────────────────────────────────────────────────
   Telemetry — ping each device for reachability + power state
   ───────────────────────────────────────────────────────────────────────── */

async function gatherTelemetry() {
  const out = [];
  for (const d of devices) {
    if (!d.ip) {
      out.push({ deviceId: d.id, reachable: false });
      continue;
    }
    const port = d.port || (d.protocol === "PJLINK" ? PJLINK.port : 23);
    // Reachability = can we open the control port?
    const reachable = await tcpReachable(d.ip, port);
    let powerState = "UNKNOWN";
    if (reachable && d.protocol === "PJLINK") {
      powerState = (await PJLINK.query(d.ip, port).catch(() => ({ powerState: "UNKNOWN" }))).powerState;
    }
    out.push({ deviceId: d.id, reachable, powerState });
  }
  return out;
}

function tcpReachable(host, port) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(TCP_TIMEOUT_MS);
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

/* ─────────────────────────────────────────────────────────────────────────
   Main loop
   ───────────────────────────────────────────────────────────────────────── */

async function tick() {
  let pollMs = POLL_MS_DEFAULT;
  try {
    if (Date.now() - lastDeviceRefresh > DEVICE_REFRESH_MS || devices.length === 0) {
      await refreshDevices().catch((e) => console.warn("[zynex-agent] roster refresh failed:", e.message));
    }

    const telemetry = await gatherTelemetry();

    // First poll: send telemetry, get commands
    const res = await cloudFetch("/api/agent/poll", {
      method: "POST",
      body: { version: "1.0.0", telemetry, results: [] },
    });
    pollMs = res.pollIntervalMs || POLL_MS_DEFAULT;

    // Execute any commands, collect results
    const results = [];
    for (const cmd of res.commands || []) {
      const device = devices.find((d) => d.id === cmd.deviceId);
      if (!device) {
        results.push({ commandId: cmd.id, status: "FAILED", result: "Device not in local roster" });
        continue;
      }
      console.log(`[zynex-agent] exec ${cmd.action} → ${device.name} (${device.ip})`);
      const r = await execute(device, cmd.action, cmd.params || {});
      results.push({ commandId: cmd.id, status: r.status, result: r.result });
    }

    // Report results back if any
    if (results.length) {
      await cloudFetch("/api/agent/poll", {
        method: "POST",
        body: { version: "1.0.0", telemetry: [], results },
      });
    }
  } catch (e) {
    console.warn("[zynex-agent] tick error:", e.message);
    pollMs = 8000; // back off on error
  }
  setTimeout(tick, pollMs);
}

console.log(`[zynex-agent] starting → ${CLOUD_URL}`);
tick();

/*
 ── Run as a service (systemd) ──────────────────────────────────────────────
 Create /etc/systemd/system/zynex-agent.service:

   [Unit]
   Description=ZynexAV on-site agent
   After=network-online.target

   [Service]
   Environment=ZYNEX_CLOUD_URL=https://your-app.vercel.app
   Environment=ZYNEX_AGENT_KEY=zyx_agt_xxxxxxxxxxxx
   ExecStart=/usr/bin/node /opt/zynex/zynex-agent.mjs
   Restart=always
   RestartSec=5
   User=pi

   [Install]
   WantedBy=multi-user.target

 Then:
   sudo systemctl enable --now zynex-agent
   journalctl -u zynex-agent -f      # live logs
*/
