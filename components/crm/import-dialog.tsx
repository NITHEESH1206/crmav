"use client";

import { useState, useTransition } from "react";
import { Upload, X, FileSpreadsheet, Download, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { importCrmCsv, type CrmImportResult } from "@/app/actions/crm-import";

const TEMPLATE = `account,tier,industry,website,contact,email,phone,title,opportunity,value,stage,probability,expected_close
"Marriott International",ENTERPRISE,Hospitality,marriott.com,"Priya Nair",priya@marriott.com,+91 90000 00000,Facilities Head,"NYC — 12 boardrooms",412000,Proposal,60,2026-09-30
"Nexus Capital",GROWTH,Finance,nexuscapital.com,"Sam Lee",sam@nexus.com,,IT Director,"HQ Phase 2 fit-out",167000,Negotiation,75,2026-08-15
"Apex Media",STARTER,Media,apex.tv,"Dana Roy",dana@apex.tv,,Producer,"Studio control surface",162000,Discovery,30,`;

export function CrmImportButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-glass-primary inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12.5px] font-medium shrink-0"
      >
        <Upload className="h-3.5 w-3.5" />
        Import pipeline
      </button>
      {open && <Dialog onClose={() => setOpen(false)} />}
    </>
  );
}

function Dialog({ onClose }: { onClose: () => void }) {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState<CrmImportResult | null>(null);
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
    a.download = "zynexav-pipeline-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function run() {
    if (csv.trim().length < 10) {
      toast.error("Paste CSV or load a .csv file first");
      return;
    }
    startTransition(async () => {
      const r = await importCrmCsv(csv);
      setResult(r);
      if (!r.ok) {
        toast.error("Import failed", { description: r.error });
      } else {
        toast.success(
          `Imported ${r.accountsCreated} accounts, ${r.opportunitiesCreated} deals`,
          { description: `${r.contactsCreated} contacts · ${r.accountsReused} existing accounts reused` }
        );
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
            Import pipeline from CSV
          </h3>
          <button onClick={onClose} className="hover-glass h-8 w-8 rounded-full border border-transparent flex items-center justify-center text-ink-300/55 hover:text-ink-300">
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="px-5 py-4 space-y-3">
          <p className="text-[12.5px] text-ink-300/65 leading-relaxed">
            One row per client/deal. We create the <strong>account</strong> (if new), an optional
            <strong> contact</strong>, and an optional <strong>opportunity</strong> — so the same file
            works whether you&apos;re loading just accounts or your whole pipeline. Only the
            <span className="font-mono"> account</span> column is required.
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
            placeholder="account,tier,industry,contact,email,opportunity,value,stage,expected_close&#10;Marriott International,ENTERPRISE,Hospitality,Priya Nair,priya@…,NYC boardrooms,412000,Proposal,2026-09-30"
            rows={8}
            className="input-glass w-full font-mono text-[11.5px] leading-relaxed resize-y"
          />

          {result?.ok && (
            <div className="rounded-xl bg-status-success-bg/50 border border-status-success-fg/20 p-3 text-[12px] text-ink-300/80">
              <div className="inline-flex items-center gap-1.5 font-medium text-status-success-fg">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {result.accountsCreated} accounts · {result.contactsCreated} contacts · {result.opportunitiesCreated} deals
                {result.skipped ? ` · ${result.skipped} skipped` : ""}
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
