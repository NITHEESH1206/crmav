import { ModuleShell } from "@/components/app/module-shell";
import { FileBrowser } from "@/components/files/file-browser";
import { listFiles, folderCounts, listProjectsForFiles } from "@/lib/data/files";
import { getStorageStatus } from "@/app/actions/upload";

export default async function FilesPage() {
  const [files, counts, projects, storage] = await Promise.all([
    listFiles(),
    folderCounts(),
    listProjectsForFiles(),
    getStorageStatus(),
  ]);

  return (
    <ModuleShell
      eyebrow="Documents"
      title="Files"
      description="Drawings, BOQs, commissioning reports, photos — versioned, approval-tracked, searchable across every project."
    >
      <FileBrowser
        files={files}
        counts={counts}
        projects={projects}
        storageConfigured={storage.configured}
      />
    </ModuleShell>
  );
}
