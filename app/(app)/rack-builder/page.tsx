import { ModuleShell } from "@/components/app/module-shell";
import { RackBuilder } from "@/components/rack-builder/rack-builder";
import { listRacks, getCatalogForRack, type RackLayout } from "@/lib/data/racks";

export default async function RackBuilderPage() {
  const [racks, catalog] = await Promise.all([listRacks(), getCatalogForRack()]);
  const normalized = racks.map((r) => ({
    id: r.id,
    name: r.name,
    totalU: r.totalU,
    layout: (r.layoutJson as RackLayout | null) ?? { items: [] },
  }));

  return (
    <ModuleShell
      eyebrow="AV Tools"
      title="Rack Builder"
      description="Design 19-inch rack layouts with drag-and-drop. Auto U-height math, power estimates, save to project."
    >
      <RackBuilder racks={normalized} catalog={catalog} />
    </ModuleShell>
  );
}
