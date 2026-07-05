import "server-only";
import { prisma } from "@/lib/prisma";
import { getCurrentWorkspaceId } from "./workspace";

export type SignalClass =
  | "hdmi"
  | "cat6"
  | "network"
  | "dante"
  | "audio"
  | "wireless"
  | "speaker"
  | "balanced";

export type PortDirection = "in" | "out";

export type Port = {
  id: string;
  label: string;       // e.g., "HDMI IN 1"
  type: string;        // e.g., "RJ45", "HDMI", "PLUG", "PIN-EP"
  direction: PortDirection;
};

export type NodeCategory =
  | "switcher"
  | "amplifier"
  | "processor"
  | "controller"
  | "receiver"
  | "network"
  | "access-point"
  | "endpoint"
  | "led-controller"
  | "led-processor"
  | "recharging-station";

export type EndpointIcon =
  | "mic"
  | "laptop"
  | "tv"
  | "led-wall"
  | "speaker"
  | "pc"
  | "camera";

export type FlowNode = {
  id: string;
  category: NodeCategory;
  title: string;
  brand?: string;
  model?: string;
  subtitle?: string;
  x: number;
  y: number;
  width?: number;
  ports: Port[];
  endpointIcon?: EndpointIcon;
  /** Product photo (from the catalog) — rendered as a node thumbnail. */
  imageUrl?: string;
};

export type FlowEdge = {
  id: string;
  from: { nodeId: string; portId: string };
  to: { nodeId: string; portId: string };
  signal: SignalClass;
  label?: string;
};

export type FlowDiagram = {
  nodes: FlowNode[];
  edges: FlowEdge[];
};

export async function listSignalFlows() {
  const workspaceId = await getCurrentWorkspaceId();
  return prisma.signalFlow.findMany({
    where: { workspaceId },
    include: { room: { include: { account: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSignalFlow(id: string) {
  const f = await prisma.signalFlow.findUnique({
    where: { id },
    include: { room: { include: { account: true } } },
  });
  if (!f) return null;
  const diagram = (f.diagramJson as FlowDiagram | null) ?? { nodes: [], edges: [] };
  return { ...f, diagram };
}
