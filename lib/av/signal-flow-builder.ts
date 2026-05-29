/**
 * Deterministic signal-flow diagram from a validated device list.
 * Mirrors the rack-builder pattern: the AI just picks devices, code
 * generates the diagram — guarantees correctness.
 *
 * Layout philosophy (left → right): sources → distribution → outputs.
 * Control sits above the distribution column. Auto-edges connect by
 * category so the diagram reads as a working AV signal chain.
 */

import type { FlowDiagram, FlowNode, FlowEdge, NodeCategory, EndpointIcon } from "@/lib/data/signal-flows";

type AnyDev = {
  catalogId: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
};

/* ─── Category → flow node category mapping ─── */
function flowCategoryFor(deviceCategory: string): NodeCategory | "skip" {
  switch (deviceCategory) {
    case "Video Switcher":
    case "AVoIP Encoder":
    case "AVoIP Decoder":
    case "AVoIP Other":
      return "switcher";
    case "DSP":
      return "processor";
    case "Amplifier":
      return "amplifier";
    case "Control - Processor":
      return "controller";
    case "Network Switch":
      return "network";
    case "Conferencing - Codec":
      return "processor";
    case "Display":
    case "Display - Interactive":
    case "Display - Video Wall LED":
    case "Display - Outdoor":
    case "Projector":
    case "Conferencing - Video Bar":
    case "Speaker - Ceiling":
    case "Speaker - Surface":
    case "Speaker - Subwoofer":
    case "Microphone - Ceiling":
    case "Microphone - Wireless":
    case "Microphone - Boundary":
    case "Camera - PTZ":
    case "Camera - Conference":
      return "endpoint";
    case "Control - Touch Panel":
      return "endpoint";
    // Rack hardware doesn't show in the signal flow
    case "Rack":
    case "Power":
    case "Cable":
    case "Accessory":
    case "Control - Keypad":
      return "skip";
    default:
      return "skip";
  }
}

function endpointIconFor(deviceCategory: string): EndpointIcon | undefined {
  if (deviceCategory.startsWith("Display")) return "tv";
  if (deviceCategory === "Display - Video Wall LED") return "led-wall";
  if (deviceCategory === "Projector") return "tv";
  if (deviceCategory.startsWith("Speaker")) return "speaker";
  if (deviceCategory.startsWith("Microphone")) return "mic";
  if (deviceCategory.startsWith("Camera")) return "camera";
  if (deviceCategory === "Conferencing - Video Bar") return "camera";
  if (deviceCategory === "Control - Touch Panel") return "pc";
  return undefined;
}

/** Is this a SOURCE endpoint (input to system) or SINK (output from system)? */
function isSource(deviceCategory: string): boolean {
  return (
    deviceCategory.startsWith("Camera") ||
    deviceCategory.startsWith("Microphone") ||
    deviceCategory === "Conferencing - Video Bar" || // also outputs but acts as source for video to displays
    deviceCategory === "Control - Touch Panel"
  );
}

function isSink(deviceCategory: string): boolean {
  return (
    deviceCategory.startsWith("Display") ||
    deviceCategory === "Projector" ||
    deviceCategory.startsWith("Speaker")
  );
}

/* ─── Build the diagram ─── */
export function buildSignalFlow(devices: AnyDev[]): FlowDiagram {
  const COL_X = { source: 100, distribution: 540, output: 980 };
  const NODE_W = 220;
  const NODE_H = 90;
  const Y_GAP = 110;

  // Flatten quantities — but cap per-category at 4 visual nodes to keep
  // diagrams readable. (10 ceiling speakers don't need 10 separate icons.)
  type Unit = AnyDev & { instanceLabel?: string };
  const units: Unit[] = [];
  for (const d of devices) {
    const flowCat = flowCategoryFor(d.category);
    if (flowCat === "skip") continue;
    const cap = isSink(d.category) || isSource(d.category) ? 4 : 1;
    const count = Math.min(d.quantity, cap);
    for (let i = 0; i < count; i++) {
      units.push({
        ...d,
        instanceLabel:
          count > 1 ? `(${i + 1}/${Math.min(d.quantity, cap)})` : undefined,
      });
    }
  }

  // Bucket by where it sits visually
  const sources = units.filter((u) => isSource(u.category));
  const sinks = units.filter((u) => isSink(u.category));
  const distribution = units.filter((u) => !isSource(u.category) && !isSink(u.category));

  // Pull controller(s) out of distribution to sit above the row
  const controllers = distribution.filter((u) => u.category === "Control - Processor");
  const middle = distribution.filter((u) => u.category !== "Control - Processor");

  const nodes: FlowNode[] = [];
  const edges: FlowEdge[] = [];

  // Distribute Y positions evenly inside each column
  function placeColumn(items: Unit[], colX: number, startY: number) {
    return items.map((u, i) => {
      const flowCat = flowCategoryFor(u.category) as NodeCategory;
      const id = `n-${nodes.length + 1}`;
      const node: FlowNode = {
        id,
        category: flowCat,
        title: u.name + (u.instanceLabel ? ` ${u.instanceLabel}` : ""),
        brand: u.brand,
        model: u.sku,
        subtitle: u.category,
        x: colX,
        y: startY + i * Y_GAP,
        width: NODE_W,
        endpointIcon: endpointIconFor(u.category),
        ports: [
          { id: `${id}-in`, label: "IN", type: "HDMI", direction: "in" },
          { id: `${id}-out`, label: "OUT", type: "HDMI", direction: "out" },
        ],
      };
      nodes.push(node);
      return node;
    });
  }

  const baseY = 120;
  const sourceNodes = placeColumn(sources, COL_X.source, baseY);

  // Middle column: switcher first (top), DSP below, amp below that
  const sortedMiddle = [...middle].sort((a, b) => {
    const ord = (c: string) =>
      c === "Video Switcher" || c.startsWith("AVoIP") ? 0 :
      c === "DSP" ? 1 :
      c === "Amplifier" ? 2 :
      c === "Network Switch" ? 3 :
      c === "Conferencing - Codec" ? 4 : 5;
    return ord(a.category) - ord(b.category);
  });
  const middleNodes = placeColumn(sortedMiddle, COL_X.distribution, baseY);

  const sinkNodes = placeColumn(sinks, COL_X.output, baseY);

  // Controllers sit above the middle column
  const controllerNodes = controllers.length
    ? controllers.map((c, i) => {
        const id = `c-${i + 1}`;
        const node: FlowNode = {
          id,
          category: "controller" as NodeCategory,
          title: c.name,
          brand: c.brand,
          model: c.sku,
          subtitle: "Control",
          x: COL_X.distribution + (i * (NODE_W + 30)),
          y: 0,
          width: NODE_W,
          ports: [
            { id: `${id}-ctrl`, label: "CTRL", type: "RJ45", direction: "out" },
          ],
        };
        nodes.push(node);
        return node;
      })
    : [];

  /* ─── Auto-edges ─── */
  const findMiddle = (cat: string) =>
    middleNodes.find((m) => (m.subtitle ?? "") === cat);

  const switcher = findMiddle("Video Switcher") ?? middleNodes.find((m) => (m.subtitle ?? "").startsWith("AVoIP"));
  const dsp = findMiddle("DSP");
  const amp = findMiddle("Amplifier");

  function addEdge(
    from: FlowNode | undefined,
    to: FlowNode | undefined,
    signal: FlowEdge["signal"],
    label?: string
  ) {
    if (!from || !to) return;
    edges.push({
      id: `e-${edges.length + 1}`,
      from: { nodeId: from.id, portId: from.ports[from.ports.length - 1].id },
      to: { nodeId: to.id, portId: to.ports[0].id },
      signal,
      label,
    });
  }

  // Sources → middle. Cameras + video bars route through switcher; mics route to DSP.
  for (const src of sourceNodes) {
    const cat = src.subtitle ?? "";
    if (cat.startsWith("Microphone")) {
      addEdge(src, dsp ?? switcher, "audio");
    } else if (cat.startsWith("Camera") || cat === "Conferencing - Video Bar") {
      addEdge(src, switcher ?? dsp, "hdmi");
    } else if (cat === "Control - Touch Panel") {
      // Touch panels go to controller, not the switcher
      addEdge(src, controllerNodes[0], "network", "TCP");
    }
  }

  // Middle internal routing — switcher → DSP (audio breakout) for AV systems
  // with both, and DSP → amplifier when both present.
  if (switcher && dsp && switcher !== dsp) addEdge(switcher, dsp, "audio", "audio");
  if (dsp && amp) addEdge(dsp, amp, "audio");

  // Middle → sinks
  for (const sink of sinkNodes) {
    const cat = sink.subtitle ?? "";
    if (cat.startsWith("Speaker")) {
      addEdge(amp ?? dsp, sink, "speaker");
    } else {
      // Displays / projector
      addEdge(switcher ?? dsp, sink, "hdmi");
    }
  }

  // Controller fans out (subtle dashed lines via signal=balanced is closest)
  for (const ctrl of controllerNodes) {
    for (const target of middleNodes) {
      addEdge(ctrl, target, "network", "ctrl");
    }
  }

  return { nodes, edges };
}
