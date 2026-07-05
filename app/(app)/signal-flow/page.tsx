import { ModuleShell } from "@/components/app/module-shell";
import { SignalFlowDesigner } from "@/components/signal-flow/signal-flow-designer";
import { BoqSchematicButton } from "@/components/boq/boq-schematic-dialog";
import { listSignalFlows, type FlowDiagram } from "@/lib/data/signal-flows";

export default async function SignalFlowPage() {
  const flows = await listSignalFlows();
  const normalized = flows.map((f) => ({
    id: f.id,
    name: f.name,
    diagram: (f.diagramJson as FlowDiagram | null) ?? { nodes: [], edges: [] },
  }));

  return (
    <ModuleShell
      eyebrow="AV Tools"
      title="Signal Flow Designer"
      description="Sources → processors → outputs. Drag nodes, watch signals animate, ship to commissioning."
      actions={<BoqSchematicButton />}
    >
      <SignalFlowDesigner flows={normalized} />
    </ModuleShell>
  );
}
