"use client";

import { useState } from "react";
import { OpsFrame, type OpsView } from "./ops-frame";
import { RoomGrid } from "./room-grid";
import type { RoomHealth } from "@/lib/data/operations";

/**
 * Client wrapper — owns the view state so it can be flipped without a route
 * change. Map view is stubbed for now (heavy: needs Mapbox setup) and falls
 * back to the grid.
 */
export function OpsShell({ rooms }: { rooms: RoomHealth[] }) {
  const [view, setView] = useState<OpsView>("grid");

  return (
    <OpsFrame view={view} onViewChange={setView}>
      {view === "grid" && <RoomGrid rooms={rooms} />}
      {view === "list" && <RoomListView rooms={rooms} />}
      {view === "map" && (
        <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center">
          <p className="text-[13px] text-ink-300/65">Map view requires Mapbox connection.</p>
          <p className="text-[12px] text-ink-300/45 mt-1">
            Add <span className="font-mono">NEXT_PUBLIC_MAPBOX_TOKEN</span> to enable geographic monitoring.
          </p>
        </div>
      )}
    </OpsFrame>
  );
}

function RoomListView({ rooms }: { rooms: RoomHealth[] }) {
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-bone-300/55 bg-bone-50/60">
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Room
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Account
            </th>
            <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Type
            </th>
            <th className="text-right px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Devices
            </th>
            <th className="text-right px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Online
            </th>
            <th className="text-right px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Warning
            </th>
            <th className="text-right px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Offline
            </th>
            <th className="text-right px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Health
            </th>
          </tr>
        </thead>
        <tbody>
          {rooms.map((r) => (
            <tr key={r.id} className="border-b border-bone-300/35 hover:bg-bone-50 cursor-pointer">
              <td className="px-4 py-2 text-ink-300 font-medium">{r.name}</td>
              <td className="px-4 py-2 text-ink-300/75">{r.account ?? "—"}</td>
              <td className="px-4 py-2 text-ink-300/65 text-[11.5px] uppercase tracking-wider">
                {r.roomType.toLowerCase()}
              </td>
              <td className="px-4 py-2 text-right font-mono">{r.deviceCount}</td>
              <td className="px-4 py-2 text-right font-mono text-status-success-fg">{r.online}</td>
              <td className="px-4 py-2 text-right font-mono text-status-warning-fg">{r.warning}</td>
              <td className="px-4 py-2 text-right font-mono text-status-danger-fg">{r.offline}</td>
              <td className="px-4 py-2 text-right font-mono">{r.healthScore}</td>
            </tr>
          ))}
          {rooms.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-[12.5px] text-ink-300/55">
                No rooms configured.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
