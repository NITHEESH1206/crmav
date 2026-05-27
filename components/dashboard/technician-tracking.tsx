"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MapPin } from "lucide-react";
import { initials } from "@/lib/utils";

const COLORS = [
  "from-signal-400 to-signal-600",
  "from-sky-400 to-sky-600",
  "from-emerald-400 to-emerald-600",
  "from-violet-400 to-violet-600",
];

const statusVariant = (s: string) =>
  s === "on-site" ? ("success" as const) : s === "transit" ? ("warning" as const) : ("secondary" as const);

export function TechnicianTracking({
  techs,
}: {
  techs: { name: string; location: string; status: string; utilization: number }[];
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Technician tracking</CardTitle>
          <p className="text-xs text-ink-300/55 mt-1">{techs.length} active · live updates</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Live
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {techs.length === 0 && (
          <div className="text-xs text-ink-300/50 text-center py-8">No technicians on the roster.</div>
        )}
        {techs.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="flex items-center gap-3"
          >
            <Avatar className="h-9 w-9 ring-1 ring-signal-500/20">
              <AvatarFallback className={`bg-gradient-to-br ${COLORS[i % COLORS.length]}`}>
                {initials(t.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{t.name}</span>
                <Badge variant={statusVariant(t.status)} className="text-[9px] h-4 px-1.5">
                  {t.status}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-ink-300/55 truncate">
                <MapPin className="h-2.5 w-2.5" />
                {t.location}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs font-mono">{t.utilization}%</div>
              <div className="text-[10px] text-ink-300/45">util.</div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
