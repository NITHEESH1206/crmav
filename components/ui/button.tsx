import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button system per spec:
 *  - default   → Ink-on-bone primary (one per surface — main action)
 *  - secondary → Outline, ink text, bone bg (sibling actions)
 *  - ghost     → No border, ink/75 text, bone-100 hover (tertiary / inline)
 *  - outline   → Same as secondary but border-default everywhere
 *  - destructive → Outline-red by default (filled red ONLY in confirm dialogs)
 *  - destructive-solid → Filled red — confirm-dialog primary
 *  - link      → Underlined ink text
 *  - generate  → Signal-filled — RESERVED for AI generation actions only
 *
 * Sizes: sm 28 · default 36 · lg 44 · icon (square) · xl (kept for marketing)
 * Radius: 8px (Linear/Stripe feel) — pill only via className override.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md text-[13px] font-medium ring-offset-background transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-ink-300 text-bone-100 hover:bg-ink-200 active:bg-ink-300 shadow-[0_1px_0_0_rgba(255,255,255,0.08)_inset,0_1px_2px_-1px_rgba(10,10,10,0.4)]",
        secondary:
          "bg-white text-ink-300 border border-bone-300/70 hover:bg-bone-50 hover:border-bone-300",
        ghost:
          "text-ink-300/75 hover:text-ink-300 hover:bg-bone-100",
        outline:
          "border border-bone-300/80 bg-transparent text-ink-300 hover:bg-bone-50 hover:border-ink-300/30",
        destructive:
          "border border-status-danger-fg/30 bg-status-danger-bg text-status-danger-fg hover:bg-status-danger-fg/10 hover:border-status-danger-fg/50",
        "destructive-solid":
          "bg-status-danger-fg text-white hover:bg-status-danger-fg/90",
        link: "text-ink-300 underline underline-offset-4 hover:text-signal-600",
        generate:
          "bg-signal-500 text-white hover:bg-signal-600 shadow-[0_1px_0_0_rgba(255,255,255,0.18)_inset,0_2px_8px_-2px_rgba(255,90,31,0.4)]",
      },
      size: {
        sm:      "h-7 px-2.5 text-[12px] [&_svg]:size-3",
        default: "h-9 px-3.5",
        lg:      "h-11 px-5 text-[14px] [&_svg]:size-4",
        xl:      "h-12 px-6 text-[15px] [&_svg]:size-4",
        icon:    "h-9 w-9",
        "icon-sm": "h-7 w-7 [&_svg]:size-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
