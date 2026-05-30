"use client";

import { useMemo, useState, useTransition } from "react";
import {
  FileText,
  Image as ImageIcon,
  Layers3,
  Folder as FolderIcon,
  Search,
  Plus,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { deleteFile } from "@/app/actions/files";
import { ProvenanceBadge } from "@/components/ai/provenance-badge";
import { UploadDropzone } from "@/components/files/upload-dropzone";
import {
  FOLDERS,
  type AppFile,
  type Folder,
  type FileLifecycle,
} from "@/lib/data/files-types";

const LIFECYCLE_META: Record<
  FileLifecycle,
  { label: string; tone: "warning" | "info" | "success" | "neutral" }
> = {
  draft:      { label: "Draft",      tone: "warning" },
  review:     { label: "In review",  tone: "info" },
  approved:   { label: "Approved",   tone: "success" },
  issued:     { label: "Issued",     tone: "success" },
  superseded: { label: "Superseded", tone: "neutral" },
};

const EXT_ICON: Record<string, typeof FileText> = {
  pdf: FileText,
  dwg: Layers3,
  dxf: Layers3,
  png: ImageIcon,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  webp: ImageIcon,
  svg: ImageIcon,
};

export function FileBrowser({
  files,
  counts,
  projects,
  storageConfigured,
}: {
  files: AppFile[];
  counts: Record<Folder, number>;
  projects: { id: string; name: string }[];
  storageConfigured: boolean;
}) {
  const [folder, setFolder] = useState<Folder | "all">("all");
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = files;
    if (folder !== "all") list = list.filter((f) => f.folder === folder);
    if (q.trim()) {
      const ql = q.toLowerCase();
      list = list.filter((f) => f.name.toLowerCase().includes(ql));
    }
    return list;
  }, [files, folder, q]);

  const selected = useMemo(
    () => filtered.find((f) => f.id === selectedId) ?? filtered[0] ?? null,
    [filtered, selectedId]
  );

  const totalCount = Object.values(counts).reduce((s, n) => s + n, 0);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_360px] gap-3 min-h-[640px]">
        {/* ── Folders ── */}
        <aside className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
          <div className="px-3 py-2 border-b border-bone-300/45 flex items-center justify-between">
            <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Folders
            </span>
            <button
              type="button"
              className="text-ink-300/45 hover:text-ink-300"
              aria-label="New folder"
              title="New folder"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <nav className="p-1.5 space-y-0.5">
            <FolderRow
              label="All files"
              count={totalCount}
              active={folder === "all"}
              onClick={() => setFolder("all")}
            />
            {FOLDERS.map((f) => (
              <FolderRow
                key={f}
                label={f}
                count={counts[f]}
                active={folder === f}
                onClick={() => setFolder(f)}
              />
            ))}
          </nav>
        </aside>

        {/* ── List ── */}
        <section className="rounded-lg bg-white border border-bone-300/55 flex flex-col min-w-0">
          <header className="px-3 py-2 border-b border-bone-300/45 flex items-center gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ink-300/45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter files by name…"
                className="h-8 w-full rounded-md border border-bone-300/55 bg-bone-50 pl-8 pr-2 text-[12.5px] text-ink-300 placeholder:text-ink-300/40 outline-none focus:border-ink-300/30"
              />
            </div>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Upload className="h-3.5 w-3.5" />
              Upload
            </Button>
          </header>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <FolderIcon className="h-6 w-6 mx-auto text-ink-300/35 mb-2" />
                <p className="text-[13px] text-ink-300/65">No files here yet.</p>
                <p className="text-[12px] text-ink-300/45 mt-1">
                  Drop a PDF, drawing, or BOQ — they'll auto-sort into folders.
                </p>
              </div>
            ) : (
              <ul>
                {filtered.map((file) => (
                  <FileListItem
                    key={file.id}
                    file={file}
                    active={selected?.id === file.id}
                    onClick={() => setSelectedId(file.id)}
                  />
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ── Preview / meta ── */}
        <aside className="rounded-lg bg-white border border-bone-300/55 flex flex-col min-w-0">
          {selected ? (
            <FilePreview file={selected} files={files} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-[12.5px] text-ink-300/45 px-6 text-center">
              Select a file to preview, see versions and timeline.
            </div>
          )}
        </aside>
      </div>

      {uploadOpen && (
        <UploadDropzone
          storageConfigured={storageConfigured}
          projects={projects}
          defaultFolder={folder === "all" ? "Drawings" : folder}
          onClose={() => setUploadOpen(false)}
        />
      )}
    </>
  );
}

/* ─── Folder row ─── */
function FolderRow({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[13px] transition-colors",
        active
          ? "bg-bone-100 text-ink-300 font-medium"
          : "text-ink-300/70 hover:text-ink-300 hover:bg-bone-50"
      )}
    >
      <FolderIcon
        className={cn("h-3.5 w-3.5 shrink-0", active ? "text-ink-300" : "text-ink-300/55")}
      />
      <span className="flex-1 text-left truncate">{label}</span>
      <span className="text-[10px] font-mono text-ink-300/45">{count}</span>
    </button>
  );
}

/* ─── List row ─── */
function FileListItem({
  file,
  active,
  onClick,
}: {
  file: AppFile;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = EXT_ICON[file.ext] ?? FileText;
  const meta = LIFECYCLE_META[file.lifecycle];
  return (
    <li
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-3 py-2 border-b border-bone-300/35 cursor-pointer transition-colors",
        active ? "bg-bone-100" : "hover:bg-bone-50"
      )}
    >
      <span className="h-7 w-7 rounded-md bg-bone-50 border border-bone-300/55 flex items-center justify-center shrink-0">
        <Icon className="h-3.5 w-3.5 text-ink-300/60" strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-ink-300 truncate">
          {prettyName(file.name)}
          <span className="text-ink-300/45 font-mono ml-1">v{file.version}</span>
        </div>
        <div className="text-[11px] text-ink-300/55 truncate mt-0.5">
          {file.project?.name ?? "Workspace"} ·{" "}
          {file.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>
      <Badge variant={meta.tone}>{meta.label}</Badge>
    </li>
  );
}

/* ─── Preview pane ─── */
function FilePreview({ file, files }: { file: AppFile; files: AppFile[] }) {
  const [pending, startTransition] = useTransition();
  const versions = files
    .filter((f) => f.name === file.name)
    .sort((a, b) => b.version - a.version);
  const Icon = EXT_ICON[file.ext] ?? FileText;

  function handleDelete() {
    if (!confirm(`Delete "${prettyName(file.name)}" v${file.version}?`)) return;
    startTransition(async () => {
      await deleteFile(file.id);
      toast.success("File deleted");
    });
  }

  return (
    <>
      <header className="px-4 py-3 border-b border-bone-300/45">
        <div className="flex items-start gap-3">
          <span className="h-8 w-8 rounded-md bg-bone-50 border border-bone-300/55 flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4 text-ink-300/65" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-[13.5px] font-semibold text-ink-300 truncate">
              {prettyName(file.name)}
            </h3>
            <div className="text-[11px] text-ink-300/55 truncate mt-0.5">
              {file.folder} · {file.project?.name ?? "Workspace"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3 flex-wrap">
          <Badge variant={LIFECYCLE_META[file.lifecycle].tone}>
            {LIFECYCLE_META[file.lifecycle].label}
          </Badge>
          <span className="text-[10.5px] font-mono text-ink-300/55 px-1.5 py-0.5 rounded bg-bone-100">
            v{file.version}
          </span>
          <span className="text-[10.5px] font-mono text-ink-300/45 px-1.5 py-0.5 rounded bg-bone-100">
            .{file.ext || "—"}
          </span>
        </div>
      </header>

      {/* Preview frame (PDF/Image inline; everything else gets a placeholder) */}
      <div className="flex-1 overflow-auto bg-bone-50 p-3 min-h-[200px]">
        {file.ext === "pdf" ? (
          <iframe
            src={file.fileUrl}
            title={file.name}
            className="w-full h-[480px] rounded border border-bone-300/55 bg-white"
          />
        ) : ["png", "jpg", "jpeg", "webp", "svg"].includes(file.ext) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file.fileUrl}
            alt={file.name}
            className="w-full h-auto rounded border border-bone-300/55 bg-white"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center text-[12px] text-ink-300/55 gap-2">
            <Icon className="h-8 w-8 text-ink-300/35" strokeWidth={1.5} />
            <p>Preview not supported in-browser for .{file.ext || "this format"}</p>
            <a
              href={file.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[12px] text-ink-300/85 hover:text-ink-300 underline"
            >
              <ExternalLink className="h-3 w-3" />
              Open in new tab
            </a>
          </div>
        )}
      </div>

      {/* Versions */}
      <section className="border-t border-bone-300/45 px-4 py-3">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold mb-2">
          Versions ({versions.length})
        </div>
        <ul className="space-y-1">
          {versions.map((v) => (
            <li
              key={v.id}
              className="flex items-center gap-2 text-[12px] py-1"
            >
              {v.lifecycle === "approved" || v.lifecycle === "issued" ? (
                <CheckCircle2 className="h-3 w-3 text-status-success-fg" />
              ) : v.lifecycle === "draft" ? (
                <AlertCircle className="h-3 w-3 text-status-warning-fg" />
              ) : (
                <Clock className="h-3 w-3 text-ink-300/35" />
              )}
              <span className="font-mono text-ink-300/75 w-8">v{v.version}</span>
              <span className="flex-1 text-ink-300/65 truncate">
                {v.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <a
                href={v.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink-300/55 hover:text-ink-300"
                aria-label="Download"
              >
                <Download className="h-3 w-3" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* Timeline */}
      <section className="border-t border-bone-300/45 px-4 py-3">
        <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold mb-2">
          Timeline
        </div>
        <ul className="space-y-2 text-[12px] text-ink-300/65">
          <li>
            <span className="font-mono text-ink-300/45">
              {file.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>{" "}
            · uploaded v{file.version}
          </li>
          {file.version > 1 && (
            <li>
              <span className="font-mono text-ink-300/45">earlier</span>{" "}
              · v{file.version - 1} superseded
            </li>
          )}
        </ul>
      </section>

      {/* Action footer */}
      <footer className="border-t border-bone-300/45 px-4 py-2.5 flex items-center justify-between">
        <ProvenanceBadge date={file.createdAt} />
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="text-[11px] text-status-danger-fg/85 hover:text-status-danger-fg inline-flex items-center gap-1"
        >
          <Trash2 className="h-3 w-3" />
          Delete
        </button>
      </footer>
    </>
  );
}

function prettyName(raw: string): string {
  // Strip the leading "/Folder/" prefix we use for synthetic folders
  if (raw.startsWith("/")) {
    const parts = raw.split("/");
    return parts[parts.length - 1] || raw;
  }
  return raw;
}
