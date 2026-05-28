"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createRoom } from "@/app/actions/create";

type Option = { id: string; name: string };

const ROOM_TYPES: { value: string; label: string; hint: string }[] = [
  { value: "BOARDROOM",       label: "Boardroom",        hint: "Premium conference table room" },
  { value: "HUDDLE",          label: "Huddle",           hint: "Small (2-6 people) collab space" },
  { value: "TRAINING",        label: "Training",         hint: "Classroom-style rows" },
  { value: "STUDIO",          label: "Studio",           hint: "Broadcast / recording" },
  { value: "AUDITORIUM",      label: "Auditorium",       hint: "100+ seat presentation" },
  { value: "LOBBY",           label: "Lobby",            hint: "Reception / waiting area" },
  { value: "COMMAND_CENTER",  label: "Command center",   hint: "Multi-screen ops" },
  { value: "OTHER",           label: "Other",            hint: "Custom space" },
];

export function NewRoomDialog({
  open,
  onClose,
  projects,
  accounts,
  defaultProjectId,
}: {
  open: boolean;
  onClose: () => void;
  projects: Option[];
  accounts: Option[];
  defaultProjectId?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [roomType, setRoomType] = useState("BOARDROOM");
  const [capacity, setCapacity] = useState<string>("12");
  const [projectId, setProjectId] = useState<string>(defaultProjectId ?? "");
  const [accountId, setAccountId] = useState<string>("");
  const [openIn3D, setOpenIn3D] = useState(true);
  const [pending, startTransition] = useTransition();

  function reset() {
    setName("");
    setRoomType("BOARDROOM");
    setCapacity("12");
    setProjectId(defaultProjectId ?? "");
    setAccountId("");
    setOpenIn3D(true);
  }

  function submit() {
    if (!name.trim()) {
      toast.error("Room name required");
      return;
    }
    startTransition(async () => {
      try {
        const r = await createRoom({
          name: name.trim(),
          roomType: roomType as "BOARDROOM",
          capacity: capacity ? parseInt(capacity, 10) : null,
          projectId: projectId || null,
          accountId: accountId || null,
        });
        if (r.ok) {
          toast.success(`Created "${name.trim()}"`, {
            description: "Now add devices from the catalog.",
          });
          reset();
          onClose();
          if (openIn3D && r.id) {
            router.push(`/rooms/${r.id}`);
          }
        }
      } catch (e) {
        toast.error("Couldn't create room", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[95] flex items-center justify-center p-4" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-ink-300/30 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-lg bg-white border border-bone-300/65 overflow-hidden shadow-[0_30px_80px_-20px_rgba(10,10,10,0.32)]"
          >
            <header className="px-5 py-3.5 border-b border-bone-300/55 flex items-start justify-between">
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.16em] text-ink-300/55 font-semibold">
                  New room
                </div>
                <h2 className="text-heading-md font-display text-ink-300">Configure an AV space</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="h-8 w-8 rounded-md text-ink-300/55 hover:text-ink-300 hover:bg-bone-100 flex items-center justify-center"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </header>

            <div className="px-5 py-4 space-y-3.5">
              <Field label="Room name" required>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Boardroom 04 — 14F"
                  className="h-9 w-full rounded-md border border-bone-300/65 bg-bone-50 px-2.5 text-[13px] text-ink-300 placeholder:text-ink-300/40 outline-none focus:border-ink-300/30"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
                  }}
                />
              </Field>

              <Field label="Type" required>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {ROOM_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setRoomType(t.value)}
                      title={t.hint}
                      className={`h-8 rounded-md text-[11.5px] font-medium transition-colors ${
                        roomType === t.value
                          ? "bg-ink-300 text-bone-100"
                          : "bg-bone-50 text-ink-300/70 hover:text-ink-300 border border-bone-300/55"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Capacity (seats)">
                  <input
                    type="number"
                    min={1}
                    max={2000}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="h-9 w-full rounded-md border border-bone-300/65 bg-bone-50 px-2.5 text-[13px] text-ink-300 font-mono outline-none focus:border-ink-300/30"
                  />
                </Field>
                <Field label="Project">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="h-9 w-full rounded-md border border-bone-300/65 bg-bone-50 px-2 text-[13px] text-ink-300 outline-none focus:border-ink-300/30"
                  >
                    <option value="">— Not linked —</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Account (optional — inherited from project if linked)">
                <select
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="h-9 w-full rounded-md border border-bone-300/65 bg-bone-50 px-2 text-[13px] text-ink-300 outline-none focus:border-ink-300/30"
                >
                  <option value="">— Inherit from project —</option>
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </Field>

              <label className="flex items-center gap-2 text-[12.5px] text-ink-300/75 pt-1">
                <input
                  type="checkbox"
                  checked={openIn3D}
                  onChange={(e) => setOpenIn3D(e.target.checked)}
                  className="accent-ink-300"
                />
                Open in 3D view after creating
              </label>
            </div>

            <footer className="px-5 py-3 border-t border-bone-300/55 flex items-center justify-between">
              <span className="text-[10.5px] text-ink-300/55">
                <span className="kbd">⌘</span> <span className="kbd">↵</span> to submit
              </span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button size="sm" onClick={submit} disabled={pending || !name.trim()}>
                  {pending ? (
                    "Creating…"
                  ) : (
                    <>
                      <Plus className="h-3.5 w-3.5" />
                      Create room
                      {openIn3D && <ArrowRight className="h-3 w-3 ml-1" />}
                    </>
                  )}
                </Button>
              </div>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
        {label}
        {required && <span className="text-signal-600 ml-1">·</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
