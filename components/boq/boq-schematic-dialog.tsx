"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  FileUp, X, Loader2, Sparkles, Check, AlertTriangle, ImageIcon, ScanLine,
} from "lucide-react";
import { toast } from "sonner";
import { generateSchematicFromBoq } from "@/app/actions/boq-import";

type MatchedItem = {
  brand: string;
  model: string;
  description: string;
  quantity: number;
  category: string;
  catalogId: string | null;
  sku: string | null;
  imageUrl: string | null;
  matched: boolean;
};

function fileKind(file: File): "image" | "pdf" | "excel" | null {
  const t = file.type;
  const n = file.name.toLowerCase();
  if (t.startsWith("image/")) return "image";
  if (t === "application/pdf" || n.endsWith(".pdf")) return "pdf";
  if (n.endsWith(".xlsx") || n.endsWith(".xls") || n.endsWith(".csv") || t.includes("spreadsheet") || t.includes("excel")) return "excel";
  return null;
}

function readBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export function BoqSchematicButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-glass-signal inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-medium"
      >
        <Sparkles className="h-3.5 w-3.5" />
        Import BOQ → schematic
      </button>
      {open && <Dialog onClose={() => setOpen(false)} />}
    </>
  );
}

function Dialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [items, setItems] = useState<MatchedItem[] | null>(null);
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();

  async function onFile(file: File) {
    const kind = fileKind(file);
    if (!kind) {
      toast.error("Unsupported file", { description: "Upload an image, PDF, or Excel/CSV." });
      return;
    }
    setReading(true);
    setItems(null);
    setName(file.name.replace(/\.[^.]+$/, "") + " — schematic");
    try {
      const dataBase64 = await readBase64(file);
      const res = await fetch("/api/ai/boq-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, dataBase64, mediaType: file.type }),
      });
      const json = await res.json();
      if (!json.ok) {
        toast.error("Couldn't read the BOQ", { description: json.error });
        setReading(false);
        return;
      }
      setFileName(file.name);
      setItems(json.items as MatchedItem[]);
      toast.success(`Read ${json.total} items`, { description: `${json.matchedCount} matched to your catalog` });
    } catch (e) {
      toast.error("Extraction failed", { description: e instanceof Error ? e.message : "Unknown error" });
    } finally {
      setReading(false);
    }
  }

  function updateQty(i: number, q: number) {
    setItems((prev) => prev && prev.map((it, idx) => (idx === i ? { ...it, quantity: Math.max(1, q) } : it)));
  }
  function remove(i: number) {
    setItems((prev) => prev && prev.filter((_, idx) => idx !== i));
  }

  function generate() {
    if (!items?.length) return;
    if (name.trim().length < 1) { toast.error("Name the schematic"); return; }
    startTransition(async () => {
      const r = await generateSchematicFromBoq({ name: name.trim(), items });
      if (r.ok) {
        toast.success("Schematic generated", { description: "It's now in 'Your flows' on the left." });
        router.refresh();
        onClose();
      } else {
        toast.error("Couldn't generate", { description: r.error });
      }
    });
  }

  const matchedCount = items?.filter((i) => i.matched).length ?? 0;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-300/35 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="glass-card relative w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        <header className="px-5 py-3.5 border-b border-bone-300/40 flex items-center justify-between shrink-0">
          <h3 className="text-[14px] font-medium text-ink-300 inline-flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-signal-700" />
            BOQ → pictorial schematic
          </h3>
          <button onClick={onClose} className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/55 hover:text-ink-300">
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="px-5 py-4 overflow-y-auto space-y-3">
          {!items && (
            <>
              <p className="text-[12.5px] text-ink-300/65 leading-relaxed">
                Upload your Bill of Quantities as an <strong>image</strong>, <strong>PDF</strong> or{" "}
                <strong>Excel/CSV</strong>. The AI reads the line items, matches them to your catalog for
                product photos, and generates an editable signal-flow schematic.
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={reading}
                className="w-full rounded-2xl border-2 border-dashed border-bone-300/70 hover:border-signal-500/50 bg-white/50 py-10 flex flex-col items-center gap-2 text-ink-300/60 transition-colors"
              >
                {reading ? (
                  <><Loader2 className="h-6 w-6 animate-spin text-signal-600" /><span className="text-[13px]">Reading the BOQ…</span></>
                ) : (
                  <><FileUp className="h-6 w-6" /><span className="text-[13px]">Click to choose a file</span>
                  <span className="text-[11px] text-ink-300/45">PNG · JPG · PDF · XLSX · CSV</span></>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf,.pdf,.xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
              />
            </>
          )}

          {items && (
            <>
              <div className="flex items-center justify-between gap-3">
                <div className="text-[12.5px] text-ink-300/70">
                  <span className="font-mono text-ink-300/50">{fileName}</span> · {items.length} items ·{" "}
                  <span className="text-signal-700 font-medium">{matchedCount} with photos</span>
                </div>
                <button onClick={() => setItems(null)} className="text-[11.5px] text-ink-300/55 hover:text-ink-300">Change file</button>
              </div>

              <div className="rounded-xl border border-bone-300/50 divide-y divide-bone-300/30 max-h-[42vh] overflow-y-auto">
                {items.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2">
                    <div className="h-10 w-10 rounded bg-white border border-bone-300/55 flex items-center justify-center shrink-0 overflow-hidden">
                      {it.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={it.imageUrl} alt="" className="h-full w-full object-contain p-0.5" />
                      ) : (
                        <ImageIcon className="h-4 w-4 text-ink-300/30" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium text-ink-300 truncate">{it.description || it.model}</div>
                      <div className="text-[11px] text-ink-300/55 truncate">
                        {it.brand} · <span className="font-mono">{it.model}</span> · {it.category}
                      </div>
                    </div>
                    {it.matched ? (
                      <span title="Matched to catalog" className="text-status-success-fg"><Check className="h-3.5 w-3.5" /></span>
                    ) : (
                      <span title="Not in catalog — no photo" className="text-amber-500"><AlertTriangle className="h-3.5 w-3.5" /></span>
                    )}
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => updateQty(i, parseInt(e.target.value, 10) || 1)}
                      className="w-14 h-8 text-center rounded-lg border border-bone-300/55 bg-white text-[12px] font-mono"
                    />
                    <button onClick={() => remove(i)} className="text-ink-300/35 hover:text-status-danger-fg"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>

              <label className="block">
                <span className="text-[11.5px] text-ink-300/65 font-medium">Schematic name</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input-glass mt-1" />
              </label>
            </>
          )}
        </div>

        {items && (
          <div className="px-5 py-3 border-t border-bone-300/40 flex justify-end gap-2 shrink-0">
            <button onClick={onClose} className="hover-glass h-9 px-4 rounded-full border border-bone-300/55 text-[13px] text-ink-300/75 hover:text-ink-300">Cancel</button>
            <button onClick={generate} disabled={pending || items.length === 0} className="btn-glass-signal h-9 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Generate schematic
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
