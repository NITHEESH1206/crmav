/**
 * Strict AV product taxonomy used by the seed + the 3D placement logic.
 *
 * Treat the string union as the source of truth — when adding a category,
 * also extend the placement map in `lib/av/placement.ts`.
 */

export const AV_CATEGORIES = [
  // Visual
  "Display",
  "Display - Interactive",
  "Display - Video Wall LED",
  "Display - Outdoor",
  "Projector",
  // Distribution
  "Video Switcher",
  "AVoIP Encoder",
  "AVoIP Decoder",
  "AVoIP Other",
  // Audio processing & amp
  "DSP",
  "Amplifier",
  // Mics
  "Microphone - Ceiling",
  "Microphone - Wireless",
  "Microphone - Boundary",
  // Speakers
  "Speaker - Ceiling",
  "Speaker - Surface",
  "Speaker - Subwoofer",
  // Cameras
  "Camera - PTZ",
  "Camera - Conference",
  // Conferencing endpoints
  "Conferencing - Video Bar",
  "Conferencing - Codec",
  // Control
  "Control - Processor",
  "Control - Touch Panel",
  "Control - Keypad",
  // Infrastructure
  "Rack",
  "Power",
  "Network Switch",
  "Cable",
  "Accessory",
] as const;

export type AvCategory = (typeof AV_CATEGORIES)[number];
