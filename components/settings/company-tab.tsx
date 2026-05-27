"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateWorkspace } from "@/app/actions/settings";
import type { Workspace } from "@prisma/client";

const TIMEZONES = [
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Europe/London", "Europe/Berlin", "Europe/Paris",
  "Asia/Dubai", "Asia/Kolkata", "Asia/Singapore", "Asia/Tokyo",
  "Australia/Sydney", "UTC",
];
const CURRENCIES = ["USD", "EUR", "GBP", "AUD", "CAD", "INR", "AED", "SGD", "JPY"];

export function CompanyTab({ workspace }: { workspace: Workspace }) {
  const [name, setName] = useState(workspace.name);
  const [currency, setCurrency] = useState(workspace.currency);
  const [timezone, setTimezone] = useState(workspace.timezone);
  const [logoUrl, setLogoUrl] = useState(workspace.logoUrl ?? "");
  const [pending, startTransition] = useTransition();

  const dirty =
    name !== workspace.name ||
    currency !== workspace.currency ||
    timezone !== workspace.timezone ||
    (logoUrl || null) !== workspace.logoUrl;

  function save() {
    startTransition(async () => {
      try {
        await updateWorkspace({
          name,
          currency,
          timezone,
          logoUrl: logoUrl.trim() || null,
        });
        toast.success("Workspace updated");
      } catch (e) {
        toast.error("Couldn't save", {
          description: e instanceof Error ? e.message : "Unknown error",
        });
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company branding</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className="text-xs text-ink-300/75 mb-2 block">Company name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-ink-300/75 mb-2 block">Logo URL (optional)</label>
          <Input
            value={logoUrl}
            onChange={(e) => setLogoUrl(e.target.value)}
            placeholder="https://…/logo.png"
          />
        </div>
        <div>
          <label className="text-xs text-ink-300/75 mb-2 block">Trading currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="h-10 w-full rounded-xl border border-bone-300/65 bg-bone-50 px-3 text-sm text-ink-300 focus:outline-none focus:border-signal-500/40"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs text-ink-300/75 mb-2 block">Time zone</label>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="h-10 w-full rounded-xl border border-bone-300/65 bg-bone-50 px-3 text-sm text-ink-300 focus:outline-none focus:border-signal-500/40"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>{tz}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={save} disabled={pending || !dirty}>
            {pending ? "Saving…" : dirty ? "Save changes" : "Saved"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
