# ZynexAV Connector

**Pure software. No hardware to buy.** The connector runs on any always-on computer
that's already at your site (reception PC, AV rack PC, signage player, a spare
laptop) — anything on the same network as your AV devices. It bridges those
devices to the ZynexAV cloud so you can monitor and control them from anywhere.

It only makes **outbound** HTTPS calls, so it works behind any firewall/router
with zero inbound ports, no VPN, and no static IP.

---

## Quick start (any OS)

1. In ZynexAV: **Operations → Remote control → New connector**. Copy the key.
2. On the on-site PC (needs [Node.js 18+](https://nodejs.org)):

```bash
# Download just this folder's zynex-agent.mjs, then:
set ZYNEX_CLOUD_URL=https://your-app.vercel.app
set ZYNEX_AGENT_KEY=zyx_agt_xxxxxxxxxxxx
node zynex-agent.mjs
```

That's it. Now in ZynexAV, type a device's IP and it connects.

---

## Install as a background service (survives reboots)

### Windows (recommended: NSSM — the Non-Sucking Service Manager)

```powershell
# 1. Download nssm from https://nssm.cc and unzip
# 2. Install the connector as a Windows service:
nssm install ZynexAVConnector "C:\Program Files\nodejs\node.exe" "C:\zynex\zynex-agent.mjs"
nssm set ZynexAVConnector AppEnvironmentExtra ZYNEX_CLOUD_URL=https://your-app.vercel.app ZYNEX_AGENT_KEY=zyx_agt_xxxx
nssm start ZynexAVConnector
```

The service auto-starts on boot and restarts if it crashes. Manage it in
`services.msc` like any Windows service.

### macOS (launchd)

Create `~/Library/LaunchAgents/com.zynexav.connector.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.zynexav.connector</string>
  <key>ProgramArguments</key>
  <array>
    <string>/usr/local/bin/node</string>
    <string>/opt/zynex/zynex-agent.mjs</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>ZYNEX_CLOUD_URL</key><string>https://your-app.vercel.app</string>
    <key>ZYNEX_AGENT_KEY</key><string>zyx_agt_xxxx</string>
  </dict>
  <key>RunAtLoad</key><true/>
  <key>KeepAlive</key><true/>
</dict></plist>
```

Then: `launchctl load ~/Library/LaunchAgents/com.zynexav.connector.plist`

### Linux (systemd)

Create `/etc/systemd/system/zynex-connector.service`:

```ini
[Unit]
Description=ZynexAV Connector
After=network-online.target

[Service]
Environment=ZYNEX_CLOUD_URL=https://your-app.vercel.app
Environment=ZYNEX_AGENT_KEY=zyx_agt_xxxx
ExecStart=/usr/bin/node /opt/zynex/zynex-agent.mjs
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable --now zynex-connector
journalctl -u zynex-connector -f   # live logs
```

### Docker (one-liner — runs anywhere Docker does)

```bash
docker run -d --name zynex-connector --restart unless-stopped \
  --network host \
  -e ZYNEX_CLOUD_URL=https://your-app.vercel.app \
  -e ZYNEX_AGENT_KEY=zyx_agt_xxxx \
  -v $(pwd)/zynex-agent.mjs:/app/zynex-agent.mjs \
  node:20-alpine node /app/zynex-agent.mjs
```

> Use `--network host` so the container can reach AV devices on the LAN.

---

## What the connector controls

| Protocol | Devices | Power | Input | Notes |
|---|---|---|---|---|
| **PJLink** | Projectors (Epson, Sony, Panasonic, NEC, Christie…) | ✅ | ✅ | Open standard, port 4352. Works out of the box. |
| **Raw TCP** | Displays, matrix switchers | ✅ | ⚙️ | Vendor command strings vary — configure per device. |
| **Crestron** | Crestron processors | ✅ | ⚙️ | Console over TCP 41794. |
| **Telnet** | Older devices | ✅ | ⚙️ | Port 23. |
| **HTTP/REST** | Modern IP devices | ✅ | ✅ | Device exposes a web API. |

---

## Security

- The connector key is hashed (SHA-256) in the cloud — shown to you only once.
- All traffic is outbound HTTPS. No inbound ports are opened on your network.
- The connector can only see devices you explicitly add in ZynexAV.
- Revoke a connector anytime from the UI — its key stops working immediately.
