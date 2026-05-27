"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { PortalData } from "../portal-shell";

const STATUS_TONE: Record<string, string> = {
  OPEN:        "pill-warning",
  IN_PROGRESS: "pill-info",
  SCHEDULED:   "pill-info",
  WAITING:     "pill-warning",
  RESOLVED:    "pill-success",
  CLOSED:      "pill-neutral",
};

export function TicketsTab({ tickets }: { tickets: PortalData["tickets"] }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  function submit() {
    if (!title.trim()) return;
    toast.success("Ticket raised", {
      description: "Your account team has been notified. You'll see updates here.",
    });
    setTitle("");
    setDescription("");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-ink-300">Your tickets</h2>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-ink-300 text-bone-100 text-[12.5px] font-medium hover:bg-ink-200"
        >
          <Plus className="h-3.5 w-3.5" />
          Raise a ticket
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-lg bg-white border border-bone-300/55 px-6 py-16 text-center text-[12.5px] text-ink-300/55">
          No tickets yet. Raise one if you need support.
        </div>
      ) : (
        <div className="rounded-lg bg-white border border-bone-300/55 overflow-hidden">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-bone-300/55 bg-bone-50/60">
                <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[100px]">
                  ID
                </th>
                <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
                  Title
                </th>
                <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[80px]">
                  Priority
                </th>
                <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[120px]">
                  Status
                </th>
                <th className="text-left px-4 py-2 text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold w-[110px]">
                  Raised
                </th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr key={t.id} className="border-b border-bone-300/35 hover:bg-bone-50">
                  <td className="px-4 py-2 font-mono text-ink-300/55">{t.number}</td>
                  <td className="px-4 py-2 text-ink-300 font-medium">{t.title}</td>
                  <td className="px-4 py-2 font-mono text-ink-300/75">{t.priority}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] ${
                        STATUS_TONE[t.status] ?? "pill-neutral"
                      }`}
                    >
                      {t.status.toLowerCase().replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-ink-300/55">
                    {t.createdAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-ink-300/30 backdrop-blur-sm" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-lg bg-white border border-bone-300/65 overflow-hidden"
          >
            <header className="px-5 py-3.5 border-b border-bone-300/55">
              <h3 className="text-[14px] font-semibold text-ink-300">Raise a ticket</h3>
              <p className="text-[12px] text-ink-300/55 mt-0.5">
                Your account team will respond per your AMC SLA.
              </p>
            </header>
            <div className="px-5 py-4 space-y-3">
              <Field label="Title">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Boardroom-04 camera not coming up"
                  className="h-9 w-full rounded-md border border-bone-300/65 bg-bone-50 px-2.5 text-[13px] text-ink-300 outline-none focus:border-ink-300/30"
                />
              </Field>
              <Field label="What's happening?">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe symptoms, when it started, anyone affected."
                  className="w-full rounded-md border border-bone-300/65 bg-bone-50 px-2.5 py-2 text-[13px] text-ink-300 outline-none focus:border-ink-300/30 resize-none"
                />
              </Field>
            </div>
            <footer className="px-5 py-3 border-t border-bone-300/55 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-8 px-3 rounded-md text-[12.5px] text-ink-300/75 hover:text-ink-300 hover:bg-bone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                className="h-8 px-3.5 rounded-md bg-ink-300 text-bone-100 text-[12.5px] font-medium hover:bg-ink-200"
              >
                Submit ticket
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10.5px] uppercase tracking-[0.14em] text-ink-300/55 font-semibold">
        {label}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
