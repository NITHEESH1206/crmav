import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Card — Linear/Stripe restraint.
 *  - 8px radius, 1px border, **no shadow at rest**
 *  - Pass `interactive` to opt in to hover lift + subtle shadow
 *
 * Compose: Card → CardHeader → CardTitle / CardDescription, then CardContent.
 */
const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }
>(({ className, interactive, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative rounded-lg bg-white text-ink-300 border border-bone-300/55",
      interactive &&
        "transition-all duration-150 hover:border-bone-300/85 hover:shadow-[0_4px_12px_-6px_rgba(10,10,10,0.12)] hover:-translate-y-px cursor-pointer",
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
