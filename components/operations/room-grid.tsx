"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { RoomHealth } from "@/lib/data/operations";

const healthTone = (score: number) => {
  if (score >= 90) return { border: "border-status-success-fg/30", dot: "bg-status-success-fg" };
  if (score >= 70) return { border: "border-status-warning-fg/30", dot: "bg-status-warning-fg" };
  return { border: "border-status-danger-fg/35", dot: "bg-status-danger-fg" };
};

export function RoomGrid({ rooms }: { rooms: RoomHealth[] }) {
  if (rooms.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center">
        <p className="text-[13px] text-ink-300/65">No rooms configured.</p>
        <p className="text-[12px] text-ink-300/45 mt-1">
          Add rooms to your projects to start monitoring.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {rooms.map((r) => {
        const tone = healthTone(r.healthScore);
        return (
          <Link
            key={r.id}
            href={`/rooms?room=${r.id}`}
            className={cn(
              "group rounded-lg bg-white border p-4 transition-all hover:-translate-y-px hover:shadow-[0_8px_22px_-12px_rgba(10,10,10,0.18)]",
              tone.border
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-ink-300 truncate">{r.name}</div>
                <div className="text-[11px] text-ink-300/55 truncate mt-0.5">
                  {r.account ?? "—"} · {r.roomType.toLowerCase()}
                </div>
              </div>
              <span className={cn("h-2 w-2 rounded-full shrink-0 mt-1.5", tone.dot)} />
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <div className="text-display-lg font-display tracking-tight text-ink-300 leading-none">
                {r.healthScore}
              </div>
              <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
                health
              </span>
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1 text-[10.5px] font-mono">
              <DotStat color="bg-status-success-fg" value={r.online} label="on" />
              <DotStat color="bg-status-warning-fg" value={r.warning} label="warn" />
              <DotStat color="bg-status-danger-fg" value={r.offline} label="off" />
            </div>

            <div className="mt-3 pt-3 border-t border-bone-300/45 text-[11px] text-ink-300/55 truncate">
              {r.topAlert ?? `${r.deviceCount} devices · all clear`}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function DotStat({ color, value, label }: { color: string; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1">
      <span className={cn("h-1.5 w-1.5 rounded-full", color)} />
      <span className="text-ink-300">{value}</span>
      <span className="text-ink-300/45">{label}</span>
    </div>
  );
}
