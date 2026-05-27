"use client";

import dynamic from "next/dynamic";
import { useState, useTransition } from "react";
import { Box, Maximize2, RotateCcw, Eye, EyeOff, Save, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { inferRoomDimensions } from "@/lib/av/placement";
import { saveRoomDimensions, resetRoomDimensions } from "@/app/actions/rooms";
import type { SceneDevice, CameraPreset } from "./room-3d-scene";

/**
 * Three.js depends on `window` — load the scene client-only.
 * Loading state mirrors the final canvas dimensions to avoid layout shift.
 */
const Room3DScene = dynamic(() => import("./room-3d-scene").then((m) => m.Room3DScene), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-bone-100 text-[12px] text-ink-300/55">
      Loading 3D scene…
    </div>
  ),
});

export function Room3DView({
  roomId,
  roomName,
  roomType,
  capacity,
  devices,
  persistedLength,
  persistedWidth,
  persistedHeight,
}: {
  roomId: string;
  roomName: string;
  roomType: string;
  capacity: number | null;
  devices: SceneDevice[];
  persistedLength: number | null;
  persistedWidth: number | null;
  persistedHeight: number | null;
}) {
  const inferred = inferRoomDimensions(roomType, capacity);
  const [length, setLength] = useState(persistedLength ?? inferred.length);
  const [width, setWidth]   = useState(persistedWidth ?? inferred.width);
  const [height, setHeight] = useState(persistedHeight ?? inferred.height);
  const [preset, setPreset] = useState<CameraPreset>("iso");
  const [showLegend, setShowLegend] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [savePending, startSave] = useTransition();

  const persistedTuple = [persistedLength, persistedWidth, persistedHeight].join("|");
  const liveTuple = [length, width, height].join("|");
  const dirty = persistedTuple !== liveTuple;

  function resetToInferred() {
    setLength(inferred.length);
    setWidth(inferred.width);
    setHeight(inferred.height);
    if (persistedLength != null || persistedWidth != null || persistedHeight != null) {
      startSave(async () => {
        await resetRoomDimensions(roomId);
        toast.success("Dimensions reset", { description: "Now using inferred defaults." });
      });
    }
  }

  function handleSave() {
    startSave(async () => {
      const r = await saveRoomDimensions({ roomId, lengthM: length, widthM: width, heightM: height });
      if (r.ok) {
        toast.success("Dimensions saved", {
          description: `${length.toFixed(2)} × ${width.toFixed(2)} × ${height.toFixed(2)} m`,
        });
      }
    });
  }

  // Device summary grouped by placement
  const deviceSummary = devices.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden border border-bone-300/55 bg-white",
        fullscreen ? "fixed inset-3 z-[90]" : "min-h-[640px] h-[72vh]"
      )}
    >
      {/* 3D canvas */}
      <div className="absolute inset-0">
        <Room3DScene
          length={length}
          width={width}
          height={height}
          roomType={roomType}
          devices={devices}
          preset={preset}
        />
      </div>

      {/* Top-left — room title + camera presets */}
      <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
        <div className="rounded-md bg-white/90 backdrop-blur border border-bone-300/65 px-3 py-2">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
            3D view
          </div>
          <div className="text-[13px] font-semibold text-ink-300 leading-tight">{roomName}</div>
        </div>
        <div className="inline-flex items-center rounded-md bg-white/90 backdrop-blur border border-bone-300/65 p-0.5 gap-0.5 self-start">
          {(["iso", "top", "front"] as CameraPreset[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={cn(
                "h-7 px-2.5 rounded text-[11.5px] font-medium capitalize transition-colors",
                preset === p
                  ? "bg-ink-300 text-bone-100"
                  : "text-ink-300/65 hover:text-ink-300"
              )}
            >
              {p === "iso" ? "Iso" : p === "top" ? "Top" : "Front"}
            </button>
          ))}
        </div>
      </div>

      {/* Top-right — fullscreen + legend toggle */}
      <div className="absolute top-3 right-3 flex items-center gap-1 z-10">
        <button
          type="button"
          onClick={() => setShowLegend((v) => !v)}
          aria-label="Toggle legend"
          className="h-8 w-8 rounded-md bg-white/90 backdrop-blur border border-bone-300/65 text-ink-300/65 hover:text-ink-300 flex items-center justify-center"
        >
          {showLegend ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
        <button
          type="button"
          onClick={() => setFullscreen((v) => !v)}
          aria-label="Fullscreen"
          className="h-8 w-8 rounded-md bg-white/90 backdrop-blur border border-bone-300/65 text-ink-300/65 hover:text-ink-300 flex items-center justify-center"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bottom-left — dimension controls */}
      <div className="absolute bottom-3 left-3 rounded-md bg-white/90 backdrop-blur border border-bone-300/65 px-3 py-2.5 z-10 w-[300px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold flex items-center gap-1.5">
            <Box className="h-3 w-3" />
            Room dimensions
          </div>
          <button
            type="button"
            onClick={resetToInferred}
            disabled={savePending}
            className="text-[11px] text-ink-300/55 hover:text-ink-300 inline-flex items-center gap-0.5 disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" />
            Reset
          </button>
        </div>
        <DimensionSlider label="Length" value={length} min={2} max={20} step={0.25} unit="m" onChange={setLength} />
        <DimensionSlider label="Width"  value={width}  min={2} max={15} step={0.25} unit="m" onChange={setWidth} />
        <DimensionSlider label="Height" value={height} min={2.4} max={6} step={0.1} unit="m" onChange={setHeight} />
        <div className="mt-2 pt-2 border-t border-bone-300/45 flex items-center justify-between">
          <span className="text-[10.5px] text-ink-300/55">
            {dirty
              ? "Unsaved changes"
              : persistedLength != null
                ? "Saved"
                : "Inferred from room type"}
          </span>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || savePending}
            className={cn(
              "inline-flex items-center gap-1.5 h-6 px-2 rounded text-[11px] font-medium transition-colors",
              dirty
                ? "bg-ink-300 text-bone-100 hover:bg-ink-200"
                : "bg-bone-100 text-ink-300/45 cursor-not-allowed"
            )}
          >
            {dirty ? <Save className="h-3 w-3" /> : <Check className="h-3 w-3" />}
            {savePending ? "Saving…" : dirty ? "Save" : "Saved"}
          </button>
        </div>
      </div>

      {/* Bottom-right — device legend */}
      {showLegend && (
        <div className="absolute bottom-3 right-3 rounded-md bg-white/90 backdrop-blur border border-bone-300/65 px-3 py-2.5 z-10 w-[260px] max-h-[280px] overflow-y-auto">
          <div className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold mb-1.5">
            Devices · {devices.length}
          </div>
          {Object.keys(deviceSummary).length === 0 ? (
            <div className="text-[12px] text-ink-300/55">
              No devices placed. Add equipment from the project BOQ.
            </div>
          ) : (
            <ul className="space-y-0.5">
              {Object.entries(deviceSummary).map(([cat, count]) => (
                <li key={cat} className="flex items-center justify-between text-[11.5px]">
                  <span className="text-ink-300/85 truncate">{cat}</span>
                  <span className="font-mono text-ink-300/55">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Hint pill (centered above the dimensions card, hides on small viewports) */}
      <div className="absolute bottom-[155px] left-1/2 -translate-x-1/2 hidden xl:block pointer-events-none">
        <div className="rounded-full bg-ink-300/80 backdrop-blur text-bone-100 px-3 py-1 text-[10.5px] font-medium tracking-wide">
          drag · scroll = zoom · right-click = pan
        </div>
      </div>
    </div>
  );
}

function DimensionSlider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="mb-1.5 last:mb-0">
      <div className="flex items-center justify-between text-[11px] text-ink-300/75">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(value % 1 === 0 ? 0 : 2)}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 accent-ink-300"
      />
    </div>
  );
}
