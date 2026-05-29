import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — Apple-style glass.
 *  - 20px radius, frosted bg via .glass-strong, soft outer shadow + inner highlight
 *  - Pass `interactive` to opt in to hover lift
 *  - Pass `flat` to fall back to the older opaque-white treatment when glass
 *    would compete with dense data (tables, list rows).
 *
 * Compose: Card → CardHeader → CardTitle / CardDescription, then CardContent.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean; flat?: boolean }
>(({ className, interactive, flat, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative text-ink-300 rounded-[20px]",
      flat
        ? "bg-white border border-bone-300/55"
        : "glass-strong",
      interactive &&
        "transition-all duration-200 hover:-translate-y-px cursor-pointer",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-heading-sm font-display tracking-tight text-ink-300", className)}
      {...props}
    />
  )
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-body-sm text-ink-300/60", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-5 pt-0", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center p-5 pt-0 border-t border-bone-300/45 mt-3", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";

/** Toolbar slot for a card — top-right action area. */
const CardToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("ml-auto flex items-center gap-1", className)} {...props} />
  )
);
CardToolbar.displayName = "CardToolbar";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardToolbar };
