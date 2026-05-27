import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Three badge families:
 *
 *  1. STATUS PILL — represents record state (Active, At Risk, Approved).
 *     Variants: success · warning · danger · info · neutral
 *
 *  2. FILTER CHIP — selected filter on a list (Owner: me ×).
 *     Variant: filter
 *
 *  3. COUNT CHIP — small monospace number (tab/badge counters).
 *     Variant: count
 *
 *  + Legacy variants kept for backwards-compat (default/secondary/outline).
 */
const badgeVariants = cva(
  "inline-flex items-center font-medium transition-colors gap-1.5 whitespace-nowrap",
  {
    variants: {
      variant: {
        // ── Status pills (semantic muted) ──
        success: "pill-success rounded-md px-2 py-0.5 text-[11px]",
        warning: "pill-warning rounded-md px-2 py-0.5 text-[11px]",
        danger:  "pill-danger  rounded-md px-2 py-0.5 text-[11px]",
        info:    "pill-info    rounded-md px-2 py-0.5 text-[11px]",
        neutral: "pill-neutral rounded-md px-2 py-0.5 text-[11px]",

        // ── Filter chip — dismissible style ──
        filter:
          "rounded-md border border-bone-300/65 bg-white text-ink-300/85 px-2 py-0.5 text-[11px] hover:border-bone-300/85",

        // ── Count chip — monospace number ──
        count:
          "rounded bg-bone-100 text-ink-300/65 px-1.5 py-0.5 text-[10px] font-mono leading-none",

        // ── Legacy ── (existing pages still rely on these names)
        default:     "rounded-md bg-ink-300 text-bone-100 px-2 py-0.5 text-[11px]",
        secondary:   "rounded-md bg-bone-100 text-ink-300/80 border border-bone-300/55 px-2 py-0.5 text-[11px]",
        outline:     "rounded-md border border-bone-300/80 text-ink-300/85 px-2 py-0.5 text-[11px]",
        destructive: "pill-danger  rounded-md px-2 py-0.5 text-[11px]",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
