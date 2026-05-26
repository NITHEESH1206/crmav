"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Network,
  Save,
  Mic,
  MonitorPlay,
  Speaker,
  Camera,
  Laptop,
  Monitor,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { saveSignalFlow } from "@/app/actions/signal-flows";
import type {
  FlowDiagram,
  FlowNode,
  FlowEdge,
  Port,
  SignalClass,
  EndpointIcon,
} from "@/lib/data/signal-flows";
import { ExportMenu, type ExportFormat } from "@/components/app/export-menu";
import { buildSignalFlowSVG } from "@/lib/export/signal-flow-svg";
import { downloadSVG, downloadSVGAsPNG } from "@/lib/export/svg";
import { downloadJSON, timestampedFilename } from "@/lib/export/download";
import { cn } from "@/lib/utils";

// ──────────────────────────────────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────────────────────────────────

const HEADER_H = 22;
const PORT_ROW_H = 14;
const PORT_DOT = 6;

const ENDPOINT_ICONS: Record<EndpointIcon, LucideIcon> = {
  mic: Mic,
  laptop: Laptop,
  tv: MonitorPlay,
  "led-wall": Monitor,
  speaker: Speaker,
  pc: Monitor,
  camera: Camera,
};

const SIGNAL_COLORS: Record<SignalClass, { color: string; dash?: string }> = {
  hdmi:     { color: "#22d3ee" },
  cat6:     { color: "#a855f7" },
  network:  { color: "#7c3aed" },
  dante:    { color: "#10b981" },
  audio:    { color: "#10b981" },
  balanced: { color: "#16a34a" },
  speaker:  { color: "#16a34a" },
  wireless: { color: "#22d3ee", dash: "5 4" },
};

const LEGEND_ITEMS: { key: SignalClass; label: string }[] = [
  { key: "hdmi", label: "HDMI (sources & displays)" },
  { key: "cat6", label: "CAT6 — DTP / HDBaseT / LED" },
  { key: "network", label: "Network / Control LAN (PoE)" },
  { key: "dante", label: "Dante audio (digital)" },
  { key: "balanced", label: "Balanced audio & speaker" },
  { key: "wireless", label: "Wireless / Wi-Fi (mics)" },
];

type Flow = { id: string; name: string; diagram: FlowDiagram };

// ──────────────────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────────────────

export function SignalFlowDesigner({ flows }: { flows: Flow[] }) {
  const [activeId, setActiveId] = useState(flows[0]?.id ?? null);
  const active = useMemo(() => flows.find((f) => f.id === activeId), [flows, activeId]);
  const [diagram, setDiagram] = useState<FlowDiagram>(active?.diagram ?? { nodes: [], edges: [] });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<"idle" | "saved">("idle");
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const dragRef = useRef<{ id: string; sx: number; sy: number; nx: number; ny: number } | null>(null);
  const panRef = useRef<{ sx: number; sy: number; px: number; py: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) {
      setDiagram(active.diagram);
      setPan({ x: 0, y: 0 });
      setZoom(1);
      setSaved("idle");
    }
  }, [active]);

  function switchFlow(id: string) {
    setActiveId(id);
  }

  function startNodeDrag(e: React.PointerEvent, n: FlowNode) {
    e.stopPropagation();
    dragRef.current = { id: n.id, sx: e.clientX, sy: e.clientY, nx: n.x, ny: n.y };
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (dragRef.current) {
      const d = dragRef.current;
      const dx = (e.clientX - d.sx) / zoom;
      const dy = (e.clientY - d.sy) / zoom;
      setDiagram((diag) => ({
        ...diag,
        nodes: diag.nodes.map((n) =>
          n.id === d.id ? { ...n, x: Math.max(0, d.nx + dx), y: Math.max(0, d.ny + dy) } : n
        ),
      }));
      setSaved("idle");
    } else if (panRef.current) {
      const p = panRef.current;
      setPan({ x: p.px + (e.clientX - p.sx), y: p.py + (e.clientY - p.sy) });
    }
  }

  function onPointerUp() {
    dragRef.current = null;
    panRef.current = null;
  }

  function startPan(e: React.PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("[data-node]")) return;
    panRef.current = { sx: e.clientX, sy: e.clientY, px: pan.x, py: pan.y };
  }

  function onWheel(e: React.WheelEvent) {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const dz = e.deltaY > 0 ? -0.08 : 0.08;
    setZoom((z) => Math.max(0.4, Math.min(1.8, z + dz)));
  }

  function save() {
    if (!active) return;
    startTransition(async () => {
      try {
        await saveSignalFlow(active.id, diagram);
        setSaved("saved");
        toast.success("Signal flow saved", {
          description: `${diagram.nodes.length} devices · ${diagram.edges.length} signals`,
        });
        setTimeout(() => setSaved("idle"), 2200);
      } catch (e) {
        toast.error("Couldn't save flow", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  async function handleExport(format: ExportFormat) {
    if (!active) return;
    const slug = active.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "signal-flow";
    try {
      if (format === "json") {
        downloadJSON(diagram, timestampedFilename(slug, "json"));
        toast.success("Exported JSON", { description: `${diagram.nodes.length} devices · ${diagram.edges.length} signals` });
        return;
      }
      const svg = buildSignalFlowSVG(diagram, active.name);
      if (format === "svg") {
        downloadSVG(svg, timestampedFilename(slug, "svg"));
        toast.success("Exported SVG");
        return;
      }
      if (format === "png") {
        await downloadSVGAsPNG(svg, timestampedFilename(slug, "png"));
        toast.success("Exported PNG", { description: "2× resolution" });
      }
    } catch (e) {
      toast.error("Export failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  if (!active) {
    return <div className="text-sm text-white/45">No signal flows yet.</div>;
  }

  const maxX = Math.max(1280, ...diagram.nodes.map((n) => n.x + (n.width ?? 220) + 80));
  const maxY = Math.max(900, ...diagram.nodes.map((n) => n.y + nodeHeight(n) + 80));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-5">
      {/* Sidebar */}
      <div className="space-y-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/45 mb-3">Your flows</div>
            <div className="space-y-1">
              {flows.map((f) => (
                <button
                  key={f.id}
                  onClick={() => switchFlow(f.id)}
                  className={cn(
                    "w-full text-left px-2.5 py-2 rounded-lg text-sm transition-colors",
                    f.id === activeId
                      ? "bg-aether-500/15 text-aether-300 ring-1 ring-aether-500/30"
                      : "text-white/65 hover:bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Network className="h-3.5 w-3.5" />
                    <span className="truncate">{f.name}</span>
                  </div>
                  <div className="text-[10px] text-white/40 mt-0.5 ml-5">
                    {f.diagram.nodes.length} devices · {f.diagram.edges.length} signals
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/45 mb-3">Controls</div>
            <div className="space-y-2 text-[11px] text-white/55 leading-relaxed">
              <div>• <span className="text-white/85">Drag header</span> — move device</div>
              <div>• <span className="text-white/85">Drag canvas</span> — pan view</div>
              <div>• <span className="text-white/85">Ctrl/⌘ + scroll</span> — zoom</div>
              <div>• <span className="text-white/85">Hover line</span> — highlight signal</div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px]">
              <span className="text-white/40">Zoom</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setZoom((z) => Math.max(0.4, +(z - 0.1).toFixed(2)))} className="w-6 h-6 rounded border border-white/[0.08] text-white/65 hover:text-white">−</button>
                <span className="w-10 text-center font-mono text-white/65">{Math.round(zoom * 100)}%</span>
                <button onClick={() => setZoom((z) => Math.min(1.8, +(z + 0.1).toFixed(2)))} className="w-6 h-6 rounded border border-white/[0.08] text-white/65 hover:text-white">+</button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Canvas */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-ink-200/40">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-aether-400">Editing</div>
              <div className="font-display text-lg font-semibold tracking-tight">{active.name}</div>
            </div>
            <div className="flex items-center gap-2">
              {saved === "saved" && <span className="text-[11px] text-emerald-400 mr-1">✓ Saved</span>}
              <ExportMenu formats={["png", "svg", "json"]} onExport={handleExport} />
              <Button size="sm" onClick={save} disabled={isPending}>
                <Save className="h-3.5 w-3.5" />
                {isPending ? "Saving…" : "Save flow"}
              </Button>
            </div>
          </div>

          {/* The technical white canvas */}
          <div
            ref={canvasRef}
            className="relative overflow-auto bg-[#fafaf9] cursor-grab active:cursor-grabbing"
            style={{ height: "min(75vh, 760px)" }}
            onPointerDown={startPan}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={onWheel}
          >
            <div
              style={{
                width: maxX,
                height: maxY,
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "0 0",
                backgroundImage:
                  "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
              className="relative"
            >
              <Legend />

              {/* SVG edges */}
              <svg
                className="absolute inset-0 pointer-events-none"
                width={maxX}
                height={maxY}
                style={{ overflow: "visible" }}
              >
                <defs>
                  {Object.entries(SIGNAL_COLORS).map(([key, v]) => (
                    <marker
                      key={key}
                      id={`arrow-${key}`}
                      viewBox="0 0 10 10"
                      refX="9"
                      refY="5"
                      markerWidth="6"
                      markerHeight="6"
                      orient="auto"
                    >
                      <path d="M 0 0 L 10 5 L 0 10 z" fill={v.color} />
                    </marker>
                  ))}
                </defs>

                {diagram.edges.map((e) => {
                  const path = computePath(diagram, e);
                  if (!path) return null;
                  const color = SIGNAL_COLORS[e.signal]?.color ?? "#444";
                  const dash = SIGNAL_COLORS[e.signal]?.dash;
                  const highlighted = hoveredEdge === e.id || hoveredEdge === null;

                  return (
                    <g key={e.id} className="pointer-events-auto">
                      <path
                        d={path.path}
                        stroke="transparent"
                        strokeWidth={14}
                        fill="none"
                        onMouseEnter={() => setHoveredEdge(e.id)}
                        onMouseLeave={() => setHoveredEdge(null)}
                      />
                      <path
                        d={path.path}
                        stroke={color}
                        strokeWidth={hoveredEdge === e.id ? 2.2 : 1.4}
                        strokeDasharray={dash}
                        fill="none"
                        opacity={highlighted ? 1 : 0.25}
                        markerEnd={`url(#arrow-${e.signal})`}
                        className="transition-opacity"
                      />
                      {e.label && (
                        <g
                          opacity={highlighted ? 1 : 0.3}
                          transform={`translate(${path.midX - 18}, ${path.midY - 8})`}
                          className="transition-opacity"
                        >
                          <rect width={36} height={16} rx={3} fill="#fafaf9" stroke={color} strokeWidth={0.8} />
                          <text
                            x={18}
                            y={11}
                            textAnchor="middle"
                            fontSize={9}
                            fontFamily="ui-monospace, SFMono-Regular, monospace"
                            fill="#1a1a1a"
                            fontWeight={600}
                          >
                            {e.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Nodes */}
              {diagram.nodes.map((n) => (
                <NodeView key={n.id} node={n} onPointerDown={(e) => startNodeDrag(e, n)} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Node rendering
// ──────────────────────────────────────────────────────────────────────────

function nodeHeight(n: FlowNode) {
  if (n.category === "endpoint") return 86;
  const portsRow = Math.max(
    n.ports.filter((p) => p.direction === "in").length,
    n.ports.filter((p) => p.direction === "out").length
  );
  return HEADER_H + portsRow * PORT_ROW_H + 14 + (n.model || n.brand ? 34 : 0);
}

function NodeView({
  node,
  onPointerDown,
}: {
  node: FlowNode;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  if (node.category === "endpoint") return <EndpointNode node={node} onPointerDown={onPointerDown} />;
  return <EquipmentNode node={node} onPointerDown={onPointerDown} />;
}

function EndpointNode({
  node,
  onPointerDown,
}: {
  node: FlowNode;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const w = node.width ?? 110;
  const Icon = (node.endpointIcon && ENDPOINT_ICONS[node.endpointIcon]) || Monitor;
  const hasOutput = node.ports.some((p) => p.direction === "out");
  const hasInput = node.ports.some((p) => p.direction === "in");

  return (
    <div
      data-node
      onPointerDown={onPointerDown}
      className="absolute select-none cursor-grab active:cursor-grabbing"
      style={{ left: node.x, top: node.y, width: w }}
    >
      <div className="flex flex-col items-center text-center">
        <div className="h-12 w-12 rounded border border-neutral-700 bg-white flex items-center justify-center shadow-sm">
          <Icon className="h-7 w-7 text-neutral-800" strokeWidth={1.4} />
        </div>
        <div className="mt-1.5 text-[10px] font-bold tracking-wide text-neutral-800">
          {node.title}
        </div>
        {node.subtitle && <div className="text-[9px] text-neutral-500 mt-0.5">{node.subtitle}</div>}
      </div>
      {hasOutput && (
        <div
          className="absolute rounded-full bg-neutral-800"
          style={{ right: -PORT_DOT / 2, top: 24 - PORT_DOT / 2, width: PORT_DOT, height: PORT_DOT }}
        />
      )}
      {hasInput && (
        <div
          className="absolute rounded-full bg-neutral-800"
          style={{ left: -PORT_DOT / 2, top: 24 - PORT_DOT / 2, width: PORT_DOT, height: PORT_DOT }}
        />
      )}
    </div>
  );
}

function EquipmentNode({
  node,
  onPointerDown,
}: {
  node: FlowNode;
  onPointerDown: (e: React.PointerEvent) => void;
}) {
  const w = node.width ?? 220;
  const ins = node.ports.filter((p) => p.direction === "in");
  const outs = node.ports.filter((p) => p.direction === "out");
  const portsRows = Math.max(ins.length, outs.length);
  const bodyHeight = portsRows * PORT_ROW_H + 12;

  return (
    <div
      data-node
      className="absolute select-none bg-white border border-neutral-700 rounded-sm shadow-sm"
      style={{ left: node.x, top: node.y, width: w }}
    >
      <div
        onPointerDown={onPointerDown}
        className="bg-neutral-100 border-b border-neutral-700 px-3 flex items-center justify-center text-[10px] font-bold tracking-wider text-neutral-800 cursor-grab active:cursor-grabbing"
        style={{ height: HEADER_H }}
      >
        {node.title}
      </div>

      <div className="px-2 py-1.5 relative" style={{ minHeight: bodyHeight }}>
        <div className="grid grid-cols-2 gap-x-3">
          <div className="flex flex-col gap-0">
            {ins.map((p) => (
              <PortRow key={p.id} port={p} />
            ))}
          </div>
          <div className="flex flex-col gap-0">
            {outs.map((p) => (
              <PortRow key={p.id} port={p} align="right" />
            ))}
          </div>
        </div>
      </div>

      {(node.brand || node.model) && (
        <div className="border-t border-neutral-700 bg-white px-2 py-1.5 text-center">
          {node.brand && (
            <div className="text-[9px] font-bold tracking-widest text-red-600">{node.brand}</div>
          )}
          {node.model && (
            <div className="text-[9px] font-mono text-red-600 mt-0.5">{node.model}</div>
          )}
        </div>
      )}
    </div>
  );
}

function PortRow({ port, align = "left" }: { port: Port; align?: "left" | "right" }) {
  return (
    <div
      data-port={port.id}
      className={cn(
        "flex items-center gap-1.5 leading-none",
        align === "right" && "flex-row-reverse text-right"
      )}
      style={{ height: PORT_ROW_H }}
    >
      <span className="block w-1.5 h-1.5 rounded-full border border-neutral-700 bg-white shrink-0" />
      <span className="text-[8.5px] font-semibold text-neutral-800 tracking-tight truncate">
        {port.label}
      </span>
      <span
        className={cn(
          "text-[7.5px] font-mono text-neutral-500 tracking-tight ml-auto",
          align === "right" && "ml-0 mr-auto"
        )}
      >
        {port.type}
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Routing — orthogonal Manhattan connector
// ──────────────────────────────────────────────────────────────────────────

function computePath(diagram: FlowDiagram, edge: FlowEdge) {
  const from = diagram.nodes.find((n) => n.id === edge.from.nodeId);
  const to = diagram.nodes.find((n) => n.id === edge.to.nodeId);
  if (!from || !to) return null;

  const fromPos = portCoord(from, edge.from.portId);
  const toPos = portCoord(to, edge.to.portId);
  if (!fromPos || !toPos) return null;

  const x1 = fromPos.x;
  const y1 = fromPos.y;
  const x2 = toPos.x;
  const y2 = toPos.y;
  const minGap = 28;

  if (x2 > x1 + minGap * 2) {
    const mx = (x1 + x2) / 2;
    const path = `M ${x1} ${y1} H ${mx} V ${y2} H ${x2}`;
    return { path, midX: mx, midY: (y1 + y2) / 2 };
  }

  // Need to wrap around: go right, up/down, left, down/up, right
  const offset = 30;
  const ymid = (y1 + y2) / 2;
  const path = `M ${x1} ${y1} H ${x1 + offset} V ${ymid} H ${x2 - offset} V ${y2} H ${x2}`;
  return { path, midX: (x1 + x2) / 2, midY: ymid };
}

function portCoord(node: FlowNode, portId: string) {
  const w = node.width ?? (node.category === "endpoint" ? 110 : 220);

  if (node.category === "endpoint") {
    const port = node.ports.find((p) => p.id === portId);
    const isOut = port?.direction === "out";
    return { x: isOut ? node.x + w : node.x, y: node.y + 24 };
  }

  const ins = node.ports.filter((p) => p.direction === "in");
  const outs = node.ports.filter((p) => p.direction === "out");

  let idx: number;
  let isIn: boolean;
  let port = ins.find((p) => p.id === portId);
  if (port) {
    idx = ins.indexOf(port);
    isIn = true;
  } else {
    port = outs.find((p) => p.id === portId);
    if (!port) return null;
    idx = outs.indexOf(port);
    isIn = false;
  }

  const bodyTop = node.y + HEADER_H + 6;
  const portY = bodyTop + idx * PORT_ROW_H + PORT_ROW_H / 2 - 1;
  return { x: isIn ? node.x : node.x + w, y: portY };
}

// ──────────────────────────────────────────────────────────────────────────
// Legend
// ──────────────────────────────────────────────────────────────────────────

function Legend() {
  return (
    <div className="absolute top-3 left-3 z-10 bg-white border border-neutral-700 rounded-sm shadow-sm p-2.5 pointer-events-none">
      <div className="text-[9px] font-bold tracking-widest text-neutral-900 border-b border-neutral-300 pb-1 mb-1.5">
        LEGEND — DIGITAL SIGNAL FLOW
      </div>
      <div className="space-y-1">
        {LEGEND_ITEMS.map((it) => (
          <div key={it.key} className="flex items-center gap-2">
            <svg width={28} height={6}>
              <line
                x1={0}
                y1={3}
                x2={28}
                y2={3}
                stroke={SIGNAL_COLORS[it.key].color}
                strokeWidth={1.6}
                strokeDasharray={SIGNAL_COLORS[it.key].dash}
              />
            </svg>
            <span className="text-[9px] text-neutral-800">{it.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
