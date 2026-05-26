"use client";

import { ModuleShell } from "@/components/app/module-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i); // 8AM–5PM
const DAYS = ["Mon 22", "Tue 23", "Wed 24", "Thu 25", "Fri 26", "Sat 27", "Sun 28"];

type Evt = {
  day: number;
  start: number;
  span: number;
  title: string;
  meta: string;
  variant: "default" | "warning" | "success" | "info";
};
const EVENTS: Evt[] = [
  { day: 0, start: 9, span: 2, title: "Hilton site survey", meta: "L. Rivera + M. Chen", variant: "default" },
  { day: 1, start: 13, span: 1, title: "AMC visit · Apex", meta: "1h 45m", variant: "success" },
  { day: 2, start: 10, span: 3, title: "Boardroom installation", meta: "Crew of 3", variant: "default" },
  { day: 3, start: 14, span: 2, title: "Crestron commissioning", meta: "P. Mehta", variant: "info" },
  { day: 4, start: 9, span: 1, title: "Sales review", meta: "Internal", variant: "warning" },
  { day: 4, start: 11, span: 2, title: "Westin DSP recom.", meta: "On-site", variant: "default" },
];

export default function CalendarPage() {
  return (
    <ModuleShell
      eyebrow="Calendar"
      title="Schedule"
      description="Drag-and-drop scheduling for technicians, installations, surveys, and client meetings."
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-white/[0.06]">
            <div />
            {DAYS.map((d, i) => (
              <div key={d} className="px-3 py-3 text-xs">
                <div className="text-white/40">{d.split(" ")[0]}</div>
                <div className={`text-base font-semibold mt-0.5 ${i === 2 ? "text-signal-400" : "text-white"}`}>
                  {d.split(" ")[1]}
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-[64px_repeat(7,1fr)] relative">
            {HOURS.map((h) => (
              <div key={h} className="contents">
                <div className="px-3 py-2 text-[10px] text-white/35 font-mono border-r border-white/[0.04]">
                  {h.toString().padStart(2, "0")}:00
                </div>
                {DAYS.map((_, di) => (
                  <div key={`${h}-${di}`} className="border-r border-b border-white/[0.04] h-14 relative" />
                ))}
              </div>
            ))}

            {EVENTS.map((e, i) => {
              const top = (e.start - 8) * 56 + 4;
              const height = e.span * 56 - 8;
              const colors: Record<Evt["variant"], string> = {
                default: "from-signal-500/30 to-signal-500/10 border-signal-500/40 text-signal-200",
                success: "from-emerald-500/30 to-emerald-500/10 border-emerald-500/40 text-emerald-200",
                warning: "from-amber-500/30 to-amber-500/10 border-amber-500/40 text-amber-200",
                info: "from-sky-500/30 to-sky-500/10 border-sky-500/40 text-sky-200",
              };
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  style={{
                    top,
                    height,
                    left: `calc(64px + (100% - 64px) * ${e.day} / 7 + 4px)`,
                    width: `calc((100% - 64px) / 7 - 8px)`,
                  }}
                  className={`absolute rounded-lg bg-gradient-to-br border backdrop-blur px-2.5 py-2 ${colors[e.variant]}`}
                >
                  <div className="text-[11px] font-semibold leading-tight">{e.title}</div>
                  <div className="text-[10px] opacity-70 mt-0.5">{e.meta}</div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-white/45">Hours scheduled (week)</div>
            <div className="font-display text-3xl font-semibold tracking-tight mt-1">186h</div>
            <Badge variant="success" className="mt-3">+12% vs last week</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-white/45">Crew utilization</div>
            <div className="font-display text-3xl font-semibold tracking-tight mt-1">78%</div>
            <Badge variant="warning" className="mt-3">Target: 82%</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs text-white/45">Conflicts detected</div>
            <div className="font-display text-3xl font-semibold tracking-tight mt-1">0</div>
            <Badge variant="success" className="mt-3">All clear</Badge>
          </CardContent>
        </Card>
      </div>
    </ModuleShell>
  );
}
