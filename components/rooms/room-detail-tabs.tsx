"use client";

import { useState } from "react";
import { Box, ListChecks, Layers3, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatCompact } from "@/lib/utils";
import { Room3DView } from "./room-3d-view";
import { AddDevicePicker, type CatalogPickItem } from "./add-device-picker";
import { GenerateButton } from "@/components/ai/generate-button";
import type { SceneDevice } from "./room-3d-scene";

type Tab = "3d" | "devices" | "boq";

export function RoomDetailTabs({
  roomId,
  roomName,
  roomType,
  capacity,
  hasProject,
  devices,
  deviceRows,
  boqRows,
  persistedLength,
  persistedWidth,
  persistedHeight,
  catalog,
}: {
  roomId: string;
  roomName: string;
  roomType: string;
  capacity: number | null;
  hasProject: boolean;
  devices: SceneDevice[];
  deviceRows: {
    id: string;
    serial: string | null;
    ip: string | null;
    firmware: string | null;
    status: string;
    catalog: { id: string; name: string; brand: string; sku: string; category: string } | null;
  }[];
  boqRows: {
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    catalog: { id: string; name: string; brand: string; sku: string; category: string } | null;
  }[];
  persistedLength: number | null;
  persistedWidth: number | null;
  persistedHeight: number | null;
  catalog: CatalogPickItem[];
}) {
  const [tab, setTab] = useState<Tab>("3d");
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center justify-between border-b border-bone-300/55 mb-4">
        <div className="flex items-center gap-1">
          {([
            { id: "3d",      label: "3D View",   icon: Box },
            { id: "devices", label: "Devices",   icon: Layers3 },
            { id: "boq",     label: "BOQ",       icon: ListChecks },
          ] as { id: Tab; label: string; icon: typeof Box }[]).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative inline-flex items-center gap-1.5 h-9 px-3 text-[12.5px] font-medium transition-colors",
                  tab === t.id ? "text-ink-300" : "text-ink-300/55 hover:text-ink-300"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
                {tab === t.id && (
                  <span className="absolute -bottom-px left-2 right-2 h-0.5 rounded-full bg-ink-300" />
                )}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          {hasProject && (
            <Button size="sm" variant="secondary" onClick={() => setPickerOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Add from catalog
            </Button>
          )}
          {/* AI generate for this room */}
          <GenerateButton
            entityId={roomId}
            entityLabel={roomName}
            sourceLabel={`${roomType.toLowerCase()}${capacity ? ` · ${capacity} seats` : ""}`}
            size="sm"
            options={[
              {
                kind: "room-boq-suggested",
                label: "Suggest BOQ",
                description: "Generate the equipment list for this room",
              },
            ]}
          />
        </div>
      </div>

      {tab === "3d" && (
        <Room3DView
          roomId={roomId}
          roomName={roomName}
          roomType={roomType}
          capacity={capacity}
          devices={devices}
          persistedLength={persistedLength}
          persistedWidth={persistedWidth}
          persistedHeight={persistedHeight}
        />
      )}

      {tab === "devices" && <DevicesTable rows={deviceRows} />}
      {tab === "boq" && <BOQTable rows={boqRows} />}

      <AddDevicePicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        roomId={roomId}
        roomName={roomName}
        catalog={catalog}
      />
    </div>
  );
}

function DevicesTable({
  rows,
}: {
  rows: {
    id: string;
    serial: string | null;
    ip: string | null;
    firmware: string | null;
    status: string;
    catalog: { id: string; name: string; brand: string; sku: string; category: string } | null;
  }[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center">
        <p className="text-[13px] text-ink-300/65">No devices placed in this room yet.</p>
        <p className="text-[12px] text-ink-300/45 mt-1">
          Add equipment from the project BOQ → assign to room.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-bone-300/55 bg-bone-50/60 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
            <th className="text-left px-4 py-2">Device</th>
            <th className="text-left px-4 py-2">Category</th>
            <th className="text-left px-4 py-2">Serial</th>
            <th className="text-left px-4 py-2">IP</th>
            <th className="text-left px-4 py-2">Firmware</th>
            <th className="text-left px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-bone-300/35 hover:bg-bone-50">
              <td className="px-4 py-2 text-ink-300 font-medium">
                {r.catalog?.name ?? "Device"}
                <span className="text-ink-300/45 font-mono ml-2">{r.catalog?.brand}</span>
              </td>
              <td className="px-4 py-2 text-ink-300/65">{r.catalog?.category ?? "—"}</td>
              <td className="px-4 py-2 font-mono text-ink-300/65">{r.serial ?? "—"}</td>
              <td className="px-4 py-2 font-mono text-ink-300/65">{r.ip ?? "—"}</td>
              <td className="px-4 py-2 font-mono text-ink-300/65">{r.firmware ?? "—"}</td>
              <td className="px-4 py-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-md px-2 py-0.5 text-[11px]",
                    r.status === "ONLINE" && "pill-success",
                    r.status === "WARNING" && "pill-warning",
                    r.status === "OFFLINE" && "pill-danger",
                    r.status === "RETIRED" && "pill-neutral"
                  )}
                >
                  {r.status.toLowerCase()}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BOQTable({
  rows,
}: {
  rows: {
    id: string;
    description: string;
    quantity: number;
    unitPriceCents: number;
    catalog: { id: string; name: string; brand: string; sku: string; category: string } | null;
  }[];
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center">
        <p className="text-[13px] text-ink-300/65">No BOQ items for this room yet.</p>
        <p className="text-[12px] text-ink-300/45 mt-1">
          Click <span className="font-medium text-ink-300">Suggest BOQ</span> above to draft one with AI.
        </p>
      </div>
    );
  }
  const total = rows.reduce((s, r) => s + r.quantity * r.unitPriceCents, 0);
  return (
    <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
      <table className="w-full text-[12.5px]">
        <thead>
          <tr className="border-b border-bone-300/55 bg-bone-50/60 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
            <th className="text-left px-4 py-2">Item</th>
            <th className="text-left px-4 py-2">Brand</th>
            <th className="text-right px-4 py-2 w-[60px]">Qty</th>
            <th className="text-right px-4 py-2 w-[110px]">Unit</th>
            <th className="text-right px-4 py-2 w-[110px]">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-bone-300/35 hover:bg-bone-50">
              <td className="px-4 py-2 text-ink-300">
                <div className="font-medium">{r.catalog?.name ?? r.description}</div>
                <div className="text-[11px] text-ink-300/55 mt-0.5">
                  {r.catalog?.sku ?? r.description}
                </div>
              </td>
              <td className="px-4 py-2 text-ink-300/65">{r.catalog?.brand ?? "—"}</td>
              <td className="px-4 py-2 text-right font-mono text-ink-300">{r.quantity}</td>
              <td className="px-4 py-2 text-right font-mono text-ink-300/65">
                ${formatCompact(r.unitPriceCents / 100)}
              </td>
              <td className="px-4 py-2 text-right font-mono text-ink-300 font-medium">
                ${formatCompact((r.quantity * r.unitPriceCents) / 100)}
              </td>
            </tr>
          ))}
          <tr className="bg-bone-50/60">
            <td colSpan={4} className="px-4 py-2 text-right text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
              Room total
            </td>
            <td className="px-4 py-2 text-right font-display text-heading-sm text-ink-300">
              ${formatCompact(total / 100)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
