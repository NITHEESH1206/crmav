"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/**
 * WidgetCard — the standard container for every Mission Control panel.
 * Slim header (eyebrow + count + drill-through link), no shadow at rest,
 * dense body, optional footer KPI row.
 */
export function WidgetCard({
  icon: Icon,
  eyebrow,
  title,
  count,
  href,
  drillLabel = "View all",
  tone = "neutral",
  className,
  children,
  footer,
}: {
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  count?: number | string;
  href?: string;
  drillLabel?: string;
  tone?: "neutral" | "warning" | "danger" | "info" | "success";
  className?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const accent =
    tone === "danger"
      ? "border-status-danger-fg/25"
      : tone === "warning"
        ? "border-status-warning-fg/25"
        : tone === "info"
          ? "border-status-info-fg/25"
          : tone === "success"
            ? "border-status-success-fg/25"
            : "border-bone-300/55";

  return (
    <section
      className={cn(
        "rounded-lg bg-white border flex flex-col min-w-0",
        accent,
        className
      )}
    >
      <header className="flex items-center justify-between gap-2 px-4 py-3 border-b border-bone-300/45">
        <div className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="h-3.5 w-3.5 text-ink-300/55 shrink-0" strokeWidth={1.75} />}
          <div className="min-w-0">
            {eyebrow && (
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-300/45 font-semibold leading-tight">
                {eyebrow}
              </div>
            )}
            <h3 className="text-[13px] font-semibold text-ink-300 truncate leading-tight">{title}</h3>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {count !== undefined && (
            <span className="text-[11px] font-mono text-ink-300/55 px-1.5 py-0.5 rounded bg-bone-100">
              {count}
            </span>
          )}
          {href && (
            <Link
              href={href}
              className="text-[11px] text-ink-300/55 hover:text-ink-300 flex items-center gap-0.5"
            >
              {drillLabel}
              <ChevronRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </header>
      <div className="flex-1 p-2">{children}</div>
      {footer && (
        <footer className="px-4 py-2.5 border-t border-bone-300/45 text-[11px] text-ink-300/65">
          {footer}
        </footer>
      )}
    </section>
  );
}

/** Compact list row used inside widgets. */
export function WidgetRow({
  primary,
  secondary,
  trailing,
  href,
  toneDot,
}: {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  trailing?: React.ReactNode;
  href?: string;
  toneDot?: "danger" | "warning" | "info" | "success" | "neutral";
}) {
  const dot =
    toneDot === "danger"
      ? "bg-status-danger-fg"
      : toneDot === "warning"
        ? "bg-status-warning-fg"
        : toneDot === "info"
          ? "bg-status-info-fg"
          : toneDot === "success"
            ? "bg-status-success-fg"
            : toneDot
              ? "bg-ink-300/50"
              : null;

  const content = (
    <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-bone-50 transition-colors">
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dot)} aria-hidden />}
      <div className="flex-1 min-w-0">
        <div className="text-[12.5px] text-ink-300 truncate">{primary}</div>
        {secondary && (
          <div className="text-[11px] text-ink-300/55 truncate mt-0.5">{secondary}</div>
        )}
      </div>
      {trailing && <div className="shrink-0 text-[11.5px] font-mono text-ink-300/70">{trailing}</div>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

/** Empty-state cell inside a widget. */
export function WidgetEmpty({ message }: { message: string }) {
  return (
    <div className="px-3 py-6 text-center text-[12px] text-ink-300/50">
      {message}
    </div>
  );
}
