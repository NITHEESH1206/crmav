"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Plus, Download, Filter, Sliders, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuickCreate } from "@/lib/stores/quick-create";
import { downloadCSV, timestampedFilename } from "@/lib/export/download";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

type Kind = "todo" | "opportunity" | "ticket" | "project";

const PATH_TO_KIND: Record<string, Kind> = {
  "/opportunities": "opportunity",
  "/projects": "project",
  "/service": "ticket",
  "/todos": "todo",
};

export type ExportColumn = { key: string; header: string };

export type ExportConfig = {
  filenamePrefix: string;
  rows: Record<string, unknown>[];
  columns: ExportColumn[];
};

export type Breadcrumb = { label: string; href?: string };

export function ModuleShell({
  eyebrow,
  title,
  description,
  breadcrumbs,
  actions,
  toolbar,
  exportConfig,
  onExport,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Path crumbs; if omitted, derived from the route + NAV_ITEMS. */
  breadcrumbs?: Breadcrumb[];
  actions?: ReactNode;
  /** Optional toolbar row below the header (segmented controls, filters). */
  toolbar?: ReactNode;
  exportConfig?: ExportConfig;
  onExport?: () => void | Promise<void>;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const showQuickCreate = useQuickCreate((s) => s.show);
  const matchedKind = Object.entries(PATH_TO_KIND).find(([p]) => pathname.startsWith(p))?.[1];

  // Sticky-compact header on scroll
  const [compact, setCompact] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setCompact(v > 96));

  // Derive breadcrumbs from nav if not provided
  const crumbs = breadcrumbs ?? deriveCrumbs(pathname, title);

  async function handleExport() {
    if (onExport) {
      try {
        await onExport();
      } catch (e) {
        toast.error("Export failed", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
      return;
    }
    if (!exportConfig) {
      toast.info("Export not available on this page yet");
      return;
    }
    if (exportConfig.rows.length === 0) {
      toast.info("Nothing to export", { description: "Add some data first." });
      return;
    }
    try {
      downloadCSV(
        exportConfig.rows,
        timestampedFilename(exportConfig.filenamePrefix, "csv"),
        exportConfig.columns
      );
      toast.success(`Exported ${exportConfig.rows.length} rows to CSV`);
    } catch (e) {
      toast.error("Export failed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  const canExport = Boolean(exportConfig || onExport);

  return (
    <div>
      {/* ── Breadcrumbs ── */}
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-[12px] text-ink-300/55 mb-3">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              {i > 0 && <ChevronRight className="h-3 w-3 text-ink-300/30 shrink-0" />}
              {c.href ? (
                <Link
                  href={c.href}
                  className="hover:text-ink-300 transition-colors truncate max-w-[180px]"
                >
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink-300/75 truncate max-w-[260px]">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}

      {/* ── Sticky compact header (appears on scroll) ── */}
      <motion.div
        initial={false}
        animate={{
          opacity: compact ? 1 : 0,
          y: compact ? 0 : -8,
          pointerEvents: compact ? "auto" : "none",
        }}
        transition={{ duration: 0.15 }}
        className="fixed top-0 inset-x-0 z-30 backdrop-blur-md bg-bone-100/85 border-b border-bone-300/55"
      >
        <div className="mx-auto max-w-[1600px] px-3 sm:px-6 lg:px-8 h-12 flex items-center justify-between gap-3 lg:pl-[260px]">
          <div className="flex items-center gap-2 min-w-0">
            {eyebrow && (
              <span className="text-[10.5px] uppercase tracking-[0.16em] text-ink-300/45 font-semibold shrink-0">
                {eyebrow}
              </span>
            )}
            <ChevronRight className="h-3 w-3 text-ink-300/30 shrink-0" />
            <span className="text-[13px] font-semibold text-ink-300 truncate">{title}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {actions ?? <DefaultActions {...{ canExport, handleExport, matchedKind, showQuickCreate, dense: true }} />}
          </div>
        </div>
      </motion.div>

      {/* ── Hero header — Aetherfield-style airier rhythm ── */}
      <header className="flex flex-col gap-5 mb-9 pt-2">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            {eyebrow && (
              <div className="inline-flex items-center gap-2 font-mono text-[12px] text-ink-300/55 uppercase tracking-[0.06em]">
                <span className="h-1 w-1 rounded-full bg-signal-500" />
                {eyebrow}
              </div>
            )}
            <h1 className="mt-3 text-[32px] md:text-[40px] leading-[1.08] tracking-[-0.024em] text-ink-300 font-medium">
              {title}
            </h1>
            {description && (
              <p className="mt-3 text-[16px] leading-[1.55] text-ink-300/65 max-w-2xl">
                {description}
              </p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {actions ?? <DefaultActions {...{ canExport, handleExport, matchedKind, showQuickCreate, dense: false }} />}
          </div>
        </div>
        {toolbar && (
          <div className="flex items-center gap-2 pb-1 border-b border-bone-300/45 -mb-2">
            {toolbar}
          </div>
        )}
      </header>

      {/* ── Content ── */}
      <div className={cn("space-y-5 section-gap")}>{children}</div>
    </div>
  );
}

function DefaultActions({
  canExport,
  handleExport,
  matchedKind,
  showQuickCreate,
  dense,
}: {
  canExport: boolean;
  handleExport: () => Promise<void> | void;
  matchedKind?: Kind;
  showQuickCreate: (k: Kind) => void;
  dense: boolean;
}) {
  const size = dense ? "sm" : "default";
  return (
    <>
      <Button variant="ghost" size={size}>
        <Filter className="h-3.5 w-3.5" />
        {!dense && "Filters"}
      </Button>
      {canExport && (
        <Button variant="ghost" size={size} onClick={handleExport}>
          <Download className="h-3.5 w-3.5" />
          {!dense && "Export"}
        </Button>
      )}
      <Button variant="ghost" size={size} title="Display options">
        <Sliders className="h-3.5 w-3.5" />
      </Button>
      {matchedKind && (
        <Button size={size} onClick={() => showQuickCreate(matchedKind)}>
          <Plus className="h-3.5 w-3.5" />
          {dense ? "New" : "Create"}
        </Button>
      )}
    </>
  );
}

function deriveCrumbs(pathname: string, fallbackTitle: string): Breadcrumb[] {
  // Find the matching NAV item, if any
  const match = NAV_ITEMS.find(
    (i) => pathname === i.href || (i.href !== "/dashboard" && pathname.startsWith(i.href))
  );
  if (!match) return [{ label: fallbackTitle }];

  if (match.group === "Pinned" || match.group === "Workspace") {
    return [{ label: match.label }];
  }
  return [
    { label: match.group },
    { label: match.label, href: match.href === pathname ? undefined : match.href },
  ];
}

/** Compact section header used inside dashboards & detail pages. */
export function SectionHeader({
  title,
  meta,
  actions,
}: {
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 mb-3">
      <div className="flex items-baseline gap-3 min-w-0">
        <h2 className="text-heading-md text-ink-300 truncate">{title}</h2>
        {meta && <span className="text-caption text-ink-300/55">{meta}</span>}
      </div>
      {actions && <div className="flex items-center gap-1.5 shrink-0">{actions}</div>}
    </div>
  );
}

export function EmptyHint({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 p-10 text-center">
      <div className="mx-auto w-10 h-10 rounded-md bg-bone-100 border border-bone-300/55 flex items-center justify-center mb-3">
        <Plus className="h-4 w-4 text-ink-300/55" />
      </div>
      <p className="text-body-sm text-ink-300/65">{message}</p>
    </div>
  );
}
