"use client";

import { useEffect, useState } from "react";
import { LayoutGrid, List, Map, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type OpsView = "grid" | "list" | "map";

export function OpsFrame({
  view,
  onViewChange,
  children,
}: {
  view: OpsView;
  onViewChange: (v: OpsView) => void;
  children: React.ReactNode;
}) {
  const [noc, setNoc] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        setNoc((v) => !v);
      }
      if (e.key === "Escape" && noc) setNoc(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [noc]);

  return (
    <div
      className={cn(
        "relative",
        noc &&
          "fixed inset-0 z-[80] bg-ink-300 text-bone-100 overflow-auto p-8 [&_section]:bg-ink-200 [&_section]:border-bone-100/10 [&_*]:text-bone-100"
      )}
    >
      <div className={cn("flex items-center justify-between mb-4", noc && "mb-6")}>
        <div className="inline-flex items-center rounded-md border border-bone-300/55 bg-white p-0.5">
          <ViewBtn active={view === "grid"} onClick={() => onViewChange("grid")} icon={LayoutGrid}>
            Grid
          </ViewBtn>
          <ViewBtn active={view === "list"} onClick={() => onViewChange("list")} icon={List}>
            List
          </ViewBtn>
          <ViewBtn active={view === "map"} onClick={() => onViewChange("map")} icon={Map}>
            Map
          </ViewBtn>
        </div>

        <button
          type="button"
          onClick={() => setNoc((v) => !v)}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[12px] font-medium text-ink-300/65 hover:text-ink-300 hover:bg-bone-100 transition-colors"
          title="Status board mode (⌘⇧S)"
        >
          {noc ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          {noc ? "Exit board" : "Status board"}
          <span className="kbd ml-1">⌘⇧S</span>
        </button>
      </div>

      {children}
    </div>
  );
}

function ViewBtn({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutGrid;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-2.5 rounded text-[12px] font-medium transition-colors",
        active ? "bg-ink-300 text-bone-100" : "text-ink-300/65 hover:text-ink-300"
      )}
    >
      <Icon className="h-3 w-3" />
      {children}
    </button>
  );
}
