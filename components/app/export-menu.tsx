"use client";

import { Download, FileImage, FileCode2, FileSpreadsheet, FileJson, type LucideIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export type ExportFormat = "png" | "svg" | "json" | "csv";

const FORMAT_META: Record<ExportFormat, { label: string; description: string; icon: LucideIcon }> = {
  png: { label: "PNG image", description: "High-res raster · 2× scaling", icon: FileImage },
  svg: { label: "SVG vector", description: "Editable in any vector tool", icon: FileCode2 },
  json: { label: "JSON data", description: "Raw structured export", icon: FileJson },
  csv: { label: "CSV spreadsheet", description: "Opens in Excel / Sheets", icon: FileSpreadsheet },
};

export function ExportMenu({
  formats,
  onExport,
  label = "Export",
  size = "sm",
  variant = "secondary",
}: {
  formats: ExportFormat[];
  onExport: (format: ExportFormat) => void | Promise<void>;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "ghost" | "outline";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="h-3.5 w-3.5" />
          {label}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Export as</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((f) => {
          const meta = FORMAT_META[f];
          const Icon = meta.icon;
          return (
            <DropdownMenuItem key={f} onClick={() => onExport(f)} className="flex-col items-start gap-0.5 py-2">
              <div className="flex items-center gap-2 w-full">
                <Icon className="h-3.5 w-3.5 text-signal-400" />
                <span className="font-medium">{meta.label}</span>
              </div>
              <div className="text-[10px] text-ink-300/55 ml-5">{meta.description}</div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
