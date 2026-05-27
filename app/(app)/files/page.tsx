import { ModuleShell } from "@/components/app/module-shell";
import { FileBrowser } from "@/components/files/file-browser";
import { listFiles, folderCounts, listProjectsForFiles } from "@/lib/data/files";

export default async function FilesPage() {
  const [files, counts, projects] = await Promise.all([
    listFiles(),
    folderCounts(),
    listProjectsForFiles(),
  ]);

  return (
    <ModuleShell
      eyebrow="Documents"
      title="Files"
      description="Drawings, BOQs, commissioning reports, photos — versioned, approval-tracked, searchable across every project."
    >
      <FileBrowser files={files} counts={counts} projects={projects} />
    </ModuleShell>
  );
}
