"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Video, Wrench, ShieldCheck, ListChecks, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CalendarEventDTO } from "@/lib/data/calendar";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_STYLE: Record<CalendarEventDTO["eventType"], { dot: string; chip: string; icon: LucideIcon }> = {
  MEETING: { dot: "bg-signal-500", chip: "bg-signal-500/15 text-signal-300 border-signal-500/30", icon: Video },
  SITE_VISIT: { dot: "bg-emerald-500", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", icon: MapPin },
  INSTALL: { dot: "bg-sky-500", chip: "bg-sky-500/15 text-sky-300 border-sky-500/30", icon: Wrench },
  AMC_VISIT: { dot: "bg-violet-500", chip: "bg-violet-500/15 text-violet-300 border-violet-500/30", icon: ShieldCheck },
  TASK: { dot: "bg-amber-500", chip: "bg-amber-500/15 text-amber-300 border-amber-500/30", icon: ListChecks },
};

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}
function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtTime(iso: string) {
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const p = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${p}` : `${h12}:${m.toString().padStart(2, "0")} ${p}`;
}

export function MobileCalendar({ events }: { events: CalendarEventDTO[] }) {
  const [anchor, setAnchor] = useState(() => new Date());
  const weekStart = startOfWeek(anchor);
  const today = new Date();

  const eventsByDay = useMemo(() => {
    const m = new Map<string, CalendarEventDTO[]>();
    for (const e of events) {
      const k = new Date(e.startsAt).toDateString();
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(e);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));
    }
    return m;
  }, [events]);

  const selectedEvents = eventsByDay.get(anchor.toDateString()) ?? [];

  return (
    <div className="rounded-2xl glass-card overflow-hidden">
      {/* Day picker strip */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <button
          onClick={() => setAnchor((d) => addDays(d, -7))}
          className="h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/65"
          aria-label="Previous week"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-display text-base font-semibold tracking-tight">
          {anchor.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
        </div>
        <button
          onClick={() => setAnchor((d) => addDays(d, 7))}
          className="h-8 w-8 rounded-lg border border-white/[0.08] bg-white/[0.02] flex items-center justify-center text-white/65"
          aria-label="Next week"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 px-3 pb-3">
        {Array.from({ length: 7 }).map((_, i) => {
          const day = addDays(weekStart, i);
          const isSelected = isSameDay(day, anchor);
          const isToday = isSameDay(day, today);
          const count = eventsByDay.get(day.toDateString())?.length ?? 0;
          return (
            <button
              key={i}
              onClick={() => setAnchor(day)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-xl border transition-all",
                isSelected
                  ? "bg-signal-500/[0.18] border-signal-500/40 shadow-glow-sm"
                  : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
              )}
            >
              <span
                className={cn(
                  "text-[10px] uppercase tracking-wider",
                  isSelected ? "text-signal-300" : "text-white/45"
                )}
              >
                {DAY_NAMES[day.getDay()]}
              </span>
              <span
                className={cn(
                  "font-display text-lg font-semibold tracking-tight",
                  isToday && !isSelected ? "text-signal-400" : isSelected ? "text-bone-100" : "text-bone-100"
                )}
              >
                {day.getDate()}
              </span>
              {count > 0 && (
                <span
                  className={cn(
                    "absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full",
                    isSelected ? "bg-signal-400" : "bg-white/40"
                  )}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected day header */}
      <div className="px-4 py-3 border-t border-white/[0.06] bg-ink-200/30">
        <div className="text-[10px] uppercase tracking-wider text-white/45">
          {anchor.toLocaleDateString("en-US", { weekday: "long" })}
        </div>
        <div className="flex items-baseline justify-between">
          <div className="font-display text-xl font-semibold tracking-tight">
            {anchor.toLocaleDateString("en-US", { month: "long", day: "numeric" })}
          </div>
          <div className="text-xs text-white/45">
            {selectedEvents.length} event{selectedEvents.length === 1 ? "" : "s"}
          </div>
        </div>
      </div>

      {/* Events list */}
      <div className="divide-y divide-white/[0.04]">
        {selectedEvents.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <div className="text-sm text-white/45">Nothing scheduled.</div>
            <div className="text-[11px] text-white/30 mt-1">Open on a larger screen to add events.</div>
          </div>
        ) : (
          selectedEvents.map((e, i) => {
            const style = EVENT_STYLE[e.eventType];
            const Icon = style.icon;
            return (
              <motion.div
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-start gap-3 px-4 py-3.5"
              >
                <div className={cn("h-9 w-9 shrink-0 rounded-xl border flex items-center justify-center", style.chip)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5 shrink-0 font-mono">
                      {fmtTime(e.startsAt)}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-white/45 mt-1 flex flex-wrap items-center gap-x-2">
                    <span>
                      {fmtTime(e.startsAt)} – {fmtTime(e.endsAt)}
                    </span>
                    {e.location && (
                      <>
                        <span>·</span>
                        <span className="truncate">{e.location}</span>
                      </>
                    )}
                    {e.userName && (
                      <>
                        <span>·</span>
                        <span className="truncate">{e.userName}</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
