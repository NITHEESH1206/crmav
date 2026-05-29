"use client";

import { useState, useTransition } from "react";
import { Building2, ArrowRight, Image as ImageIcon, Globe } from "lucide-react";
import { toast } from "sonner";
import { saveWorkspaceIdentity } from "@/app/actions/onboarding";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "INR", "SGD", "AUD", "CAD", "JPY"];
const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Dubai",
  "Asia/Singapore",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

export function IdentityStep({
  initial,
  onContinue,
}: {
  initial: { name: string; logoUrl: string; currency: string; timezone: string };
  onContinue: () => void;
}) {
  const [name, setName] = useState(initial.name);
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl);
  const [currency, setCurrency] = useState(initial.currency);
  const [timezone, setTimezone] = useState(initial.timezone);
  const [pending, startTransition] = useTransition();

  const canContinue = name.trim().length >= 2;

  function submit() {
    if (!canContinue) return;
    startTransition(async () => {
      try {
        const r = await saveWorkspaceIdentity({
          name: name.trim(),
          logoUrl: logoUrl.trim() || null,
          currency,
          timezone,
        });
        if (r.ok) {
          toast.success("Workspace saved");
          onContinue();
        }
      } catch (e) {
        toast.error("Couldn't save workspace", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  return (
    <div className="glass-card p-7 md:p-10">
      <div className="flex items-center gap-3 mb-7">
        <span className="h-11 w-11 rounded-2xl bg-signal-500/15 border border-signal-500/25 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
          <Building2 className="h-5 w-5 text-signal-700" strokeWidth={2} />
        </span>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-300/55">
            Step 1 of 5
          </div>
          <h2 className="text-[22px] md:text-[24px] font-medium tracking-[-0.014em] text-ink-300 leading-tight">
            What's your company called?
          </h2>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="text-[12.5px] text-ink-300/75 font-medium">
            Workspace name <span className="text-signal-600">·</span>
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Soundstage AV"
            className="input-glass mt-1.5"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter" && canContinue) submit();
            }}
          />
        </label>

        <label className="block">
          <span className="text-[12.5px] text-ink-300/75 font-medium inline-flex items-center gap-1.5">
            <ImageIcon className="h-3 w-3" />
            Logo URL <span className="ml-1 text-ink-300/45 font-normal">(optional)</span>
          </span>
          <input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://your.cdn/logo.svg"
            className="input-glass mt-1.5"
          />
          <p className="mt-1.5 text-[11.5px] text-ink-300/55">
            Hosted somewhere CDN-friendly (S3, Vercel Blob, Cloudinary). Real upload comes in a follow-up.
          </p>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-[12.5px] text-ink-300/75 font-medium">Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="input-glass mt-1.5"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-[12.5px] text-ink-300/75 font-medium inline-flex items-center gap-1.5">
              <Globe className="h-3 w-3" />
              Timezone
            </span>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input-glass mt-1.5"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-bone-300/35 flex items-center justify-between gap-3">
        <p className="text-[11.5px] text-ink-300/55">
          Stored on your workspace record. Editable anytime in Settings.
        </p>
        <button
          type="button"
          onClick={submit}
          disabled={!canContinue || pending}
          className={`btn-glass-signal rounded-full px-6 py-3 text-[14.5px] font-medium inline-flex items-center gap-2 ${
            !canContinue || pending ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {pending ? "Saving…" : "Save & continue"}
          <ArrowRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
