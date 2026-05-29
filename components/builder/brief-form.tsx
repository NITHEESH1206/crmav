"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Building2, Users, Brush, MessageSquareText, Plus, X, Layers3 } from "lucide-react";

const ROOM_TYPES = [
  { v: "BOARDROOM",      l: "Boardroom" },
  { v: "HUDDLE",         l: "Huddle" },
  { v: "TRAINING",       l: "Training" },
  { v: "STUDIO",         l: "Studio" },
  { v: "AUDITORIUM",     l: "Auditorium" },
  { v: "LOBBY",          l: "Lobby" },
  { v: "COMMAND_CENTER", l: "Command center" },
  { v: "OTHER",          l: "Other" },
] as const;

const TIERS = [
  { v: "STANDARD", l: "Standard", hint: "Stock kit, single display, baseline DSP" },
  { v: "PREMIUM",  l: "Premium",  hint: "Dual cameras, premium DSP, ceiling array" },
  { v: "FLAGSHIP", l: "Flagship", hint: "AI tracking, video wall, redundant DSP" },
] as const;

export type RoomBrief = {
  name: string;
  roomType: (typeof ROOM_TYPES)[number]["v"];
  capacity: number;
  lengthM: number | null;
  widthM: number | null;
  heightM: number | null;
  notes: string;
};

export type Brief = {
  accountName: string;
  projectName: string;
  rooms: RoomBrief[];
  tier: (typeof TIERS)[number]["v"];
  brandPreferences: string;
  requirements: string;
};

function emptyRoom(): RoomBrief {
  return {
    name: "",
    roomType: "BOARDROOM",
    capacity: 12,
    lengthM: null,
    widthM: null,
    heightM: null,
    notes: "",
  };
}

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
  const [projectName, setProjectName] = useState(initial?.projectName ?? "");
  const [rooms, setRooms] = useState<RoomBrief[]>(
    initial?.rooms && initial.rooms.length > 0 ? initial.rooms : [emptyRoom()]
  );
  const [tier, setTier] = useState<Brief["tier"]>(initial?.tier ?? "PREMIUM");
  const [brandPreferences, setBrandPreferences] = useState(initial?.brandPreferences ?? "");
  const [requirements, setRequirements] = useState(initial?.requirements ?? "");
  const [activeRoomIdx, setActiveRoomIdx] = useState(0);

  const canSubmit =
    accountName.trim().length >= 2 &&
    rooms.length >= 1 &&
    rooms.every((r) => r.name.trim().length >= 2 && r.capacity >= 1);

  function updateRoom(idx: number, patch: Partial<RoomBrief>) {
    setRooms((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  }

  function addRoom() {
    if (rooms.length >= 20) return;
    setRooms((prev) => [...prev, emptyRoom()]);
    setActiveRoomIdx(rooms.length);
  }

  function removeRoom(idx: number) {
    if (rooms.length === 1) return;
    setRooms((prev) => prev.filter((_, i) => i !== idx));
    setActiveRoomIdx((cur) => Math.max(0, Math.min(cur, rooms.length - 2)));
  }

  function submit() {
    if (!canSubmit) return;
    onSubmit({
      accountName: accountName.trim(),
      projectName: projectName.trim() || `${accountName.trim()} — ${rooms.length} room${rooms.length === 1 ? "" : "s"}`,
      rooms,
      tier,
      brandPreferences: brandPreferences.trim(),
      requirements: requirements.trim(),
    });
  }

  const activeRoom = rooms[activeRoomIdx] ?? rooms[0];

  return (
    <div className="glass-card p-7 md:p-10 space-y-7">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.06em] text-signal-700 mb-3">
          <Sparkles className="h-3 w-3" strokeWidth={2.5} />
          Step 1 · Brief
        </div>
        <h2 className="text-[28px] md:text-[32px] font-medium tracking-[-0.018em] text-ink-300 leading-tight">
          Tell us about the project.
        </h2>
        <p className="mt-2 text-[15px] text-ink-300/65 max-w-[560px]">
          Add as many rooms as you need — one boardroom, or a whole floor of huddle rooms + training rooms + a flagship boardroom. The AI handles them all in one pass.
        </p>
      </div>

      {/* Client + project */}
      <Section icon={Building2} title="Client & project">
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
          <Field label="Project name" hint="optional — we'll generate one">
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g. Conference Floor Refresh — 14F"
              className="input-glass"
            />
          </Field>
        </div>
      </Section>

      {/* Rooms */}
      <Section icon={Layers3} title={`Rooms · ${rooms.length}`}>
        {/* Room tabs */}
        <div className="flex items-center gap-1.5 flex-wrap mb-4">
          {rooms.map((r, i) => {
            const isActive = i === activeRoomIdx;
            return (
              <div key={i} className="relative flex items-center">
                <button
                  type="button"
                  onClick={() => setActiveRoomIdx(i)}
                  className={`hover-glass inline-flex items-center gap-2 h-9 pl-3 pr-3 rounded-full text-[12.5px] font-medium border ${
                    isActive
                      ? "glass-pill-active text-ink-300"
                      : "border-bone-300/55 text-ink-300/65 hover:text-ink-300"
                  }`}
                >
                  <span className="font-mono text-[10.5px] text-ink-300/55">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {r.name.trim() || `Room ${i + 1}`}
                  {rooms.length > 1 && (
                    <span
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRoom(i);
                      }}
                      className="ml-1 h-4 w-4 rounded-full bg-ink-300/10 hover:bg-status-danger-fg/20 hover:text-status-danger-fg flex items-center justify-center text-ink-300/55 cursor-pointer"
                    >
                      <X className="h-2.5 w-2.5" />
                    </span>
                  )}
                </button>
              </div>
            );
          })}
          {rooms.length < 20 && (
            <button
              type="button"
              onClick={addRoom}
              className="hover-glass inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-dashed border-bone-300/65 text-[12.5px] font-medium text-ink-300/65 hover:text-ink-300"
            >
              <Plus className="h-3 w-3" />
              Add room
            </button>
          )}
        </div>

        {/* Active room editor */}
        <RoomEditor
          room={activeRoom}
          index={activeRoomIdx}
          onChange={(patch) => updateRoom(activeRoomIdx, patch)}
        />
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
        <p className="text-[11.5px] text-ink-300/55 mt-2">
          Tier applies to the whole project. Per-room overrides go in the room's notes field.
        </p>
      </Section>

      {/* Brand prefs */}
      <Section icon={Brush} title="Brand preferences">
        <input
          value={brandPreferences}
          onChange={(e) => setBrandPreferences(e.target.value)}
          placeholder='e.g. "Crestron control, Q-SYS audio, Shure mics, Samsung displays"'
          className="input-glass"
        />
        <p className="text-[12px] text-ink-300/55 mt-1.5">
          Applies to every room. The AI will keep ecosystems consistent across rooms (e.g. one Crestron environment, not Crestron in one room and AMX in another).
        </p>
      </Section>

      {/* Requirements */}
      <Section icon={MessageSquareText} title="Special requirements">
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
          placeholder='e.g. "BYOD essential for all rooms, must support Teams + Zoom, central rack in MDF closet feeding all rooms"'
          className="input-glass resize-none"
        />
      </Section>

      {/* Submit */}
      <div className="pt-4 border-t border-bone-300/35 flex items-center justify-between gap-3">
        <p className="text-[12px] text-ink-300/55 max-w-[420px]">
          The AI only picks SKUs from your seeded catalog. Output is validated server-side before any database writes.
        </p>
        <button
          type="button"
          disabled={!canSubmit || submitting}
          onClick={submit}
          className={`btn-glass-signal rounded-full px-6 py-3 text-[14.5px] font-medium inline-flex items-center gap-2 ${
            !canSubmit || submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Generating…" : `Generate plan for ${rooms.length} room${rooms.length === 1 ? "" : "s"}`}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

/* ─── Per-room editor ─── */
function RoomEditor({
  room,
  index,
  onChange,
}: {
  room: RoomBrief;
  index: number;
  onChange: (patch: Partial<RoomBrief>) => void;
}) {
  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Room name" required>
          <input
            value={room.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder={`e.g. ${["Boardroom 04", "Huddle North", "Training Room A", "Lobby"][index % 4]}`}
            className="input-glass"
          />
        </Field>
        <Field label="Capacity (seats)" required>
          <input
            type="number"
            min={1}
            max={2000}
            value={room.capacity}
            onChange={(e) => onChange({ capacity: parseInt(e.target.value || "0", 10) })}
            className="input-glass font-mono"
          />
        </Field>
      </div>

      <Field label="Room type">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {ROOM_TYPES.map((t) => (
            <button
              key={t.v}
              type="button"
              onClick={() => onChange({ roomType: t.v })}
              className={`hover-glass h-9 px-3 rounded-full text-[12.5px] font-medium border ${
                room.roomType === t.v
                  ? "glass-pill-active text-ink-300"
                  : "border-bone-300/60 text-ink-300/65 hover:text-ink-300"
              }`}
            >
              {t.l}
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Length (m)" hint="optional">
          <input
            type="number"
            step={0.1}
            value={room.lengthM ?? ""}
            onChange={(e) => onChange({ lengthM: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="—"
            className="input-glass font-mono"
          />
        </Field>
        <Field label="Width (m)" hint="optional">
          <input
            type="number"
            step={0.1}
            value={room.widthM ?? ""}
            onChange={(e) => onChange({ widthM: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="—"
            className="input-glass font-mono"
          />
        </Field>
        <Field label="Height (m)" hint="optional">
          <input
            type="number"
            step={0.1}
            value={room.heightM ?? ""}
            onChange={(e) => onChange({ heightM: e.target.value ? parseFloat(e.target.value) : null })}
            placeholder="—"
            className="input-glass font-mono"
          />
        </Field>
      </div>

      <Field label="Per-room notes" hint="optional">
        <input
          value={room.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder='e.g. "Hosts the central rack" or "Needs LED video wall instead of LCD"'
          className="input-glass"
        />
      </Field>
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
