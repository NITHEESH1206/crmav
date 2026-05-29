"use client";

import { useEffect, useState } from "react";
import { Maximize2, Minimize2, Calendar, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Wraps the Mission Control content with:
 *  - Today / This week toggle
 *  - NOC (full-screen) toggle — ⌘⇧M
 *
 * When NOC mode is active, the wrapper takes over the viewport, hides the app
 * chrome, and renders on a dark canvas with oversized type — ideal for a wall
 * monitor in the ops room.
 */
export function DashboardFrame({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"today" | "week">("today");
  const [noc, setNoc] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === "m" || e.key === "M")) {
        e.preventDefault();
        setNoc((v) => !v);
      }
      if (e.key === "Escape" && noc) {
        setNoc(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [noc]);

  return (
    <div
      className={cn(
        "relative",
        noc &&
          "fixed inset-0 z-[80] bg-ink-300 text-bone-100 overflow-auto p-8 [&_section]:bg-ink-200 [&_section]:border-bone-100/10 [&_header]:border-bone-100/10 [&_*]:text-bone-100"
      )}
    >
      {/* Toolbar */}
      <div className={cn("flex items-center justify-between mb-4", noc && "mb-6")}>
        <div className="glass inline-flex items-center rounded-full p-1">
          <button
            type="button"
            onClick={() => setMode("today")}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all",
              mode === "today"
                ? "btn-glass-primary"
                : "text-ink-300/65 hover:text-ink-300 hover:bg-white/40"
            )}
          >
            <Calendar className="h-3 w-3" />
            Today
          </button>
          <button
            type="button"
            onClick={() => setMode("week")}
            className={cn(
              "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium transition-all",
              mode === "week"
                ? "btn-glass-primary"
                : "text-ink-300/65 hover:text-ink-300 hover:bg-white/40"
            )}
          >
            <CalendarDays className="h-3 w-3" />
            This week
          </button>
        </div>

        <button
          type="button"
          onClick={() => setNoc((v) => !v)}
          className="glass inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full text-[12.5px] font-medium text-ink-300/75 hover:text-ink-300 transition-all hover:-translate-y-px"
          title="Mission control mode (⌘⇧M)"
        >
          {noc ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          {noc ? "Exit NOC" : "NOC mode"}
          <span className="kbd ml-1">⌘⇧M</span>
        </button>
      </div>

      {children}
    </div>
  );
}
