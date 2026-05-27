"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, ChevronDown } from "lucide-react";
import { useGeneration, type GenerationKind, GENERATION_ROUTES } from "@/lib/stores/generation";
import { cn } from "@/lib/utils";

export type GenerateOption = {
  kind: GenerationKind;
  label?: string;
  /** Human description shown in the dropdown. */
  description?: string;
};

/**
 * GenerateButton — split button that fires a default generation or opens a
 * menu of options for the current entity. Always opens the GenerationDrawer.
 */
export function GenerateButton({
  entityId,
  entityLabel,
  sourceLabel,
  options,
  size = "default",
  className,
}: {
  entityId: string;
  entityLabel: string;
  sourceLabel?: string;
  options: GenerateOption[];
  size?: "default" | "sm";
  className?: string;
}) {
  const show = useGeneration((s) => s.show);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  if (options.length === 0) return null;
  const primary = options[0];
  const primaryRoute = GENERATION_ROUTES[primary.kind];

  const h = size === "sm" ? "h-7" : "h-9";
  const px = size === "sm" ? "px-2.5 text-[12px]" : "px-3.5 text-[13px]";

  return (
    <div ref={wrapperRef} className={cn("relative inline-flex isolate", className)}>
      <button
        type="button"
        onClick={() =>
          show({
            kind: primary.kind,
            entityId,
            entityLabel,
            sourceLabel,
          })
        }
        className={cn(
          "inline-flex items-center gap-1.5 rounded-l-md bg-signal-500 text-white font-medium hover:bg-signal-600 transition-colors",
          h,
          px
        )}
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
        {primary.label ?? primaryRoute.verb}
      </button>
      {options.length > 1 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="More generation options"
          className={cn(
            "inline-flex items-center justify-center rounded-r-md bg-signal-500 text-white border-l border-white/20 hover:bg-signal-600 transition-colors",
            h,
            size === "sm" ? "w-7" : "w-8"
          )}
        >
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        </button>
      )}

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-[300px] rounded-md bg-white border border-bone-300/65 shadow-[0_18px_50px_-22px_rgba(10,10,10,0.28)] overflow-hidden z-10">
          <div className="px-3 py-1.5 border-b border-bone-300/45 text-[10px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-signal-500" />
            AI generations
          </div>
          <div className="py-1">
            {options.map((opt) => {
              const route = GENERATION_ROUTES[opt.kind];
              return (
                <button
                  key={opt.kind}
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    show({
                      kind: opt.kind,
                      entityId,
                      entityLabel,
                      sourceLabel,
                    });
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-bone-50 transition-colors"
                >
                  <div className="text-[13px] font-medium text-ink-300">
                    {opt.label ?? route.title}
                  </div>
                  {opt.description && (
                    <div className="text-[11.5px] text-ink-300/55 mt-0.5">{opt.description}</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
