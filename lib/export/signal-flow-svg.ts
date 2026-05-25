import type { FlowDiagram, FlowNode, SignalClass } from "@/lib/data/signal-flows";

const HEADER_H = 22;
const PORT_ROW_H = 14;
const FOOTER_H = 34;

const SIGNAL_COLORS: Record<SignalClass, { color: string; dash?: string; legend: string }> = {
  hdmi: { color: "#22d3ee", legend: "HDMI (sources & displays)" },
  cat6: { color: "#a855f7", legend: "CAT6 — DTP / HDBaseT / LED" },
  network: { color: "#7c3aed", legend: "Network / Control LAN (PoE)" },
  dante: { color: "#10b981", legend: "Dante audio (digital)" },
  audio: { color: "#10b981", legend: "Digital audio" },
  balanced: { color: "#16a34a", legend: "Balanced audio & speaker" },
  speaker: { color: "#16a34a", legend: "Speaker" },
  wireless: { color: "#22d3ee", dash: "5,4", legend: "Wireless / Wi-Fi (mics)" },
};

function nodeHeight(n: FlowNode) {
  if (n.category === "endpoint") return 86;
  const portsRow = Math.max(
    n.ports.filter((p) => p.direction === "in").length,
    n.ports.filter((p) => p.direction === "out").length
  );
  return HEADER_H + portsRow * PORT_ROW_H + 14 + (n.model || n.brand ? FOOTER_H : 0);
}

function nodeWidth(n: FlowNode) {
  return n.width ?? (n.category === "endpoint" ? 110 : 220);
}

function portCoord(node: FlowNode, portId: string) {
  const w = nodeWidth(node);
  if (node.category === "endpoint") {
    const port = node.ports.find((p) => p.id === portId);
    const isOut = port?.direction === "out";
    return { x: isOut ? node.x + w : node.x, y: node.y + 24 };
  }
  const ins = node.ports.filter((p) => p.direction === "in");
  const outs = node.ports.filter((p) => p.direction === "out");
  let idx = 0;
  let isIn = false;
  const inIdx = ins.findIndex((p) => p.id === portId);
  if (inIdx >= 0) {
    idx = inIdx;
    isIn = true;
  } else {
    const outIdx = outs.findIndex((p) => p.id === portId);
    if (outIdx < 0) return null;
    idx = outIdx;
  }
  const bodyTop = node.y + HEADER_H + 6;
  const portY = bodyTop + idx * PORT_ROW_H + PORT_ROW_H / 2 - 1;
  return { x: isIn ? node.x : node.x + w, y: portY };
}

function escapeXML(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Build a standalone, self-contained SVG of a signal flow diagram.
 * No external CSS, fonts inlined as system stack, monochrome aesthetic
 * matching the in-app editor.
 */
export function buildSignalFlowSVG(diagram: FlowDiagram, title: string): string {
  const padding = 60;
  const legendW = 260;
  const legendH = 130;
  const maxX = Math.max(...diagram.nodes.map((n) => n.x + nodeWidth(n)), 1100) + padding;
  const maxY = Math.max(...diagram.nodes.map((n) => n.y + nodeHeight(n)), 700) + padding;
  const width = maxX + padding;
  const height = maxY + padding + 50;

  const parts: string[] = [];
  parts.push(
    `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" font-family="system-ui, -apple-system, Segoe UI, sans-serif">`
  );

  // background
  parts.push(`<rect width="100%" height="100%" fill="#fafaf9"/>`);

  // grid
  parts.push(
    `<defs>
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.04)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)"/>`
  );

  // arrow markers
  parts.push(`<defs>`);
  for (const [key, v] of Object.entries(SIGNAL_COLORS)) {
    parts.push(
      `<marker id="arrow-${key}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${v.color}"/>
      </marker>`
    );
  }
  parts.push(`</defs>`);

  // Title
  parts.push(
    `<text x="${padding}" y="32" font-size="14" font-weight="700" fill="#1a1a1a" letter-spacing="0.5">${escapeXML(title.toUpperCase())}</text>`
  );

  // Legend
  const lx = padding;
  const ly = 48;
  parts.push(
    `<g transform="translate(${lx},${ly})">
      <rect width="${legendW}" height="${legendH}" fill="#ffffff" stroke="#404040" stroke-width="1"/>
      <text x="10" y="16" font-size="9" font-weight="700" fill="#111" letter-spacing="1">LEGEND — DIGITAL SIGNAL FLOW</text>
      <line x1="10" y1="22" x2="${legendW - 10}" y2="22" stroke="#d4d4d4" stroke-width="0.5"/>`
  );
  const legendItems: SignalClass[] = ["hdmi", "cat6", "network", "dante", "balanced", "wireless"];
  legendItems.forEach((k, i) => {
    const y = 36 + i * 14;
    parts.push(
      `<line x1="10" y1="${y}" x2="38" y2="${y}" stroke="${SIGNAL_COLORS[k].color}" stroke-width="1.6" ${SIGNAL_COLORS[k].dash ? `stroke-dasharray="${SIGNAL_COLORS[k].dash}"` : ""}/>
       <text x="44" y="${y + 3}" font-size="9" fill="#1a1a1a">${escapeXML(SIGNAL_COLORS[k].legend)}</text>`
    );
  });
  parts.push(`</g>`);

  // Edges
  for (const e of diagram.edges) {
    const from = diagram.nodes.find((n) => n.id === e.from.nodeId);
    const to = diagram.nodes.find((n) => n.id === e.to.nodeId);
    if (!from || !to) continue;
    const f = portCoord(from, e.from.portId);
    const t = portCoord(to, e.to.portId);
    if (!f || !t) continue;
    const color = SIGNAL_COLORS[e.signal]?.color ?? "#444";
    const dash = SIGNAL_COLORS[e.signal]?.dash;
    let path: string;
    let midX: number, midY: number;
    if (t.x > f.x + 56) {
      const mx = (f.x + t.x) / 2;
      path = `M ${f.x} ${f.y} H ${mx} V ${t.y} H ${t.x}`;
      midX = mx;
      midY = (f.y + t.y) / 2;
    } else {
      const offset = 30;
      const ymid = (f.y + t.y) / 2;
      path = `M ${f.x} ${f.y} H ${f.x + offset} V ${ymid} H ${t.x - offset} V ${t.y} H ${t.x}`;
      midX = (f.x + t.x) / 2;
      midY = ymid;
    }
    parts.push(
      `<path d="${path}" fill="none" stroke="${color}" stroke-width="1.4" ${dash ? `stroke-dasharray="${dash}"` : ""} marker-end="url(#arrow-${e.signal})"/>`
    );
    if (e.label) {
      parts.push(
        `<g transform="translate(${midX - 18},${midY - 8})">
          <rect width="36" height="16" rx="3" fill="#fafaf9" stroke="${color}" stroke-width="0.8"/>
          <text x="18" y="11" text-anchor="middle" font-size="9" font-family="ui-monospace, monospace" font-weight="600" fill="#1a1a1a">${escapeXML(e.label)}</text>
        </g>`
      );
    }
  }

  // Nodes
  for (const n of diagram.nodes) {
    const w = nodeWidth(n);
    if (n.category === "endpoint") {
      // Icon box (no real icon — just a labeled rect to keep export self-contained)
      const iconCY = n.y + 24;
      parts.push(
        `<g transform="translate(${n.x},${n.y})">
          <rect x="${(w - 44) / 2}" y="0" width="44" height="44" fill="#ffffff" stroke="#404040" stroke-width="1"/>
          <text x="${w / 2}" y="28" text-anchor="middle" font-size="10" font-weight="700" fill="#1a1a1a">${escapeXML(endpointMark(n))}</text>
          <text x="${w / 2}" y="60" text-anchor="middle" font-size="10" font-weight="700" fill="#1a1a1a">${escapeXML(n.title)}</text>
          ${n.subtitle ? `<text x="${w / 2}" y="72" text-anchor="middle" font-size="9" fill="#737373">${escapeXML(n.subtitle)}</text>` : ""}
        </g>
        <circle cx="${n.x + (n.ports.some((p) => p.direction === "out") ? w : 0)}" cy="${iconCY}" r="3" fill="#1a1a1a"/>`
      );
      continue;
    }

    const ins = n.ports.filter((p) => p.direction === "in");
    const outs = n.ports.filter((p) => p.direction === "out");
    const portsRows = Math.max(ins.length, outs.length);
    const bodyH = portsRows * PORT_ROW_H + 12;
    const hasFooter = !!(n.brand || n.model);
    const totalH = HEADER_H + bodyH + (hasFooter ? FOOTER_H : 0);

    parts.push(
      `<g transform="translate(${n.x},${n.y})">
        <rect width="${w}" height="${totalH}" fill="#ffffff" stroke="#404040" stroke-width="1"/>
        <rect width="${w}" height="${HEADER_H}" fill="#f5f5f4" stroke="#404040" stroke-width="1"/>
        <text x="${w / 2}" y="${HEADER_H - 7}" text-anchor="middle" font-size="10" font-weight="700" fill="#1a1a1a" letter-spacing="1">${escapeXML(n.title)}</text>`
    );

    // Inbound ports (left)
    ins.forEach((p, i) => {
      const py = HEADER_H + 6 + i * PORT_ROW_H + PORT_ROW_H / 2 - 1;
      parts.push(
        `<circle cx="8" cy="${py}" r="2" fill="#ffffff" stroke="#404040" stroke-width="1"/>
        <text x="14" y="${py + 3}" font-size="8.5" font-weight="600" fill="#1a1a1a">${escapeXML(p.label)}</text>
        <text x="${w / 2 - 6}" y="${py + 3}" font-size="7.5" font-family="ui-monospace, monospace" fill="#737373" text-anchor="end">${escapeXML(p.type)}</text>`
      );
    });
    // Outbound ports (right)
    outs.forEach((p, i) => {
      const py = HEADER_H + 6 + i * PORT_ROW_H + PORT_ROW_H / 2 - 1;
      parts.push(
        `<circle cx="${w - 8}" cy="${py}" r="2" fill="#ffffff" stroke="#404040" stroke-width="1"/>
        <text x="${w - 14}" y="${py + 3}" font-size="8.5" font-weight="600" fill="#1a1a1a" text-anchor="end">${escapeXML(p.label)}</text>
        <text x="${w / 2 + 6}" y="${py + 3}" font-size="7.5" font-family="ui-monospace, monospace" fill="#737373">${escapeXML(p.type)}</text>`
      );
    });

    if (hasFooter) {
      parts.push(
        `<line x1="0" y1="${HEADER_H + bodyH}" x2="${w}" y2="${HEADER_H + bodyH}" stroke="#404040" stroke-width="1"/>`
      );
      if (n.brand) {
        parts.push(
          `<text x="${w / 2}" y="${HEADER_H + bodyH + 14}" text-anchor="middle" font-size="9" font-weight="700" fill="#dc2626" letter-spacing="1.5">${escapeXML(n.brand)}</text>`
        );
      }
      if (n.model) {
        parts.push(
          `<text x="${w / 2}" y="${HEADER_H + bodyH + 26}" text-anchor="middle" font-size="9" font-family="ui-monospace, monospace" fill="#dc2626">${escapeXML(n.model)}</text>`
        );
      }
    }

    parts.push(`</g>`);
  }

  // Watermark / metadata
  parts.push(
    `<text x="${width - padding}" y="${height - 20}" text-anchor="end" font-size="9" fill="rgba(0,0,0,0.4)">Generated by AetherAV CRM · ${new Date().toLocaleDateString()}</text>`
  );

  parts.push(`</svg>`);
  return parts.join("\n");
}

function endpointMark(n: FlowNode): string {
  const map: Record<string, string> = {
    mic: "MIC",
    laptop: "LAPTOP",
    tv: "TV",
    "led-wall": "LED",
    speaker: "SPK",
    pc: "PC",
    camera: "CAM",
  };
  return n.endpointIcon ? map[n.endpointIcon] ?? "■" : "■";
}
