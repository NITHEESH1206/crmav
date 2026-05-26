"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export type RelatedItem = {
  id: string;
  label: string;
  meta?: string;
  href?: string;
  badge?: { label: string; tone?: "default" | "secondary" | "success" | "warning" | "destructive" | "info" };
  right?: ReactNode;
};

export function RelatedList({
  title,
  icon: Icon,
  items,
  empty = "Nothing yet.",
  className,
}: {
  title: string;
  icon?: LucideIcon;
  items: RelatedItem[];
  empty?: string;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center gap-2">
        {Icon && <Icon className="h-3.5 w-3.5 text-signal-400" />}
        <CardTitle className="text-sm">{title}</CardTitle>
        <Badge variant="secondary" className="ml-auto h-5">{items.length}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {items.length === 0 ? (
          <div className="px-6 pb-6 text-xs text-white/40 italic">{empty}</div>
        ) : (
          <div className="border-t border-white/[0.04]">
            {items.map((it) => {
              const Inner = (
                <div className="flex items-center gap-3 px-6 py-3 hover:bg-white/[0.02] transition-colors group">
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-white/85 truncate">{it.label}</div>
                    {it.meta && (
                      <div className="text-[11px] text-white/45 mt-0.5 truncate">{it.meta}</div>
                    )}
                  </div>
                  {it.badge && (
                    <Badge variant={it.badge.tone ?? "secondary"} className="shrink-0">
                      {it.badge.label}
                    </Badge>
                  )}
                  {it.right && <div className="shrink-0">{it.right}</div>}
                  {it.href && (
                    <ChevronRight className="h-3.5 w-3.5 text-white/30 group-hover:text-white/70 shrink-0" />
                  )}
                </div>
              );
              return it.href ? (
                <Link key={it.id} href={it.href} className="block border-b border-white/[0.04] last:border-b-0">
                  {Inner}
                </Link>
              ) : (
                <div key={it.id} className="border-b border-white/[0.04] last:border-b-0">
                  {Inner}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
