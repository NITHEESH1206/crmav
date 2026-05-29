"use client";

import { useState, useTransition } from "react";
import { Briefcase, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { createFirstAccount } from "@/app/actions/onboarding";

const INDUSTRIES = [
  "Hospitality",
  "Corporate",
  "Education",
  "Government",
  "Healthcare",
  "Broadcast",
  "Retail",
  "Religious",
  "Other",
];

export function AccountStep({
  accountCount,
  onContinue,
  onBack,
}: {
  accountCount: number;
  onContinue: () => void;
  onBack: () => void;
}) {
  const [skip, setSkip] = useState(accountCount > 0);
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Corporate");
  const [website, setWebsite] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [pending, startTransition] = useTransition();

  const canSubmit = name.trim().length >= 2;

  function submit() {
    if (!canSubmit) return;
    startTransition(async () => {
      try {
        const r = await createFirstAccount({
          name: name.trim(),
          industry,
          website: website.trim() || null,
          contactName: contactName.trim() || undefined,
          contactEmail: contactEmail.trim() || null,
        });
        if (r.ok) {
          toast.success(`Created account "${name.trim()}"`);
          onContinue();
        }
      } catch (e) {
        toast.error("Couldn't create account", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  return (
    <div className="glass-card p-7 md:p-10">
      <div className="flex items-center gap-3 mb-7">
        <span className="h-11 w-11 rounded-2xl bg-signal-500/15 border border-signal-500/25 flex items-center justify-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.5)]">
          <Briefcase className="h-5 w-5 text-signal-700" strokeWidth={2} />
        </span>
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-ink-300/55">
            Step 3 of 5
          </div>
          <h2 className="text-[22px] md:text-[24px] font-medium tracking-[-0.014em] text-ink-300 leading-tight">
            Add your first client
          </h2>
        </div>
      </div>

      {skip ? (
        <div className="rounded-2xl bg-status-success-bg/60 border border-status-success-fg/20 p-5">
          <div className="flex items-center gap-2">
            <span className="h-7 w-7 rounded-full bg-status-success-fg/15 flex items-center justify-center">
              <Check className="h-4 w-4 text-status-success-fg" strokeWidth={2.5} />
            </span>
            <div>
              <div className="text-[15px] font-medium text-ink-300">
                {accountCount} account{accountCount === 1 ? "" : "s"} already on file
              </div>
              <div className="text-[12.5px] text-ink-300/65 mt-0.5">
                You already have accounts to work with. Continue to the next step.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSkip(false)}
            className="mt-3 text-[12.5px] text-ink-300/60 hover:text-ink-300 underline-offset-2 hover:underline"
          >
            Or add another one →
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-[14px] text-ink-300/70 leading-[1.55]">
            One client to anchor your first project against. You can paste in a real one — Marriott NYC, your local school district, anything you actually work with.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block sm:col-span-2">
              <span className="text-[12.5px] text-ink-300/75 font-medium">
                Company name <span className="text-signal-600">·</span>
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Marriott International"
                className="input-glass mt-1.5"
                autoFocus
              />
            </label>

            <label className="block">
              <span className="text-[12.5px] text-ink-300/75 font-medium">Industry</span>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="input-glass mt-1.5"
              >
                {INDUSTRIES.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[12.5px] text-ink-300/75 font-medium">
                Website <span className="ml-1 text-ink-300/45 font-normal">(optional)</span>
              </span>
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://marriott.com"
                className="input-glass mt-1.5"
              />
            </label>

            <label className="block">
              <span className="text-[12.5px] text-ink-300/75 font-medium">
                Primary contact <span className="ml-1 text-ink-300/45 font-normal">(optional)</span>
              </span>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="e.g. Elliot Williams"
                className="input-glass mt-1.5"
              />
            </label>

            <label className="block">
              <span className="text-[12.5px] text-ink-300/75 font-medium">
                Contact email <span className="ml-1 text-ink-300/45 font-normal">(optional)</span>
              </span>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="elliot@marriott.com"
                className="input-glass mt-1.5"
              />
            </label>
          </div>
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-bone-300/35 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="hover-glass inline-flex items-center gap-1.5 h-10 px-4 rounded-full border border-bone-300/55 text-[13.5px] text-ink-300/75 hover:text-ink-300"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        {skip ? (
          <button
            type="button"
            onClick={onContinue}
            className="btn-glass-signal inline-flex items-center gap-2 h-10 px-5 rounded-full text-[14px] font-medium"
          >
            Continue
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : (
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit || pending}
            className={`btn-glass-signal rounded-full px-6 py-3 text-[14.5px] font-medium inline-flex items-center gap-2 ${
              !canSubmit || pending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {pending ? "Creating…" : "Create account & continue"}
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </button>
        )}
      </div>
    </div>
  );
}
