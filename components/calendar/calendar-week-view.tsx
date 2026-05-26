"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Video,
  MapPin,
  Phone,
  Wrench,
  ShieldCheck,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import {
  moveCalendarEvent,
  resizeCalendarEvent,
  createCalendarEvent,
  deleteCalendarEvent,
} from "@/app/actions/calendar";
import type { CalendarEventDTO } from "@/lib/data/calendar";
import { cn } from "@/lib/utils";

// ─── constants ───────────────────────────────────────────────────────────
const HOUR_HEIGHT = 56; // px per 1-hour row
const SLOT_MINUTES = 30; // snap grid
const START_HOUR = 7; // 7 AM
const END_HOUR = 20; // 8 PM
const HOURS_SHOWN = END_HOUR - START_HOUR;
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type EventType = CalendarEventDTO["eventType"];

const EVENT_COLORS: Record<
  EventType,
  { bg: string; border: string; text: string; dot: string; icon: LucideIcon }
> = {
  MEETING: {
    bg: "bg-signal-500/15",
    border: "border-signal-500/40",
    text: "text-signal-200",
    dot: "bg-signal-500",
    icon: Video,
  },
  SITE_VISIT: {
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    text: "text-emerald-200",
    dot: "bg-emerald-500",
    icon: MapPin,
  },
  INSTALL: {
    bg: "bg-sky-500/15",
    border: "border-sky-500/40",
    text: "text-sky-200",
    dot: "bg-sky-500",
    icon: Wrench,
  },
  AMC_VISIT: {
    bg: "bg-violet-500/15",
    border: "border-violet-500/40",
    text: "text-violet-200",
    dot: "bg-violet-500",
    icon: ShieldCheck,
  },
  TASK: {
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    text: "text-amber-200",
    dot: "bg-amber-500",
    icon: ListChecks,
  },
};

const TYPE_LABEL: Record<EventType, string> = {
  MEETING: "Meeting",
  SITE_VISIT: "Site visit",
  INSTALL: "Install",
  AMC_VISIT: "AMC visit",
  TASK: "Task",
};

// ─── helpers ─────────────────────────────────────────────────────────────
function startOfWeek(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

function addDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + days);
  return x;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function fmtMonthRange(start: Date): string {
  const end = addDays(start, 6);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (start.getMonth() === end.getMonth()) {
    return `${start.toLocaleDateString("en-US", { month: "long" })} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}, ${end.getFullYear()}`;
}

function minutesFromMidnight(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

function snap(minutes: number): number {
  return Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES;
}

function dayIndexOf(iso: string, weekStart: Date): number {
  const d = new Date(iso);
  return Math.floor((d.getTime() - weekStart.getTime()) / (24 * 3600_000));
}

function setDayAndMinutes(weekStart: Date, dayIdx: number, minutes: number): Date {
  const d = addDays(weekStart, dayIdx);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

function timeLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12} ${period}` : `${h12}:${m.toString().padStart(2, "0")} ${period}`;
}

// ─── component ───────────────────────────────────────────────────────────
type DragState =
  | { kind: "move"; id: string; startMin: number; endMin: number; dayIdx: number; pointerY: number; pointerX: number; originDayIdx: number; originStartMin: number }
  | { kind: "resize"; id: string; startMin: number; endMin: number; dayIdx: number; pointerY: number }
  | null;

export function CalendarWeekView({ initialEvents }: { initialEvents: CalendarEventDTO[] }) {
  const router = useRouter();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [events, setEvents] = useState<CalendarEventDTO[]>(initialEvents);
  const [drag, setDrag] = useState<DragState>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [creating, setCreating] = useState<{ dayIdx: number; startMin: number; endMin: number; title: string } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const now = useNow();

  // Sync incoming events when the parent re-fetches (different week, server mutation)
  useEffect(() => {
    setEvents(initialEvents);
  }, [initialEvents]);

  const today = new Date();
  const todayDayIdx = isSameDay(today, weekStart) || (today >= weekStart && today < addDays(weekStart, 7))
    ? Math.floor((today.getTime() - weekStart.getTime()) / 86_400_000)
    : -1;

  const columns = useMemo(() => {
    // Group events by day index, with overlap-aware lane assignment
    const byDay: { dayIdx: number; events: { e: CalendarEventDTO; lane: number; lanes: number }[] }[] = [];
    for (let d = 0; d < 7; d++) {
      const dayEvents = events
        .filter((e) => dayIndexOf(e.startsAt, weekStart) === d)
        .sort((a, b) => +new Date(a.startsAt) - +new Date(b.startsAt));

      // Assign lanes for overlap
      const lanes: { e: CalendarEventDTO; lane: number; lanes: number; endMin: number }[] = [];
      for (const e of dayEvents) {
        const startMin = minutesFromMidnight(e.startsAt);
        const endMin = minutesFromMidnight(e.endsAt);
        const activeLanes = lanes.filter((x) => x.endMin > startMin);
        const usedLanes = new Set(activeLanes.map((x) => x.lane));
        let lane = 0;
        while (usedLanes.has(lane)) lane++;
        lanes.push({ e, lane, lanes: 0, endMin });
      }
      // Compute lane count for each event
      lanes.forEach((item, i) => {
        const startMin = minutesFromMidnight(item.e.startsAt);
        const endMin = minutesFromMidnight(item.e.endsAt);
        const concurrent = lanes.filter((x, j) => {
          if (i === j) return true;
          const xStart = minutesFromMidnight(x.e.startsAt);
          const xEnd = minutesFromMidnight(x.e.endsAt);
          return xStart < endMin && xEnd > startMin;
        });
        item.lanes = Math.max(...concurrent.map((c) => c.lane + 1), 1);
      });
      byDay.push({ dayIdx: d, events: lanes });
    }
    return byDay;
  }, [events, weekStart]);

  function navigate(delta: number) {
    setWeekStart((w) => addDays(w, delta * 7));
  }
  function goToday() {
    setWeekStart(startOfWeek(new Date()));
  }

  // Begin moving an event
  function startMove(e: React.PointerEvent, ev: CalendarEventDTO) {
    e.stopPropagation();
    e.preventDefault();
    const startMin = minutesFromMidnight(ev.startsAt);
    const endMin = minutesFromMidnight(ev.endsAt);
    setDrag({
      kind: "move",
      id: ev.id,
      startMin,
      endMin,
      dayIdx: dayIndexOf(ev.startsAt, weekStart),
      originDayIdx: dayIndexOf(ev.startsAt, weekStart),
      originStartMin: startMin,
      pointerY: e.clientY,
      pointerX: e.clientX,
    });
    setSelectedId(ev.id);
  }

  function startResize(e: React.PointerEvent, ev: CalendarEventDTO) {
    e.stopPropagation();
    e.preventDefault();
    setDrag({
      kind: "resize",
      id: ev.id,
      startMin: minutesFromMidnight(ev.startsAt),
      endMin: minutesFromMidnight(ev.endsAt),
      dayIdx: dayIndexOf(ev.startsAt, weekStart),
      pointerY: e.clientY,
    });
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const colWidth = (rect.width - 64) / 7; // 64px gutter

    if (drag.kind === "move") {
      const dy = e.clientY - drag.pointerY;
      const dx = e.clientX - drag.pointerX;
      const minutesDelta = snap((dy / HOUR_HEIGHT) * 60);
      const colDelta = Math.round(dx / colWidth);
      const duration = drag.endMin - drag.startMin;
      const newStartMin = clamp(snap(drag.originStartMin) + minutesDelta, START_HOUR * 60, END_HOUR * 60 - duration);
      const newDay = clamp(drag.originDayIdx + colDelta, 0, 6);
      setEvents((arr) =>
        arr.map((x) =>
          x.id === drag.id
            ? {
                ...x,
                startsAt: setDayAndMinutes(weekStart, newDay, newStartMin).toISOString(),
                endsAt: setDayAndMinutes(weekStart, newDay, newStartMin + duration).toISOString(),
              }
            : x
        )
      );
    } else if (drag.kind === "resize") {
      const dy = e.clientY - drag.pointerY;
      const minutesDelta = snap((dy / HOUR_HEIGHT) * 60);
      const newEndMin = clamp(drag.endMin + minutesDelta, drag.startMin + SLOT_MINUTES, END_HOUR * 60);
      setEvents((arr) =>
        arr.map((x) =>
          x.id === drag.id
            ? { ...x, endsAt: setDayAndMinutes(weekStart, drag.dayIdx, newEndMin).toISOString() }
            : x
        )
      );
    }
  }

  function onPointerUp() {
    if (!drag) return;
    const ev = events.find((x) => x.id === drag.id);
    setDrag(null);
    if (!ev) return;
    startTransition(async () => {
      try {
        if (drag.kind === "move") {
          await moveCalendarEvent({ id: ev.id, startsAt: ev.startsAt, endsAt: ev.endsAt });
          toast.success("Event moved", { description: ev.title });
        } else if (drag.kind === "resize") {
          await resizeCalendarEvent({ id: ev.id, endsAt: ev.endsAt });
          toast.success("Event resized", { description: ev.title });
        }
        router.refresh();
      } catch (e) {
        toast.error("Couldn't update event", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  // Click an empty cell to start creating
  function onDayClick(dayIdx: number, e: React.MouseEvent<HTMLDivElement>) {
    if (drag) return;
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const minute = snap((offsetY / HOUR_HEIGHT) * 60 + START_HOUR * 60);
    setCreating({
      dayIdx,
      startMin: clamp(minute, START_HOUR * 60, END_HOUR * 60 - 60),
      endMin: clamp(minute + 60, START_HOUR * 60 + 60, END_HOUR * 60),
      title: "",
    });
  }

  async function commitCreate() {
    if (!creating || !creating.title.trim()) {
      setCreating(null);
      return;
    }
    const startsAt = setDayAndMinutes(weekStart, creating.dayIdx, creating.startMin).toISOString();
    const endsAt = setDayAndMinutes(weekStart, creating.dayIdx, creating.endMin).toISOString();
    setCreating(null);
    try {
      await createCalendarEvent({
        title: creating.title.trim(),
        startsAt,
        endsAt,
        eventType: "MEETING",
      });
      toast.success("Event created", { description: creating.title });
      router.refresh();
    } catch (e) {
      toast.error("Couldn't create event", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  async function removeSelected() {
    if (!selectedId) return;
    const ev = events.find((e) => e.id === selectedId);
    if (!ev) return;
    setSelectedId(null);
    setEvents((arr) => arr.filter((e) => e.id !== ev.id));
    try {
      await deleteCalendarEvent(ev.id);
      toast.success("Event deleted");
      router.refresh();
    } catch (e) {
      toast.error("Couldn't delete event", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    }
  }

  // Keyboard: Esc cancels creation/selection, Delete removes selected
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCreating(null);
        setSelectedId(null);
      }
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId) {
        // Don't intercept when typing in inputs
        if (e.target instanceof HTMLElement && /input|textarea/i.test(e.target.tagName)) return;
        removeSelected();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return (
    <div className="rounded-2xl glass-card overflow-hidden" onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerLeave={onPointerUp}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <button
            onClick={goToday}
            className="px-3 h-8 rounded-lg border border-white/[0.08] bg-white/[0.02] text-sm hover:bg-white/[0.05] transition-colors"
          >
            Today
          </button>
          <div className="flex items-center rounded-lg border border-white/[0.08] bg-white/[0.02] overflow-hidden">
            <button
              onClick={() => navigate(-1)}
              className="h-8 w-8 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05] transition-colors"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate(1)}
              className="h-8 w-8 flex items-center justify-center text-white/65 hover:text-white hover:bg-white/[0.05] transition-colors border-l border-white/[0.06]"
              aria-label="Next week"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="ml-2 font-display text-base font-semibold tracking-tight">
            {fmtMonthRange(weekStart)}
          </div>
        </div>

        <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider text-white/45">
          {Object.entries(EVENT_COLORS).map(([k, v]) => (
            <div key={k} className="flex items-center gap-1.5">
              <span className={cn("h-1.5 w-1.5 rounded-full", v.dot)} />
              {TYPE_LABEL[k as EventType]}
            </div>
          ))}
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-white/[0.04] bg-ink-200/40">
        <div />
        {Array.from({ length: 7 }).map((_, i) => {
          const day = addDays(weekStart, i);
          const isToday = isSameDay(day, today);
          return (
            <div key={i} className="px-3 py-3">
              <div className="text-[10px] uppercase tracking-wider text-white/40">{DAY_NAMES[day.getDay()]}</div>
              <div
                className={cn(
                  "mt-0.5 font-display text-2xl font-semibold tracking-tight",
                  isToday ? "text-signal-400" : "text-white"
                )}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid */}
      <div ref={gridRef} className="grid grid-cols-[64px_repeat(7,1fr)] relative select-none">
        {/* Hour labels */}
        <div className="border-r border-white/[0.04]">
          {Array.from({ length: HOURS_SHOWN }).map((_, i) => {
            const hour = START_HOUR + i;
            return (
              <div
                key={i}
                style={{ height: HOUR_HEIGHT }}
                className="text-[10px] text-white/35 font-mono px-2 pt-1.5 text-right"
              >
                {timeLabel(hour * 60)}
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        {columns.map(({ dayIdx, events: dayEvents }) => (
          <div
            key={dayIdx}
            className="relative border-r border-white/[0.04] last:border-r-0 cursor-cell"
            onClick={(e) => onDayClick(dayIdx, e)}
          >
            {/* Hour rows */}
            {Array.from({ length: HOURS_SHOWN }).map((_, i) => (
              <div
                key={i}
                style={{ height: HOUR_HEIGHT }}
                className="border-b border-white/[0.03] last:border-b-0 hover:bg-white/[0.01] transition-colors"
              />
            ))}

            {/* Current-time indicator */}
            {todayDayIdx === dayIdx && (
              <NowIndicator now={now} />
            )}

            {/* Events */}
            <AnimatePresence>
              {dayEvents.map(({ e: ev, lane, lanes }) => {
                const startMin = minutesFromMidnight(ev.startsAt);
                const endMin = minutesFromMidnight(ev.endsAt);
                const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
                const height = ((endMin - startMin) / 60) * HOUR_HEIGHT - 2;
                const widthPct = 100 / lanes;
                const leftPct = lane * widthPct;
                const style = EVENT_COLORS[ev.eventType];
                const Icon = style.icon;
                const isSelected = selectedId === ev.id;
                const isDragging = drag?.id === ev.id;

                return (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(ev.id);
                    }}
                    onPointerDown={(e) => startMove(e, ev)}
                    style={{
                      position: "absolute",
                      top,
                      height: Math.max(height, 22),
                      left: `calc(${leftPct}% + 2px)`,
                      width: `calc(${widthPct}% - 4px)`,
                      zIndex: isDragging ? 30 : isSelected ? 20 : 10,
                    }}
                    className={cn(
                      "group rounded-lg border backdrop-blur px-2.5 py-1.5 text-left cursor-grab active:cursor-grabbing transition-shadow",
                      style.bg,
                      style.border,
                      style.text,
                      isSelected && "ring-2 ring-white/40 shadow-soft",
                      isDragging && "ring-2 ring-signal-400/80 shadow-glow-sm"
                    )}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Icon className="h-2.5 w-2.5 opacity-80 shrink-0" />
                      <span className="text-[10px] font-mono opacity-70">
                        {timeLabel(startMin)}
                      </span>
                    </div>
                    <div className="text-[11px] font-semibold leading-tight line-clamp-2">{ev.title}</div>
                    {height > 50 && (ev.location || ev.userName) && (
                      <div className="text-[10px] opacity-70 mt-1 truncate">
                        {ev.userName ?? ""}
                        {ev.userName && ev.location ? " · " : ""}
                        {ev.location ?? ""}
                      </div>
                    )}
                    {/* Resize handle */}
                    <div
                      onPointerDown={(e) => startResize(e, ev)}
                      className="absolute left-0 right-0 bottom-0 h-1.5 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <div className="mx-auto w-8 h-0.5 mt-0.5 rounded-full bg-white/30" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Inline create */}
            {creating && creating.dayIdx === dayIdx && (
              <CreateBubble
                creating={creating}
                onChange={(title) => setCreating({ ...creating, title })}
                onCommit={commitCreate}
                onCancel={() => setCreating(null)}
              />
            )}
          </div>
        ))}
      </div>

      {/* Stats footer */}
      <div className="grid grid-cols-3 gap-px bg-white/[0.04] border-t border-white/[0.06]">
        <Stat label="Events this week" value={events.length} />
        <Stat label="Total scheduled hours" value={(events.reduce((s, e) => s + (+new Date(e.endsAt) - +new Date(e.startsAt)), 0) / 3600_000).toFixed(1) + "h"} />
        <Stat label="On-site visits" value={events.filter((e) => e.eventType === "SITE_VISIT" || e.eventType === "INSTALL" || e.eventType === "AMC_VISIT").length} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-ink-200/30 px-5 py-3">
      <div className="text-[10px] uppercase tracking-wider text-white/45">{label}</div>
      <div className="font-display text-xl font-semibold tracking-tight mt-0.5">{value}</div>
    </div>
  );
}

function NowIndicator({ now }: { now: Date }) {
  const minutes = now.getHours() * 60 + now.getMinutes();
  if (minutes < START_HOUR * 60 || minutes > END_HOUR * 60) return null;
  const top = ((minutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top }}>
      <div className="flex items-center">
        <div className="h-2 w-2 rounded-full bg-signal-500 shadow-glow-sm -ml-1" />
        <div className="flex-1 h-px bg-signal-500" />
      </div>
    </div>
  );
}

function CreateBubble({
  creating,
  onChange,
  onCommit,
  onCancel,
}: {
  creating: { dayIdx: number; startMin: number; endMin: number; title: string };
  onChange: (title: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  const top = ((creating.startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT;
  const height = ((creating.endMin - creating.startMin) / 60) * HOUR_HEIGHT - 2;
  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{ position: "absolute", top, height, left: 2, right: 2, zIndex: 30 }}
      className="rounded-lg border border-signal-500/60 bg-signal-500/15 backdrop-blur px-2.5 py-1.5 shadow-glow-sm"
    >
      <div className="text-[10px] font-mono opacity-70 mb-1">
        {timeLabel(creating.startMin)} – {timeLabel(creating.endMin)}
      </div>
      <input
        autoFocus
        value={creating.title}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={onCommit}
        placeholder="New event…"
        className="w-full bg-transparent border-0 outline-none text-[11px] font-semibold text-white placeholder:text-white/35"
      />
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);
  return now;
}
