"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Building2, Layers3, Users, Ruler, Brush, MessageSquareText } from "lucide-react";

const ROOM_TYPES = [
  { v: "BOARDROOM",      l: "Boardroom",      hint: "Premium conference table" },
  { v: "HUDDLE",         l: "Huddle",         hint: "Small (2-6) collab room" },
  { v: "TRAINING",       l: "Training",       hint: "Classroom rows" },
  { v: "STUDIO",         l: "Studio",         hint: "Broadcast / recording" },
  { v: "AUDITORIUM",     l: "Auditorium",     hint: "100+ seats" },
  { v: "LOBBY",          l: "Lobby",          hint: "Reception" },
  { v: "COMMAND_CENTER", l: "Command center", hint: "Multi-screen ops" },
  { v: "OTHER",          l: "Other",          hint: "Custom space" },
] as const;

const TIERS = [
  { v: "STANDARD", l: "Standard", hint: "Stock kit, single display, baseline DSP" },
  { v: "PREMIUM",  l: "Premium",  hint: "Dual cameras, premium DSP, ceiling array" },
  { v: "FLAGSHIP", l: "Flagship", hint: "AI tracking, video wall, redundant DSP" },
] as const;

export type Brief = {
  accountName: string;
  roomName: string;
  roomType: (typeof ROOM_TYPES)[number]["v"];
  capacity: number;
  lengthM: number | null;
  widthM: number | null;
  heightM: number | null;
  tier: (typeof TIERS)[number]["v"];
  brandPreferences: string;
  requirements: string;
};

export function BriefForm({
  initial,
  onSubmit,
  submitting,
}: {
  initial?: Partial<Brief>;
  onSubmit: (brief: Brief) => void;
  submitting?: boolean;
}) {
  const [accountName, setAccountName] = useState(initial?.accountName ?? "");
  const [roomName, setRoomName] = useState(initial?.roomName ?? "");
  const [roomType, setRoomType] = useState<Brief["roomType"]>(initial?.roomType ?? "BOARDROOM");
  const [capacity, setCapacity] = useState(initial?.capacity?.toString() ?? "12");
  const [length, setLength] = useState(initial?.lengthM?.toString() ?? "");
  const [width, setWidth] = useState(initial?.widthM?.toString() ?? "");
  const [height, setHeight] = useState(initial?.heightM?.toString() ?? "");
  const [tier, setTier] = useState<Brief["tier"]>(initial?.tier ?? "PREMIUM");
  const [brandPreferences, setBrandPreferences] = useState(initial?.brandPreferences ?? "");
  const [requirements, setRequirements] = useState(initial?.requirements ?? "");

  const canSubmit =
    accountName.trim().length >= 2 &&
    roomName.trim().length >= 2 &&
    parseInt(capacity, 10) >= 1;

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      accountName: accountName.trim(),
      roomName: roomName.trim(),
      roomType,
      capacity: parseInt(capacity, 10),
      lengthM: length ? parseFloat(length) : null,
      widthM: width ? parseFloat(width) : null,
      heightM: height ? parseFloat(height) : null,
      tier,
      brandPreferences: brandPreferences.trim(),
      requirements: requirements.trim(),
    });
  }

  return (
    <div className="glass-card p-7 md:p-10 space-y-7">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-signal-700 mb-3">
            <Sparkles className="h-3 w-3" strokeWidth={2.5} />
            Step 1 · Brief
          </div>
          <h2 className="text-[28px] md:text-[32px] font-medium tracking-[-0.018em] text-ink-300 leading-tight">
            Tell us about the room.
          </h2>
          <p className="mt-2 text-[15px] text-ink-300/65 max-w-[560px]">
            We'll pick equipment from your catalog, draft a stacked rack, generate a signal flow, and create the project.
          </p>
        </div>
      </div>

      {/* Identity */}
      <Section icon={Building2} title="Client & room">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Client (account)" required>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. Marriott NYC"
              className="input-glass"
              autoFocus
            />
          </Field>
          <Field label="Room name" required>
            <input
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="e.g. Boardroom 04 — 14F"
              className="input-glass"
            />
          </Field>
        </div>
      </Section>

      {/* Type */}
      <Section icon={Layers3} title="Room type">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ROOM_TYPES.map((t) => (
            <button
              key={t.v}
              type="button"
              title={t.hint}
              onClick={() => setRoomType(t.v)}
              className={`hover-glass h-10 px-3 rounded-full text-[13px] font-medium border ${
                roomType === t.v
                  ? "glass-pill-active text-ink-300"
                  : "border-bone-300/60 text-ink-300/70 hover:text-ink-300"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </Section>

      {/* Size */}
      <Section icon={Ruler} title="Size">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Field label="Capacity (seats)" required>
            <input
              type="number"
              min={1}
              max={2000}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="input-glass font-mono"
            />
          </Field>
          <Field label="Length (m)" hint="optional">
            <input
              type="number"
              step={0.1}
              min={2}
              max={50}
              value={length}
              onChange={(e) => setLength(e.target.value)}
              placeholder="—"
              className="input-glass font-mono"
            />
          </Field>
          <Field label="Width (m)" hint="optional">
            <input
              type="number"
              step={0.1}
              min={2}
              max={40}
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              placeholder="—"
              className="input-glass font-mono"
            />
          </Field>
          <Field label="Height (m)" hint="optional">
            <input
              type="number"
              step={0.1}
              min={2.4}
              max={15}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="—"
              className="input-glass font-mono"
            />
          </Field>
        </div>
        <p className="text-[12px] text-ink-300/55 mt-1.5">
          Leave blank to let the AI infer sensible dimensions for the room type & capacity.
        </p>
      </Section>

      {/* Tier */}
      <Section icon={Users} title="Service tier">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {TIERS.map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => setTier(t.v)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                tier === t.v
                  ? "glass-pill-active border-signal-500/40"
                  : "hover-glass border-bone-300/60 bg-white/30"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-signal-700">
                  {t.v}
                </span>
              </div>
              <div className="mt-1 text-[15px] font-medium text-ink-300">{t.l}</div>
              <div className="mt-1 text-[12.5px] text-ink-300/60 leading-snug">{t.hint}</div>
            </button>
          ))}
        </div>
      </Section>

      {/* Preferences */}
      <Section icon={Brush} title="Brand preferences">
        <input
          value={brandPreferences}
          onChange={(e) => setBrandPreferences(e.target.value)}
          placeholder='e.g. "Crestron control, Q-SYS audio, Shure mics, Samsung displays"'
          className="input-glass"
        />
        <p className="text-[12px] text-ink-300/55 mt-1.5">
          Leave blank for our default mix. Mention specific manufacturers and the AI will only choose from them.
        </p>
      </Section>

      {/* Requirements */}
      <Section icon={MessageSquareText} title="Special requirements">
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
          placeholder='e.g. "BYOD essential, dual displays, ceiling mic array, must support Teams + Zoom"'
          className="input-glass resize-none"
        />
      </Section>

      {/* Submit */}
      <div className="pt-4 border-t border-bone-300/35 flex items-center justify-between gap-3">
        <p className="text-[12px] text-ink-300/55">
          The AI will only pick SKUs from your seeded catalog. Output is validated server-side before any database writes.
        </p>
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={submit}
          className={`btn-glass-signal rounded-full px-6 py-3 text-[15px] font-medium inline-flex items-center gap-2 ${
            !canSubmit || submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Generating…" : "Generate plan"}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Building2;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-3 font-mono text-[11.5px] uppercase tracking-[0.08em] text-ink-300/60">
        <Icon className="h-3 w-3" strokeWidth={2} />
        {title}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[12.5px] text-ink-300/75 font-medium">
        {label}
        {required && <span className="text-signal-600 ml-0.5">·</span>}
        {hint && <span className="ml-1.5 text-ink-300/45 font-normal">({hint})</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
