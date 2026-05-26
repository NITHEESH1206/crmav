"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  FileImage,
  FileCode,
  File,
  Plus,
  ExternalLink,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  addProjectDocument,
  deleteProjectDocument,
  listProjectDocuments,
} from "@/app/actions/drawings";
import { formatDate } from "@/lib/utils";

type Doc = Awaited<ReturnType<typeof listProjectDocuments>>[number];

function fileTypeFromUrl(url: string): { icon: LucideIcon; label: string; tone: string } {
  const ext = url.split(".").pop()?.toLowerCase().split("?")[0] ?? "";
  if (["pdf"].includes(ext)) return { icon: FileText, label: "PDF", tone: "bg-red-500/15 text-red-300 border-red-500/30" };
  if (["dwg", "dxf"].includes(ext)) return { icon: FileCode, label: ext.toUpperCase(), tone: "bg-sky-500/15 text-sky-300 border-sky-500/30" };
  if (["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext)) return { icon: FileImage, label: ext.toUpperCase(), tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30" };
  if (["doc", "docx", "txt", "md"].includes(ext)) return { icon: FileText, label: ext.toUpperCase(), tone: "bg-signal-500/15 text-signal-300 border-signal-500/30" };
  return { icon: File, label: "DOC", tone: "bg-white/[0.06] text-white/65 border-white/[0.08]" };
}

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    listProjectDocuments(projectId)
      .then(setDocs)
      .catch((e) =>
        toast.error("Couldn't load documents", {
          description: e instanceof Error ? e.message : "Unknown error",
        })
      );
  }, [projectId]);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await addProjectDocument({ projectId, name: name.trim(), fileUrl: url.trim() });
        const fresh = await listProjectDocuments(projectId);
        setDocs(fresh);
        setOpen(false);
        setName("");
        setUrl("");
        toast.success("Document added", { description: name });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg);
        toast.error("Couldn't add document", { description: msg });
      }
    });
  }

  function remove(d: Doc) {
    const prev = docs;
    setDocs((arr) => arr?.filter((x) => x.id !== d.id) ?? null);
    startTransition(async () => {
      try {
        await deleteProjectDocument(d.id, projectId);
        toast.success("Document removed");
      } catch (e) {
        setDocs(prev);
        toast.error("Couldn't delete", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5 text-signal-400" />
            Documents & drawings
          </CardTitle>
          <p className="text-xs text-white/45 mt-1">
            Site surveys, DWG/PDF drawings, datasheets, AS-builts
          </p>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          Add document
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        {docs === null ? (
          <div className="px-6 pb-6 space-y-2">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : docs.length === 0 ? (
          <div className="px-6 pb-6 text-xs text-white/40 italic">
            No documents yet. Click <span className="text-white/65">Add document</span> to link a drawing, survey, or datasheet.
          </div>
        ) : (
          <div className="border-t border-white/[0.04]">
            <AnimatePresence initial={false}>
              {docs.map((d) => {
                const meta = fileTypeFromUrl(d.fileUrl);
                const Icon = meta.icon;
                return (
                  <motion.div
                    key={d.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center gap-3 px-6 py-3 border-b border-white/[0.04] last:border-b-0 hover:bg-white/[0.015]"
                  >
                    <div className={`h-9 w-9 shrink-0 rounded-lg border flex items-center justify-center ${meta.tone}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium truncate">{d.name}</div>
                        <Badge variant="secondary" className="h-4 px-1.5 text-[9px] font-mono">v{d.version}</Badge>
                      </div>
                      <div className="text-[11px] text-white/45 mt-0.5 flex items-center gap-2">
                        <span>{meta.label}</span>
                        <span>·</span>
                        <span>{formatDate(d.createdAt, { month: "short", day: "numeric", year: "numeric" })}</span>
                      </div>
                    </div>
                    <a
                      href={d.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-8 px-3 rounded-md border border-white/[0.08] bg-white/[0.02] text-xs text-white/70 hover:text-white hover:bg-white/[0.05] flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </a>
                    <button
                      onClick={() => remove(d)}
                      aria-label="Delete document"
                      className="h-8 w-8 rounded-md text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setError(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a document</DialogTitle>
            <DialogDescription>
              Link a drawing, site survey, datasheet, or AS-built. Paste a Drive / Dropbox / Notion / S3 URL.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-2 space-y-4">
            <div>
              <label className="text-xs text-white/65 mb-1.5 block">Document name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Boardroom rack elevation v3"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs text-white/65 mb-1.5 block">File URL</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/..."
              />
            </div>
            {error && <div className="text-xs text-red-400">{error}</div>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submit} disabled={pending || name.trim().length < 1 || url.trim().length < 4}>
              {pending ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
