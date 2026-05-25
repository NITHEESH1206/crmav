"use client";

import { useDetailDrawer } from "@/lib/stores/detail-drawer";
import type { DetailKind } from "@/app/actions/detail";
import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

/**
 * Wrap any list row in this to make it open the detail drawer on click.
 * Use as a substitute for the parent <div> on the row.
 */
export function OpenableRow({
  kind,
  id,
  className,
  children,
  ...props
}: {
  kind: DetailKind;
  id: string;
  children: ReactNode;
} & HTMLAttributes<HTMLDivElement>) {
  const show = useDetailDrawer((s) => s.show);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => show(kind, id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          show(kind, id);
        }
      }}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  );
}
