"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, Grid, Html } from "@react-three/drei";
import * as THREE from "three";
import { Suspense, useMemo, useState } from "react";
import {
  CATEGORY_PLACEMENT,
  displaySizeMeters,
  hasConferenceTable,
  type PlacementSurface,
} from "@/lib/av/placement";
import type { AvCategory } from "@/lib/av/categories";

export type SceneDevice = {
  id: string;
  name: string;
  brand: string;
  sku: string;
  category: AvCategory;
  /** Optional explicit display diagonal in inches (parsed from name when not set). */
  displayInches?: number;
};

export type CameraPreset = "iso" | "top" | "front";

const PRESETS: Record<CameraPreset, [number, number, number]> = {
  iso:   [8, 6, 9],
  top:   [0, 14, 0.001],
  front: [0, 3, 10],
};

export function Room3DScene({
  length,
  width,
  height,
  roomType,
  devices,
  preset = "iso",
}: {
  length: number;
  width: number;
  height: number;
  roomType: string;
  devices: SceneDevice[];
  preset?: CameraPreset;
}) {
  // Sort + bucket devices by placement surface
  const byPlacement = useMemo(() => {
    const map: Partial<Record<PlacementSurface, SceneDevice[]>> = {};
    for (const d of devices) {
      const surface = CATEGORY_PLACEMENT[d.category] ?? "hidden";
      (map[surface] ??= []).push(d);
    }
    return map;
  }, [devices]);

  const camPos = PRESETS[preset];

  return (
    <Canvas
      shadows
      camera={{ position: camPos, fov: 45 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#F4F2EC" }}
    >
      <color attach="background" args={["#F4F2EC"]} />
      <fog attach="fog" args={["#F4F2EC", 25, 60]} />

      <Suspense fallback={<Html center>Loading…</Html>}>
        {/* Lights */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[length * 0.6, height * 2, width * 0.6]}
          intensity={0.7}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <directionalLight position={[-length, height * 1.5, -width]} intensity={0.2} />

        {/* Ground grid (outside the room) */}
        <Grid
          position={[0, -0.01, 0]}
          args={[60, 60]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#DDD6C8"
          sectionSize={5}
          sectionThickness={1}
          sectionColor="#A59986"
          fadeDistance={50}
          fadeStrength={1}
          infiniteGrid={false}
        />

        {/* Room shell */}
        <RoomShell length={length} width={width} height={height} />

        {/* Conference table + chairs */}
        {hasConferenceTable(roomType) && (
          <ConferenceTable length={length} width={width} roomType={roomType} />
        )}

        {/* Device meshes */}
        <Displays devices={byPlacement["wall-front"] ?? []} width={width} height={height} length={length} />
        <CeilingDevices devices={byPlacement["ceiling"] ?? []} length={length} width={width} height={height} />
        <Rack
          rackDevice={(byPlacement["floor-corner"] ?? []).find((d) => d.category === "Rack")}
          rackContents={byPlacement["in-rack"] ?? []}
          length={length}
          width={width}
        />
        <SubsAndCornerSpeakers
          devices={(byPlacement["floor-corner"] ?? []).filter((d) => d.category !== "Rack")}
          length={length}
          width={width}
        />
        <SurfaceSpeakers devices={byPlacement["wall-left"] ?? []} length={length} height={height} width={width} />
        <TableDevices devices={byPlacement["table"] ?? []} roomType={roomType} length={length} width={width} />

        <OrbitControls
          enableDamping
          dampingFactor={0.08}
          target={[0, height / 2 - 0.4, 0]}
          minDistance={2}
          maxDistance={40}
          maxPolarAngle={Math.PI / 2 - 0.05}
        />
        <Environment preset="city" environmentIntensity={0.35} />
      </Suspense>
    </Canvas>
  );
}

/* ─── Room shell ─── */
function RoomShell({ length, width, height }: { length: number; width: number; height: number }) {
  // Walls are double-sided box geometries — we drop the ceiling and front wall
  // tops so the interior is visible from the orbit camera.
  const WALL = "#FFFFFF";
  const FLOOR = "#EBE7DD";
  const TRIM = "#0A0A0A";

  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color={FLOOR} roughness={0.85} />
      </mesh>

      {/* Back wall (+Z) */}
      <mesh receiveShadow position={[0, height / 2, width / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={WALL} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* Front wall (-Z) */}
      <mesh receiveShadow position={[0, height / 2, -width / 2]}>
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial color={WALL} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* Left wall (-X) */}
      <mesh receiveShadow position={[-length / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={WALL} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>
      {/* Right wall (+X) */}
      <mesh receiveShadow position={[length / 2, height / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color={WALL} side={THREE.DoubleSide} roughness={0.9} />
      </mesh>

      {/* Floor trim line */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[length + 0.01, 0.1, 0.01]} />
        <meshBasicMaterial color={TRIM} />
      </mesh>

      {/* Door frame on back wall */}
      <mesh position={[length / 2 - 0.6, 1.05, width / 2 - 0.01]}>
        <boxGeometry args={[0.95, 2.1, 0.04]} />
        <meshStandardMaterial color="#574F43" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Conference table + chairs ─── */
function ConferenceTable({
  length,
  width,
  roomType,
}: {
  length: number;
  width: number;
  roomType: string;
}) {
  const tableLen = Math.min(length * 0.65, 5.5);
  const tableWid = Math.min(width * 0.45, 1.4);
  const chairs = roomType === "HUDDLE" ? 4 : roomType === "TRAINING" ? 0 : 8;

  // Distribute chairs around the table — half each long side
  const seats = [];
  if (chairs > 0) {
    const perSide = Math.ceil(chairs / 2);
    const spacing = tableLen / (perSide + 1);
    for (let i = 0; i < perSide; i++) {
      const x = -tableLen / 2 + spacing * (i + 1);
      seats.push({ pos: [x, 0, tableWid / 2 + 0.5] as [number, number, number] });
      seats.push({ pos: [x, 0, -tableWid / 2 - 0.5] as [number, number, number] });
    }
  }

  return (
    <group>
      {/* Table top */}
      <mesh castShadow receiveShadow position={[0, 0.74, 0]}>
        <boxGeometry args={[tableLen, 0.04, tableWid]} />
        <meshStandardMaterial color="#2B2018" roughness={0.55} metalness={0.05} />
      </mesh>
      {/* Table leg pedestals */}
      {[-tableLen / 3, tableLen / 3].map((x) => (
        <mesh key={x} castShadow position={[x, 0.36, 0]}>
          <cylinderGeometry args={[0.06, 0.1, 0.72, 12]} />
          <meshStandardMaterial color="#1A1A1D" />
        </mesh>
      ))}
      {seats.slice(0, chairs).map((s, i) => (
        <Chair key={i} position={s.pos} />
      ))}
    </group>
  );
}

function Chair({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.45, 0]}>
        <boxGeometry args={[0.45, 0.04, 0.42]} />
        <meshStandardMaterial color="#1A1A1D" />
      </mesh>
      <mesh castShadow position={[0, 0.8, -0.18]}>
        <boxGeometry args={[0.45, 0.6, 0.04]} />
        <meshStandardMaterial color="#1A1A1D" />
      </mesh>
      <mesh castShadow position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.45, 8]} />
        <meshStandardMaterial color="#5C5C60" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

/* ─── Displays (front wall, distributed) ─── */
function Displays({
  devices,
  width,
  height,
  length,
}: {
  devices: SceneDevice[];
  width: number;
  height: number;
  length: number;
}) {
  const screens = devices.filter((d) =>
    d.category.startsWith("Display") || d.category === "Conferencing - Video Bar"
  );
  const cameras = devices.filter((d) => d.category.startsWith("Camera"));

  if (screens.length === 0 && cameras.length === 0) return null;

  // Even spread along the front wall (along X)
  const cols = Math.min(screens.length, 3);
  const xSlots = cols === 0
    ? []
    : Array.from({ length: cols }, (_, i) => (i - (cols - 1) / 2) * (length / (cols + 1)) * 0.9);

  return (
    <group>
      {screens.slice(0, cols).map((d, i) => {
        const inches = parseDisplayInches(d) ?? 65;
        const { w, h } = displaySizeMeters(inches);
        const centerY = height * 0.55;
        return (
          <DeviceTooltipGroup key={d.id} device={d}>
            <mesh position={[xSlots[i], centerY, -width / 2 + 0.04]}>
              <boxGeometry args={[w + 0.06, h + 0.06, 0.05]} />
              <meshStandardMaterial color="#0A0A0A" />
            </mesh>
            <mesh position={[xSlots[i], centerY, -width / 2 + 0.07]}>
              <planeGeometry args={[w, h]} />
              <meshStandardMaterial color="#0F1116" emissive="#0F1116" emissiveIntensity={0.05} />
            </mesh>
          </DeviceTooltipGroup>
        );
      })}

      {/* Cameras mount centred above the array of displays */}
      {cameras.slice(0, 2).map((d, i) => (
        <DeviceTooltipGroup key={d.id} device={d}>
          <mesh position={[(i - 0.5) * 0.5, height * 0.85, -width / 2 + 0.12]} castShadow>
            <cylinderGeometry args={[0.06, 0.08, 0.18, 16]} />
            <meshStandardMaterial color="#1A1A1D" />
          </mesh>
        </DeviceTooltipGroup>
      ))}
    </group>
  );
}

/* ─── Ceiling devices (mics + speakers) ─── */
function CeilingDevices({
  devices,
  length,
  width,
  height,
}: {
  devices: SceneDevice[];
  length: number;
  width: number;
  height: number;
}) {
  const mics = devices.filter((d) => d.category.startsWith("Microphone"));
  const speakers = devices.filter((d) => d.category.startsWith("Speaker"));
  const projectors = devices.filter((d) => d.category === "Projector");

  return (
    <group>
      {/* Ceiling mics — distributed on a grid */}
      {mics.map((d, i) => {
        const { x, z } = gridPos(i, mics.length, length * 0.6, width * 0.5);
        return (
          <DeviceTooltipGroup key={d.id} device={d}>
            <mesh position={[x, height - 0.05, z]} rotation={[Math.PI / 2, 0, 0]}>
              <boxGeometry args={[0.6, 0.6, 0.04]} />
              <meshStandardMaterial color="#F4F2EC" roughness={0.4} />
            </mesh>
            <mesh position={[x, height - 0.07, z]}>
              <ringGeometry args={[0.18, 0.2, 32]} />
              <meshBasicMaterial color="#FF5A1F" />
            </mesh>
          </DeviceTooltipGroup>
        );
      })}

      {/* Ceiling speakers — distributed on a wider grid */}
      {speakers.map((d, i) => {
        const { x, z } = gridPos(i, speakers.length, length * 0.7, width * 0.6);
        return (
          <DeviceTooltipGroup key={d.id} device={d}>
            <mesh position={[x, height - 0.04, z]}>
              <cylinderGeometry args={[0.13, 0.13, 0.08, 32]} />
              <meshStandardMaterial color="#F4F2EC" />
            </mesh>
            <mesh position={[x, height - 0.08, z]}>
              <cylinderGeometry args={[0.06, 0.06, 0.02, 32]} />
              <meshStandardMaterial color="#1A1A1D" />
            </mesh>
          </DeviceTooltipGroup>
        );
      })}

      {/* Projectors — hung from ceiling */}
      {projectors.map((d, i) => (
        <DeviceTooltipGroup key={d.id} device={d}>
          <mesh position={[(i - projectors.length / 2 + 0.5) * 0.8, height - 0.4, -width / 2 + 2]} castShadow>
            <boxGeometry args={[0.6, 0.22, 0.45]} />
            <meshStandardMaterial color="#1A1A1D" />
          </mesh>
        </DeviceTooltipGroup>
      ))}
    </group>
  );
}

/* ─── Rack + in-rack devices ─── */
function Rack({
  rackDevice,
  rackContents,
  length,
  width,
}: {
  rackDevice: SceneDevice | undefined;
  rackContents: SceneDevice[];
  length: number;
  width: number;
}) {
  if (!rackDevice && rackContents.length === 0) return null;

  // Rack in the back-right corner
  const x = length / 2 - 0.5;
  const z = width / 2 - 0.5;
  const rackH = 2.1;
  const rackW = 0.6;
  const rackD = 0.6;

  // In-rack devices stack from bottom
  const slots = Math.min(rackContents.length, 12);
  const slotH = (rackH - 0.2) / 12;

  return (
    <group position={[x, 0, z]}>
      {/* Rack chassis */}
      <mesh castShadow position={[0, rackH / 2, 0]}>
        <boxGeometry args={[rackW, rackH, rackD]} />
        <meshStandardMaterial color="#1A1A1D" roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Rack front panel cutout */}
      <mesh position={[0, rackH / 2, -rackD / 2 - 0.001]}>
        <planeGeometry args={[rackW - 0.05, rackH - 0.1]} />
        <meshBasicMaterial color="#0A0A0A" />
      </mesh>

      {/* In-rack device fronts (with brand-coded colors) */}
      {rackContents.slice(0, slots).map((d, i) => (
        <DeviceTooltipGroup key={d.id} device={d}>
          <mesh position={[0, 0.1 + i * slotH + slotH / 2, -rackD / 2 - 0.002]}>
            <planeGeometry args={[rackW - 0.08, slotH * 0.85]} />
            <meshStandardMaterial color={brandColor(d.brand)} emissive={brandColor(d.brand)} emissiveIntensity={0.1} />
          </mesh>
          {/* Front-panel LED dot */}
          <mesh position={[rackW / 2 - 0.08, 0.1 + i * slotH + slotH / 2, -rackD / 2 - 0.005]}>
            <sphereGeometry args={[0.012, 8, 8]} />
            <meshBasicMaterial color="#11703A" />
          </mesh>
        </DeviceTooltipGroup>
      ))}

      {/* If the catalog has an explicit "Rack" entry, tag it */}
      {rackDevice && (
        <DeviceTooltipGroup device={rackDevice}>
          <mesh position={[0, rackH + 0.15, 0]}>
            <boxGeometry args={[rackW + 0.05, 0.03, rackD + 0.05]} />
            <meshStandardMaterial color="#0A0A0A" />
          </mesh>
        </DeviceTooltipGroup>
      )}
    </group>
  );
}

/* ─── Subs + corner devices ─── */
function SubsAndCornerSpeakers({
  devices,
  length,
  width,
}: {
  devices: SceneDevice[];
  length: number;
  width: number;
}) {
  return (
    <group>
      {devices.map((d, i) => {
        // Distribute into the 4 corners
        const corner = i % 4;
        const x = (corner === 0 || corner === 3 ? -1 : 1) * (length / 2 - 0.4);
        const z = (corner === 0 || corner === 1 ? -1 : 1) * (width / 2 - 0.4);
        return (
          <DeviceTooltipGroup key={d.id} device={d}>
            <mesh castShadow position={[x, 0.25, z]}>
              <boxGeometry args={[0.55, 0.5, 0.55]} />
              <meshStandardMaterial color="#1A1A1D" />
            </mesh>
          </DeviceTooltipGroup>
        );
      })}
    </group>
  );
}

/* ─── Surface (side wall) speakers ─── */
function SurfaceSpeakers({
  devices,
  length,
  height,
  width,
}: {
  devices: SceneDevice[];
  length: number;
  height: number;
  width: number;
}) {
  const half = Math.ceil(devices.length / 2);
  return (
    <group>
      {devices.map((d, i) => {
        // Alternate left/right walls, distribute along length
        const side = i < half ? -1 : 1;
        const idx = i % half;
        const z = (idx - (half - 1) / 2) * (length / (half + 1)) * 0.9;
        return (
          <DeviceTooltipGroup key={d.id} device={d}>
            <mesh castShadow position={[side * (width / 2 - 0.06), height * 0.65, z]}
                  rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
              <boxGeometry args={[0.22, 0.32, 0.18]} />
              <meshStandardMaterial color="#0A0A0A" />
            </mesh>
          </DeviceTooltipGroup>
        );
      })}
    </group>
  );
}

/* ─── Table devices (touch panels, wireless mics) ─── */
function TableDevices({
  devices,
  roomType,
  length,
  width,
}: {
  devices: SceneDevice[];
  roomType: string;
  length: number;
  width: number;
}) {
  if (!hasConferenceTable(roomType)) return null;
  const tableLen = Math.min(length * 0.65, 5.5);
  return (
    <group>
      {devices.slice(0, 3).map((d, i) => {
        const x = (i - 1) * (tableLen / 4);
        const isTouch = d.category === "Control - Touch Panel";
        return (
          <DeviceTooltipGroup key={d.id} device={d}>
            <mesh castShadow position={[x, 0.78, 0]}>
              <boxGeometry args={isTouch ? [0.28, 0.04, 0.18] : [0.12, 0.06, 0.12]} />
              <meshStandardMaterial color="#1A1A1D" />
            </mesh>
            {isTouch && (
              <mesh position={[x, 0.81, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.24, 0.14]} />
                <meshBasicMaterial color="#FF5A1F" />
              </mesh>
            )}
          </DeviceTooltipGroup>
        );
      })}
    </group>
  );
}

/* ─── Tooltip helper ─── */
function DeviceTooltipGroup({
  device,
  children,
}: {
  device: SceneDevice;
  children: React.ReactNode;
}) {
  const [hover, setHover] = useState(false);
  return (
    <group
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "default";
      }}
    >
      {children}
      {hover && (
        <Html
          position={[0, 0, 0]}
          center
          distanceFactor={8}
          occlude={false}
          style={{ pointerEvents: "none" }}
        >
          <div className="bg-ink-300 text-bone-100 rounded-md px-2 py-1 text-[10px] font-medium whitespace-nowrap shadow-lg">
            {device.brand} · {device.name}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── Helpers ─── */

function gridPos(i: number, total: number, areaL: number, areaW: number) {
  if (total === 1) return { x: 0, z: 0 };
  const cols = Math.ceil(Math.sqrt(total * (areaL / areaW)));
  const rows = Math.ceil(total / cols);
  const col = i % cols;
  const row = Math.floor(i / cols);
  const xSpacing = areaL / (cols + 1);
  const zSpacing = areaW / (rows + 1);
  return {
    x: -areaL / 2 + xSpacing * (col + 1),
    z: -areaW / 2 + zSpacing * (row + 1),
  };
}

function parseDisplayInches(device: SceneDevice): number | null {
  if (device.displayInches) return device.displayInches;
  const m = device.name.match(/(\d{2,3})\s*["”]/);
  if (m) return parseInt(m[1], 10);
  const m2 = device.sku.match(/(\d{2,3})/);
  if (m2) {
    const n = parseInt(m2[1], 10);
    if (n >= 32 && n <= 110) return n;
  }
  return null;
}

function brandColor(brand: string): string {
  const map: Record<string, string> = {
    Crestron:           "#21364B",
    Extron:             "#222428",
    "Q-SYS":            "#1A2733",
    QSC:                "#1A2733",
    Biamp:              "#1F2D3A",
    Shure:              "#1A1A1D",
    Sennheiser:         "#0A0A0A",
    Yamaha:             "#3D0F11",
    Bose:               "#1A1A1D",
    "Middle Atlantic":  "#0A0A0A",
    APC:                "#1F2A1F",
    Furman:             "#1A1A1D",
    NETGEAR:            "#1F2A33",
    Cisco:              "#1B1F4A",
  };
  return map[brand] ?? "#1A1A1D";
}
