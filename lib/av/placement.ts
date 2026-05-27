import type { AvCategory } from "./categories";

/** Where a device of a given category renders in the 3D room. */
export type PlacementSurface =
  | "wall-front"
  | "wall-back"
  | "wall-left"
  | "wall-right"
  | "ceiling"
  | "floor-corner"
  | "floor-edge"
  | "table"
  | "in-rack"
  | "hidden"; // Cables, accessories — not visualized

export const CATEGORY_PLACEMENT: Record<AvCategory, PlacementSurface> = {
  Display:                    "wall-front",
  "Display - Interactive":    "wall-front",
  "Display - Video Wall LED": "wall-front",
  "Display - Outdoor":        "wall-front",
  Projector:                  "ceiling",
  "Video Switcher":           "in-rack",
  "AVoIP Encoder":            "in-rack",
  "AVoIP Decoder":            "in-rack",
  "AVoIP Other":              "in-rack",
  DSP:                        "in-rack",
  Amplifier:                  "in-rack",
  "Microphone - Ceiling":     "ceiling",
  "Microphone - Wireless":    "table",
  "Microphone - Boundary":    "table",
  "Speaker - Ceiling":        "ceiling",
  "Speaker - Surface":        "wall-left",
  "Speaker - Subwoofer":      "floor-corner",
  "Camera - PTZ":             "wall-front",
  "Camera - Conference":      "wall-front",
  "Conferencing - Video Bar": "wall-front",
  "Conferencing - Codec":     "in-rack",
  "Control - Processor":      "in-rack",
  "Control - Touch Panel":    "table",
  "Control - Keypad":         "wall-back",
  Rack:                       "floor-corner",
  Power:                      "in-rack",
  "Network Switch":           "in-rack",
  Cable:                      "hidden",
  Accessory:                  "hidden",
};

/** Approximate display sizes (inches) → meters, for visual scale. */
export function displaySizeMeters(inches: number): { w: number; h: number } {
  // 16:9 with 1\" bezel. Diagonal in metres = inches × 0.0254.
  const diag = inches * 0.0254;
  const h = diag / Math.sqrt(1 + (16 / 9) ** 2) * (16 / 9);
  const w = diag / Math.sqrt(1 + (9 / 16) ** 2) * 1;
  return { w: w, h: h };
}

/** Infer dimensions from room type + capacity. Returns metres. */
export function inferRoomDimensions(
  roomType: string,
  capacity: number | null | undefined
): { length: number; width: number; height: number } {
  const cap = capacity ?? 8;
  switch (roomType) {
    case "HUDDLE":         return { length: 4,  width: 3,  height: 2.7 };
    case "BOARDROOM":      {
      const length = Math.max(5, Math.min(15, cap * 0.7 + 3));
      const width = Math.max(3.5, length * 0.55);
      return { length, width, height: 3 };
    }
    case "TRAINING": {
      const rows = Math.ceil(cap / 6);
      return { length: 6 + rows * 1.2, width: 6, height: 3 };
    }
    case "AUDITORIUM":     return { length: 18, width: 12, height: 5 };
    case "STUDIO":         return { length: 8,  width: 6,  height: 3.5 };
    case "LOBBY":          return { length: 10, width: 8,  height: 4 };
    case "COMMAND_CENTER": return { length: 10, width: 7,  height: 3.2 };
    default:               return { length: 5,  width: 4,  height: 2.7 };
  }
}

/** Heuristic for whether a room type has a centre conference table. */
export function hasConferenceTable(roomType: string): boolean {
  return ["BOARDROOM", "HUDDLE", "TRAINING"].includes(roomType);
}

/** Heuristic: front wall = where the displays go. Origin at room centre. */
export const FRONT_WALL_AXIS = "negZ" as const; // -Z is the "front" wall
