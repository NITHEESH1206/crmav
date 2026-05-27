"use client";

import { FileText, Download } from "lucide-react";
import type { PortalData } from "../portal-shell";

export function DocumentsTab({ documents }: { documents: PortalData["documents"] }) {
  if (documents.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center text-[12.5px] text-ink-300/55">
        No documents shared with you yet.
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-bone-300/55 bg-bone-50/60">
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Document
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Project
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[80px]">
              Version
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[120px]">
              Added
            </th>
            <th className="w-[60px]" />
          </tr>
        </thead>
        <tbody>
          {documents.map((d) => (
            <tr key={d.id} className="border-b border-bone-300/35 hover:bg-bone-50">
              <td className="px-4 py-2">
                <div className="flex items-center gap-2 text-ink-300 font-medium">
                  <FileText className="h-3.5 w-3.5 text-ink-300/55 shrink-0" />
                  <span className="truncate">{prettyName(d.name)}</span>
                </div>
              </td>
              <td className="px-4 py-2 text-ink-300/75 truncate">{d.project?.name ?? "—"}</td>
              <td className="px-4 py-2 font-mono text-ink-300/65">v{d.version}</td>
              <td className="px-4 py-2 text-ink-300/55">
                {d.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </td>
              <td className="px-4 py-2 text-right">
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[12px] text-ink-300/65 hover:text-ink-300"
                >
                  <Download className="h-3 w-3" />
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function prettyName(raw: string): string {
  if (raw.startsWith("/")) {
    const parts = raw.split("/");
    return parts[parts.length - 1] || raw;
  }
  return raw;
}
