"use client";

import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "warning" | "info" | "destructive" | "neutral";

const TONE_CLASS: Record<Tone, string> = {
  default: "bg-signal-500/15 text-signal-300 border-signal-500/30",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  info: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  destructive: "bg-red-500/15 text-red-300 border-red-500/30",
  neutral: "bg-bone-100/70 text-ink-300/80 border-bone-300/65",
};

export function StatusPill({
  value,
  options,
  onChange,
  tones,
}: {
  value: string;
  options: { value: string; label: string; tone?: Tone }[];
  onChange: (next: string) => Promise<unknown>;
  tones?: Record<string, Tone>;
}) {
  const [, startTransition] = useTransition();
  const [pending, setPending] = useState(false);

  const current = options.find((o) => o.value === value);
  const tone: Tone = (tones && tones[value]) ?? current?.tone ?? "default";

  function set(next: string) {
    if (next === value) return;
    setPending(true);
    startTransition(async () => {
      try {
        await onChange(next);
        const label = options.find((o) => o.value === next)?.label ?? next;
        toast.success(`Updated to ${label}`);
      } catch (e) {
        toast.error("Couldn't update", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
      setPending(false);
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={pending}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border transition-all hover:opacity-90 capitalize disabled:opacity-60",
            TONE_CLASS[tone]
          )}
        >
          {current?.label ?? value}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {options.map((o) => (
          <DropdownMenuItem key={o.value} onClick={() => set(o.value)}>
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full mr-2",
                {
                  default: "bg-signal-500",
                  success: "bg-emerald-500",
                  warning: "bg-amber-500",
                  info: "bg-sky-500",
                  destructive: "bg-red-500",
                  neutral: "bg-white/40",
                }[(tones && tones[o.value]) ?? o.tone ?? "default"]
              )}
            />
            {o.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
