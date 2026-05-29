import { ModuleShell } from "@/components/app/module-shell";
import { BuilderShell } from "@/components/builder/builder-shell";

export default function BuilderPage() {
  return (
    <ModuleShell
      eyebrow="AI Builder"
      title="Design a room with AI"
      description="Give us a brief — client, room, capacity, tier, brand preferences. The AI picks devices from your real catalog, drafts a rack, generates a signal flow, and launches the project. Everything renders in 3D the moment it's done."
    >
      <BuilderShell />
    </ModuleShell>
  );
}
