"use client";

import { useState, useTransition } from "react";
import { Users, ArrowRight, ArrowLeft, Plus, X, Check } from "lucide-react";
import { toast } from "sonner";
import { inviteTeamMembers } from "@/app/actions/onboarding";

type Member = { name: string; email: string; role: string };

const ROLES = [
  { v: "ADMIN",        l: "Admin" },
  { v: "SALES",        l: "Sales" },
  { v: "ENGINEER",     l: "Engineer" },
  { v: "SERVICE_TECH", l: "Service tech" },
  { v: "MEMBER",       l: "Member" },
];

export function TeamStep({
  memberCount,
  onFinish,
  onBack,
  finishing,
}: {
  memberCount: number;
  onFinish: () => void;
  onBack: () => void;
  finishing?: boolean;
}) {
  const [members, setMembers] = useState<Member[]>([
    { name: "", email: "", role: "ENGINEER" },
  ]);
  const [pending, startTransition] = useTransition();

  function updateMember(i: number, patch: Partial<Member>) {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)));
  }

  function addRow() {
    if (members.length >= 10) return;
    setMembers((prev) => [...prev, { name: "", email: "", role: "ENGINEER" }]);
  }

  function removeRow(i: number) {
    setMembers((prev) => prev.filter((_, idx) => idx !== i));
  }

  const validMembers = members.filter(
    (m) => m.name.trim().length >= 2 && m.email.trim().includes("@")
  );

  function submit() {
    if (validMembers.length === 0) {
      onFinish();
      return;
    }
    startTransition(async () => {
      try {
        const r = await inviteTeamMembers({
          members: validMembers.map((m) => ({
            name: m.name.trim(),
            email: m.email.trim(),
            role: m.role as "ENGINEER",
          })),
        });
        if (r.ok) {
          toast.success(`Invited ${r.created} team member${r.created === 1 ? "" : "s"}`, {
            description: r.skipped
              ? `${r.skipped} skipped (already exist)`
              : undefined,
          });
          onFinish();
        }
      } catch (e) {
        toast.error("Couldn't invite team", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  return (
    <div className="glass-card p-7 md:p-10">
      <div className="flex items-center gap-3 mb-7">
        <span className="h-11 w-11 rounded-2xl bg-signal-500/15 border border-signal-500/25 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
          <Users className="h-5 w-5 text-signal-700" strokeWidth={2} />
        </span>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-300/55">
            Step 5 of 5
          </div>
          <h2 className="text-[22px] md:text-[24px] font-medium tracking-[-0.014em] text-ink-300 leading-tight">
            Invite your team
          </h2>
        </div>
      </div>

      <p className="text-[14px] text-ink-300/70 leading-[1.55] mb-5">
        Bring in the people who'll actually use this. Each one gets the role you set — Sales sees pipeline, Engineers see racks + signal flows, Service techs see tickets + devices. You can refine roles later in Settings.
      </p>

      {memberCount > 1 && (
        <div className="rounded-2xl bg-status-success-bg/60 border border-status-success-fg/20 p-4 mb-5">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-status-success-fg" strokeWidth={2.5} />
            <span className="text-[13px] text-ink-300">
              {memberCount} member{memberCount === 1 ? "" : "s"} already in your workspace.
            </span>
          </div>
        </div>
      )}

      <div className="space-y-2.5">
        {members.map((m, i) => (
          <div
            key={i}
            className="grid grid-cols-1 sm:grid-cols-[2fr_2fr_1.2fr_auto] gap-2 items-end"
          >
            <label className="block">
              {i === 0 && (
                <span className="text-[11.5px] text-ink-300/65 font-medium">Name</span>
              )}
              <input
                value={m.name}
                onChange={(e) => updateMember(i, { name: e.target.value })}
                placeholder="Aarav Patel"
                className="input-glass mt-1"
              />
            </label>
            <label className="block">
              {i === 0 && (
                <span className="text-[11.5px] text-ink-300/65 font-medium">Email</span>
              )}
              <input
                type="email"
                value={m.email}
                onChange={(e) => updateMember(i, { email: e.target.value })}
                placeholder="aarav@example.com"
                className="input-glass mt-1"
              />
            </label>
            <label className="block">
              {i === 0 && (
                <span className="text-[11.5px] text-ink-300/65 font-medium">Role</span>
              )}
              <select
                value={m.role}
                onChange={(e) => updateMember(i, { role: e.target.value })}
                className="input-glass mt-1"
              >
                {ROLES.map((r) => (
                  <option key={r.v} value={r.v}>{r.l}</option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={members.length === 1}
              className="hover-glass h-10 w-10 rounded-xl border border-bone-300/55 flex items-center justify-center text-ink-300/55 hover:text-status-danger-fg disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Remove row"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      {members.length < 10 && (
        <button
          type="button"
          onClick={addRow}
          className="hover-glass mt-3 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border border-bone-300/55 text-[12.5px] text-ink-300/65 hover:text-ink-300"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another
        </button>
      )}

      <p className="text-[11.5px] text-ink-300/55 mt-4">
        Leave rows blank if you want to skip — we'll only invite the rows with a valid name and email.
      </p>

      <div className="mt-8 pt-6 border-t border-bone-300/35 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="hover-glass inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13.5px] text-ink-300/75 hover:text-ink-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending || finishing}
          className="btn-glass-signal rounded-full px-6 py-3 text-[14.5px] font-medium inline-flex items-center gap-2"
        >
          {pending || finishing
            ? "Finishing…"
            : validMembers.length > 0
              ? `Invite ${validMembers.length} & finish`
              : "Finish setup"}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
