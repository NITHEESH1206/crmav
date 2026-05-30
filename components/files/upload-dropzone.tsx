"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { Upload, File as FileIcon, X, Loader2, CheckCircle2, Link2 } from "lucide-react";
import { toast } from "sonner";
import { uploadDocument } from "@/app/actions/upload";
import { addFile } from "@/app/actions/files";
import { FOLDERS, type Folder } from "@/lib/data/files-types";
import { cn } from "@/lib/utils";

type Mode = "upload" | "url";

/**
 * Dropzone with two modes:
 *  - upload: drag-drop / pick → base64 → Supabase Storage (when configured)
 *  - url:    paste a hosted URL → stored as a Drawing reference
 *
 * The parent passes `storageConfigured`; when false, we default to URL mode and
 * disable upload with a hint.
 */
export function UploadDropzone({
  storageConfigured,
  projects,
  defaultFolder,
  onClose,
  onUploaded,
}: {
  storageConfigured: boolean;
  projects: { id: string; name: string }[];
  defaultFolder: Folder;
  onClose: () => void;
  onUploaded?: () => void;
}) {
  const [mode, setMode] = useState<Mode>(storageConfigured ? "upload" : "url");
  const [folder, setFolder] = useState<Folder>(defaultFolder);
  const [projectId, setProjectId] = useState("");
  const [dragging, setDragging] = useState(false);
  const [queue, setQueue] = useState<{ name: string; status: "pending" | "done" | "error" }[]>([]);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  // URL-mode fields
  const [urlName, setUrlName] = useState("");
  const [url, setUrl] = useState("");

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // strip the data URL prefix
        const base64 = result.split(",")[1] ?? "";
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      setQueue(arr.map((f) => ({ name: f.name, status: "pending" as const })));
      startTransition(async () => {
        for (const file of arr) {
          try {
            const base64 = await fileToBase64(file);
            const r = await uploadDocument({
              fileName: file.name,
              folder,
              contentType: file.type || "application/octet-stream",
              dataBase64: base64,
              projectId: projectId || null,
            });
            setQueue((q) =>
              q.map((item) =>
                item.name === file.name
                  ? { ...item, status: r.ok ? "done" : "error" }
                  : item
              )
            );
            if (!r.ok) {
              toast.error(`Failed: ${file.name}`, { description: r.error });
            }
          } catch (e) {
            setQueue((q) =>
              q.map((item) =>
                item.name === file.name ? { ...item, status: "error" } : item
              )
            );
            toast.error(`Failed: ${file.name}`, {
              description: e instanceof Error ? e.message : "Unknown error",
            });
          }
        }
        const allDone = arr.length;
        toast.success(`Uploaded ${allDone} file${allDone === 1 ? "" : "s"}`);
        onUploaded?.();
      });
    },
    [folder, projectId, onUploaded]
  );

  function submitUrl() {
    if (!urlName.trim() || !url.trim()) {
      toast.error("Name and URL are required");
      return;
    }
    startTransition(async () => {
      try {
        const r = await addFile({
          name: urlName.trim(),
          fileUrl: url.trim(),
          projectId: projectId || undefined,
          folder,
        });
        if (r.ok) {
          toast.success(`Added v${r.version}`);
          onUploaded?.();
          onClose();
        }
      } catch (e) {
        toast.error("Failed", { description: e instanceof Error ? e.message : "Unknown error" });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-300/30 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-card relative w-full max-w-lg overflow-hidden"
      >
        <header className="px-5 py-3.5 border-b border-bone-300/40 flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-ink-300">Add file</h3>
          <button onClick={onClose} className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/55 hover:text-ink-300">
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        {/* Mode switch */}
        <div className="px-5 pt-4">
          <div className="glass inline-flex items-center rounded-full p-0.5 gap-0.5">
            <button
              type="button"
              onClick={() => setMode("upload")}
              disabled={!storageConfigured}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all",
                mode === "upload" ? "btn-glass-primary" : "text-ink-300/65 hover:text-ink-300",
                !storageConfigured && "opacity-40 cursor-not-allowed"
              )}
            >
              <Upload className="h-3 w-3" />
              Upload
            </button>
            <button
              type="button"
              onClick={() => setMode("url")}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all",
                mode === "url" ? "btn-glass-primary" : "text-ink-300/65 hover:text-ink-300"
              )}
            >
              <Link2 className="h-3 w-3" />
              Paste URL
            </button>
          </div>
          {!storageConfigured && (
            <p className="text-[11px] text-ink-300/55 mt-2">
              Direct upload needs Supabase Storage. Add <span className="font-mono">SUPABASE_URL</span> + <span className="font-mono">SUPABASE_SERVICE_ROLE_KEY</span> to enable it. URL paste works now.
            </p>
          )}
        </div>

        {/* Folder + project */}
        <div className="px-5 pt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-[11.5px] text-ink-300/65 font-medium">Folder</span>
            <select
              value={folder}
              onChange={(e) => setFolder(e.target.value as Folder)}
              className="input-glass mt-1"
            >
              {FOLDERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[11.5px] text-ink-300/65 font-medium">Project (optional)</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="input-glass mt-1"
            >
              <option value="">— Workspace —</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Upload mode */}
        {mode === "upload" && (
          <div className="px-5 py-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
              }}
              onClick={() => inputRef.current?.click()}
              className={cn(
                "rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all",
                dragging
                  ? "border-signal-500/60 bg-signal-500/8"
                  : "border-bone-300/65 bg-white/30 hover:border-bone-300/85"
              )}
            >
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleFiles(e.target.files)}
              />
              <Upload className="h-6 w-6 mx-auto text-ink-300/45 mb-2" strokeWidth={1.5} />
              <p className="text-[13px] text-ink-300/75 font-medium">
                Drop files here, or click to pick
              </p>
              <p className="text-[11px] text-ink-300/50 mt-1">PDF, images, drawings — up to 25MB each</p>
            </div>

            {queue.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {queue.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-[12px] px-2 py-1.5 rounded-lg bg-white/40">
                    <FileIcon className="h-3.5 w-3.5 text-ink-300/55 shrink-0" />
                    <span className="flex-1 truncate text-ink-300">{item.name}</span>
                    {item.status === "pending" && <Loader2 className="h-3.5 w-3.5 animate-spin text-ink-300/55" />}
                    {item.status === "done" && <CheckCircle2 className="h-3.5 w-3.5 text-status-success-fg" />}
                    {item.status === "error" && <X className="h-3.5 w-3.5 text-status-danger-fg" />}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="hover-glass h-9 px-4 rounded-full border border-bone-300/55 text-[13px] text-ink-300/75 hover:text-ink-300"
              >
                {pending ? "Uploading…" : "Done"}
              </button>
            </div>
          </div>
        )}

        {/* URL mode */}
        {mode === "url" && (
          <div className="px-5 py-4 space-y-3">
            <label className="block">
              <span className="text-[11.5px] text-ink-300/65 font-medium">Filename</span>
              <input
                value={urlName}
                onChange={(e) => setUrlName(e.target.value)}
                placeholder="e.g. Rack-A_v3.pdf"
                className="input-glass mt-1"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="text-[11.5px] text-ink-300/65 font-medium">File URL</span>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://…"
                className="input-glass mt-1"
              />
            </label>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="hover-glass h-9 px-4 rounded-full border border-bone-300/55 text-[13px] text-ink-300/75 hover:text-ink-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitUrl}
                disabled={pending}
                className="btn-glass-signal h-9 px-4 rounded-full text-[13px] font-medium"
              >
                {pending ? "Adding…" : "Add file"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
