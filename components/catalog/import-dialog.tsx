"use client";

import { useState, useTransition } from "react";
import { Upload, X, FileSpreadsheet, Download, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { importCatalogCsv, type ImportResult } from "@/app/actions/catalog";

const TEMPLATE = `sku,name,brand,category,description,list_price,cost,image_url,datasheet_url
CRES-TSW-1070,"TSW-1070 10.1\\" Touch Screen",Crestron,Control - Touch Panel,"10.1-inch wall-mount touch panel",1500,900,https://your-feed.example/images/tsw-1070.jpg,https://your-feed.example/ds/tsw-1070.pdf
EXT-DTP3-T-211,"DTP3 T 211 Transmitter",Extron,AVoIP Encoder,"HDMI + USB-C to DTP3 transmitter",695,420,https://your-feed.example/images/dtp3-t-211.jpg,
QSC-CORE-110F,"Q-SYS Core 110f",QSC,DSP,"Integrated DSP core, 8x8 analog I/O",3200,1950,https://your-feed.example/images/core-110f.jpg,`;

export function CatalogImportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-glass-primary inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-medium shrink-0"
      >
        <Upload className="h-3.5 w-3.5" />
        Import products
      </button>
      {open && <ImportDialog onClose={() => setOpen(false)} />}
    </>
  );
}

function ImportDialog({ onClose }: { onClose: () => void }) {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [pending, startTransition] = useTransition();

  function loadFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setCsv(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const blob = new Blob([TEMPLATE], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "zynexav-catalog-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function run() {
    if (csv.trim().length < 10) {
      toast.error("Paste CSV or load a .csv file first");
      return;
    }
    startTransition(async () => {
      const r = await importCatalogCsv(csv);
      setResult(r);
      if (!r.ok) {
        toast.error("Import failed", { description: r.error });
      } else {
        toast.success(`Imported ${r.added + r.updated} products`, {
          description: `${r.added} new · ${r.updated} updated${r.skipped ? ` · ${r.skipped} skipped` : ""}`,
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-ink-300/35 backdrop-blur-sm" />
      <div onClick={(e) => e.stopPropagation()} className="glass-card relative w-full max-w-lg overflow-hidden">
        <header className="px-5 py-3.5 border-b border-bone-300/40 flex items-center justify-between">
          <h3 className="text-[14px] font-medium text-ink-300 inline-flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-signal-700" />
            Import products from CSV
          </h3>
          <button onClick={onClose} className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/55 hover:text-ink-300">
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="px-5 py-4 space-y-3">
          <p className="text-[12.5px] text-ink-300/65 leading-relaxed">
            Paste a product feed or load a <span className="font-mono">.csv</span>. Each row upserts by
            SKU and can include an <strong>image URL</strong> + datasheet. Tip: pull official photos &amp;
            specs from your distributor / manufacturer dealer feed (ADI, Almo, Exertis…).
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={downloadTemplate}
              className="hover-glass inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-bone-300/55 text-[12px] text-ink-300/75 hover:text-ink-300"
            >
              <Download className="h-3 w-3" />
              Download template
            </button>
            <label className="hover-glass inline-flex items-center gap-1.5 h-8 px-3 rounded-full border border-bone-300/55 text-[12px] text-ink-300/75 hover:text-ink-300 cursor-pointer">
              <Upload className="h-3 w-3" />
              Load .csv file
              <input
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
              />
            </label>
          </div>

          <textarea
            value={csv}
            onChange={(e) => setCsv(e.target.value)}
            placeholder="sku,name,brand,category,description,list_price,cost,image_url,datasheet_url&#10;CRES-TSW-1070,TSW-1070…,Crestron,Control - Touch Panel,…"
            rows={8}
            className="input-glass w-full font-mono text-[11.5px] leading-relaxed resize-y"
          />

          {result?.ok && (
            <div className="rounded-xl bg-status-success-bg/50 border border-status-success-fg/20 p-3 text-[12px] text-ink-300/80">
              <div className="inline-flex items-center gap-1.5 font-medium text-status-success-fg">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.added} added · {result.updated} updated{result.skipped ? ` · ${result.skipped} skipped` : ""}
              </div>
              {result.errors.length > 0 && (
                <ul className="mt-1.5 text-[11px] text-status-danger-fg/90 list-disc pl-4">
                  {result.errors.map((er, i) => <li key={i}>{er}</li>)}
                </ul>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button onClick={onClose} className="hover-glass h-9 px-4 rounded-full border border-bone-300/55 text-[13px] text-ink-300/75 hover:text-ink-300">
              {result?.ok ? "Done" : "Cancel"}
            </button>
            <button onClick={run} disabled={pending} className="btn-glass-signal h-9 px-4 rounded-full text-[13px] font-medium inline-flex items-center gap-1.5">
              {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
